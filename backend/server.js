const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const config = require('./config');
const db = require('./services/database');
const authService = require('./services/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');
const adminsRoutes = require('./routes/admins');
const marketingRoutes = require('./routes/marketing');

const app = express();
const PORT = config.server.port;

// Security & logging middleware
app.use(helmet());
app.use(cors(config.server.cors));
app.use(morgan('combined'));
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FamilyNest Admin API',
    timestamp: new Date().toISOString()
  });
});

// Real, database-backed routes (JWT-protected where appropriate, see middleware/auth.js)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/marketing', marketingRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 FamilyNest Admin API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  const connected = await db.testConnection();
  if (connected) {
    await authService.initializeDefaultAdmin();
  } else {
    console.warn('⚠️  Database connection failed at startup - admin auth will not work until the DB is reachable. Check backend/.env');
  }
});

module.exports = app;
