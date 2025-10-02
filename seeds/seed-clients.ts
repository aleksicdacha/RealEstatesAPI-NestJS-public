import { DataSource } from 'typeorm';
import { Client } from '@src/entities/client/client.entity';
import { Property } from '@src/entities/property/property.entity';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';

const env = dotenv.config({ path: './.env' });
dotenvExpand.expand(env);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [Client, Property, PropertyImage],
  synchronize: false,
  logging: true,
});

// AppDataSource.initialize()
//   .then((result) => {console.log(result)}).catch((err) => {console.log(err)});
// console.log('Database initialized successfully');
// console.log('Loaded Entities:', AppDataSource.entityMetadatas.map((e) => e.name));

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to the database.');

    const clientRepository = AppDataSource.getRepository(Client);
    const propertyRepository = AppDataSource.getRepository(Property);

    // Check if clients exist
    const existingClients = await clientRepository.count();
    if (existingClients > 0) {
      console.log('Clients already exist. Skipping seed.');
      return;
    }

    // Find the property by the given ID
    const property = await propertyRepository.findOne({
      where: { id: 'e0890111-3e5c-495d-b5d2-dd6224e62920' },
    });

    if (!property) {
      console.error('Property with ID "e0890111-3e5c-495d-b5d2-dd6224e62920" not found. Aborting seed.');
      return;
    }

    // Create a client
    const client = clientRepository.create({
      name: 'John Malkovitch',
      address: '456 Elm Street, Metropolis',
      email: 'johnmalkovitch@example.com',
      phone: '+381692345678',
      status: ClientStatus.Active,
      transactionType: TransactionType.Seller,
      property, // Associate the property
    });

    await clientRepository.save(client);

    console.log('Client has been seeded successfully:', client);
  } catch (error) {
    console.error('Error while seeding the database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

seed();
