import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Register tsconfig paths for CLI commands
require('tsconfig-paths/register');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: true,  // Temporarily enabled for local dev (bypasses corrupted migrations)
  logging: true,
  entities: [__dirname + '/entities/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});