const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const config = require('../config');

/**
 * Create admin user (for setup)
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} role - Admin role (SUPER_ADMIN, ADMIN)
 * @returns {Promise<Object>} Created admin user
 */
const createAdmin = async (email, password, role = 'ADMIN') => {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const query = `
    INSERT INTO admin_users (username, email, password_hash, role, is_active)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id, username, email, role, created_at
  `;
  
  const username = email.split('@')[0]; // Extract username from email
  const result = await db.query(query, [username, email, hashedPassword, role]);
  return result.rows[0];
};

/**
 * Authenticate admin user
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object|null>} Admin user or null
 */
const authenticateAdmin = async (email, password) => {
  console.log(`🔐 Authenticating admin: ${email}`);
  
  const query = `
    SELECT id, username, email, password_hash, role, is_active, last_login
    FROM admin_users 
    WHERE email = $1 AND is_active = true
  `;
  
  const result = await db.query(query, [email]);
  
  if (result.rows.length === 0) {
    console.log(`❌ Admin not found: ${email}`);
    return null;
  }
  
  const admin = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, admin.password_hash);
  
  if (!isValidPassword) {
    console.log(`❌ Invalid password for admin: ${email}`);
    return null;
  }
  
  // Update last login
  await db.query(
    'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
    [admin.id]
  );
  
  console.log(`✅ Admin authenticated successfully: ${email}`);
  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    lastLogin: new Date()
  };
};

/**
 * Generate JWT token for admin
 * @param {Object} admin - Admin user object
 * @returns {string} JWT token
 */
const generateToken = (admin) => {
  const payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    type: 'admin'
  };
  
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: config.jwt.expiresIn 
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.log(`❌ Invalid token: ${error.message}`);
    return null;
  }
};

/**
 * Get admin by ID
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object|null>} Admin user or null
 */
const getAdminById = async (adminId) => {
  const query = `
    SELECT id, username, email, role, is_active, created_at, last_login
    FROM admin_users 
    WHERE id = $1 AND is_active = true
  `;
  
  const result = await db.query(query, [adminId]);
  return result.rows[0] || null;
};

/**
 * Initialize default admin user if none exists
 */
const initializeDefaultAdmin = async () => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM admin_users');
    const adminCount = parseInt(result.rows[0].count);
    
    if (adminCount === 0) {
      console.log('🌱 No admin users found, creating default admin...');
      
      const defaultAdmin = await createAdmin(
        'anthony@familynest.com',
        'admin123',
        'SUPER_ADMIN'
      );
      
      console.log('✅ Default admin created:');
      console.log(`   📧 Email: anthony@familynest.com`);
      console.log(`   🔑 Password: admin123 (CHANGE THIS!)`);
      console.log(`   👑 Role: SUPER_ADMIN`);
      
      return defaultAdmin;
    } else {
      console.log(`👥 Found ${adminCount} existing admin user(s)`);
    }
  } catch (error) {
    console.error('💥 Failed to initialize admin users:', error);
  }
};

module.exports = {
  createAdmin,
  authenticateAdmin,
  generateToken,
  verifyToken,
  getAdminById,
  initializeDefaultAdmin
};
