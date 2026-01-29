"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../src/entities/property/property.entity");
const property_image_entity_1 = require("../src/entities/property-image/property-image.entity");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const env = dotenv.config({ path: './.env' });
dotenvExpand.expand(env);
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'CHANGE_ME',
    database: process.env.DB_NAME || 'estates',
    entities: [property_entity_1.Property, property_image_entity_1.PropertyImage],
    synchronize: false,
    logging: true,
});
async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to the database.');
        const propertyRepository = AppDataSource.getRepository(property_entity_1.Property);
        const propertyImageRepository = AppDataSource.getRepository(property_image_entity_1.PropertyImage);
        const existingProperties = await propertyRepository.count();
        if (existingProperties > 0) {
            console.log('Properties already exist. Skipping seed.');
            return;
        }
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
    }
    catch (error) {
        console.error('Error while seeding the database:', error);
    }
    finally {
        await AppDataSource.destroy();
        console.log('Database connection closed.');
    }
}
seed();
//# sourceMappingURL=seed-properties.js.map