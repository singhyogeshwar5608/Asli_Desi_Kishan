import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8080'),
  CLIENT_WEB_ORIGIN: z.string().optional(),
  CLIENT_FLUTTER_ORIGIN: z.string().optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PASSWORD_SALT_ROUNDS: z.string().default('10'),
  REDIS_URL: z.string().optional(),
  ENABLE_ACTIVITY_STREAM: z.string().optional(),
  ENABLE_SOCKET_NOTIFICATIONS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV !== 'production',
  port: Number(env.PORT),
  clientWebOrigin: env.CLIENT_WEB_ORIGIN,
  clientFlutterOrigin: env.CLIENT_FLUTTER_ORIGIN,
  mongo: {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    saltRounds: Number(env.PASSWORD_SALT_ROUNDS),
  },
  redisUrl: env.REDIS_URL,
  features: {
    activityStream: env.ENABLE_ACTIVITY_STREAM === 'true',
    socketNotifications: env.ENABLE_SOCKET_NOTIFICATIONS === 'true',
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    uploadFolder: env.CLOUDINARY_UPLOAD_FOLDER,
  },
};
