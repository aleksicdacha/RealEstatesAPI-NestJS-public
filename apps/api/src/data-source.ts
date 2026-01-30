import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: false, // Must be false for migrations
  logging: ['query', 'error', 'warn'], // Enable detailed logging
  entities: ['dist/entities/**/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
});