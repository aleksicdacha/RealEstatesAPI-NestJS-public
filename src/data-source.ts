import { DataSource } from 'typeorm';
import { User } from '@src/entities/user/user.entity';
import { Property } from '@src/entities/property/property.entity';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
import { Client } from '@src/entities/client/client.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'real_estate_user',
  password: process.env.DB_PASSWORD || '***REMOVED-BY-SECURITY-CLEANUP***',
  database: process.env.DB_DATABASE || 'real_estate_db',
  synchronize: true,
  logging: true,
  entities: [User, Property, PropertyImage, Client],
  migrations: ['src/migrations/*.ts'],
});