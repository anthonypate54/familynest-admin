const express = require('express');
const db = require('../services/database');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// All settings routes require authentication
router.use(requireAuth);

/**
 * GET /api/settings
 * Get all system settings
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let sql = `
      SELECT id, setting_key, setting_value, description, 
             updated_at, updated_by
      FROM system_settings
    `;
    
    const params = [];
    
    if (category && category.trim()) {
      sql += ` WHERE category = $1`;
      params.push(category.trim());
    }
    
    sql += ` ORDER BY setting_key`;
    
    const result = await db.query(sql, params);
    
    res.json({
      settings: result.rows,
      category: category || 'all'
    });
    
  } catch (error) {
    console.error('💥 Get settings error:', error);
    res.status(500).json({
      error: 'Failed to get settings',
      message: 'Failed to retrieve system settings'
    });
  }
});

/**
 * GET /api/settings/:key
 * Get specific setting by key
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const sql = `
      SELECT id, setting_key, setting_value, description,
             updated_at, updated_by
      FROM system_settings
      WHERE setting_key = $1
    `;
    
    const result = await db.query(sql, [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Setting not found',
        message: `Setting '${key}' not found`
      });
    }
    
    res.json({
      setting: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Get setting error:', error);
    res.status(500).json({
      error: 'Failed to get setting',
      message: 'Failed to retrieve setting'
    });
  }
});

/**
 * PUT /api/settings/:key
 * Update system setting (requires SUPER_ADMIN)
 */
router.put('/:key', requireSuperAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Setting value is required'
      });
    }
    
    const sql = `
      UPDATE system_settings 
      SET setting_value = $1,
          description = COALESCE($2, description),
          updated_at = NOW(),
          updated_by = $3
      WHERE setting_key = $4
      RETURNING id, setting_key, setting_value, description, updated_at
    `;
    
    const result = await db.query(sql, [value, description, req.admin.id, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Setting not found',
        message: `Setting '${key}' not found`
      });
    }
    
    console.log(`⚙️ Admin ${req.admin.email} updated setting '${key}' = '${value}'`);
    
    res.json({
      message: 'Setting updated successfully',
      setting: result.rows[0]
    });
    
  } catch (error) {
    console.error('💥 Update setting error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Failed to update setting'
    });
  }
});

/**
 * POST /api/settings
 * Create new system setting (requires SUPER_ADMIN)
 */
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { settingKey, value, description, dataType = 'STRING' } = req.body;
    
    if (!settingKey || value === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Setting key and value are required'
      });
    }
    
    const sql = `
      INSERT INTO system_settings (setting_key, setting_value, data_type, description, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, setting_key, setting_value, description, updated_at
    `;
    
    const result = await db.query(sql, [settingKey, value, dataType, description, req.admin.id]);
    
    console.log(`➕ Admin ${req.admin.email} created setting '${settingKey}' = '${value}'`);
    
    res.status(201).json({
      message: 'Setting created successfully',
      setting: result.rows[0]
    });
    
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Setting already exists',
        message: 'A setting with this key already exists'
      });
    }
    
    console.error('💥 Create setting error:', error);
    res.status(500).json({
      error: 'Creation failed',
      message: 'Failed to create setting'
    });
  }
});

module.exports = router;











