const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.ADMIN_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'FamilyNest Admin API',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'anthony@familynest.com' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      token: 'mock-jwt-token-' + Date.now(),
      admin: {
        id: 1,
        username: 'anthony',
        email: 'anthony@familynest.com',
        role: 'SUPER_ADMIN',
        lastLogin: new Date()
      }
    });
  } else {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }
});

// Auth verification endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Authorization header missing or invalid'
    });
  }
  
  const token = authHeader.substring(7);
  
  // Simple token validation (in real app, verify JWT)
  if (token.startsWith('mock-jwt-token-')) {
    res.json({
      admin: {
        id: 1,
        username: 'anthony',
        email: 'anthony@familynest.com',
        role: 'SUPER_ADMIN',
        lastLogin: new Date()
      }
    });
  } else {
    res.status(401).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
});

// Mock user stats endpoint
app.get('/api/users/stats', (req, res) => {
  res.json({
    stats: {
      total_users: 42,
      trial_users: 12,
      active_users: 25,
      expired_users: 3,
      cancelled_users: 2,
      new_users_7d: 8,
      new_users_30d: 35,
      monthly_revenue: 74.75
    }
  });
});

// Mock users search endpoint
app.get('/api/users/search', (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        email: 'claude@test.com',
        first_name: 'Claude',
        last_name: 'User',
        subscription_status: 'trial',
        trial_end_date: '2025-09-20T00:00:00.000Z',
        subscription_end_date: null,
        platform: null,
        monthly_price: 2.99,
        created_at: '2025-09-15T00:00:00.000Z'
      },
      {
        id: 2,
        email: 'bucky@test.com',
        first_name: 'Bucky',
        last_name: 'User',
        subscription_status: 'active',
        trial_end_date: null,
        subscription_end_date: '2025-10-15T00:00:00.000Z',
        platform: 'google',
        monthly_price: 2.99,
        created_at: '2025-08-15T00:00:00.000Z'
      }
    ],
    pagination: {
      page: 0,
      size: 20,
      total: 2,
      totalPages: 1
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 FamilyNest Admin API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Test login: anthony@familynest.com / admin123`);
  console.log('✅ Mock Admin API ready for testing');
});

module.exports = app;