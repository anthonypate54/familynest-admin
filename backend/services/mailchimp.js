const axios = require('axios');
const crypto = require('crypto');

// Mailchimp API keys are formatted as "<key>-<server prefix>", e.g.
// "abc123def456-us21". The server prefix (data center) is required to
// build the base URL, so we derive it from the key itself instead of
// needing a separate env var.
const apiKey = process.env.MAILCHIMP_API_KEY || '';
const serverPrefix = apiKey.includes('-') ? apiKey.split('-').pop() : null;

const client = axios.create({
  baseURL: serverPrefix ? `https://${serverPrefix}.api.mailchimp.com/3.0` : undefined,
  auth: {
    // Username can be anything non-empty per Mailchimp's docs - convention is 'anystring'
    username: 'familynest-admin',
    password: apiKey
  },
  timeout: 10000
});

const isConfigured = () => Boolean(apiKey && serverPrefix);

/**
 * Basic connectivity/auth check. Hits the account root endpoint.
 * @returns {Promise<{accountName: string, email: string}>}
 */
const getAccountInfo = async () => {
  if (!isConfigured()) {
    throw new Error('MAILCHIMP_API_KEY is not set (or missing the -<server prefix> suffix)');
  }
  const { data } = await client.get('/');
  return {
    accountName: data.account_name,
    email: data.email,
    totalSubscribers: data.total_subscribers
  };
};

/**
 * List all audiences (lists) in this Mailchimp account - used to find the
 * Audience/List ID to sync contacts into.
 * @returns {Promise<Array<{id: string, name: string, memberCount: number}>>}
 */
const listAudiences = async () => {
  if (!isConfigured()) {
    throw new Error('MAILCHIMP_API_KEY is not set (or missing the -<server prefix> suffix)');
  }
  const { data } = await client.get('/lists', { params: { count: 100 } });
  return (data.lists || []).map(list => ({
    id: list.id,
    name: list.name,
    memberCount: list.stats ? list.stats.member_count : undefined
  }));
};

/**
 * Add or update a single contact in an audience (Mailchimp's "upsert" -
 * PUT to a member resource keyed by MD5(lowercased email) creates it if
 * missing or updates it if present, so this is safe to call repeatedly).
 * @param {Object} params
 * @param {string} params.listId
 * @param {string} params.email
 * @param {string} [params.status='subscribed'] - subscribed | unsubscribed | transactional
 * @param {Object} [params.mergeFields] - e.g. { FNAME: 'Anthony', LNAME: 'Pate' }
 * @param {string[]} [params.tags] - e.g. ['active', 'dropped_paywall']
 */
const upsertContact = async ({ listId, email, status = 'subscribed', mergeFields = {}, tags = [] }) => {
  if (!isConfigured()) {
    throw new Error('MAILCHIMP_API_KEY is not set (or missing the -<server prefix> suffix)');
  }
  if (!listId || !email) {
    throw new Error('listId and email are required');
  }

  const subscriberHash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');

  const { data } = await client.put(`/lists/${listId}/members/${subscriberHash}`, {
    email_address: email,
    status_if_new: status,
    merge_fields: mergeFields
  });

  if (tags.length > 0) {
    await client.post(`/lists/${listId}/members/${subscriberHash}/tags`, {
      tags: tags.map(name => ({ name, status: 'active' }))
    });
  }

  return { id: data.id, email: data.email_address, status: data.status };
};

module.exports = {
  isConfigured,
  getAccountInfo,
  listAudiences,
  upsertContact
};
