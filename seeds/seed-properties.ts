import { DataSource } from 'typeorm';
import { Property } from '@src/property/property.entity';
import { PropertyImage } from '@src/property-image/property-image.entity';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

const env = dotenv.config({ path: './.env' });
dotenvExpand.expand(env);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [Property, PropertyImage],
  synchronize: false,
  logging: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to the database.');

    const propertyRepository = AppDataSource.getRepository(Property);
    const propertyImageRepository = AppDataSource.getRepository(PropertyImage);

    // Check if properties exist
    const existingProperties = await propertyRepository.count();
    if (existingProperties > 0) {
      console.log('Properties already exist. Skipping seed.');
      return;
    }

    // Create a property with images
    const property = propertyRepository.create({
      code: 'Luxury Apartment',
      description: 'A beautiful luxury apartment in the city center.',
      price: 250000,
      salePrice: 270000,
      area: 120.5,
      address: '123 Main Street, Metropolis',
      lat: 44.7866,
      lon: 20.4489,
    });

    // Save property and images
    property.images = [
      propertyImageRepository.create({
        url: 'https://example.com/image1.jpg',
        order: 1,
        isFavorite: true,
      }),
      propertyImageRepository.create({
        url: 'https://example.com/image2.jpg',
        order: 2,
      }),
    ];
    await propertyRepository.save(property);

    console.log('Property and images have been seeded successfully:', property);
  } catch (error) {
    console.error('Error while seeding the database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

seed();
