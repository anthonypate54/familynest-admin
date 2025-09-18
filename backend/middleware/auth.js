const authService = require('../services/auth');

/**
 * Middleware to verify admin authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No valid authorization header' 
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
    
    // Get fresh admin data
    const admin = await authService.getAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Admin user not found or inactive' 
      });
    }
    
    // Attach admin to request
    req.admin = admin;
    next();
    
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error', 
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to require specific admin role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

/**
 * Middleware to require SUPER_ADMIN role
 */
const requireSuperAdmin = requireRole('SUPER_ADMIN');

module.exports = {
  requireAuth,
  requireRole,
  requireSuperAdmin
};
