"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../src/entities/client/client.entity");
const property_entity_1 = require("../src/entities/property/property.entity");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const property_image_entity_1 = require("../src/entities/property-image/property-image.entity");
const client_status_enum_1 = require("../src/entities/client/enums/client-status.enum");
const transaction_type_enum_1 = require("../src/entities/client/enums/transaction-type.enum");
const env = dotenv.config({ path: './.env' });
dotenvExpand.expand(env);
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'CHANGE_ME',
    database: process.env.DB_NAME || 'estates',
    entities: [client_entity_1.Client, property_entity_1.Property, property_image_entity_1.PropertyImage],
    synchronize: false,
    logging: true,
});
async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to the database.');
        const clientRepository = AppDataSource.getRepository(client_entity_1.Client);
        const propertyRepository = AppDataSource.getRepository(property_entity_1.Property);
        const existingClients = await clientRepository.count();
        if (existingClients > 0) {
            console.log('Clients already exist. Skipping seed.');
            return;
        }
        const property = await propertyRepository.findOne({
            where: { id: 'e0890111-3e5c-495d-b5d2-dd6224e62920' },
        });
        if (!property) {
            console.error('Property with ID "e0890111-3e5c-495d-b5d2-dd6224e62920" not found. Aborting seed.');
            return;
        }
        const client = clientRepository.create({
            name: 'John Malkovitch',
            address: '456 Elm Street, Metropolis',
            email: 'johnmalkovitch@example.com',
            phone: '+381692345678',
            status: client_status_enum_1.ClientStatus.Active,
            transactionType: transaction_type_enum_1.TransactionType.Seller,
            property,
        });
        await clientRepository.save(client);
        console.log('Client has been seeded successfully:', client);
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
//# sourceMappingURL=seed-clients.js.map