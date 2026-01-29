"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/entities/user/user.entity");
const property_entity_1 = require("../src/entities/property/property.entity");
const client_entity_1 = require("../src/entities/client/client.entity");
const property_image_entity_1 = require("../src/entities/property-image/property-image.entity");
const role_enum_1 = require("../src/entities/user/enums/role.enum");
const property_type_enum_1 = require("../src/entities/property/enums/property-type.enum");
const property_status_enum_1 = require("../src/entities/property/enums/property-status.enum");
const heating_enum_1 = require("../src/entities/property/enums/heating.enum");
const client_status_enum_1 = require("../src/entities/client/enums/client-status.enum");
const transaction_type_enum_1 = require("../src/entities/client/enums/transaction-type.enum");
const payment_type_enum_1 = require("../src/entities/client/enums/payment-type.enum");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'CHANGE_ME',
    database: process.env.DB_NAME || 'estates',
    entities: [user_entity_1.User, property_entity_1.Property, client_entity_1.Client, property_image_entity_1.PropertyImage],
    synchronize: false,
    logging: true,
});
async function seedDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('📚 Connected to the database for seeding...');
        const userRepository = AppDataSource.getRepository(user_entity_1.User);
        const propertyRepository = AppDataSource.getRepository(property_entity_1.Property);
        const propertyImageRepository = AppDataSource.getRepository(property_image_entity_1.PropertyImage);
        const clientRepository = AppDataSource.getRepository(client_entity_1.Client);
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
        if (existingUsers === 0) {
            console.log('👥 Creating users...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const hashedUserPassword = await bcrypt.hash('password123', 10);
            const users = [
                {
                    username: 'admin',
                    password: hashedPassword,
                    role: role_enum_1.Role.ADMIN,
                },
                {
                    username: 'manager1',
                    password: hashedUserPassword,
                    role: role_enum_1.Role.ADMIN,
                },
                {
                    username: 'agent1',
                    password: hashedUserPassword,
                    role: role_enum_1.Role.USER,
                },
                {
                    username: 'agent2',
                    password: hashedUserPassword,
                    role: role_enum_1.Role.USER,
                },
            ];
            savedUsers = await userRepository.save(users);
            console.log(`✅ Created ${savedUsers.length} users`);
        }
        else {
            console.log('👥 Users already exist, skipping...');
            savedUsers = await userRepository.find();
        }
        if (existingProperties === 0) {
            console.log('🏠 Creating properties...');
            const properties = [
                {
                    code: 'APT001',
                    description: 'Luxurious 3-bedroom apartment in city center with stunning views and modern amenities. Recently renovated with high-end finishes.',
                    propertyType: property_type_enum_1.PropertyType.Apartment,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.CENTRAL,
                },
                {
                    code: 'HSE002',
                    description: 'Beautiful family house with large garden and garage. Perfect for families with children.',
                    propertyType: property_type_enum_1.PropertyType.House,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.GAS_CENTRAL,
                },
                {
                    code: 'APT003',
                    description: 'Modern studio apartment perfect for young professionals or students.',
                    propertyType: property_type_enum_1.PropertyType.Apartment,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.ELECTRIC_CENTRAL,
                },
                {
                    code: 'OFF004',
                    description: 'Premium office space in business district with panoramic city views.',
                    propertyType: property_type_enum_1.PropertyType.Office,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.CENTRAL,
                },
                {
                    code: 'HSE005',
                    description: 'Charming countryside house with vineyard and swimming pool.',
                    propertyType: property_type_enum_1.PropertyType.House,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.FIREPLACE,
                },
                {
                    code: 'APT006',
                    description: 'Cozy 2-bedroom apartment with balcony overlooking the park.',
                    propertyType: property_type_enum_1.PropertyType.Apartment,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.INDEPENDENT_ON_GAS,
                },
                {
                    code: 'OFF007',
                    description: 'Flexible office space suitable for startups and small businesses.',
                    propertyType: property_type_enum_1.PropertyType.Office,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.CENTRAL,
                },
                {
                    code: 'HSE008',
                    description: 'Traditional house with authentic architecture and modern upgrades.',
                    propertyType: property_type_enum_1.PropertyType.House,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.SOLID_FUEL_CENTRAL,
                },
                {
                    code: 'APT009',
                    description: 'Penthouse apartment with terrace and spectacular city views.',
                    propertyType: property_type_enum_1.PropertyType.Apartment,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.FLOOR,
                },
                {
                    code: 'OFF010',
                    description: 'Ground floor office with separate entrance and parking.',
                    propertyType: property_type_enum_1.PropertyType.Office,
                    status: property_status_enum_1.PropertyStatus.Active,
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
                    heating: heating_enum_1.HeatingType.INDEPENDENT_ON_ELECTRICITY,
                },
            ];
            savedProperties = await propertyRepository.save(properties);
            console.log(`✅ Created ${savedProperties.length} properties`);
        }
        else {
            console.log('🏠 Properties already exist, skipping...');
            savedProperties = await propertyRepository.find();
        }
        console.log('🖼️ Creating property images...');
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
        for (let i = 0; i < savedProperties.length; i++) {
            const property = savedProperties[i];
            const imagesForProperty = [];
            if (property.code === 'APT001') {
                imagesForProperty.push({ url: `/uploads/${availableImages[0]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[1]}`, order: 1, isFavorite: false }, { url: `/uploads/${availableImages[2]}`, order: 2, isFavorite: false });
            }
            else if (property.code === 'HSE002') {
                imagesForProperty.push({ url: `/uploads/${availableImages[3]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[4]}`, order: 1, isFavorite: false });
            }
            else if (property.code === 'APT003') {
                imagesForProperty.push({ url: `/uploads/${availableImages[5]}`, order: 0, isFavorite: true });
            }
            else if (property.code === 'OFF004') {
                imagesForProperty.push({ url: `/uploads/${availableImages[6]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[7]}`, order: 1, isFavorite: false });
            }
            else if (property.code === 'HSE005') {
                imagesForProperty.push({ url: `/uploads/${availableImages[8]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[9]}`, order: 1, isFavorite: false }, { url: `/uploads/${availableImages[10]}`, order: 2, isFavorite: false });
            }
            else if (property.code === 'APT006') {
                imagesForProperty.push({ url: `/uploads/${availableImages[11]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[12]}`, order: 1, isFavorite: false });
            }
            else if (property.code === 'OFF007') {
                imagesForProperty.push({ url: `/uploads/${availableImages[13]}`, order: 0, isFavorite: true });
            }
            else if (property.code === 'HSE008') {
                imagesForProperty.push({ url: `/uploads/${availableImages[14]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[15]}`, order: 1, isFavorite: false });
            }
            else if (property.code === 'APT009') {
                imagesForProperty.push({ url: `/uploads/${availableImages[16]}`, order: 0, isFavorite: true }, { url: `/uploads/${availableImages[17]}`, order: 1, isFavorite: false }, { url: `/uploads/${availableImages[18]}`, order: 2, isFavorite: false });
            }
            else if (property.code === 'OFF010') {
                imagesForProperty.push({ url: `/uploads/${availableImages[0]}`, order: 0, isFavorite: true });
            }
            for (const imageData of imagesForProperty) {
                propertyImages.push({
                    ...imageData,
                    property: property
                });
            }
        }
        const savedImages = await propertyImageRepository.save(propertyImages);
        console.log(`✅ Created ${savedImages.length} property images`);
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
                    transactionType: transaction_type_enum_1.TransactionType.Buyer,
                    paymentType: payment_type_enum_1.PaymentType.Credit,
                    comment: 'Looking for family home, budget flexible',
                    moneyAmount: 300000,
                    status: client_status_enum_1.ClientStatus.Active,
                    property: savedProperties[1],
                },
                {
                    name: 'Maria Garcia',
                    address: '456 Seller Avenue, Town',
                    email: 'maria.garcia@email.com',
                    phone: '+1-555-0102',
                    transactionType: transaction_type_enum_1.TransactionType.Seller,
                    paymentType: payment_type_enum_1.PaymentType.Cash,
                    comment: 'Selling inherited property',
                    moneyAmount: 450000,
                    status: client_status_enum_1.ClientStatus.Active,
                    property: savedProperties[0],
                },
                {
                    name: 'David Johnson',
                    address: '789 Renter Road, Village',
                    email: 'david.johnson@email.com',
                    phone: '+1-555-0103',
                    transactionType: transaction_type_enum_1.TransactionType.Rents,
                    paymentType: payment_type_enum_1.PaymentType.Cash,
                    comment: 'Looking for studio apartment for 1 year',
                    moneyAmount: 800,
                    status: client_status_enum_1.ClientStatus.Active,
                    property: savedProperties[2],
                },
                {
                    name: 'Sarah Wilson',
                    address: '321 Business Lane, Metro',
                    email: 'sarah.wilson@email.com',
                    phone: '+1-555-0104',
                    transactionType: transaction_type_enum_1.TransactionType.Buyer,
                    paymentType: payment_type_enum_1.PaymentType.Combined,
                    comment: 'Business expansion, need office space',
                    moneyAmount: 750000,
                    status: client_status_enum_1.ClientStatus.Active,
                    property: savedProperties[3],
                },
                {
                    name: 'Michael Brown',
                    address: '654 Landlord Boulevard, Suburb',
                    email: 'michael.brown@email.com',
                    phone: '+1-555-0105',
                    transactionType: transaction_type_enum_1.TransactionType.RentsOut,
                    paymentType: payment_type_enum_1.PaymentType.Cash,
                    comment: 'Property investment, rental income',
                    moneyAmount: 1200,
                    status: client_status_enum_1.ClientStatus.Active,
                    property: savedProperties[5],
                },
            ];
            savedClients = await clientRepository.save(clients);
            console.log(`✅ Created ${savedClients.length} clients`);
        }
        else {
            console.log('👥 Clients already exist, skipping...');
            savedClients = await clientRepository.find();
        }
        console.log('🎉 Database seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   👥 Users: ${savedUsers.length}`);
        console.log(`   🏠 Properties: ${savedProperties.length}`);
        console.log(`   �️ Property Images: ${savedImages.length}`);
        console.log(`   �👤 Clients: ${savedClients.length}`);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await AppDataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}
seedDatabase();
//# sourceMappingURL=comprehensive-seed.js.map