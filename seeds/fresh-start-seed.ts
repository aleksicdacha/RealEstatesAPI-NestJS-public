import { DataSource } from 'typeorm';
import { User } from '../apps/api/src/entities/user/user.entity';
import { Property } from '../apps/api/src/entities/property/property.entity';
import { Client } from '../apps/api/src/entities/client/client.entity';
import { PropertyImage } from '../apps/api/src/entities/property-image/property-image.entity';
import { Representative } from '../apps/api/src/entities/representative/representative.entity';
import { Role } from '../apps/api/src/entities/user/enums/role.enum';
import { PropertyType } from '../apps/api/src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '../apps/api/src/entities/property/enums/property-status.enum';
import { HeatingType } from '../apps/api/src/entities/property/enums/heating.enum';
import { Orientation } from '../apps/api/src/entities/property/enums/orientation.enum';
import { ClientStatus } from '../apps/api/src/entities/client/enums/client-status.enum';
import { TransactionType } from '../apps/api/src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '../apps/api/src/entities/client/enums/payment-type.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: './apps/api/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [User, Property, Client, PropertyImage, Representative],
  synchronize: true,  // Create tables automatically
  logging: false,
});

async function seedDatabase() {
  console.log('🌱 Starting fresh database seed...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const userRepository = AppDataSource.getRepository(User);
    const propertyRepository = AppDataSource.getRepository(Property);
    const propertyImageRepository = AppDataSource.getRepository(PropertyImage);
    const clientRepository = AppDataSource.getRepository(Client);

    // Clear existing data (in correct order due to foreign keys)
    console.log('🗑️  Cleaning existing data...');
    await AppDataSource.query('TRUNCATE TABLE property_images, clients, properties, users RESTART IDENTITY CASCADE');
    console.log('✅ Existing data cleared\n');

    // ========== SEED USERS ==========
    console.log('👥 Creating users...');

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('password123', 10);

    const users = await userRepository.save([
      {
        username: 'admin',
        password: hashedAdminPassword,
        role: Role.ADMIN,
      },
      {
        username: 'manager',
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
    ]);

    console.log(`✅ Created ${users.length} users\n`);

    // ========== SEED PROPERTIES ==========
    console.log('🏠 Creating properties...');

    const propertiesData = [
      {
        code: 'NIS-001',
        description: 'Luksuzni trosoban stan u centru grada sa prelepim pogledom na Nišavu. Kompletno renoviran sa vrhunskim materijalima.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 120000,
        salePrice: 115000,
        area: 85.5,
        address: 'Obrenovićeva 15, Niš',
        neighborhood: 'Centar',
        lat: 43.3209,
        lon: 21.8954,
        comment: 'Odlična prilika za investiciju, vlasnik hitno prodaje',
        elevator: true,
        additionalEquipment: ['Klima uređaj', 'Centralno grejanje', 'Interfon', 'Ugrađeni plakar'],
        constructionYear: 2015,
        bathrooms: 1,
        floor: 4,
        roomStructure: 'Trosoban',
        heating: HeatingType.CENTRAL,
        orientation: Orientation.South,
        specialOffer: 1,
      },
      {
        code: 'NIS-002',
        description: 'Prostrana porodična kuća sa dvorištem i garažom. Idealna za veće porodice.',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 185000,
        salePrice: 180000,
        area: 220.0,
        address: 'Cara Dušana 45, Niš',
        neighborhood: 'Duvanjište',
        lat: 43.3156,
        lon: 21.8908,
        comment: 'Kuća u mirnom delu grada, blizu škole i vrtića',
        elevator: false,
        additionalEquipment: ['Dvorište', 'Garaža', 'Podrum', 'Terasa'],
        constructionYear: 2010,
        bathrooms: 2,
        floor: 0,
        roomStructure: 'Četvorosoban',
        heating: HeatingType.GAS_CENTRAL,
        orientation: Orientation.SouthEast,
        specialOffer: 2,
      },
      {
        code: 'NIS-003',
        description: 'Moderan garsonjera u novogradnji, savršena za studente ili mlade parove.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 45000,
        salePrice: 43000,
        area: 28.0,
        address: 'Studentska 8, Niš',
        neighborhood: 'Studentski grad',
        lat: 43.3297,
        lon: 21.9027,
        comment: 'Blizu univerziteta, odličan povraćaj investicije kroz iznajmljivanje',
        elevator: true,
        additionalEquipment: ['Klima', 'Ugrađena kuhinja'],
        constructionYear: 2020,
        bathrooms: 1,
        floor: 2,
        roomStructure: 'Garsonjera',
        heating: HeatingType.ELECTRIC_CENTRAL,
        orientation: Orientation.West,
        specialOffer: 3,
      },
      {
        code: 'NIS-004',
        description: 'Poslovni prostor u srcu grada, idealan za kancelariju ili prodavnicu.',
        propertyType: PropertyType.Office,
        status: PropertyStatus.Active,
        price: 95000,
        salePrice: 90000,
        area: 65.0,
        address: 'Kralja Milana 22, Niš',
        neighborhood: 'Centar',
        lat: 43.3198,
        lon: 21.8965,
        comment: 'Velika prohodnost, odlična lokacija',
        elevator: true,
        additionalEquipment: ['Klima', 'WC', 'Parking'],
        constructionYear: 2018,
        bathrooms: 1,
        floor: 1,
        roomStructure: 'Open space',
        heating: HeatingType.CENTRAL,
        orientation: Orientation.North,
      },
      {
        code: 'NIS-005',
        description: 'Luksuzna vila sa bazenom i panoramskim pogledom na grad.',
        propertyType: PropertyType.House,
        status: PropertyStatus.Active,
        price: 350000,
        salePrice: 340000,
        area: 380.0,
        address: 'Vinogradi bb, Niš',
        neighborhood: 'Pantelej',
        lat: 43.3445,
        lon: 21.9234,
        comment: 'Premium nekretnina, bazen, panoramski pogled',
        elevator: false,
        additionalEquipment: ['Bazen', 'Sauna', 'Fitness', 'Garaža za 3 auta', 'Video nadzor'],
        constructionYear: 2019,
        bathrooms: 4,
        floor: 0,
        roomStructure: 'Petosoban',
        heating: HeatingType.FLOOR,
        orientation: Orientation.South,
        specialOffer: 4,
      },
      {
        code: 'NIS-006',
        description: 'Dvosoban stan sa lođom, odličan raspored prostorija.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 75000,
        salePrice: 72000,
        area: 58.0,
        address: 'Bulevar Nemanjića 10, Niš',
        neighborhood: 'Medijana',
        lat: 43.3167,
        lon: 21.9156,
        comment: 'Useljivo odmah, vlasništvo 1/1',
        elevator: true,
        additionalEquipment: ['Lođa', 'Plakar', 'Podrum'],
        constructionYear: 2012,
        bathrooms: 1,
        floor: 6,
        roomStructure: 'Dvosoban',
        heating: HeatingType.INDEPENDENT_ON_GAS,
        orientation: Orientation.East,
        specialOffer: 5,
      },
      {
        code: 'NIS-007',
        description: 'Poslovni prostor pogodan za restoran ili kafić sa terasom.',
        propertyType: PropertyType.CommercialSpace,
        status: PropertyStatus.Active,
        price: 140000,
        salePrice: 135000,
        area: 120.0,
        address: 'Kopitareva 5, Niš',
        neighborhood: 'Centar',
        lat: 43.3212,
        lon: 21.8976,
        comment: 'Ugao, visok saobraćaj, terasa',
        elevator: false,
        additionalEquipment: ['Terasa', 'Kuhinja', 'Klimatizacija', 'WC'],
        constructionYear: 2008,
        bathrooms: 2,
        floor: 0,
        roomStructure: 'Otvorenog tipa',
        heating: HeatingType.CENTRAL,
        orientation: Orientation.SouthWest,
      },
      {
        code: 'NIS-008',
        description: 'Jednosoban stan u mirnom delu grada, idealan za prvo stanovanje.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 52000,
        salePrice: 50000,
        area: 42.0,
        address: 'Stevana Sremca 18, Niš',
        neighborhood: 'Crvena Zvezda',
        lat: 43.3089,
        lon: 21.8823,
        comment: 'Mirno naselje, dobra infrastruktura',
        elevator: false,
        additionalEquipment: ['Balkon', 'Podrum'],
        constructionYear: 1985,
        bathrooms: 1,
        floor: 3,
        roomStructure: 'Jednosoban',
        heating: HeatingType.SOLID_FUEL_CENTRAL,
        orientation: Orientation.NorthEast,
        specialOffer: 6,
      },
      {
        code: 'NIS-009',
        description: 'Penthouse stan sa dve terase i spektakularnim pogledom.',
        propertyType: PropertyType.Apartment,
        status: PropertyStatus.Active,
        price: 195000,
        salePrice: 190000,
        area: 145.0,
        address: 'Nikole Pašića 33, Niš',
        neighborhood: 'Centar',
        lat: 43.3223,
        lon: 21.8987,
        comment: 'Penthouse, 2 terase, lux opremljen',
        elevator: true,
        additionalEquipment: ['2 Terase', 'Roletne', 'Premium opremanje', 'Smart Home'],
        constructionYear: 2021,
        bathrooms: 2,
        floor: 8,
        roomStructure: 'Četvorosoban',
        heating: HeatingType.FLOOR,
        orientation: Orientation.South,
        specialOffer: 7,
      },
      {
        code: 'NIS-010',
        description: 'Garaža u centru grada sa ramp pristupom.',
        propertyType: PropertyType.Office,
        status: PropertyStatus.Active,
        price: 18000,
        salePrice: 17000,
        area: 16.0,
        address: 'Generals Milojka Lešjanina 5, Niš',
        neighborhood: 'Centar',
        lat: 43.3201,
        lon: 21.8943,
        comment: 'Garažno mesto, sigurno, osvetljeno',
        elevator: false,
        additionalEquipment: ['Rampa', 'Osvetljenje', 'Video nadzor'],
        constructionYear: 2016,
        bathrooms: 0,
        floor: -1,
        roomStructure: 'Garaža',
        heating: HeatingType.OTHER,
        orientation: Orientation.North,
      },
    ];

    const properties = await propertyRepository.save(propertiesData);
    console.log(`✅ Created ${properties.length} properties\n`);

    // ========== SEED PROPERTY IMAGES ==========
    console.log('🖼️  Creating property images...');

    // Sample images (using placeholder service)
    const imageUrls = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ];

    const propertyImages = [];
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images per property

      for (let j = 0; j < numImages; j++) {
        propertyImages.push({
          url: imageUrls[j % imageUrls.length],
          order: j,
          isFavorite: j === 0, // First image is favorite
          property: property,
        });
      }
    }

    const savedImages = await propertyImageRepository.save(propertyImages);
    console.log(`✅ Created ${savedImages.length} property images\n`);

    // ========== SEED CLIENTS ==========
    console.log('👤 Creating clients...');

    const clientsData = [
      {
        name: 'Marko Marković',
        address: 'Knjaževačka 12, Niš',
        email: 'marko.markovic@example.com',
        phone: '+381641234567',
        transactionType: TransactionType.Seller,
        paymentType: PaymentType.Cash,
        comment: 'Prodaje stan zbog preseljenja u inostranstvo',
        moneyAmount: 115000,
        status: ClientStatus.Active,
        property: properties[0], // NIS-001
      },
      {
        name: 'Ana Petrović',
        address: 'Južni bulevar 25, Niš',
        email: 'ana.petrovic@example.com',
        phone: '+381642345678',
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Credit,
        comment: 'Traži porodičnu kuću, budžet do 200.000€',
        moneyAmount: 180000,
        status: ClientStatus.Active,
        property: properties[1], // NIS-002
      },
      {
        name: 'Nikola Jovanović',
        address: 'Bulevar 12. Februar 44, Niš',
        email: 'nikola.jovanovic@example.com',
        phone: '+381643456789',
        transactionType: TransactionType.Rents,
        paymentType: PaymentType.Cash,
        comment: 'Student, traži garsonjeru blizu fakulteta',
        moneyAmount: 200,
        status: ClientStatus.Active,
        property: properties[2], // NIS-003
      },
      {
        name: 'Jelena Nikolić',
        address: 'Vojvode Tankosića 18, Niš',
        email: 'jelena.nikolic@example.com',
        phone: '+381644567890',
        transactionType: TransactionType.Buyer,
        paymentType: PaymentType.Combined,
        comment: 'Otvara firmu, potreban poslovni prostor',
        moneyAmount: 90000,
        status: ClientStatus.Active,
        property: properties[3], // NIS-004
      },
      {
        name: 'Stefan Dimitrijević',
        address: 'Generala Bože Jankovića 7, Niš',
        email: 'stefan.dimitrijevic@example.com',
        phone: '+381645678901',
        transactionType: TransactionType.RentsOut,
        paymentType: PaymentType.Cash,
        comment: 'Izdaje dvosoban stan, dugoročno',
        moneyAmount: 350,
        status: ClientStatus.Active,
        property: properties[5], // NIS-006
      },
    ];

    const clients = await clientRepository.save(clientsData);
    console.log(`✅ Created ${clients.length} clients\n`);

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!      ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏠 Properties: ${properties.length}`);
    console.log(`   🖼️  Images: ${savedImages.length}`);
    console.log(`   👤 Clients: ${clients.length}\n`);

    console.log('🔐 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeder
seedDatabase();
