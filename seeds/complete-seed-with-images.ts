import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/data-source';
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
import { join } from 'path';
import { readdirSync } from 'fs';

const seedData = async () => {
  console.log('🌱 Starting complete database seeding with images...');
  
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
    await imageRepository.clear();
    await clientRepository.clear();
    await propertyRepository.clear();
    await userRepository.clear();

    // Seed Users
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
        username: 'manager',
        password: await bcrypt.hash('manager123', saltRounds),
        role: Role.ADMIN,
      },
    ];

    const savedUsers = await userRepository.save(users);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Seed Properties first (since clients reference properties)
    console.log('🏠 Creating properties...');
    const properties = [
      {
        code: 'L001',
        description: 'Luxury 3-bedroom apartment in city center with panoramic views, modern appliances, and underground parking.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 185000,
        salePrice: 180000,
        area: 95.5,
        address: '123 Downtown Plaza, Belgrade',
        lat: 44.7866,
        lon: 20.4489,
        comment: 'Prime location, recently renovated',
        elevator: true,
        additionalEquipment: ['Air conditioning', 'Parking', 'Balcony', 'Storage'],
        constructionYear: 2015,
        bathrooms: 2,
        floor: 8,
        heating: HeatingType.CENTRAL,
      },
      {
        code: 'S001',
        description: 'Spacious family house with garden, garage, and excellent neighborhood for families with children.',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 240000,
        salePrice: 235000,
        area: 150.0,
        address: '456 Residential Street, Novi Sad',
        lat: 45.2671,
        lon: 19.8335,
        comment: 'Perfect for families, quiet neighborhood',
        elevator: false,
        additionalEquipment: ['Garden', 'Garage', 'Terrace', 'Basement'],
        constructionYear: 2010,
        bathrooms: 3,
        floor: null, // Ground floor house
        heating: HeatingType.GAS_CENTRAL,
      },
      {
        code: 'S002',
        description: 'Modern studio apartment perfect for young professionals, fully furnished with contemporary design.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 75000,
        salePrice: 72000,
        area: 35.0,
        address: '789 Student District, Novi Belgrade',
        lat: 44.8125,
        lon: 20.4612,
        comment: 'Great investment opportunity, high rental demand',
        elevator: true,
        additionalEquipment: ['Furnished', 'Internet', 'Cable TV'],
        constructionYear: 2018,
        bathrooms: 1,
        floor: 3,
        heating: HeatingType.ELECTRIC_CENTRAL,
      },
      {
        code: 'A001',
        description: 'Commercial office space in business district with modern amenities and excellent accessibility.',
        propertyType: PropertyType.Office,
        status: PropertyStatus.Active,
        price: 320000,
        salePrice: 310000,
        area: 200.0,
        address: '321 Business Center, Belgrade',
        lat: 44.8176,
        lon: 20.4633,
        comment: 'Premium office location',
        elevator: true,
        additionalEquipment: ['Reception', 'Conference rooms', 'Parking', 'Security'],
        constructionYear: 2020,
        bathrooms: 4,
        floor: 5,
        heating: HeatingType.CENTRAL,
      },
      {
        code: 'V001',
        description: 'Charming vacation house by the lake with private dock and beautiful nature surroundings.',
        propertyType: PropertyType.House,
        status: PropertyStatus.Inactive,
        price: 150000,
        salePrice: 145000,
        area: 85.0,
        address: '555 Lakeside Road, Zlatibor',
        lat: 43.7294,
        lon: 19.7109,
        comment: 'Recently sold, vacation rental potential',
        elevator: false,
        additionalEquipment: ['Lake access', 'Dock', 'Fireplace', 'Mountain view'],
        constructionYear: 2005,
        bathrooms: 2,
        floor: null,
        heating: HeatingType.FIREPLACE,
      },
    ];

    const savedProperties = await propertyRepository.save(properties);
    console.log(`✅ Created ${savedProperties.length} properties`);

    // Get available images from uploads folder
    const uploadsPath = join(process.cwd(), 'uploads');
    let availableImages: string[] = [];
    
    try {
      availableImages = readdirSync(uploadsPath).filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') || 
        file.toLowerCase().endsWith('.png')
      );
      console.log(`📷 Found ${availableImages.length} images in uploads folder:`, availableImages);
    } catch (error) {
      console.log('⚠️  Could not read uploads folder, continuing without images');
    }

    // Create Property Images using available files
    if (availableImages.length > 0) {
      console.log('📸 Creating property images...');
      const propertyImages = [];

      // Map images to properties based on naming convention and availability
      const imageMapping = [
        { propertyCode: 'L001', imageFiles: availableImages.filter(img => img.startsWith('L001')) },
        { propertyCode: 'S001', imageFiles: availableImages.filter(img => img.startsWith('S001')) },
        { propertyCode: 'S002', imageFiles: availableImages.filter(img => img.startsWith('S002')) },
      ];

      for (const mapping of imageMapping) {
        const property = savedProperties.find(p => p.code === mapping.propertyCode);
        if (property && mapping.imageFiles.length > 0) {
          mapping.imageFiles.forEach((imageFile, index) => {
            propertyImages.push({
              url: `/uploads/${imageFile}`,
              order: index,
              isFavorite: index === 0, // First image is favorite
              property: property,
            });
          });
        }
      }

      // If we have extra images, distribute them among other properties
      const unassignedImages = availableImages.filter(img => 
        !img.startsWith('L001') && !img.startsWith('S001') && !img.startsWith('S002')
      );

      if (unassignedImages.length > 0) {
        const propertiesNeedingImages = savedProperties.filter(p => 
          !['L001', 'S001', 'S002'].includes(p.code)
        );

        unassignedImages.forEach((imageFile, index) => {
          const propertyIndex = index % propertiesNeedingImages.length;
          const property = propertiesNeedingImages[propertyIndex];
          if (property) {
            propertyImages.push({
              url: `/uploads/${imageFile}`,
              order: 0,
              isFavorite: true,
              property: property,
            });
          }
        });
      }

      if (propertyImages.length > 0) {
        const savedImages = await imageRepository.save(propertyImages);
        console.log(`✅ Created ${savedImages.length} property images`);
      }
    }

    // Seed Clients with property relationships
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
        comment: 'Interested in downtown apartments, cash buyer',
        moneyAmount: 200000,
        property: savedProperties.find(p => p.code === 'L001'), // Link to L001
      },
      {
        name: 'Ana Jovanović',
        address: 'Strahinića Bana 15, Novi Sad',
        email: 'ana.jovanovic@gmail.com',
        phone: '+381629876543',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Credit,
        comment: 'Selling family house, relocating for work',
        moneyAmount: 240000,
        property: savedProperties.find(p => p.code === 'S001'), // Link to S001
      },
      {
        name: 'Nikola Stojanović',
        address: 'Bulevar Oslobođenja 25, Novi Beograd',
        email: 'nikola.stojanovic@yahoo.com',
        phone: '+381611357924',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'First-time buyer, looking for studio apartment',
        moneyAmount: 75000,
        property: savedProperties.find(p => p.code === 'S002'), // Link to S002
      },
      {
        name: 'Milica Radić',
        address: 'Terazije 3, Belgrade',
        email: 'milica.radic@hotmail.com',
        phone: '+381602468135',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Cash,
        comment: 'Business owner looking for commercial space',
        moneyAmount: 320000,
        property: savedProperties.find(p => p.code === 'A001'), // Link to A001
      },
      {
        name: 'Stefan Milanović',
        address: 'Kraljice Marije 8, Kragujevac',
        email: 'stefan.milanovic@gmail.rs',
        phone: '+381631357924',
        status: ClientStatus.Inactive,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Successfully sold vacation house',
        moneyAmount: 150000,
        property: savedProperties.find(p => p.code === 'V001'), // Link to V001 (sold)
      },
      {
        name: 'Jovana Đorđević',
        address: 'Makedonska 12, Niš',
        email: 'jovana.djordjevic@email.rs',
        phone: '+381644567890',
        status: ClientStatus.Active,
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'Looking for apartment under 100k, pre-approved loan',
        moneyAmount: 95000,
        property: null, // No specific property assigned yet
      },
      {
        name: 'Dragan Maksimović',
        address: 'Vidovdanska 45, Subotica',
        email: 'dragan.maksimovic@yahoo.rs',
        phone: '+381652345678',
        status: ClientStatus.Active,
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Planning to sell inherited property',
        moneyAmount: 180000,
        property: null, // Property not yet listed
      },
    ];

    const savedClients = await clientRepository.save(clients);
    console.log(`✅ Created ${savedClients.length} clients`);

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${savedUsers.length}`);
    console.log(`🏠 Properties: ${savedProperties.length}`);
    console.log(`👤 Clients: ${savedClients.length}`);
    
    if (availableImages.length > 0) {
      const imageCount = await imageRepository.count();
      console.log(`📷 Property Images: ${imageCount}`);
    }

    console.log('\n🔍 Sample Data Created:');
    console.log('Users: admin/admin123, agent1/agent123, agent2/agent123, manager/manager123');
    console.log('Properties: L001 (Downtown Apt), S001 (Family House), S002 (Studio), A001 (Office), V001 (Vacation)');
    console.log('Clients: 7 clients with various transaction types and payment methods');
    
    if (availableImages.length > 0) {
      console.log(`Images: Mapped ${availableImages.length} images from uploads folder to properties`);
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
};

seedData()
  .then(() => {
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
