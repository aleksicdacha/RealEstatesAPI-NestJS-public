import { DataSource } from 'typeorm';
import { User } from '../src/entities/user/user.entity';
import { Property } from '../src/entities/property/property.entity';
import { Client } from '../src/entities/client/client.entity';
import { PropertyImage } from '../src/entities/property-image/property-image.entity';
import { Role } from '../src/entities/user/enums/role.enum';
import { PropertyType } from '../src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '../src/entities/property/enums/property-status.enum';
import { HeatingType } from '../src/entities/property/enums/heating.enum';
import { ClientStatus } from '../src/entities/client/enums/client-status.enum';
import { TransactionType } from '../src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '../src/entities/client/enums/payment-type.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [User, Property, Client, PropertyImage],
  synchronize: false,
  logging: true,
});

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('📚 Connected to the database for seeding...');

    const userRepository = AppDataSource.getRepository(User);
    const propertyRepository = AppDataSource.getRepository(Property);
    const propertyImageRepository = AppDataSource.getRepository(PropertyImage);
    const clientRepository = AppDataSource.getRepository(Client);

    // Check if data already exists
    const existingUsers = await userRepository.count();
    const existingProperties = await propertyRepository.count();
    const existingImages = await propertyImageRepository.count();
    
    if (existingUsers > 0 && existingProperties > 0 && existingImages > 0) {
      console.log('🔄 All data already exists. Skipping seed to avoid duplicates.');
      console.log(`   Current counts - Users: ${existingUsers}, Properties: ${existingProperties}, Images: ${existingImages}, Clients: ${await clientRepository.count()}`);
      return;
    }

    let savedUsers = [];
    let savedProperties = [];

    // ========== SEED USERS ==========
    if (existingUsers === 0) {
      console.log('👥 Creating users...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const hashedUserPassword = await bcrypt.hash('password123', 10);

      const users = [
        {
          username: 'admin',
          password: hashedPassword,
          role: Role.ADMIN,
        },
        {
          username: 'manager1',
          password: hashedUserPassword,
          role: Role.ADMIN,
        },
        {
          username: 'agent1',
          password: hashedUserPassword,
          role: Role.USER,
        },
        {
          username: 'agent2',
          password: hashedUserPassword,
          role: Role.USER,
        },
      ];

      savedUsers = await userRepository.save(users);
      console.log(`✅ Created ${savedUsers.length} users`);
    } else {
      console.log('👥 Users already exist, skipping...');
      savedUsers = await userRepository.find();
    }

    // ========== SEED PROPERTIES ==========
    if (existingProperties === 0) {
      console.log('🏠 Creating properties...');

      const properties = [
        {
          code: 'APT001',
          description: 'Luxurious 3-bedroom apartment in city center with stunning views and modern amenities. Recently renovated with high-end finishes.',
          propertyType: PropertyType.Apartment,
          status: PropertyStatus.Active,
          price: 450000,
          salePrice: 420000,
          area: 120.5,
          address: '123 Main Street, Downtown District, City Center',
          lat: 44.787197,
          lon: 20.457273,
          comment: 'Prime location, excellent investment opportunity',
          elevator: true,
          additionalEquipment: ['Air Conditioning', 'Dishwasher', 'Washing Machine', 'Built-in Wardrobes'],
          constructionYear: 2018,
          bathrooms: 2,
          floor: 5,
          heating: HeatingType.CENTRAL,
        },
        {
          code: 'HSE002',
          description: 'Beautiful family house with large garden and garage. Perfect for families with children.',
          propertyType: PropertyType.House,
          status: PropertyStatus.Active,
          price: 280000,
          salePrice: 270000,
          area: 180.0,
          address: '456 Oak Avenue, Suburban Hills, Green Valley',
          lat: 44.825197,
          lon: 20.425273,
          comment: 'Family-friendly neighborhood, good schools nearby',
          elevator: false,
          additionalEquipment: ['Garden', 'Garage', 'Fireplace', 'Basement'],
          constructionYear: 2015,
          bathrooms: 3,
          floor: 0,
          heating: HeatingType.GAS_CENTRAL,
        },
        {
          code: 'APT003',
          description: 'Modern studio apartment perfect for young professionals or students.',
          propertyType: PropertyType.Apartment,
          status: PropertyStatus.Active,
          price: 95000,
          salePrice: 90000,
          area: 35.0,
          address: '789 University Street, Student Quarter',
          lat: 44.807197,
          lon: 20.447273,
          comment: 'Close to university and public transport',
          elevator: true,
          additionalEquipment: ['Air Conditioning', 'Built-in Kitchen'],
          constructionYear: 2020,
          bathrooms: 1,
          floor: 3,
          heating: HeatingType.ELECTRIC_CENTRAL,
        },
        {
          code: 'OFF004',
          description: 'Premium office space in business district with panoramic city views.',
          propertyType: PropertyType.Office,
          status: PropertyStatus.Active,
          price: 750000,
          salePrice: 720000,
          area: 250.0,
          address: '321 Business Plaza, Financial District',
          lat: 44.797197,
          lon: 20.467273,
          comment: 'High-end office building, prestigious address',
          elevator: true,
          additionalEquipment: ['Reception Area', 'Conference Rooms', 'Parking Spaces'],
          constructionYear: 2019,
          bathrooms: 2,
          floor: 12,
          heating: HeatingType.CENTRAL,
        },
        {
          code: 'HSE005',
          description: 'Charming countryside house with vineyard and swimming pool.',
          propertyType: PropertyType.House,
          status: PropertyStatus.Active,
          price: 650000,
          salePrice: 620000,
          area: 320.0,
          address: '555 Vineyard Road, Wine Country',
          lat: 44.887197,
          lon: 20.387273,
          comment: 'Unique property with vineyard, perfect for wine enthusiasts',
          elevator: false,
          additionalEquipment: ['Swimming Pool', 'Vineyard', 'Wine Cellar', 'Guest House'],
          constructionYear: 2010,
          bathrooms: 4,
          floor: 0,
          heating: HeatingType.FIREPLACE,
        },
        {
          code: 'APT006',
          description: 'Cozy 2-bedroom apartment with balcony overlooking the park.',
          propertyType: PropertyType.Apartment,
          status: PropertyStatus.Active,
          price: 185000,
          salePrice: 175000,
          area: 75.0,
          address: '101 Park View Lane, Green District',
          lat: 44.777197,
          lon: 20.477273,
          comment: 'Peaceful location with park views',
          elevator: false,
          additionalEquipment: ['Balcony', 'Built-in Wardrobes'],
          constructionYear: 2012,
          bathrooms: 1,
          floor: 2,
          heating: HeatingType.INDEPENDENT_ON_GAS,
        },
        {
          code: 'OFF007',
          description: 'Flexible office space suitable for startups and small businesses.',
          propertyType: PropertyType.Office,
          status: PropertyStatus.Active,
          price: 155000,
          salePrice: 145000,
          area: 85.0,
          address: '202 Innovation Hub, Tech Quarter',
          lat: 44.817197,
          lon: 20.437273,
          comment: 'Perfect for tech startups, modern building',
          elevator: true,
          additionalEquipment: ['Open Floor Plan', 'High-Speed Internet', 'Meeting Rooms'],
          constructionYear: 2021,
          bathrooms: 1,
          floor: 4,
          heating: HeatingType.CENTRAL,
        },
        {
          code: 'HSE008',
          description: 'Traditional house with authentic architecture and modern upgrades.',
          propertyType: PropertyType.House,
          status: PropertyStatus.Active,
          price: 385000,
          salePrice: 370000,
          area: 220.0,
          address: '888 Heritage Street, Historic District',
          lat: 44.757197,
          lon: 20.487273,
          comment: 'Historic charm with modern conveniences',
          elevator: false,
          additionalEquipment: ['Traditional Architecture', 'Modern Kitchen', 'Garden'],
          constructionYear: 1925,
          bathrooms: 2,
          floor: 0,
          heating: HeatingType.SOLID_FUEL_CENTRAL,
        },
        {
          code: 'APT009',
          description: 'Penthouse apartment with terrace and spectacular city views.',
          propertyType: PropertyType.Apartment,
          status: PropertyStatus.Active,
          price: 890000,
          salePrice: 850000,
          area: 200.0,
          address: '999 Skyline Tower, Premium District',
          lat: 44.837197,
          lon: 20.417273,
          comment: 'Luxury penthouse, exclusive building',
          elevator: true,
          additionalEquipment: ['Terrace', 'City Views', 'Premium Finishes', 'Concierge'],
          constructionYear: 2022,
          bathrooms: 3,
          floor: 20,
          heating: HeatingType.FLOOR,
        },
        {
          code: 'OFF010',
          description: 'Ground floor office with separate entrance and parking.',
          propertyType: PropertyType.Office,
          status: PropertyStatus.Active,
          price: 225000,
          salePrice: 210000,
          area: 120.0,
          address: '444 Commerce Way, Business Park',
          lat: 44.847197,
          lon: 20.407273,
          comment: 'Convenient location with easy access',
          elevator: false,
          additionalEquipment: ['Separate Entrance', 'Parking Spaces', 'Storage Room'],
          constructionYear: 2016,
          bathrooms: 1,
          floor: 0,
          heating: HeatingType.INDEPENDENT_ON_ELECTRICITY,
        },
      ];

      savedProperties = await propertyRepository.save(properties);
      console.log(`✅ Created ${savedProperties.length} properties`);
    } else {
      console.log('🏠 Properties already exist, skipping...');
      savedProperties = await propertyRepository.find();
    }

    // ========== SEED PROPERTY IMAGES ==========
    console.log('🖼️ Creating property images...');

    // Available image files from uploads folder
    const availableImages = [
      'L001-1740742789497.jpg',
      'S001-1734637092803.jpg',
      'S001-1734637092814.jpg',
      'S001-1734637092840.jpg',
      'S002-1734642441023.jpg',
      'S002-1734642441035.jpg',
      'S002-1740761117321.jpg',
      'S0025435-1756466937259.png',
      'S0025435-1756466937260.png',
      'TEst0012345678-1756466479525.png',
      'TEst0012345678-1756466479527.png',
      'TEst003-1756466177895.png',
      'TEst003-1756466177897.png',
      'TEst00356-1756465969660.png',
      'TEst00356-1756465969663.png',
      'TEst00356-1756466097935.png',
      'TEst00356-1756466097936.png',
      'TEst0037654564-1756466750538.png',
      'TEst0037654564-1756466750539.png'
    ];

    const propertyImages = [];

    // Assign images to properties (some properties get multiple images)
    for (let i = 0; i < savedProperties.length; i++) {
      const property = savedProperties[i];
      const imagesForProperty = [];

      // APT001 - Luxury apartment (3 images)
      if (property.code === 'APT001') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[0]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[1]}`, order: 1, isFavorite: false },
          { url: `/uploads/${availableImages[2]}`, order: 2, isFavorite: false }
        );
      }
      // HSE002 - Family house (2 images)
      else if (property.code === 'HSE002') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[3]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[4]}`, order: 1, isFavorite: false }
        );
      }
      // APT003 - Studio apartment (1 image)
      else if (property.code === 'APT003') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[5]}`, order: 0, isFavorite: true }
        );
      }
      // OFF004 - Office space (2 images)
      else if (property.code === 'OFF004') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[6]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[7]}`, order: 1, isFavorite: false }
        );
      }
      // HSE005 - Countryside house (3 images)
      else if (property.code === 'HSE005') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[8]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[9]}`, order: 1, isFavorite: false },
          { url: `/uploads/${availableImages[10]}`, order: 2, isFavorite: false }
        );
      }
      // APT006 - Park view apartment (2 images)
      else if (property.code === 'APT006') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[11]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[12]}`, order: 1, isFavorite: false }
        );
      }
      // OFF007 - Startup office (1 image)
      else if (property.code === 'OFF007') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[13]}`, order: 0, isFavorite: true }
        );
      }
      // HSE008 - Traditional house (2 images)
      else if (property.code === 'HSE008') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[14]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[15]}`, order: 1, isFavorite: false }
        );
      }
      // APT009 - Penthouse (3 images)
      else if (property.code === 'APT009') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[16]}`, order: 0, isFavorite: true },
          { url: `/uploads/${availableImages[17]}`, order: 1, isFavorite: false },
          { url: `/uploads/${availableImages[18]}`, order: 2, isFavorite: false }
        );
      }
      // OFF010 - Ground floor office (1 image)
      else if (property.code === 'OFF010') {
        imagesForProperty.push(
          { url: `/uploads/${availableImages[0]}`, order: 0, isFavorite: true }
        );
      }

      // Create PropertyImage instances with property relationship
      for (const imageData of imagesForProperty) {
        propertyImages.push({
          ...imageData,
          property: property
        });
      }
    }

    const savedImages = await propertyImageRepository.save(propertyImages);
    console.log(`✅ Created ${savedImages.length} property images`);

    // ========== SEED CLIENTS ==========
    const existingClients = await clientRepository.count();
    let savedClients = [];

    if (existingClients === 0) {
      console.log('👥 Creating clients...');

      const clients = [
        {
          name: 'John Smith',
          address: '123 Client Street, City',
          email: 'john.smith@email.com',
          phone: '+1-555-0101',
          transactionType: TransactionType.Buyer,
          paymentType: PaymentType.Credit,
          comment: 'Looking for family home, budget flexible',
          moneyAmount: 300000,
          status: ClientStatus.Active,
          property: savedProperties[1], // House
        },
        {
          name: 'Maria Garcia',
          address: '456 Seller Avenue, Town',
          email: 'maria.garcia@email.com',
          phone: '+1-555-0102',
          transactionType: TransactionType.Seller,
          paymentType: PaymentType.Cash,
          comment: 'Selling inherited property',
          moneyAmount: 450000,
          status: ClientStatus.Active,
          property: savedProperties[0], // Apartment
        },
        {
          name: 'David Johnson',
          address: '789 Renter Road, Village',
          email: 'david.johnson@email.com',
          phone: '+1-555-0103',
          transactionType: TransactionType.Rents,
          paymentType: PaymentType.Cash,
          comment: 'Looking for studio apartment for 1 year',
          moneyAmount: 800,
          status: ClientStatus.Active,
          property: savedProperties[2], // Studio
        },
        {
          name: 'Sarah Wilson',
          address: '321 Business Lane, Metro',
          email: 'sarah.wilson@email.com',
          phone: '+1-555-0104',
          transactionType: TransactionType.Buyer,
          paymentType: PaymentType.Combined,
          comment: 'Business expansion, need office space',
          moneyAmount: 750000,
          status: ClientStatus.Active,
          property: savedProperties[3], // Office
        },
        {
          name: 'Michael Brown',
          address: '654 Landlord Boulevard, Suburb',
          email: 'michael.brown@email.com',
          phone: '+1-555-0105',
          transactionType: TransactionType.RentsOut,
          paymentType: PaymentType.Cash,
          comment: 'Property investment, rental income',
          moneyAmount: 1200,
          status: ClientStatus.Active,
          property: savedProperties[5], // Park view apartment
        },
      ];

      savedClients = await clientRepository.save(clients);
      console.log(`✅ Created ${savedClients.length} clients`);
    } else {
      console.log('👥 Clients already exist, skipping...');
      savedClients = await clientRepository.find();
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${savedUsers.length}`);
    console.log(`   🏠 Properties: ${savedProperties.length}`);
    console.log(`   �️ Property Images: ${savedImages.length}`);
    console.log(`   �👤 Clients: ${savedClients.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeder
seedDatabase();
