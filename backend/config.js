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

  // Marketing tool DB connection - should use the restricted `marketing_tool`
  // Postgres role (SELECT anywhere, INSERT/UPDATE only on
  // marketing_segment_definitions and marketing_campaign_export - see
  // familynest-backend/scripts/marketing/04_create_restricted_role_OPTIONAL.sql).
  // Falls back to the main database config if not set, but that means ad-hoc
  // queries run through the full app DB user instead of the restricted role.
  marketingDatabase: {
    user: process.env.MARKETING_DB_USER || process.env.DB_USER || 'familynest_user',
    host: process.env.MARKETING_DB_HOST || process.env.DB_HOST || 'localhost',
    database: process.env.MARKETING_DB_NAME || process.env.DB_NAME || 'familynest_test',
    password: process.env.MARKETING_DB_PASSWORD || process.env.DB_PASSWORD || 'password',
    port: process.env.MARKETING_DB_PORT || process.env.DB_PORT || 5432,
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