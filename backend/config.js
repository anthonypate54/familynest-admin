require('dotenv').config();

// AWS RDS rejects plain unencrypted connections (pg_hba.conf requires SSL),
// but a local Postgres install typically neither needs nor is configured
// for it. Rather than hardcoding one or the other, only require SSL when
// the target host isn't local - so the exact same config.js works
// unmodified against local dev Postgres AND staging/production RDS.
// `rejectUnauthorized: false` skips validating RDS's certificate chain
// (there's no easy-to-bundle custom CA here); the connection is still
// encrypted, just not verified against a trusted root - acceptable here
// since this is a direct connection to a specific known AWS-managed host,
// not a public-internet endpoint an attacker could easily MITM.
const isLocalHost = (host) => !host || host === 'localhost' || host === '127.0.0.1';
const sslFor = (host) => (isLocalHost(host) ? false : { rejectUnauthorized: false });

module.exports = {
  // Database configuration
  database: {
    user: process.env.DB_USER || 'familynest_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'familynest_test',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: sslFor(process.env.DB_HOST),
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
    ssl: sslFor(process.env.MARKETING_DB_HOST || process.env.DB_HOST),
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