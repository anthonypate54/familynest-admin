const express = require('express');
const authService = require('../services/auth');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin-management routes require auth, and are SUPER_ADMIN only
router.use(requireAuth, requireSuperAdmin);

/**
 * GET /api/admins
 * List all admin users
 */
router.get('/', async (req, res) => {
  try {
    const admins = await authService.listAdmins();
    res.json({ admins });
  } catch (error) {
    console.error('💥 List admins error:', error);
    res.status(500).json({
      error: 'Failed to list admins',
      message: 'Failed to retrieve admin users'
    });
  }
});

/**
 * POST /api/admins
 * Create a new admin user
 */
router.post('/', async (req, res) => {
  try {
    const { email, password, role = 'ADMIN' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters'
      });
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Role must be one of: ${allowedRoles.join(', ')}`
      });
    }

    const admin = await authService.createAdmin(email, password, role);

    console.log(`➕ Admin ${req.admin.email} created new admin: ${email} (${role})`);

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Admin already exists',
        message: 'An admin with this email already exists'
      });
    }

    console.error('💥 Create admin error:', error);
    res.status(500).json({
      error: 'Creation failed',
      message: 'Failed to create admin user'
    });
  }
});

/**
 * PUT /api/admins/:id/deactivate
 * Deactivate an admin user (soft delete - preserves history)
 */
router.put('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot deactivate your own account'
      });
    }

    const admin = await authService.deactivateAdmin(id);

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: `Admin with ID ${id} not found`
      });
    }

    console.log(`🚫 Admin ${req.admin.email} deactivated admin ${admin.email}`);

    res.json({ message: 'Admin deactivated successfully', admin });

  } catch (error) {
    console.error('💥 Deactivate admin error:', error);
    res.status(500).json({
      error: 'Deactivation failed',
      message: 'Failed to deactivate admin'
    });
  }
});

/**
 * PUT /api/admins/:id/reactivate
 * Reactivate a previously deactivated admin user
 */
router.put('/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await authService.reactivateAdmin(id);

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: `Admin with ID ${id} not found`
      });
    }

    console.log(`✅ Admin ${req.admin.email} reactivated admin ${admin.email}`);

    res.json({ message: 'Admin reactivated successfully', admin });

  } catch (error) {
    console.error('💥 Reactivate admin error:', error);
    res.status(500).json({
      error: 'Reactivation failed',
      message: 'Failed to reactivate admin'
    });
  }
});

module.exports = router;
