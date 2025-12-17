import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  name: process.env.DB_DATABASE || process.env.DB_NAME || 'estates',
  synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));
