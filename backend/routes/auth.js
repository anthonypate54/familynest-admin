const express = require('express');
const authService = require('../services/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }
    
    const admin = await authService.authenticateAdmin(email, password);
    
    if (!admin) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    const token = authService.generateToken(admin);
    
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
    
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Login failed due to server error'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current admin user info
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      createdAt: req.admin.created_at,
      lastLogin: req.admin.last_login
    }
  });
});

/**
 * POST /api/auth/verify
 * Verify token validity
 */
router.post('/verify', requireAuth, (req, res) => {
  res.json({
    valid: true,
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

/**
 * POST /api/auth/logout
 * Admin logout (client-side token removal)
 */
router.post('/logout', requireAuth, (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

/**
 * POST /api/auth/change-password
 * Change your own password (must supply current password)
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'New password must be at least 8 characters'
      });
    }

    const changed = await authService.changePassword(req.admin.id, currentPassword, newPassword);

    if (!changed) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }

    console.log(`🔑 Admin ${req.admin.email} changed their password`);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('💥 Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to change password'
    });
  }
});

module.exports = router;











