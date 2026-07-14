import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '50', 10),
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10),
  tempDir: path.resolve(__dirname, '../../', process.env.TEMP_DIR || '../temp'),
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  sitePassword: process.env.SITE_PASSWORD || 'loadtube',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
};
