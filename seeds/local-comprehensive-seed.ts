// Register tsconfig paths before imports
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('../apps/api/tsconfig.json');

tsConfigPaths.register({
  baseUrl: '../apps/api',
  paths: tsConfig.compilerOptions.paths
});

import { DataSource } from 'typeorm';
import { User } from '../apps/api/src/entities/user/user.entity';
import { Property } from '../apps/api/src/entities/property/property.entity';
import { Client } from '../apps/api/src/entities/client/client.entity';
import { PropertyImage } from '../apps/api/src/entities/property-image/property-image.entity';
import { Role } from '../apps/api/src/entities/user/enums/role.enum';
import { PropertyType } from '../apps/api/src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '../apps/api/src/entities/property/enums/property-status.enum';
import { HeatingType } from '../apps/api/src/entities/property/enums/heating.enum';
import { ClientStatus } from '../apps/api/src/entities/client/enums/client-status.enum';
import { TransactionType } from '../apps/api/src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '../apps/api/src/entities/client/enums/payment-type.enum';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(__dirname, '../apps/api/.env') });

// Initialize DataSource
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: false,
  logging: true,
  entities: [__dirname + '/../apps/api/src/entities/**/*.entity.{ts,js}'],
});

const seedData = async () => {
  console.log('🌱 Starting comprehensive database seeding...');

  // Initialize the data source
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  // Get repositories
  const userRepository = AppDataSource.getRepository(User);
  const propertyRepository = AppDataSource.getRepository(Property);
  const clientRepository = AppDataSource.getRepository(Client);
  const imageRepository = AppDataSource.getRepository(PropertyImage);

  try {
    // Clear existing data (in correct order due to foreign key constraints)
    console.log('🗑️  Clearing existing data...');
    await imageRepository.delete({});
    await clientRepository.delete({});
    await propertyRepository.delete({});
    await userRepository.delete({});
    console.log('✅ Existing data cleared');

    // Seed Users (minimum 10)
    console.log('👥 Creating users...');
    const saltRounds = 10;
    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', saltRounds),
        role: Role.ADMIN,
      },
      {
        username: 'agent1',
        password: await bcrypt.hash('agent123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'agent2',
        password: await bcrypt.hash('agent123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'agent3',
        password: await bcrypt.hash('agent123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'agent4',
        password: await bcrypt.hash('agent123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'manager1',
        password: await bcrypt.hash('manager123', saltRounds),
        role: Role.ADMIN,
      },
      {
        username: 'manager2',
        password: await bcrypt.hash('manager123', saltRounds),
        role: Role.ADMIN,
      },
      {
        username: 'sales1',
        password: await bcrypt.hash('sales123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'sales2',
        password: await bcrypt.hash('sales123', saltRounds),
        role: Role.USER,
      },
      {
        username: 'viewer',
        password: await bcrypt.hash('viewer123', saltRounds),
        role: Role.USER,
      },
    ];

    const savedUsers = await userRepository.save(users);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Seed Properties (minimum 15 with diverse types)
    console.log('🏠 Creating properties...');
    const properties = [
      {
        code: 'APT-001',
        guid: 'a1b2c3d4-e5f6-4789-a1b2-c3d4e5f67890',
        description: 'Luxury 3-bedroom apartment in city center with panoramic views',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 185000,
        salePrice: 180000,
        area: 95.5,
        address: '123 Downtown Plaza, Belgrade',
        neighborhood: 'City Center',
        lat: 44.7866,
        lon: 20.4489,
        comment: 'Prime location, recently renovated',
        elevator: true,
        additionalEquipment: ['Air conditioning', 'Parking', 'Balcony'],
        constructionYear: 2015,
        bathrooms: 2,
        floor: 8,
        heating: HeatingType.CENTRAL,
        specialOffer: 1,
      },
      {
        code: 'HOU-001',
        guid: 'b2c3d4e5-f6a7-4890-b2c3-d4e5f6a78901',
        description: 'Spacious family house with garden and garage',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 240000,
        salePrice: 235000,
        area: 150.0,
        address: '456 Residential Street, Novi Sad',
        neighborhood: 'Residential Area',
        lat: 45.2671,
        lon: 19.8335,
        comment: 'Perfect for families',
        elevator: false,
        additionalEquipment: ['Garden', 'Garage', 'Fireplace'],
        constructionYear: 2010,
        bathrooms: 3,
        floor: 0,
        heating: HeatingType.GAS_CENTRAL,
        specialOffer: 2,
      },
      {
        code: 'LND-001',
        guid: 'c3d4e5f6-a7b8-4901-c3d4-e5f6a7b89012',
        description: 'Building land with utilities connection',
        propertyType: PropertyType.Land,
        status: PropertyStatus.Active,
        price: 95000,
        salePrice: 90000,
        area: 500.0,
        address: '789 Development Zone, Niš',
        neighborhood: 'Development Zone',
        lat: 43.3209,
        lon: 21.8954,
        comment: 'Ready for construction',
        elevator: false,
        additionalEquipment: ['Utilities'],
        constructionYear: null,
        bathrooms: 0,
        floor: 0,
        heating: HeatingType.OTHER,
        specialOffer: 3,
      },
      {
        code: 'OFF-001',
        guid: 'd4e5f6a7-b8c9-4012-d4e5-f6a7b8c90123',
        description: 'Modern office space in business district',
        propertyType: PropertyType.Office,
        status: PropertyStatus.Active,
        price: 175000,
        salePrice: 170000,
        area: 120.0,
        address: '100 Business Center, Belgrade',
        neighborhood: 'Business District',
        lat: 44.8125,
        lon: 20.4612,
        comment: 'High-end finishes',
        elevator: true,
        additionalEquipment: ['Parking', 'Security', 'AC'],
        constructionYear: 2020,
        bathrooms: 2,
        floor: 5,
        heating: HeatingType.ELECTRIC_CENTRAL,
        specialOffer: 4,
      },
      {
        code: 'COM-001',
        guid: 'e5f6a7b8-c9d0-4123-e5f6-a7b8c9d01234',
        description: 'Commercial space for retail or restaurant',
        propertyType: PropertyType.CommercialSpace,
        status: PropertyStatus.Active,
        price: 220000,
        salePrice: 215000,
        area: 180.0,
        address: '200 Shopping Street, Kragujevac',
        neighborhood: 'Shopping District',
        lat: 44.0125,
        lon: 20.9114,
        comment: 'High foot traffic',
        elevator: false,
        additionalEquipment: ['Storage', 'Loading dock'],
        constructionYear: 2018,
        bathrooms: 2,
        floor: 0,
        heating: HeatingType.FLOOR,
        specialOffer: 5,
      },
      {
        code: 'VAC-001',
        guid: 'f6a7b8c9-d0e1-4234-f6a7-b8c9d0e12345',
        description: 'Cozy vacation home near lake',
        propertyType: PropertyType.VacationHome,
        status: PropertyStatus.Active,
        price: 150000,
        salePrice: 145000,
        area: 85.0,
        address: '300 Lake View, Zlatibor',
        neighborhood: 'Mountain Resort',
        lat: 43.7398,
        lon: 19.7148,
        comment: 'Perfect getaway',
        elevator: false,
        additionalEquipment: ['Terrace', 'BBQ', 'Fireplace'],
        constructionYear: 2012,
        bathrooms: 2,
        floor: 0,
        heating: HeatingType.FIREPLACE,
        specialOffer: 6,
      },
      {
        code: 'DUP-001',
        guid: 'a7b8c9d0-e1f2-4345-a7b8-c9d0e1f23456',
        description: 'Modern duplex with rooftop terrace',
        propertyType: PropertyType.Duplex,
        status: PropertyStatus.Active,
        price: 280000,
        salePrice: 275000,
        area: 160.0,
        address: '400 Urban Heights, Belgrade',
        neighborhood: 'Modern District',
        lat: 44.7989,
        lon: 20.4599,
        comment: 'Exclusive design',
        elevator: true,
        additionalEquipment: ['Terrace', 'Smart home', 'Parking'],
        constructionYear: 2021,
        bathrooms: 3,
        floor: 10,
        heating: HeatingType.FLOOR,
        specialOffer: 7,
      },
      {
        code: 'AIH-001',
        guid: 'b8c9d0e1-f2a3-4456-b8c9-d0e1f2a34567',
        description: 'Charming apartment in traditional house',
        propertyType: PropertyType.ApartmentInHouse,
        status: PropertyStatus.Active,
        price: 95000,
        salePrice: 92000,
        area: 70.0,
        address: '500 Old Town, Subotica',
        neighborhood: 'Historic District',
        lat: 46.1003,
        lon: 19.6659,
        comment: 'Heritage property',
        elevator: false,
        additionalEquipment: ['Courtyard', 'Garden access'],
        constructionYear: 1950,
        bathrooms: 1,
        floor: 1,
        heating: HeatingType.INDEPENDENT_ON_GAS,
        specialOffer: 8,
      },
      {
        code: 'APT-002',
        guid: 'c9d0e1f2-a3b4-4567-c9d0-e1f2a3b45678',
        description: 'Studio apartment for students or singles',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 55000,
        salePrice: 53000,
        area: 35.0,
        address: '600 University District, Belgrade',
        neighborhood: 'University Area',
        lat: 44.8041,
        lon: 20.4651,
        comment: 'Great investment',
        elevator: true,
        additionalEquipment: ['Furnished'],
        constructionYear: 2019,
        bathrooms: 1,
        floor: 3,
        heating: HeatingType.ELECTRIC_CENTRAL,
        specialOffer: 9,
      },
      {
        code: 'HOU-002',
        guid: 'd0e1f2a3-b4c5-4678-d0e1-f2a3b4c56789',
        description: 'Traditional house with large yard',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 180000,
        salePrice: 175000,
        area: 120.0,
        address: '700 Countryside, Valjevo',
        neighborhood: 'Rural Area',
        lat: 44.2752,
        lon: 19.8900,
        comment: 'Peaceful location',
        elevator: false,
        additionalEquipment: ['Garden', 'Orchard', 'Well'],
        constructionYear: 1995,
        bathrooms: 2,
        floor: 0,
        heating: HeatingType.SOLID_FUEL_CENTRAL,
        specialOffer: 10,
      },
      {
        code: 'APT-003',
        guid: 'e1f2a3b4-c5d6-4789-e1f2-a3b4c5d67890',
        description: 'Penthouse with spectacular city views',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Inactive,
        price: 450000,
        salePrice: 440000,
        area: 200.0,
        address: '800 Elite Towers, Belgrade',
        neighborhood: 'Elite District',
        lat: 44.8176,
        lon: 20.4633,
        comment: 'Luxury living',
        elevator: true,
        additionalEquipment: ['Jacuzzi', 'Sauna', 'Wine cellar', 'Parking'],
        constructionYear: 2022,
        bathrooms: 4,
        floor: 20,
        heating: HeatingType.FLOOR,
        specialOffer: null,
      },
      {
        code: 'OFF-002',
        guid: 'f2a3b4c5-d6e7-4890-f2a3-b4c5d6e78901',
        description: 'Co-working space with modern amenities',
        propertyType: PropertyType.Office,
        status: PropertyStatus.Active,
        price: 145000,
        salePrice: 142000,
        area: 90.0,
        address: '900 Innovation Hub, Novi Sad',
        neighborhood: 'Tech District',
        lat: 45.2556,
        lon: 19.8452,
        comment: 'Start-up friendly',
        elevator: true,
        additionalEquipment: ['High-speed internet', 'Meeting rooms'],
        constructionYear: 2021,
        bathrooms: 2,
        floor: 2,
        heating: HeatingType.AIR_CONDITIONER,
        specialOffer: 11,
      },
      {
        code: 'LND-002',
        guid: 'a3b4c5d6-e7f8-4901-a3b4-c5d6e7f89012',
        description: 'Agricultural land with access road',
        propertyType: PropertyType.Land,
        status: PropertyStatus.Active,
        price: 45000,
        salePrice: 43000,
        area: 2000.0,
        address: 'Rural Route 12, Čačak',
        neighborhood: 'Agricultural Zone',
        lat: 43.8910,
        lon: 20.3497,
        comment: 'Farming potential',
        elevator: false,
        additionalEquipment: ['Road access'],
        constructionYear: null,
        bathrooms: 0,
        floor: 0,
        heating: HeatingType.OTHER,
        specialOffer: 12,
      },
      {
        code: 'COM-002',
        guid: 'b4c5d6e7-f8a9-4012-b4c5-d6e7f8a90123',
        description: 'Restaurant space with full kitchen',
        propertyType: PropertyType.CommercialSpace,
        status: PropertyStatus.Active,
        price: 195000,
        salePrice: 190000,
        area: 150.0,
        address: '1000 Food Court, Niš',
        neighborhood: 'Entertainment District',
        lat: 43.3235,
        lon: 21.9027,
        comment: 'Turnkey operation',
        elevator: false,
        additionalEquipment: ['Commercial kitchen', 'Terrace'],
        constructionYear: 2017,
        bathrooms: 2,
        floor: 0,
        heating: HeatingType.GAS_CENTRAL,
        specialOffer: 13,
      },
      {
        code: 'HOU-003',
        guid: 'c5d6e7f8-a9b0-4123-c5d6-e7f8a9b01234',
        description: 'Newly built smart home',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 320000,
        salePrice: 315000,
        area: 180.0,
        address: '1100 Smart Living, Belgrade',
        neighborhood: 'New Development',
        lat: 44.7661,
        lon: 20.5122,
        comment: 'Energy efficient',
        elevator: false,
        additionalEquipment: ['Smart home system', 'Solar panels', 'EV charger'],
        constructionYear: 2023,
        bathrooms: 3,
        floor: 0,
        heating: HeatingType.FLOOR,
        specialOffer: 14,
      },
    ];

    const savedProperties = await propertyRepository.save(properties);
    console.log(`✅ Created ${savedProperties.length} properties`);

    // Seed Property Images
    console.log('🖼️  Creating property images...');
    const uploadsPath = path.join(__dirname, '../uploads');
    let imageFiles: string[] = [];

    // Check if uploads directory exists and has images
    if (fs.existsSync(uploadsPath)) {
      imageFiles = fs.readdirSync(uploadsPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    }

    if (imageFiles.length > 0) {
      const propertyImages: any[] = [];

      // Assign 3-5 images to each property
      savedProperties.forEach((property, pIndex) => {
        const numImages = 3 + (pIndex % 3); // 3, 4, or 5 images per property

        for (let i = 0; i < numImages && i < imageFiles.length; i++) {
          const imgIndex = (pIndex * 3 + i) % imageFiles.length;
          propertyImages.push({
            property: property,
            imageUrl: `/uploads/${imageFiles[imgIndex]}`,
            order: i + 1,
            isFavorite: i === 0, // First image is favorite
          });
        }
      });

      if (propertyImages.length > 0) {
        const savedImages = await imageRepository.save(propertyImages);
        console.log(`✅ Created ${savedImages.length} property images`);
      }
    } else {
      console.log('⚠️  No images found in uploads directory, skipping image seeding');
    }

    // Seed Clients (minimum 15 with property relationships)
    console.log('👤 Creating clients...');
    const clients = [
      {
        name: 'Marko Petrović',
        address: 'Knez Mihailova 42, Belgrade',
        email: 'marko.petrovic@email.rs',
        phone: '+381601234567',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Cash,
        comment: 'Interested in downtown apartments',
        moneyAmount: 200000,
        property: savedProperties[0],
      },
      {
        name: 'Ana Jovanović',
        address: 'Strahinića Bana 15, Novi Sad',
        email: 'ana.jovanovic@gmail.com',
        phone: '+381629876543',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Credit,
        comment: 'Selling family home',
        moneyAmount: 240000,
        property: savedProperties[1],
      },
      {
        name: 'Nikola Đorđević',
        address: 'Bulevar Oslobođenja 88, Niš',
        email: 'nikola.djordjevic@yahoo.com',
        phone: '+381611357924',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Combined,
        comment: 'Looking for investment property',
        moneyAmount: 95000,
        property: savedProperties[2],
      },
      {
        name: 'Milica Radić',
        address: 'Terazije 3, Belgrade',
        email: 'milica.radic@hotmail.com',
        phone: '+381602468135',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Cash,
        comment: 'Business owner',
        moneyAmount: 175000,
        property: savedProperties[3],
      },
      {
        name: 'Stefan Milanović',
        address: 'Kraljice Marije 8, Kragujevac',
        email: 'stefan.milanovic@gmail.rs',
        phone: '+381631357924',
        status: ClientStatus.Inactive,
        transactionType: TransactionType.RentsOut,
        paymentType: PaymentType.Cash,
        comment: 'Property owner, rents commercial space',
        moneyAmount: 220000,
        property: savedProperties[4],
      },
      {
        name: 'Jelena Nikolić',
        address: 'Cara Dušana 22, Subotica',
        email: 'jelena.nikolic@email.rs',
        phone: '+381642345678',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Vacation home for sale',
        moneyAmount: 150000,
        property: savedProperties[5],
      },
      {
        name: 'Dragan Maksimović',
        address: 'Vidovdanska 45, Belgrade',
        email: 'dragan.maksimovic@yahoo.rs',
        phone: '+381652345678',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'Pre-approved for mortgage',
        moneyAmount: 280000,
        property: savedProperties[6],
      },
      {
        name: 'Tijana Stojanović',
        address: 'Narodnog Fronta 16, Kragujevac',
        email: 'tijana.stojanovic@gmail.com',
        phone: '+381663456789',
        status: ClientStatus.Active,
        transactionType: TransactionType.Rents,
        paymentType: PaymentType.Cash,
        comment: 'Looking to rent apartment',
        moneyAmount: 95000,
        property: savedProperties[7],
      },
      {
        name: 'Igor Pavlović',
        address: 'Save Kovačevića 7, Niš',
        email: 'igor.pavlovic@hotmail.rs',
        phone: '+381674567890',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Cash,
        comment: 'First-time buyer',
        moneyAmount: 55000,
        property: savedProperties[8],
      },
      {
        name: 'Maja Popović',
        address: 'Makedonska 33, Valjevo',
        email: 'maja.popovic@email.rs',
        phone: '+381685678901',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Inherited property',
        moneyAmount: 180000,
        property: savedProperties[9],
      },
      {
        name: 'Vladimir Kostić',
        address: 'Kneginje Zorke 12, Belgrade',
        email: 'vladimir.kostic@gmail.rs',
        phone: '+381696789012',
        status: ClientStatus.Deleted,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'Client withdrew from deal',
        moneyAmount: 450000,
        property: savedProperties[10],
      },
      {
        name: 'Sandra Ilić',
        address: 'Bulevar Kralja Petra 44, Novi Sad',
        email: 'sandra.ilic@yahoo.com',
        phone: '+381607890123',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Combined,
        comment: 'Tech startup founder',
        moneyAmount: 145000,
        property: savedProperties[11],
      },
      {
        name: 'Nemanja Živković',
        address: 'Cara Lazara 56, Čačak',
        email: 'nemanja.zivkovic@email.rs',
        phone: '+381618901234',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Selling agricultural land',
        moneyAmount: 45000,
        property: savedProperties[12],
      },
      {
        name: 'Danijela Marković',
        address: 'Obrenovićeva 78, Niš',
        email: 'danijela.markovic@gmail.com',
        phone: '+381629012345',
        status: ClientStatus.Active,
        transactionType: TransactionType.RentsOut,
        paymentType: PaymentType.Cash,
        comment: 'Restaurant owner',
        moneyAmount: 195000,
        property: savedProperties[13],
      },
      {
        name: 'Aleksandar Simić',
        address: 'Patrijarha Pavla 99, Belgrade',
        email: 'aleksandar.simic@hotmail.rs',
        phone: '+381630123456',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'Eco-conscious buyer',
        moneyAmount: 320000,
        property: savedProperties[14],
      },
    ];

    const savedClients = await clientRepository.save(clients);
    console.log(`✅ Created ${savedClients.length} clients`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${savedUsers.length}`);
    console.log(`   Properties: ${savedProperties.length}`);
    console.log(`   Clients: ${savedClients.length}`);
    console.log(`   Images: ${imageFiles.length > 0 ? 'Seeded' : 'Skipped (no images found)'}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔐 Default Admin Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed
seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
