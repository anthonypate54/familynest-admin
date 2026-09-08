const axios = require('axios');
const marketingDb = require('./marketingDb');

// Translates an admin's plain-English description of a marketing segment
// into a single read-only SQL SELECT, using Claude. This is a convenience
// layer only - the generated SQL is NOT trusted on its own. The caller
// (routes/marketing.js) always re-validates it through
// marketingDb.assertSafeSelect() before returning it to the frontend, and
// it only ever runs (later, via the normal preview/sync flow) under the
// restricted marketing_tool DB role. So a bad or malicious-looking
// generation just fails validation or returns wrong/empty rows - it can't
// write anywhere it isn't already allowed to.
const apiKey = process.env.ANTHROPIC_API_KEY || '';
// Haiku is plenty for this: a short, structured "translate English to SQL"
// task, not deep reasoning - keeps per-generation cost negligible.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const client = axios.create({
  baseURL: 'https://api.anthropic.com/v1',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  timeout: 20000
});

const isConfigured = () => Boolean(apiKey);

// House-style context for the model: hard rules + gotcha notes that aren't
// derivable from a raw column list + a few real, already-reviewed example
// queries. The actual table/column list is NOT hand-typed here - it's
// pulled live from information_schema (see marketingDb.getSchemaContext())
// and spliced in below, so every table in the database is always visible
// to the model without needing to manually update this file, and it can
// never drift out of sync with a Flyway migration that's actually been
// applied. Deliberately never includes actual row data/PII - only column
// names/types - since that would mean sending real user records to a
// third-party API for no reason.
const PROMPT_INTRO = `You generate a single read-only PostgreSQL query for a "marketing segment" - a saved list of app_user rows an admin will export/sync to Mailchimp for FamilyNest, a family-sharing app.

Here is the full current schema (every table and column that exists in the database right now, auto-generated from information_schema - not all of it is relevant to every request, use your judgement about which tables actually matter for a given question):

`;

const PROMPT_RULES = `

A few notes on specific tables/columns that aren't obvious from the list above:
- app_user.subscription_status values seen: 'active', 'trial', 'platform_trial', 'expired', 'cancelled', 'SUBSCRIPTION_STATE_ACTIVE' (legacy alias, treat same as 'active'), or NULL/empty string (user never engaged - never started a trial or subscription at all).
- app_user.monthly_price is ALWAYS 0 for every row, not populated by real purchases - NEVER use it for money questions.
- payment_transactions is the ONLY source of real purchase/money data. status = 'renewal' means an actual real charge; other status values are not real charges. Always also filter is_test = false.
- message is the ONLY source of in-app messaging/posting activity. sender_id is who wrote/posted it (foreign key to app_user.id) - user_id on that table is the family-feed it was posted into, NOT the author. For "who has/hasn't sent a message" questions, always filter on message.sender_id, never message.user_id.
- invitation has NO recipient user id column - the invitee is identified only by invitation.email (they may not even be a registered app_user yet when invited). invitation.sender_id is who SENT the invite, not who received it. For "users who were invited but never accepted/joined" questions, join on app_user.email = invitation.email, filtering invitation.status - never join on invitation.sender_id for the recipient side.
- Direct-message tables, disambiguated (do not mix these up):
  - dm_message = the actual 1:1 DM records. It has sender_id (who wrote it, FK to app_user.id) and conversation_id - it does NOT have a user_id column. For any "who sent the most/fewest DMs", "users who have never DMed anyone" etc question, GROUP BY / filter on dm_message.sender_id.
  - dm_conversation_participant and dm_conversation (user1_id/user2_id) only describe conversation MEMBERSHIP, not individual messages - never use these to count messages sent, only to find who is/isn't part of a conversation at all.
  - message = the family-feed posts table (separate feature from DMs entirely) - sender_id is the author there too, but don't conflate message and dm_message, they're different tables for different features.

Hard rules:
- Output ONLY the raw SQL. No markdown code fences, no explanation, no comments, no leading/trailing text of any kind - your entire response must be valid SQL and nothing else.
- Must be exactly one SELECT or WITH ... SELECT statement. At most one trailing semicolon, no chained statements.
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, GRANT, CREATE, or any other write/DDL keyword - read-only only.
- The result MUST include at least the columns id and email (required downstream for Mailchimp sync + audit logging). Include first_name and last_name too unless the request specifically says not to.
- Only filter out specific accounts, emails, or usernames if the request explicitly asks for it - do not add any exclusions on your own initiative.
- For any question involving money/payments/pricing, JOIN payment_transactions filtered to status = 'renewal' AND is_test = false. Never use app_user.monthly_price.
- For any question involving in-app activity/engagement (e.g. "never posted", "hasn't sent a message"), use NOT EXISTS / EXISTS against message.sender_id = app_user.id, not a JOIN + IS NULL, and not message.user_id.
- Default to ORDER BY created_at DESC unless the request implies a different order (e.g. "highest paying first" -> order by the payment amount instead).
- For matching on names or other free-text fields (first_name, last_name, username, etc.), use ILIKE rather than = so inconsistent casing in the data (e.g. a stray lowercase last name) doesn't silently drop matching rows - unless the request explicitly asks for an exact/case-sensitive match.

These 4 example segments are real, already-reviewed queries currently in production use - match this general style:

-- active: currently paying or in a platform-managed trial
SELECT id, email, first_name, last_name FROM app_user WHERE subscription_status IN ('active', 'platform_trial', 'SUBSCRIPTION_STATE_ACTIVE') ORDER BY created_at DESC

-- on_trial: currently in an app-managed trial that hasn't ended yet
SELECT id, email, first_name, last_name FROM app_user WHERE subscription_status = 'trial' AND trial_end_date > NOW() ORDER BY created_at DESC

-- dropped_paywall: trial/subscription lapsed without converting
SELECT id, email, first_name, last_name FROM app_user WHERE (subscription_status = 'expired' OR (subscription_status = 'trial' AND trial_end_date <= NOW()) OR (subscription_status = 'cancelled' AND (subscription_end_date IS NULL OR subscription_end_date <= NOW()))) ORDER BY created_at DESC

-- unfinished_signup: registered but never started a trial/subscription at all
SELECT id, email, first_name, last_name, created_at FROM app_user WHERE subscription_status IS NULL ORDER BY created_at DESC

This one is not yet a saved segment but shows the expected style for combining date math with an activity/engagement check:

-- signed up over 30 days ago and has never sent a message
SELECT id, email, first_name, last_name, created_at FROM app_user u WHERE created_at < NOW() - INTERVAL '30 days' AND NOT EXISTS (SELECT 1 FROM message m WHERE m.sender_id = u.id) ORDER BY created_at DESC

If the conversation already has prior turns, treat the new message as a REFINEMENT of the most recent query (e.g. "also exclude X", "sort by Y instead") rather than an unrelated request from scratch - adjust the previous SQL to satisfy the new instruction while keeping everything else about it the same. Only start completely over if the new message clearly describes a different, unrelated segment.`;

