require('dotenv').config();

module.exports = {
  // Database configuration
  database: {
    user: process.env.DB_USER || 'familynest_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'familynest_test',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretadminjwtkey',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Server configuration
  server: {
    port: process.env.ADMIN_API_PORT || 3001,
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },
  
  // External APIs (if needed)
  mainApi: {
    url: process.env.MAIN_API_URL || 'http://localhost:8080/api',
  },
};