const express = require('express');
const marketingDb = require('../services/marketingDb');
const mailchimp = require('../services/mailchimp');
const nlToSql = require('../services/nlToSql');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All marketing routes require authentication
router.use(requireAuth);

/**
 * GET /api/marketing/mailchimp/status
 * Connectivity/auth check only - confirms the API key works and shows
 * which Mailchimp account we're talking to.
 */
router.get('/mailchimp/status', async (req, res) => {
  try {
    const info = await mailchimp.getAccountInfo();
    res.json({ connected: true, ...info });
  } catch (error) {
    console.error('💥 Mailchimp status error:', error?.response?.data || error.message);
    res.status(502).json({
      connected: false,
      error: 'Mailchimp connection failed',
      message: error?.response?.data?.detail || error.message
    });
  }
});

/**
 * GET /api/marketing/mailchimp/audiences
 * List audiences (lists) in the connected Mailchimp account, so we can
 * pick which one to sync contacts into.
 */
router.get('/mailchimp/audiences', async (req, res) => {
  try {
    const audiences = await mailchimp.listAudiences();
    res.json({ audiences });
  } catch (error) {
    console.error('💥 Mailchimp list audiences error:', error?.response?.data || error.message);
    res.status(502).json({
      error: 'Failed to list audiences',
      message: error?.response?.data?.detail || error.message
    });
  }
});

/**
 * GET /api/marketing/segments
 * List saved segment definitions (active ones by default)
 */
router.get('/segments', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const segments = await marketingDb.listSegments(!includeInactive);
    res.json({ segments });
  } catch (error) {
    console.error('💥 List segments error:', error);
    res.status(500).json({
      error: 'Failed to list segments',
      message: 'Failed to retrieve segment definitions'
    });
  }
});

/**
 * POST /api/marketing/generate-sql
 * Translate a plain-English description of a segment into SQL via
 * Claude, then re-validate the result through the exact same
 * assertSafeSelect() check every other query goes through - the model's
 * output is never trusted on its own. Does NOT run the query - the
 * frontend still has to click Run Preview, same as a hand-typed query.
 *
 * Supports multi-turn refinement: pass back the `history` array this
 * route returned from a prior call, and the new `description` is treated
 * as a refinement of the previous query ("also exclude X") rather than an
 * unrelated request. Omit/clear history to start a fresh conversation.
 *
 * Body: { description: string, history?: Array<{role, content}> }
 */
