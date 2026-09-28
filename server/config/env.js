import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sewalink',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  emailHost: process.env.EMAIL_HOST,
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM || 'SewaLink <noreply@sewalink.local>',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@sewalink.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'AdminPass123!',
  seedPassword: process.env.SEED_PASSWORD || 'DemoPass123!',
  imageStorage: process.env.IMAGE_STORAGE || 'local',
  nodeEnv: process.env.NODE_ENV || 'development',
};
