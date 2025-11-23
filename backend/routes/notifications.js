const express = require('express');
const db = require('../services/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(requireAuth);

/**
 * GET /api/notifications
 * Get all notifications with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { active, type } = req.query;
    
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;
    
    if (active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(active === 'true');
      paramIndex++;
    }
    
    if (type && type.trim()) {
      whereClause += ` AND notification_type = $${paramIndex}`;
      params.push(type.trim());
      paramIndex++;
    }
    
    const sql = `
      SELECT id, title, message, notification_type, target_type,
             is_active, show_from, show_until, priority, created_at
      FROM user_notifications
      WHERE ${whereClause}
      ORDER BY priority DESC, created_at DESC
    `;
    
    const result = await db.query(sql, params);
    
    res.json({
      notifications: result.rows,
      filters: {
        active: active || 'all',
        type: type || 'all'
      }
    });
    
  } catch (error) {
    console.error('💥 Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      message: 'Failed to retrieve notifications'
    });
  }
});

/**
 * POST /api/notifications
 * Create new notification
 */
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      message, 
      type = 'ANNOUNCEMENT', 
      targetType = 'ALL',
      priority = 1,
      showFrom = new Date(),
      showUntil = null
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and message are required'
      });
    }
    
    const sql = `
      INSERT INTO user_notifications 
      (title, message, notification_type, target_type, priority, 
       show_from, show_until, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
      RETURNING id, title, message, notification_type, target_type,
                is_active, show_from, show_until, priority, created_at
    `;
    
    const result = await db.query(sql, [
      title, message, type, targetType, priority, 
      showFrom, showUntil, req.admin.id
    ]);
    
    console.log(`📢 Admin ${req.admin.email} created notification: '${title}'`);
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Create notification error:', error);
    res.status(500).json({
      error: 'Creation failed',
      message: 'Failed to create notification'
    });
  }
});

/**
 * PUT /api/notifications/:id
 * Update notification
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, isActive, showUntil } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }
    
    if (message !== undefined) {
      updates.push(`message = $${paramIndex}`);
      params.push(message);
      paramIndex++;
    }
    
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }
    
    if (showUntil !== undefined) {
      updates.push(`show_until = $${paramIndex}`);
      params.push(showUntil);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No fields to update'
      });
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const sql = `
      UPDATE user_notifications 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, message, is_active, show_until, updated_at
    `;
    
    const result = await db.query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Notification not found',
        message: `Notification with ID ${id} not found`
      });
    }
    
    console.log(`📝 Admin ${req.admin.email} updated notification ${id}`);
    
    res.json({
      message: 'Notification updated successfully',
      notification: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Update notification error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Failed to update notification'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM user_notifications WHERE id = $1 RETURNING id, title';
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Notification not found',
        message: `Notification with ID ${id} not found`
      });
    }
    
    console.log(`🗑️ Admin ${req.admin.email} deleted notification ${id}: '${result.rows[0].title}'`);
    
    res.json({
      message: 'Notification deleted successfully'
    });
    
  } catch (error) {
    console.error('💥 Delete notification error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Failed to delete notification'
    });
  }
});

module.exports = router;