router.post('/generate-sql', async (req, res) => {
  try {
    const { description, history } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'description is required'
      });
    }

    if (!nlToSql.isConfigured()) {
      return res.status(503).json({
        error: 'Not configured',
        message: 'ANTHROPIC_API_KEY is not set on the server'
      });
    }

    const priorHistory = Array.isArray(history) ? history : [];
    const { rawSql, messages } = await nlToSql.generateSql(description, priorHistory);

    let safeSql;
    try {
      safeSql = marketingDb.assertSafeSelect(rawSql);
    } catch (validationError) {
      console.error('💥 Generated SQL failed validation:', rawSql);
      return res.status(422).json({
        error: 'Generated SQL failed validation',
        message: `The AI generated an invalid query: ${validationError.message}`,
        generatedSql: rawSql
      });
    }

    // Store the validated SQL (not the raw/un-stripped model output) as
    // the assistant's turn, so a future refinement call sees exactly what
    // will actually run, not e.g. leftover markdown fences.
    const updatedHistory = [...messages, { role: 'assistant', content: safeSql }];

    console.log(`🤖 Admin ${req.admin.email} generated SQL from English (turn ${updatedHistory.length / 2}): "${description}"`);

    res.json({ sql: safeSql, history: updatedHistory });

  } catch (error) {
    console.error('💥 Generate SQL error:', error?.response?.data || error.message);
    res.status(502).json({
      error: 'Generation failed',
      message: error?.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/marketing/preview
 * Run an ad-hoc (or saved segment's) read-only SQL query and return the
 * results, for previewing in the UI before exporting/syncing. Does NOT
 * write anything - no logging, no Mailchimp calls. Runs under the
 * restricted `marketing_tool` DB role.
 *
 * Body: { sql: string, limit?: number }
 */
router.post('/preview', async (req, res) => {
  try {
    const { sql, limit } = req.body;

    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'sql is required'
      });
    }

    const { rows, rowCount, truncated } = await marketingDb.runValidatedQuery(sql, { limit });

    console.log(`🔍 Admin ${req.admin.email} previewed a marketing query (${rowCount} rows${truncated ? ', truncated' : ''})`);

    res.json({ rows, rowCount, truncated });

  } catch (error) {
    // Validation errors (bad SQL) are the caller's fault - 400, not 500.
    // Real DB/connection errors still fall through to 500.
    const isValidationError = error.message && (
      error.message.includes('Query') ||
      error.message.includes('disallowed keyword') ||
      error.message.includes('single statement')
    );

    if (isValidationError) {
      return res.status(400).json({
        error: 'Invalid query',
        message: error.message
      });
    }

    console.error('💥 Preview query error:', error);
    res.status(500).json({
      error: 'Preview failed',
      message: 'Failed to run preview query'
    });
  }
});

/**
 * POST /api/marketing/sync
 * Sync a list of contacts to a Mailchimp audience, then log each
 * successfully-synced contact to marketing_campaign_export.
 *
 * Body: {
 *   campaignName: string,
 *   segment: string,       // free-text label, e.g. segment name or 'ad-hoc'
 *   listId: string,        // Mailchimp audience id
 *   rows: Array<{ id: number, email: string, first_name?: string, last_name?: string }>
 * }
 */
router.post('/sync', async (req, res) => {
  try {
    const { campaignName, segment, listId, rows } = req.body;

    if (!campaignName || !campaignName.trim()) {
      return res.status(400).json({ error: 'Validation error', message: 'campaignName is required' });
    }
    if (!segment || !segment.trim()) {
      return res.status(400).json({ error: 'Validation error', message: 'segment is required' });
    }
    if (!listId) {
      return res.status(400).json({ error: 'Validation error', message: 'listId is required' });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Validation error', message: 'rows must be a non-empty array' });
    }
    if (rows.length > 2000) {
      return res.status(400).json({ error: 'Validation error', message: 'Too many rows in one sync (max 2000) - narrow your query first' });
    }

    const succeeded = [];
    const failed = [];

    for (const row of rows) {
      if (!row.email || !row.id) {
        failed.push({ row, reason: 'missing id or email' });
        continue;
      }
      try {
        await mailchimp.upsertContact({
          listId,
          email: row.email,
          mergeFields: {
            FNAME: row.first_name || '',
            LNAME: row.last_name || ''
          },
          tags: [segment]
        });
        succeeded.push({ userId: row.id, email: row.email });
      } catch (mcError) {
        failed.push({
          row,
          reason: mcError?.response?.data?.detail || mcError.message
        });
      }
    }

    let logged = 0;
    if (succeeded.length > 0) {
      const logResult = await marketingDb.logExports(succeeded, campaignName.trim(), segment.trim());
      logged = logResult.inserted;
    }

    console.log(`📧 Admin ${req.admin.email} synced campaign "${campaignName}" (segment: ${segment}): ${succeeded.length} succeeded, ${failed.length} failed`);

    res.json({
      syncedCount: succeeded.length,
      failedCount: failed.length,
      loggedCount: logged,
      failures: failed
    });

  } catch (error) {
    console.error('💥 Marketing sync error:', error);
    res.status(500).json({
      error: 'Sync failed',
      message: 'Failed to sync contacts to Mailchimp'
    });
  }
});

/**
 * GET /api/marketing/history
 * Recent campaign export log entries (append-only audit trail).
 */
router.get('/history', async (req, res) => {
  try {
    const result = await marketingDb.marketingPool.query(`
      SELECT campaign_name, segment, COUNT(*) as contact_count, MIN(exported_at) as first_exported_at, MAX(exported_at) as last_exported_at
      FROM marketing_campaign_export
      GROUP BY campaign_name, segment
      ORDER BY MAX(exported_at) DESC
      LIMIT 50
    `);
    res.json({ history: result.rows });
  } catch (error) {
    console.error('💥 Marketing history error:', error);
    res.status(500).json({
      error: 'Failed to load history',
      message: 'Failed to retrieve campaign export history'
    });
  }
});

module.exports = router;
