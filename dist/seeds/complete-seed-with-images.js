"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../src/data-source");
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
const path_1 = require("path");
const fs_1 = require("fs");
const seedData = async () => {
    console.log('🌱 Starting complete database seeding with images...');
    await data_source_1.AppDataSource.initialize();
    console.log('✅ Database connected');
    const userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const propertyRepository = data_source_1.AppDataSource.getRepository(property_entity_1.Property);
    const clientRepository = data_source_1.AppDataSource.getRepository(client_entity_1.Client);
    const imageRepository = data_source_1.AppDataSource.getRepository(property_image_entity_1.PropertyImage);
    try {
        console.log('🗑️  Clearing existing data...');
        await imageRepository.clear();
        await clientRepository.clear();
        await propertyRepository.clear();
        await userRepository.clear();
        console.log('👥 Creating users...');
        const saltRounds = 10;
        const users = [
            {
                username: 'admin',
                password: await bcrypt.hash('admin123', saltRounds),
                role: role_enum_1.Role.ADMIN,
            },
            {
                username: 'agent1',
                password: await bcrypt.hash('agent123', saltRounds),
                role: role_enum_1.Role.USER,
            },
            {
                username: 'agent2',
                password: await bcrypt.hash('agent123', saltRounds),
                role: role_enum_1.Role.USER,
            },
            {
                username: 'manager',
                password: await bcrypt.hash('manager123', saltRounds),
                role: role_enum_1.Role.ADMIN,
            },
        ];
        const savedUsers = await userRepository.save(users);
        console.log(`✅ Created ${savedUsers.length} users`);
        console.log('🏠 Creating properties...');
        const properties = [
            {
                code: 'L001',
                description: 'Luxury 3-bedroom apartment in city center with panoramic views, modern appliances, and underground parking.',
                propertyType: property_type_enum_1.PropertyType.Apartment,
                status: property_status_enum_1.PropertyStatus.Active,
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
                heating: heating_enum_1.HeatingType.CENTRAL,
            },
            {
                code: 'S001',
                description: 'Spacious family house with garden, garage, and excellent neighborhood for families with children.',
                propertyType: property_type_enum_1.PropertyType.House,
                status: property_status_enum_1.PropertyStatus.Active,
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
                floor: null,
                heating: heating_enum_1.HeatingType.GAS_CENTRAL,
            },
            {
                code: 'S002',
                description: 'Modern studio apartment perfect for young professionals, fully furnished with contemporary design.',
                propertyType: property_type_enum_1.PropertyType.Apartment,
                status: property_status_enum_1.PropertyStatus.Active,
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
                heating: heating_enum_1.HeatingType.ELECTRIC_CENTRAL,
            },
            {
                code: 'A001',
                description: 'Commercial office space in business district with modern amenities and excellent accessibility.',
                propertyType: property_type_enum_1.PropertyType.Office,
                status: property_status_enum_1.PropertyStatus.Active,
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
                heating: heating_enum_1.HeatingType.CENTRAL,
            },
            {
                code: 'V001',
                description: 'Charming vacation house by the lake with private dock and beautiful nature surroundings.',
                propertyType: property_type_enum_1.PropertyType.House,
                status: property_status_enum_1.PropertyStatus.Inactive,
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
                heating: heating_enum_1.HeatingType.FIREPLACE,
            },
        ];
        const savedProperties = await propertyRepository.save(properties);
        console.log(`✅ Created ${savedProperties.length} properties`);
        const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
        let availableImages = [];
        try {
            availableImages = (0, fs_1.readdirSync)(uploadsPath).filter(file => file.toLowerCase().endsWith('.jpg') ||
                file.toLowerCase().endsWith('.jpeg') ||
                file.toLowerCase().endsWith('.png'));
            console.log(`📷 Found ${availableImages.length} images in uploads folder:`, availableImages);
        }
        catch (error) {
            console.log('⚠️  Could not read uploads folder, continuing without images');
        }
        if (availableImages.length > 0) {
            console.log('📸 Creating property images...');
            const propertyImages = [];
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
                            isFavorite: index === 0,
                            property: property,
                        });
                    });
                }
            }
            const unassignedImages = availableImages.filter(img => !img.startsWith('L001') && !img.startsWith('S001') && !img.startsWith('S002'));
            if (unassignedImages.length > 0) {
                const propertiesNeedingImages = savedProperties.filter(p => !['L001', 'S001', 'S002'].includes(p.code));
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
        console.log('👤 Creating clients...');
        const clients = [
            {
                name: 'Marko Petrović',
                address: 'Knez Mihailova 42, Belgrade',
                email: 'marko.petrovic@email.rs',
                phone: '+381601234567',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Buyer,
                paymentType: payment_type_enum_1.PaymentType.Cash,
                comment: 'Interested in downtown apartments, cash buyer',
                moneyAmount: 200000,
                property: savedProperties.find(p => p.code === 'L001'),
            },
            {
                name: 'Ana Jovanović',
                address: 'Strahinića Bana 15, Novi Sad',
                email: 'ana.jovanovic@gmail.com',
                phone: '+381629876543',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Seller,
                paymentType: payment_type_enum_1.PaymentType.Credit,
                comment: 'Selling family house, relocating for work',
                moneyAmount: 240000,
                property: savedProperties.find(p => p.code === 'S001'),
            },
            {
                name: 'Nikola Stojanović',
                address: 'Bulevar Oslobođenja 25, Novi Beograd',
                email: 'nikola.stojanovic@yahoo.com',
                phone: '+381611357924',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Buyer,
                paymentType: payment_type_enum_1.PaymentType.Credit,
                comment: 'First-time buyer, looking for studio apartment',
                moneyAmount: 75000,
                property: savedProperties.find(p => p.code === 'S002'),
            },
            {
                name: 'Milica Radić',
                address: 'Terazije 3, Belgrade',
                email: 'milica.radic@hotmail.com',
                phone: '+381602468135',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Buyer,
                paymentType: payment_type_enum_1.PaymentType.Cash,
                comment: 'Business owner looking for commercial space',
                moneyAmount: 320000,
                property: savedProperties.find(p => p.code === 'A001'),
            },
            {
                name: 'Stefan Milanović',
                address: 'Kraljice Marije 8, Kragujevac',
                email: 'stefan.milanovic@gmail.rs',
                phone: '+381631357924',
                status: client_status_enum_1.ClientStatus.Inactive,
                transactionType: transaction_type_enum_1.TransactionType.Seller,
                paymentType: payment_type_enum_1.PaymentType.Cash,
                comment: 'Successfully sold vacation house',
                moneyAmount: 150000,
                property: savedProperties.find(p => p.code === 'V001'),
            },
            {
                name: 'Jovana Đorđević',
                address: 'Makedonska 12, Niš',
                email: 'jovana.djordjevic@email.rs',
                phone: '+381644567890',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Buyer,
                paymentType: payment_type_enum_1.PaymentType.Credit,
                comment: 'Looking for apartment under 100k, pre-approved loan',
                moneyAmount: 95000,
                property: null,
            },
            {
                name: 'Dragan Maksimović',
                address: 'Vidovdanska 45, Subotica',
                email: 'dragan.maksimovic@yahoo.rs',
                phone: '+381652345678',
                status: client_status_enum_1.ClientStatus.Active,
                transactionType: transaction_type_enum_1.TransactionType.Seller,
                paymentType: payment_type_enum_1.PaymentType.Cash,
                comment: 'Planning to sell inherited property',
                moneyAmount: 180000,
                property: null,
            },
        ];
        const savedClients = await clientRepository.save(clients);
        console.log(`✅ Created ${savedClients.length} clients`);
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
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
    finally {
        await data_source_1.AppDataSource.destroy();
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
//# sourceMappingURL=complete-seed-with-images.js.map