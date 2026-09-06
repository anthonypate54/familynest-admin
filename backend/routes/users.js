const express = require('express');
const db = require('../services/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

/**
 * GET /api/users/search
 * Search users with pagination and filters
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      q = '',           // search query
      status = '',      // subscription status filter
      page = 0,         // page number
      size = 20,        // page size
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Whitelist of sortable columns -> one or more SQL expressions (in
    // priority order, for tie-breaking - e.g. "name" sorts by last name
    // then first name). Never interpolate req.query.sortBy directly into
    // SQL - that's an easy SQL injection vector since ORDER BY can't be
    // parameterized normally.
    //
    // Text expressions are wrapped in LOWER() so sorting is case-insensitive
    // - otherwise Postgres's default collation sorts by byte value, which
    // puts all uppercase letters before any lowercase letter (so "Zack"
    // would sort before "adam").
    //
    // Also wrapped in NULLIF(col, '') so that an empty-string value (which
    // several legacy rows have instead of a true NULL) is treated the same
    // as "no value" and pushed to the end by NULLS LAST too - otherwise an
    // empty string sorts BEFORE every real letter, so blank-last-name users
    // would incorrectly float to the very top of an ascending sort.
    const SORTABLE_COLUMNS = {
      name: ["LOWER(NULLIF(u.last_name, ''))", "LOWER(NULLIF(u.first_name, ''))"],
      subscription_status: ["LOWER(NULLIF(u.subscription_status, ''))"],
      trial_end_date: ['u.trial_end_date'],
      platform: ["LOWER(NULLIF(u.platform, ''))"],
      current_monthly_price: ['latest_pt.current_monthly_price'],
      total_paid: ['totals_pt.total_paid'],
      created_at: ['u.created_at']
    };
    const sortExprs = SORTABLE_COLUMNS[sortBy] || SORTABLE_COLUMNS.created_at;
    const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    // Every expression in a multi-column sort (e.g. name) needs the same
    // direction applied individually - "ORDER BY a, b DESC" would only
    // apply DESC to b, not a.
    const orderByClause = sortExprs.map(expr => `${expr} ${sortDirection} NULLS LAST`).join(', ');
    
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;
    
    // Search by email, first name, last name (aliased to u. - app_user is
    // joined as "u" below so we can also pull real transaction data)
    if (q && q.trim()) {
      whereClause += ` AND (
        LOWER(u.email) LIKE $${paramIndex} OR 
        LOWER(u.first_name) LIKE $${paramIndex} OR 
        LOWER(u.last_name) LIKE $${paramIndex}
      )`;
      params.push(`%${q.trim().toLowerCase()}%`);
      paramIndex++;
    }
    
    // Filter by subscription status
    if (status && status.trim()) {
      whereClause += ` AND u.subscription_status = $${paramIndex}`;
      params.push(status.trim());
      paramIndex++;
    }
    
    // monthly_price on app_user is not populated by real purchase data (always 0),
    // so derive real pricing from payment_transactions instead:
    //   current_monthly_price = amount of the user's most recent actual charge
    //   total_paid            = lifetime sum of all actual charges
    // Only 'renewal' rows carry a real charge amount in this data (trial/
    // cancelled/expired rows are correctly $0).
    const sql = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name,
        u.subscription_status, u.trial_end_date, u.subscription_end_date,
        u.platform, u.created_at, u.updated_at,
        latest_pt.current_monthly_price,
        totals_pt.total_paid
      FROM app_user u
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, amount AS current_monthly_price
        FROM payment_transactions
        WHERE status = 'renewal' AND is_test = false
        ORDER BY user_id, transaction_date DESC
      ) latest_pt ON latest_pt.user_id = u.id
      LEFT JOIN (
        SELECT user_id, SUM(amount) AS total_paid
        FROM payment_transactions
        WHERE status = 'renewal' AND is_test = false
        GROUP BY user_id
      ) totals_pt ON totals_pt.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(parseInt(size), parseInt(page) * parseInt(size));
    
    const result = await db.query(sql, params);

    // Cast numeric fields (pg returns NUMERIC as strings)
    result.rows.forEach(row => {
      row.current_monthly_price = row.current_monthly_price !== null ? Number(row.current_monthly_price) : null;
      row.total_paid = row.total_paid !== null ? Number(row.total_paid) : null;
    });
    
    // Get total count (app_user aliased as u to match whereClause)
    const countSql = `SELECT COUNT(*) FROM app_user u WHERE ${whereClause}`;
    const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET params
    const countResult = await db.query(countSql, countParams);
    
    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / size)
      },
      filters: {
        query: q,
        status: status
      },
      sort: {
        sortBy: Object.keys(SORTABLE_COLUMNS).includes(sortBy) ? sortBy : 'created_at',
        sortOrder: sortDirection.toLowerCase()
      }
    });
    
  } catch (error) {
    console.error('💥 User search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Failed to search users'
    });
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 * NOTE: must be defined before GET /:id, otherwise Express matches "stats"
 * as an :id value and this route never gets hit.
 */
router.get('/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription_status = 'trial' THEN 1 END) as trial_users,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN subscription_status = 'expired' THEN 1 END) as expired_users,
        COUNT(CASE WHEN subscription_status = 'cancelled' THEN 1 END) as cancelled_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_7d,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
        COALESCE(SUM(CASE WHEN subscription_status = 'active' THEN monthly_price END), 0) as monthly_revenue
      FROM app_user
    `;
    
    const result = await db.query(sql);
    const row = result.rows[0];

    // pg returns COUNT()/SUM() as strings (to avoid precision loss on
    // bigint/numeric), so cast to real numbers before sending JSON -
    // otherwise consumers doing e.g. stats.monthly_revenue.toFixed(2) crash.
    const stats = {
      total_users: Number(row.total_users),
      trial_users: Number(row.trial_users),
      active_users: Number(row.active_users),
      expired_users: Number(row.expired_users),
      cancelled_users: Number(row.cancelled_users),
      new_users_7d: Number(row.new_users_7d),
      new_users_30d: Number(row.new_users_30d),
      monthly_revenue: Number(row.monthly_revenue)
    };

    res.json({ stats });
    
  } catch (error) {
    console.error('💥 User stats error:', error);
    res.status(500).json({
      error: 'Stats failed',
      message: 'Failed to get user statistics'
    });
  }
});

/**
 * GET /api/users/:id
 * Get user details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        id, username, email, first_name, last_name,
        subscription_status, trial_end_date, subscription_end_date,
        platform, platform_transaction_id, monthly_price,
        created_at, updated_at,
        (SELECT COUNT(*) FROM user_family_membership WHERE user_id = $1) as family_count,
        (SELECT COUNT(*) FROM message WHERE user_id = $1) as message_count
      FROM app_user 
      WHERE id = $1
    `;
    
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} not found`
      });
    }
    
    res.json({
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'Failed to retrieve user details'
    });
  }
});

/**
 * PUT /api/users/:id/subscription
 * Update user subscription
 */
router.put('/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, platform, monthlyPrice } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Subscription status is required'
      });
    }
    
    const sql = `
      UPDATE app_user 
      SET subscription_status = $1,
          platform = $2,
          monthly_price = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, email, subscription_status, platform, monthly_price
    `;
    
    const result = await db.query(sql, [status, platform, monthlyPrice, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} not found`
      });
    }
    
    // Log admin action
    console.log(`👤 Admin ${req.admin.email} updated subscription for user ${id}: ${status}`);
    
    res.json({
      message: 'Subscription updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Update subscription error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Failed to update subscription'
    });
  }
});

