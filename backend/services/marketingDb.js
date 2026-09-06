const { Pool } = require('pg');
const config = require('../config');

// Dedicated connection pool using the restricted `marketing_tool` role where
// configured (see config.js / .env.example). This is deliberately SEPARATE
// from services/database.js's pool, which uses the full app DB user.
const marketingPool = new Pool(config.marketingDatabase);

marketingPool.on('error', (err) => {
  console.error('💥 Marketing DB pool error:', err);
});

// --- Query safety validation -------------------------------------------
//
// This tool lets admins run ad-hoc SQL for segment definitions, so on top
// of running everything through the restricted DB role (the real
// enforcement), we also reject anything that doesn't look like a plain
// read-only SELECT/CTE as an early, clearer line of defense.

const DANGEROUS_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT',
  'REVOKE', 'CREATE', 'COPY', 'CALL', 'VACUUM', 'ANALYZE', 'EXECUTE',
  'REINDEX', 'CLUSTER', 'LOCK', 'DO', 'MERGE'
];

/**
 * Validate that a string of SQL looks like a single, read-only
 * SELECT (or WITH ... SELECT) statement.
 * @param {string} sqlText
 * @throws {Error} if validation fails
 */
const assertSafeSelect = (sqlText) => {
  if (!sqlText || typeof sqlText !== 'string' || !sqlText.trim()) {
    throw new Error('Query cannot be empty');
  }

  // Strip a single trailing semicolon (and trailing whitespace) - but reject
  // if there's a semicolon anywhere else, which would indicate multiple
  // statements chained together.
  let text = sqlText.trim();
  const semicolonCount = (text.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !text.endsWith(';'))) {
    throw new Error('Only a single statement is allowed (no chained statements separated by ;)');
  }
  text = text.replace(/;\s*$/, '');

  const firstWordMatch = text.match(/^\s*(\w+)/);
  const firstWord = firstWordMatch ? firstWordMatch[1].toUpperCase() : '';
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    throw new Error('Query must start with SELECT or WITH (read-only queries only)');
  }

  const upperText = text.toUpperCase();
  for (const keyword of DANGEROUS_KEYWORDS) {
    // Match as a whole word so e.g. a column literally named "created_at"
    // doesn't false-positive on nothing here, but "UPDATE" the keyword does.
    const re = new RegExp(`(^|[^a-zA-Z0-9_])${keyword}([^a-zA-Z0-9_]|$)`);
    if (re.test(upperText)) {
      throw new Error(`Query contains disallowed keyword: ${keyword}`);
    }
  }

  return text;
};

/**
 * Run an admin-supplied (or saved) read-only SQL query safely:
 *  - validates it's a single SELECT/WITH statement with no dangerous keywords
 *  - runs it under the restricted marketing_tool role (real enforcement)
 *  - clamps to a max row count and a short statement timeout so a runaway
 *    or accidental cross-join query can't hang the database
 * @param {string} sqlText
 * @param {Object} [opts]
 * @param {number} [opts.limit=1000]
 * @param {number} [opts.timeoutMs=5000]
 * @returns {Promise<{rows: Array, rowCount: number, truncated: boolean}>}
 */
const runValidatedQuery = async (sqlText, opts = {}) => {
  const limit = Math.min(opts.limit || 1000, 5000);
  const timeoutMs = Math.min(opts.timeoutMs || 5000, 15000);

  const safeText = assertSafeSelect(sqlText);
  const client = await marketingPool.connect();

  try {
    await client.query(`SET statement_timeout = ${timeoutMs}`);

    // Wrap in a subquery + LIMIT (limit + 1 so we can tell if it was
    // truncated) - this also acts as an extra structural safety check,
    // since anything that isn't a valid single SELECT will fail to parse
    // as a subquery here even if it slipped past the text-based check.
    const wrapped = `SELECT * FROM (${safeText}) AS _segment_query LIMIT ${limit + 1}`;
    const result = await client.query(wrapped);

    const truncated = result.rows.length > limit;
    const rows = truncated ? result.rows.slice(0, limit) : result.rows;

    return { rows, rowCount: rows.length, truncated };
  } finally {
    await client.query('RESET statement_timeout').catch(() => {});
    client.release();
  }
};

// --- Segment definitions (data, not code) -------------------------------

/**
 * List all segment definitions.
 * @param {boolean} [activeOnly=true]
 */
const listSegments = async (activeOnly = true) => {
  const sql = activeOnly
    ? 'SELECT id, name, description, sql_text, is_active, created_by, created_at, updated_at FROM marketing_segment_definitions WHERE is_active = true ORDER BY created_at ASC'
    : 'SELECT id, name, description, sql_text, is_active, created_by, created_at, updated_at FROM marketing_segment_definitions ORDER BY created_at ASC';
  const result = await marketingPool.query(sql);
  return result.rows;
};

/**
 * Get a single segment definition by name.
 */
const getSegmentByName = async (name) => {
  const result = await marketingPool.query(
    'SELECT id, name, description, sql_text, is_active FROM marketing_segment_definitions WHERE name = $1',
    [name]
  );
  return result.rows[0] || null;
};

/**
 * Create or update (by name) a saved segment definition. Validates the SQL
 * the same way ad-hoc preview queries are validated.
 */
const saveSegment = async ({ name, description, sqlText, createdBy }) => {
  const safeText = assertSafeSelect(sqlText);

  const result = await marketingPool.query(
    `INSERT INTO marketing_segment_definitions (name, description, sql_text, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO UPDATE
       SET description = EXCLUDED.description,
           sql_text = EXCLUDED.sql_text,
           updated_at = NOW()
     RETURNING id, name, description, sql_text, is_active, created_at, updated_at`,
    [name, description || null, safeText, createdBy || null]
  );
  return result.rows[0];
};

// --- Campaign export log (append-only) -----------------------------------

/**
 * Log a batch of successfully-synced contacts to marketing_campaign_export.
 * This table is INSERT-only by design (see 00_create_log_table.sql / the
 * marketing_tool role's grants) - no UPDATE, no DELETE. Writing a row here
 * IS the permanent record of "this user was sent to Mailchimp under this
 * campaign, at this time" - there's no separate "confirm sent" step.
 * @param {Array<{userId: number, email: string}>} entries
 * @param {string} campaignName
 * @param {string} segment
 */
const logExports = async (entries, campaignName, segment) => {
  if (!entries || entries.length === 0) return { inserted: 0 };

  const values = [];
  const params = [];
  let i = 1;
  for (const entry of entries) {
    values.push(`($${i}, $${i + 1}, $${i + 2}, $${i + 3})`);
    params.push(campaignName, segment, entry.userId, entry.email);
    i += 4;
  }

  const sql = `
    INSERT INTO marketing_campaign_export (campaign_name, segment, user_id, email)
    VALUES ${values.join(', ')}
  `;

  await marketingPool.query(sql, params);
  return { inserted: entries.length };
};

module.exports = {
  assertSafeSelect,
  runValidatedQuery,
  listSegments,
  getSegmentByName,
  saveSegment,
  logExports,
  marketingPool
};