/**
 * Assemble the full system prompt: intro + live schema (fetched/cached via
 * marketingDb.getSchemaContext()) + hard rules/examples.
 * @returns {Promise<string>}
 */
const buildSystemPrompt = async () => {
  const schema = await marketingDb.getSchemaContext();
  return `${PROMPT_INTRO}${schema}${PROMPT_RULES}`;
};

/**
 * Generate a SQL query from a plain-English description, optionally
 * continuing a prior conversation so follow-up messages ("also exclude
 * inactive users", "sort by highest spend instead") refine the previous
 * query instead of starting from scratch each time.
 * @param {string} description
 * @param {Array<{role: 'user'|'assistant', content: string}>} [history]
 *   Prior turns, oldest first. Assistant turns should hold the previously
 *   validated SQL text (not raw/un-stripped model output).
 * @returns {Promise<{rawSql: string, messages: Array}>} rawSql is NOT yet
 *   validated - the caller must run it through assertSafeSelect(). messages
 *   is the full request array (history + this new user turn) so the
 *   caller can append the validated assistant reply and hand the result
 *   back to the frontend as the new history.
 */
const generateSql = async (description, history = []) => {
  if (!isConfigured()) {
    throw new Error('ANTHROPIC_API_KEY is not set on the server');
  }
  if (!description || !description.trim()) {
    throw new Error('description is required');
  }

  const messages = [
    ...history,
    { role: 'user', content: description.trim() }
  ];

  const systemPrompt = await buildSystemPrompt();

  const { data } = await client.post('/messages', {
    model: MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages
  });

  const rawText = (data.content || []).map(block => block.text || '').join('').trim();

  // Strip markdown code fences in case the model added them despite
  // instructions not to - belt-and-suspenders, the real safety net is
  // assertSafeSelect() on the caller's side either way.
  const rawSql = rawText
    .replace(/^```sql\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  if (!rawSql) {
    throw new Error('Model returned an empty response');
  }

  return { rawSql, messages };
};

module.exports = { isConfigured, generateSql };