/**
 * POST /api/users/:id/extend-trial
 * Extend user trial
 */
router.post('/:id/extend-trial', async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;
    
    if (!days || days <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Days must be a positive number'
      });
    }
    
    const sql = `
      UPDATE app_user 
      SET trial_end_date = COALESCE(trial_end_date, NOW()) + INTERVAL '${days} days',
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, trial_end_date
    `;
    
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} not found`
      });
    }
    
    console.log(`📅 Admin ${req.admin.email} extended trial for user ${id} by ${days} days`);
    
    res.json({
      message: `Trial extended by ${days} days`,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Extend trial error:', error);
    res.status(500).json({
      error: 'Extension failed',
      message: 'Failed to extend trial'
    });
  }
});

/**
 * GET /api/users/:id/activity
 * Get user activity logs
 */
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    // Simulate activity logs (in real app, this would come from actual tables)
    const activities = [
      {
        id: 1,
        action: 'login',
        description: 'User logged in',
        ip_address: '192.168.1.100',
        user_agent: 'FamilyNest iOS App 1.0',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
      },
      {
        id: 2,
        action: 'photo_upload',
        description: 'Uploaded a family photo',
        ip_address: '192.168.1.100',
        user_agent: 'FamilyNest iOS App 1.0',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: 3,
        action: 'message_sent',
        description: 'Sent a message to family group',
        ip_address: '192.168.1.100',
        user_agent: 'FamilyNest iOS App 1.0',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
      }
    ];
    
    res.json({
      activities: activities.slice(0, parseInt(limit)),
      total: activities.length
    });
    
  } catch (error) {
    console.error('💥 User activity error:', error);
    res.status(500).json({
      error: 'Activity fetch failed',
      message: 'Failed to get user activity'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete/deactivate user account
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.body;
    
    if (permanent) {
      // Hard delete (dangerous - normally not allowed)
      const sql = `DELETE FROM app_user WHERE id = $1 RETURNING id, email`;
      const result = await db.query(sql, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      console.log(`🗑️ Admin ${req.admin.email} permanently deleted user ${id}: ${result.rows[0].email}`);
      
      res.json({
        message: 'User permanently deleted',
        user: result.rows[0]
      });
    } else {
      // Soft delete - just mark as inactive
      const sql = `
        UPDATE app_user 
        SET subscription_status = 'cancelled',
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, subscription_status
      `;
      const result = await db.query(sql, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      console.log(`🚫 Admin ${req.admin.email} deactivated user ${id}: ${result.rows[0].email}`);
      
      res.json({
        message: 'User account deactivated',
        user: result.rows[0]
      });
    }
    
  } catch (error) {
    console.error('💥 Delete user error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
