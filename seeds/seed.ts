import { DataSource } from 'typeorm';
import { User } from '../apps/api/src/entities/user/user.entity';
import { Property } from '../apps/api/src/entities/property/property.entity';
import { Client } from '../apps/api/src/entities/client/client.entity';
import { PropertyImage } from '../apps/api/src/entities/property-image/property-image.entity';
import { Representative } from '../apps/api/src/entities/representative/representative.entity';
import { NewsletterSubscriber } from '../apps/api/src/entities/newsletter-subscriber/newsletter-subscriber.entity';
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

// Load env from apps/api/.env (standard location)
dotenv.config({ path: './apps/api/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'estates',
  entities: [
    User,
    Property,
    Client,
    PropertyImage,
    Representative,
    NewsletterSubscriber,
  ],
  synchronize: true, // Auto-creates tables — safe for dev/seed
  logging: false,
});

async function seed() {
  console.log('\n🌱 Comprehensive database seed starting...\n');

  await AppDataSource.initialize();
  console.log('✅ Database connected\n');

  const userRepo = AppDataSource.getRepository(User);
  const propertyRepo = AppDataSource.getRepository(Property);
  const imageRepo = AppDataSource.getRepository(PropertyImage);
  const clientRepo = AppDataSource.getRepository(Client);
  const representativeRepo = AppDataSource.getRepository(Representative);
  const newsletterRepo = AppDataSource.getRepository(NewsletterSubscriber);

  // Clear all data (correct FK order)
  console.log('🗑️  Clearing existing data...');
  await AppDataSource.query(
    'TRUNCATE TABLE newsletter_subscribers RESTART IDENTITY CASCADE',
  );
  await AppDataSource.query(
    'TRUNCATE TABLE representatives RESTART IDENTITY CASCADE',
  );
  await AppDataSource.query(
    'TRUNCATE TABLE property_images RESTART IDENTITY CASCADE',
  );
  await AppDataSource.query('TRUNCATE TABLE clients RESTART IDENTITY CASCADE');
  await AppDataSource.query(
    'TRUNCATE TABLE properties RESTART IDENTITY CASCADE',
  );
  await AppDataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  console.log('✅ Data cleared\n');

  // ══════════════════════════════════════════════════════════
  // USERS — covers both Role.ADMIN and Role.USER
  // ══════════════════════════════════════════════════════════
  console.log('👥 Creating users...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('password123', 10);

  const users = await userRepo.save([
    {
      username: 'admin',
      email: 'admin@olymp-nekretnine.rs',
      password: adminHash,
      role: Role.ADMIN,
    },
    {
      username: 'manager',
      email: 'manager@olymp-nekretnine.rs',
      password: adminHash,
      role: Role.ADMIN,
    },
    {
      username: 'agent1',
      email: 'agent1@olymp-nekretnine.rs',
      password: userHash,
      role: Role.USER,
    },
    {
      username: 'agent2',
      email: 'agent2@olymp-nekretnine.rs',
      password: userHash,
      role: Role.USER,
    },
    {
      username: 'agent3',
      email: 'agent3@olymp-nekretnine.rs',
      password: userHash,
      role: Role.USER,
    },
  ]);
  console.log(`✅ Created ${users.length} users\n`);

  // ══════════════════════════════════════════════════════════
  // PROPERTIES — covers ALL PropertyType, PropertyStatus,
  //   HeatingType, Orientation enum values
  // ══════════════════════════════════════════════════════════
  console.log('🏠 Creating properties...');

  const propertiesData: Partial<Property>[] = [
    // 1. Apartment — Central, South
    {
      code: 'NIS-001',
      description:
        'Luksuzni trosoban stan u centru grada sa prelepim pogledom na Nišavu. Kompletno renoviran sa vrhunskim materijalima.',
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
      additionalEquipment: [
        'Klima uređaj',
        'Centralno grejanje',
        'Interfon',
        'Ugrađeni plakar',
      ],
      constructionYear: 2015,
      bathrooms: 1,
      floor: 4,
      roomStructure: 'Trosoban',
      heating: HeatingType.CENTRAL,
      orientation: Orientation.South,
      specialOffer: 1,
    },
    // 2. House — GasCentral, SouthEast
    {
      code: 'NIS-002',
      description:
        'Prostrana porodična kuća sa dvorištem i garažom u mirnom delu grada.',
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
    // 3. ApartmentInHouse — ElectricCentral, West
    {
      code: 'NIS-003',
      description:
        'Moderan stan u kući sa zasebnim ulazom, savršen za mlade parove.',
      propertyType: PropertyType.ApartmentInHouse,
      status: PropertyStatus.Active,
      price: 55000,
      salePrice: 52000,
      area: 65.0,
      address: 'Studentska 8, Niš',
      neighborhood: 'Studentski grad',
      lat: 43.3297,
      lon: 21.9027,
      comment: 'Zaseban ulaz, dvorište, blizu univerziteta',
      elevator: false,
      additionalEquipment: ['Zaseban ulaz', 'Dvorište', 'Parking mesto'],
      constructionYear: 2018,
      bathrooms: 1,
      floor: 0,
      roomStructure: 'Dvosoban',
      heating: HeatingType.ELECTRIC_CENTRAL,
      orientation: Orientation.West,
      specialOffer: 3,
    },
    // 4. Office — Central, North
    {
      code: 'NIS-004',
      description:
        'Poslovni prostor u centru grada, idealan za kancelariju ili IT firmu.',
      propertyType: PropertyType.Office,
      status: PropertyStatus.Active,
      price: 95000,
      salePrice: 90000,
      area: 65.0,
      address: 'Kralja Milana 22, Niš',
      neighborhood: 'Centar',
      lat: 43.3198,
      lon: 21.8965,
      comment: 'Velika prohodnost, odlična lokacija za biznis',
      elevator: true,
      additionalEquipment: ['Klima', 'WC', 'Parking', 'Optički internet'],
      constructionYear: 2019,
      bathrooms: 1,
      floor: 1,
      roomStructure: 'Open space',
      heating: HeatingType.CENTRAL,
      orientation: Orientation.North,
    },
    // 5. CommercialSpace — Floor, SouthWest
    {
      code: 'NIS-005',
      description:
        'Poslovni prostor pogodan za restoran ili kafić sa terasom na prometnom mestu.',
      propertyType: PropertyType.CommercialSpace,
      status: PropertyStatus.Active,
      price: 140000,
      salePrice: 135000,
      area: 120.0,
      address: 'Kopitareva 5, Niš',
      neighborhood: 'Centar',
      lat: 43.3212,
      lon: 21.8976,
      comment: 'Ugaoni prostor, visoka prohodnost, terasa',
      elevator: false,
      additionalEquipment: ['Terasa', 'Kuhinja', 'Klimatizacija', 'WC'],
      constructionYear: 2008,
      bathrooms: 2,
      floor: 0,
      roomStructure: 'Otvorenog tipa',
      heating: HeatingType.FLOOR,
      orientation: Orientation.SouthWest,
    },
    // 6. Land — no heating, East
    {
      code: 'NIS-006',
      description:
        'Građevinsko zemljište na odličnoj lokaciji, ravno, svi priključci.',
      propertyType: PropertyType.Land,
      status: PropertyStatus.Active,
      price: 75000,
      salePrice: 70000,
      area: 850.0,
      address: 'Vinogradska bb, Niš',
      neighborhood: 'Pantelej',
      lat: 43.3445,
      lon: 21.9234,
      comment: 'Kompletna infrastruktura, dozvoljena gradnja',
      elevator: false,
      additionalEquipment: ['Struja', 'Voda', 'Kanalizacija', 'Gas'],
      constructionYear: null,
      bathrooms: 0,
      floor: 0,
      roomStructure: null,
      heating: null,
      orientation: Orientation.East,
      specialOffer: 5,
    },
    // 7. VacationHome — Fireplace, NorthWest
    {
      code: 'NIS-007',
      description:
        'Vikendica sa prelepim pogledom na Sićevačku klisuru, idealna za odmor.',
      propertyType: PropertyType.VacationHome,
      status: PropertyStatus.Active,
      price: 42000,
      salePrice: 40000,
      area: 80.0,
      address: 'Sićevačka klisura, Niš',
      neighborhood: 'Sićevo',
      lat: 43.3567,
      lon: 22.0345,
      comment: 'Mirno okruženje, priroda, pogled na klisuru',
      elevator: false,
      additionalEquipment: ['Kamin', 'Terasa', 'Pomoćni objekat', 'Voćnjak'],
      constructionYear: 2005,
      bathrooms: 1,
      floor: 0,
      roomStructure: 'Dvosoban',
      heating: HeatingType.FIREPLACE,
      orientation: Orientation.NorthWest,
    },
    // 8. Duplex — IndependentOnGas, NorthEast
    {
      code: 'NIS-008',
      description:
        'Prostran duplex stan sa dva nivoa, moderan dizajn i kvalitetna gradnja.',
      propertyType: PropertyType.Duplex,
      status: PropertyStatus.Active,
      price: 155000,
      salePrice: 150000,
      area: 130.0,
      address: 'Bulevar Nemanjića 10, Niš',
      neighborhood: 'Medijana',
      lat: 43.3167,
      lon: 21.9156,
      comment: 'Duplex, dva nivoa, garažno mesto u ceni',
      elevator: true,
      additionalEquipment: ['Garažno mesto', 'Ostava', 'Terasa na oba nivoa'],
      constructionYear: 2022,
      bathrooms: 2,
      floor: 5,
      roomStructure: 'Četvorosoban',
      heating: HeatingType.INDEPENDENT_ON_GAS,
      orientation: Orientation.NorthEast,
      specialOffer: 7,
    },
    // 9. Apartment — SolidFuelCentral, North (Inactive)
    {
      code: 'NIS-009',
      description:
        'Jednosoban stan u mirnom delu grada, idealan za prvo stanovanje ili izdavanje.',
      propertyType: PropertyType.Apartment,
      status: PropertyStatus.Inactive,
      price: 38000,
      salePrice: 36000,
      area: 42.0,
      address: 'Stevana Sremca 18, Niš',
      neighborhood: 'Crvena Zvezda',
      lat: 43.3089,
      lon: 21.8823,
      comment: 'Privremeno povučen sa tržišta, vlasnik razmišlja',
      elevator: false,
      additionalEquipment: ['Balkon', 'Podrum'],
      constructionYear: 1985,
      bathrooms: 1,
      floor: 3,
      roomStructure: 'Jednosoban',
      heating: HeatingType.SOLID_FUEL_CENTRAL,
      orientation: Orientation.North,
    },
    // 10. House — IndependentOnSolidFuel, South (Deleted)
    {
      code: 'NIS-010',
      description: 'Stara kuća za rušenje sa velikim placem, odlična lokacija.',
      propertyType: PropertyType.House,
      status: PropertyStatus.Deleted,
      price: 95000,
      salePrice: 90000,
      area: 100.0,
      address: 'Vizantijski bulevar 55, Niš',
      neighborhood: 'Medijana',
      lat: 43.3134,
      lon: 21.9087,
      comment: 'Prodata — arhivirana',
      elevator: false,
      additionalEquipment: ['Plac 500m²'],
      constructionYear: 1965,
      bathrooms: 1,
      floor: 0,
      roomStructure: 'Trosoban',
      heating: HeatingType.INDEPENDENT_ON_SOLID_FUEL,
      orientation: Orientation.South,
    },
    // 11. Apartment — IndependentOnElectricity, SouthEast
    {
      code: 'NIS-011',
      description:
        'Penthouse stan sa dve terase i spektakularnim pogledom na grad.',
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
      additionalEquipment: [
        '2 Terase',
        'Roletne',
        'Premium opremanje',
        'Smart Home',
      ],
      constructionYear: 2021,
      bathrooms: 2,
      floor: 8,
      roomStructure: 'Četvorosoban',
      heating: HeatingType.INDEPENDENT_ON_ELECTRICITY,
      orientation: Orientation.SouthEast,
      specialOffer: 8,
    },
    // 12. Apartment — AirConditioner, West
    {
      code: 'NIS-012',
      description:
        'Garsonjera u novogradnji, kompletno nameštena, useljiva odmah.',
      propertyType: PropertyType.Apartment,
      status: PropertyStatus.Active,
      price: 45000,
      salePrice: 43000,
      area: 28.0,
      address: 'Aleksandra Medvedeva 14, Niš',
      neighborhood: 'Palilula',
      lat: 43.3178,
      lon: 21.9112,
      comment: 'Nameštena, odmah useljiva, dobar za izdavanje',
      elevator: true,
      additionalEquipment: [
        'Nameštaj',
        'Klima',
        'Ugrađena kuhinja',
        'Veš mašina',
      ],
      constructionYear: 2023,
      bathrooms: 1,
      floor: 2,
      roomStructure: 'Garsonjera',
      heating: HeatingType.AIR_CONDITIONER,
      orientation: Orientation.West,
    },
    // 13. House — Other heating, NorthWest
    {
      code: 'NIS-013',
      description:
        'Luksuzna vila sa bazenom i panoramskim pogledom, vrhunska gradnja.',
      propertyType: PropertyType.House,
      status: PropertyStatus.Active,
      price: 350000,
      salePrice: 340000,
      area: 380.0,
      address: 'Vinogradi bb, Niš',
      neighborhood: 'Pantelej',
      lat: 43.345,
      lon: 21.924,
      comment: 'Premium nekretnina, bazen, panoramski pogled',
      elevator: false,
      additionalEquipment: [
        'Bazen',
        'Sauna',
        'Fitness',
        'Garaža za 3 auta',
        'Video nadzor',
      ],
      constructionYear: 2020,
      bathrooms: 4,
      floor: 0,
      roomStructure: 'Petosoban i veći',
      heating: HeatingType.OTHER,
      orientation: Orientation.NorthWest,
      specialOffer: 4,
    },
    // 14. Office — GasCentral, East
    {
      code: 'NIS-014',
      description:
        'Kancelarijski prostor u poslovnoj zgradi sa kompletnom infrastrukturom.',
      propertyType: PropertyType.Office,
      status: PropertyStatus.Active,
      price: 110000,
      salePrice: 105000,
      area: 90.0,
      address: 'Vojvode Mišića 16, Niš',
      neighborhood: 'Medijana',
      lat: 43.3145,
      lon: 21.9078,
      comment: 'Idealno za veću firmu, konferencijska sala',
      elevator: true,
      additionalEquipment: [
        'Konferencijska sala',
        'Kuhinja',
        'Server soba',
        'Parking 5 mesta',
      ],
      constructionYear: 2017,
      bathrooms: 2,
      floor: 3,
      roomStructure: 'Petospratnica',
      heating: HeatingType.GAS_CENTRAL,
      orientation: Orientation.East,
    },
    // 15. Apartment — Floor, SouthWest (covers remaining combos)
    {
      code: 'NIS-015',
      description: 'Dvosoban stan u novogradnji sa lođom i pogledom na park.',
      propertyType: PropertyType.Apartment,
      status: PropertyStatus.Active,
      price: 82000,
      salePrice: 78000,
      area: 62.0,
      address: 'Generala Milojka Lešjanina 10, Niš',
      neighborhood: 'Centar',
      lat: 43.3201,
      lon: 21.8943,
      comment: 'Novogradnja, useljivo odmah, vlasništvo 1/1',
      elevator: true,
      additionalEquipment: [
        'Lođa',
        'Podrum',
        'Parking mesto',
        'Video interfon',
      ],
      constructionYear: 2024,
      bathrooms: 1,
      floor: 6,
      roomStructure: 'Dvosoban',
      heating: HeatingType.FLOOR,
      orientation: Orientation.SouthWest,
      specialOffer: 6,
    },
  ];

  const properties = await propertyRepo.save(propertiesData as Property[]);
  console.log(`✅ Created ${properties.length} properties\n`);

  // ══════════════════════════════════════════════════════════
  // PROPERTY IMAGES — 2-4 images per property
  // ══════════════════════════════════════════════════════════
  console.log('🖼️  Creating property images...');

  const imageUrls = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ];

  const allImages: Partial<PropertyImage>[] = [];
  for (const property of properties) {
    const numImages = 2 + Math.floor(Math.random() * 3); // 2-4 images
    for (let j = 0; j < numImages; j++) {
      allImages.push({
        url: imageUrls[j % imageUrls.length],
        order: j,
        isFavorite: j === 0,
        property,
      });
    }
  }

  const savedImages = await imageRepo.save(allImages as PropertyImage[]);
  console.log(`✅ Created ${savedImages.length} property images\n`);

  // ══════════════════════════════════════════════════════════
  // CLIENTS — covers ALL TransactionType, PaymentType,
  //   ClientStatus enum values. Linked to properties.
  // ══════════════════════════════════════════════════════════
  console.log('👤 Creating clients...');

  const clientsData: Partial<Client>[] = [
    // Seller + Cash + Active
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
      ownerJmbg: '1234567890123',
      ownerBirthplace: 'Niš',
      ownerIdCardNumber: 'NI-123456',
      ownerIdCardIssuePlace: 'SUP Niš',
      property: properties[0],
    },
    // Buyer + Credit + Active
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
      property: properties[1],
    },
    // Rents + Cash + Active
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
      property: properties[2],
    },
    // RentsOut + Combined + Active
    {
      name: 'Jelena Nikolić',
      address: 'Vojvode Tankosića 18, Niš',
      email: 'jelena.nikolic@example.com',
      phone: '+381644567890',
      transactionType: TransactionType.RentsOut,
      paymentType: PaymentType.Combined,
      comment: 'Izdaje poslovni prostor dugoročno',
      moneyAmount: 500,
      status: ClientStatus.Active,
      property: properties[4],
    },
    // Seller + Combined + Active (with representative)
    {
      name: 'Stefan Dimitrijević',
      address: 'Generala Bože Jankovića 7, Niš',
      email: 'stefan.dimitrijevic@example.com',
      phone: '+381645678901',
      transactionType: TransactionType.Seller,
      paymentType: PaymentType.Combined,
      comment: 'Prodaje vikendicu, moguća zamena za stan',
      moneyAmount: 40000,
      status: ClientStatus.Active,
      ownerJmbg: '9876543210987',
      ownerBirthplace: 'Niš',
      ownerIdCardNumber: 'NI-654321',
      ownerIdCardIssuePlace: 'SUP Niš',
      property: properties[6],
    },
    // Buyer + Cash + Inactive
    {
      name: 'Milan Stojanović',
      address: 'Bulevar Zorana Đinđića 22, Niš',
      email: 'milan.stojanovic@example.com',
      phone: '+381646789012',
      transactionType: TransactionType.Buyer,
      paymentType: PaymentType.Cash,
      comment: 'Odustao od kupovine, preselio se',
      moneyAmount: 95000,
      status: ClientStatus.Inactive,
    },
    // Seller + Credit + Deleted
    {
      name: 'Dragana Ilić',
      address: 'Voždova 33, Niš',
      email: 'dragana.ilic@example.com',
      phone: '+381647890123',
      transactionType: TransactionType.Seller,
      paymentType: PaymentType.Credit,
      comment: 'Prodaja završena, arhivirano',
      moneyAmount: 90000,
      status: ClientStatus.Deleted,
      property: properties[9],
    },
    // Buyer + Credit + Active
    {
      name: 'Petar Živković',
      address: 'Toplička 5, Niš',
      email: 'petar.zivkovic@example.com',
      phone: '+381648901234',
      transactionType: TransactionType.Buyer,
      paymentType: PaymentType.Credit,
      comment: 'Traži luksuzni stan sa terasom',
      moneyAmount: 200000,
      status: ClientStatus.Active,
      property: properties[10],
    },
  ];

  const clients = await clientRepo.save(clientsData as Client[]);
  console.log(`✅ Created ${clients.length} clients\n`);

  // ══════════════════════════════════════════════════════════
  // REPRESENTATIVES — linked to clients who have one
  // ══════════════════════════════════════════════════════════
  console.log('📋 Creating representatives...');

  const representatives = await representativeRepo.save([
    {
      name: 'Advokat Dragan Pavlović',
      address: 'Cetinjska 15, Niš',
      phone: '+381691112233',
      jmbg: '1122334455667',
      birthplace: 'Beograd',
      idCardNumber: 'BG-112233',
      idCardIssuePlace: 'SUP Beograd',
      client: clients[4], // Stefan Dimitrijević's representative
    },
    {
      name: 'Advokat Milica Todorović',
      address: 'Bulevar oslobođenja 88, Niš',
      phone: '+381694445566',
      jmbg: '7788990011223',
      birthplace: 'Niš',
      idCardNumber: 'NI-778899',
      idCardIssuePlace: 'SUP Niš',
      client: clients[0], // Marko Marković's representative
    },
  ]);
  console.log(`✅ Created ${representatives.length} representatives\n`);

  // ══════════════════════════════════════════════════════════
  // NEWSLETTER SUBSCRIBERS
  // ══════════════════════════════════════════════════════════
  console.log('📧 Creating newsletter subscribers...');

  const subscribers = await newsletterRepo.save([
    { email: 'subscriber1@example.com', isActive: true },
    { email: 'subscriber2@example.com', isActive: true },
    { email: 'unsubscribed@example.com', isActive: false },
  ]);
  console.log(`✅ Created ${subscribers.length} newsletter subscribers\n`);

  // ══════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   🎉 DATABASE SEEDED SUCCESSFULLY!                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('📊 Summary:');
  console.log(`   👥 Users:           ${users.length} (2 admin, 3 agent)`);
  console.log(
    `   🏠 Properties:      ${properties.length} (all 8 PropertyTypes, all 3 statuses)`,
  );
  console.log(`   🖼️  Images:          ${savedImages.length}`);
  console.log(
    `   👤 Clients:         ${clients.length} (all TransactionTypes, PaymentTypes, ClientStatuses)`,
  );
  console.log(`   📋 Representatives: ${representatives.length}`);
  console.log(`   📧 Subscribers:     ${subscribers.length}\n`);
  console.log('🔐 Login: admin / admin123\n');
  console.log('Enum coverage:');
  console.log(
    '   PropertyType:    Apartment, House, ApartmentInHouse, Office, CommercialSpace, Land, VacationHome, Duplex ✓',
  );
  console.log('   PropertyStatus:  Active, Inactive, Deleted ✓');
  console.log('   HeatingType:     All 11 values ✓');
  console.log('   Orientation:     All 8 values ✓');
  console.log('   TransactionType: Seller, Buyer, Rents, RentsOut ✓');
  console.log('   PaymentType:     Cash, Credit, Combined ✓');
  console.log('   ClientStatus:    Active, Inactive, Deleted ✓');
  console.log('   Role:            ADMIN, USER ✓\n');

  await AppDataSource.destroy();
  console.log('🔌 Database connection closed');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
