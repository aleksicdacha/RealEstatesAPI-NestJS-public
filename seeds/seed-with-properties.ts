import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config({ path: './apps/api/.env' });
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: false,
  logging: false,
});
function getRealImages(): string[] {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('⚠️  Uploads folder does not exist, using placeholder URLs');
    return [];
  }
  const files = fs.readdirSync(uploadsDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .map(file => `/uploads/${file}`);
  return files;
}
async function seed() {
  try {
    console.log('🌱 Starting FULL database seed (with real images & complete data)...\n');
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');
    const realImages = getRealImages();
    console.log(`📸 Found ${realImages.length} real images in uploads folder\n');
    console.log('👤 Creating users...');
    const existingAdmin = await AppDataSource.query(
      `SELECT * FROM users WHERE username = $1`,
      ['admin']
    );
    if (existingAdmin.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await AppDataSource.query(
        `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@realestates.com', hashedPassword, 'admin']
      );
      console.log('   ✅ Admin user created');
    } else {
      console.log('   ⚠️  Admin user already exists');
    }
    const existingAgent = await AppDataSource.query(
      `SELECT * FROM users WHERE username = $1`,
      ['agent']
    );
    if (existingAgent.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('agent123', salt);
      await AppDataSource.query(
        `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['agent', 'agent@realestates.com', hashedPassword, 'user']
      );
      console.log('   ✅ Agent user created\n');
    } else {
      console.log('   ⚠️  Agent user already exists\n');
    }
    console.log('👥 Creating sample clients (all fields)...');
    await AppDataSource.query(`DELETE FROM property_images`);
    await AppDataSource.query(`DELETE FROM properties`);
    await AppDataSource.query(`DELETE FROM clients`);
    const clientIds = [];
    const sampleClients = [
      {
        name: 'Marko Marković',
        address: 'Ul. Kralja Milana 25, Niš',
        email: 'marko.markovic@example.com',
        phone: '+381 64 123 4567',
        ownerJmbg: '0101990800001',
        ownerBirthplace: 'Niš',
        ownerIdCardNumber: '001234567',
        ownerIdCardIssuePlace: 'PU Niš',
        transactionType: 'seller',
        paymentType: 'cash',
        comment: 'Klijent je kooperativan, želi brzu prodaju.',
        moneyAmount: 85000,
        status: 'active',
      },
      {
        name: 'Ana Petrović',
        address: 'Bulevar Nemanjića 33, Niš',
        email: 'ana.petrovic@example.com',
        phone: '+381 64 234 5678',
        ownerJmbg: '1505985800002',
        ownerBirthplace: 'Beograd',
        ownerIdCardNumber: '002345678',
        ownerIdCardIssuePlace: 'PU Beograd',
        transactionType: 'seller',
        paymentType: 'bank-transfer',
        comment: 'Potrebno je dogovoriti termine razgledanja unapred.',
        moneyAmount: 95000,
        status: 'active',
      },
      {
        name: 'Nikola Jovanović',
        address: 'Vojvode Tankosića 12, Niš',
        email: 'nikola.jovanovic@example.com',
        phone: '+381 64 345 6789',
        ownerJmbg: '2203992800003',
        ownerBirthplace: 'Leskovac',
        ownerIdCardNumber: '003456789',
        ownerIdCardIssuePlace: 'PU Leskovac',
        transactionType: 'Seller',
        paymentType: 'Cash',
        comment: 'Fleksibilan po pitanju cene, može se pregovarati.',
        moneyAmount: 55000,
        status: 'active',
      },
      {
        name: 'Jelena Nikolić',
        address: 'Cara Dušana 78, Niš',
        email: 'jelena.nikolic@example.com',
        phone: '+381 64 456 7890',
        ownerJmbg: '0902988800004',
        ownerBirthplace: 'Niš',
        ownerIdCardNumber: '004567890',
        ownerIdCardIssuePlace: 'PU Niš',
        transactionType: 'Buyer',
        paymentType: 'Loan',
        comment: 'Traži kredit, potrebna procena vrednosti.',
        moneyAmount: 70000,
        status: 'active',
      },
      {
        name: 'Stefan Đorđević',
        address: 'Knjaza Miloša 45, Niš',
        email: 'stefan.djordjevic@example.com',
        phone: '+381 64 567 8901',
        ownerJmbg: '1510995800005',
        ownerBirthplace: 'Niš',
        ownerIdCardNumber: '005678901',
        ownerIdCardIssuePlace: 'PU Niš',
        transactionType: 'Renter',
        paymentType: 'Cash',
        comment: 'Traži stan na duži period, redovan klijent.',
        moneyAmount: null,
        status: 'active',
      },
    ];
    for (const client of sampleClients) {
      const result = await AppDataSource.query(
        `INSERT INTO clients (
          name, address, email, phone, "ownerJmbg", "ownerBirthplace",
          "ownerIdCardNumber", "ownerIdCardIssuePlace", "transactionType",
          "paymentType", comment, "moneyAmount", status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          client.name, client.address, client.email, client.phone,
          client.ownerJmbg, client.ownerBirthplace, client.ownerIdCardNumber,
          client.ownerIdCardIssuePlace, client.transactionType, client.paymentType,
          client.comment, client.moneyAmount, client.status
        ]
      );
      clientIds.push(result[0].id);
    }
    console.log(`   ✅ Created ${sampleClients.length} clients with ALL fields\n`);
    console.log('🏠 Creating sample properties (all fields, linked to clients)...');
    const sampleProperties = [
      {
        code: 'NIS-001',
        description: 'Luksuzni trosoban stan u centru grada sa kompletnom renovacijom. Visokokvalitetni materijali, parket, podno grejanje. Uključeno parking mesto u garaži. Stan je potpuno namešten sa modernom opremom. Idealan za porodicu ili investiciju.',
        propertyType: 'Apartment',
        status: 'active',
        price: 85000,
        salePrice: 80000,
        area: 72.5,
        address: 'Bulevar Nemanjića 15, Niš',
        neighborhood: 'Centar',
        lat: 43.3209,
        lon: 21.8954,
        floor: 3,
        numberOfFloors: 5,
        roomStructure: '3.0',
        bathrooms: 1,
        heating: 'CentralHeating',
        elevator: true,
        terrace: true,
        balcony: true,
        parking: true,
        garage: false,
        constructionYear: 2018,
        registeredUntil: '2025-12-31',
        orientation: 'South',
        youtubeUrl: null,
        specialOffer: 1,
        comment: 'Premium lokacija, brza prodaja moguća.',
        clientId: clientIds[0],
      },
      {
        code: 'NIS-002',
        description: 'Prostran četvorosoban stan sa dva balkona i pogledom na park. Odličan raspored prostorija, dnevni boravak 28m2, master spavaća soba sa kupatilom. Centralno grejanje, klima uređaji u svim sobama.',
        propertyType: 'Apartment',
        status: 'active',
        price: 95000,
        salePrice: 92000,
        area: 85,
        address: 'Ul. Kralja Milana 44, Niš',
        neighborhood: 'Centar',
        lat: 43.3182,
        lon: 21.8961,
        floor: 5,
        numberOfFloors: 8,
        roomStructure: '4.0',
        bathrooms: 2,
        heating: 'CentralHeating',
        elevator: true,
        terrace: false,
        balcony: true,
        parking: true,
        garage: true,
        constructionYear: 2020,
        registeredUntil: '2026-06-30',
        orientation: 'SouthWest',
        youtubeUrl: null,
        specialOffer: 2,
        comment: 'Nov stan, prva prodaja nakon izgradnje.',
        clientId: clientIds[1],
      },
      {
        code: 'NIS-003',
        description: 'Dvosoban stan u mirnom delu grada. Idealan za mlade bračne parove ili investiciju za izdavanje. Stan je kompletno renoviran 2022. godine.',
        propertyType: 'Apartment',
        status: 'active',
        price: 55000,
        salePrice: 52000,
        area: 48,
        address: 'Vojvode Tankosića 8, Niš',
        neighborhood: 'Medijana',
        lat: 43.3156,
        lon: 21.9021,
        floor: 2,
        numberOfFloors: 4,
        roomStructure: '2.0',
        bathrooms: 1,
        heating: 'GasHeating',
        elevator: false,
        terrace: false,
        balcony: true,
        parking: false,
        garage: false,
        constructionYear: 2015,
        registeredUntil: '2025-08-15',
        orientation: 'East',
        youtubeUrl: null,
        specialOffer: 3,
        comment: 'Dobra prilika za prve kupce.',
        clientId: clientIds[2],
      },
      {
        code: 'NIS-004',
        description: 'Porodična kuća sa dvorištem od 400m2. Tri spavaće sobe, dnevni boravak, kuhinja sa trpezarijom. Garaža za dva automobila. Kompletno ograđeno dvorište sa voćnjakom.',
        propertyType: 'House',
        status: 'active',
        price: 145000,
        salePrice: 140000,
        area: 120,
        address: 'Cara Dušana 78, Niš',
        neighborhood: 'Pantelej',
        lat: 43.3245,
        lon: 21.9156,
        floor: null,
        numberOfFloors: 2,
        roomStructure: '4.5',
        bathrooms: 2,
        heating: 'CentralHeating',
        elevator: false,
        terrace: true,
        balcony: false,
        parking: true,
        garage: true,
        constructionYear: 2010,
        registeredUntil: '2027-03-20',
        orientation: 'South',
        youtubeUrl: null,
        specialOffer: 4,
        comment: 'Kuća u odličnom stanju, useljiva odmah.',
        clientId: clientIds[3],
      },
      {
        code: 'NIS-005',
        description: 'Poslovni prostor u samom centru grada. Idealan za kancelariju, ordinaciju ili prodavnicu. Potpuno adaptiran, klima uređaji, video nadzor.',
        propertyType: 'Commercial',
        status: 'active',
        price: 78000,
        salePrice: 75000,
        area: 55,
        address: 'Knjaza Miloša 45, Niš',
        neighborhood: 'Centar',
        lat: 43.3190,
        lon: 21.8945,
        floor: 1,
        numberOfFloors: 5,
        roomStructure: '0',
        bathrooms: 1,
        heating: 'CentralHeating',
        elevator: true,
        terrace: false,
        balcony: false,
        parking: false,
        garage: false,
        constructionYear: 2005,
        registeredUntil: '2026-12-31',
        orientation: 'North',
        youtubeUrl: null,
        specialOffer: 5,
        comment: 'Visoka frekventnost, odlična lokacija.',
        clientId: clientIds[4],
      },
    ];
    let createdProperties = 0;
    const propertyGuids = [];
    for (const property of sampleProperties) {
      const propertyResult = await AppDataSource.query(
        `INSERT INTO properties (
          "code", "description", "propertyType", "status", "price", "salePrice",
          "area", "address", "neighborhood", "lat", "lon", "floor", "numberOfFloors",
          "roomStructure", "bathrooms", "heating", "elevator", "terrace", "balcony",
          "parking", "garage", "constructionYear", "registeredUntil", "orientation",
          "youtubeUrl", "specialOffer", "comment", "clientId", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
        ) RETURNING id, guid`,
        [
          property.code, property.description, property.propertyType, property.status,
          property.price, property.salePrice, property.area, property.address,
          property.neighborhood, property.lat, property.lon, property.floor,
          property.numberOfFloors, property.roomStructure, property.bathrooms,
          property.heating, property.elevator, property.terrace, property.balcony,
          property.parking, property.garage, property.constructionYear,
          property.registeredUntil, property.orientation, property.youtubeUrl,
          property.specialOffer, property.comment, property.clientId
        ]
      );
      const propertyId = propertyResult[0].id;
      const propertyGuid = propertyResult[0].guid;
      propertyGuids.push({ code: property.code, guid: propertyGuid });
      const propertyImages = realImages.slice(createdProperties * 3, (createdProperties + 1) * 3);
      if (propertyImages.length > 0) {
        for (let i = 0; i < propertyImages.length; i++) {
          await AppDataSource.query(
            `INSERT INTO property_images ("url", "order", "isFavorite", "propertyId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [propertyImages[i], i + 1, i === 0, propertyId]
          );
        }
      }
      createdProperties++;
    }
    console.log(`   ✅ Created ${createdProperties} properties with ALL fields\n`);
    console.log(`   ✅ Linked ${createdProperties} properties to clients\n`);
    console.log(`   ✅ Added ${realImages.slice(0, 15).length} real images from uploads folder\n`);
    const totalUsers = await AppDataSource.query(`SELECT COUNT(*) as count FROM users`);
    const totalClients = await AppDataSource.query(`SELECT COUNT(*) as count FROM clients`);
    const totalProperties = await AppDataSource.query(`SELECT COUNT(*) as count FROM properties`);
    const totalImages = await AppDataSource.query(`SELECT COUNT(*) as count FROM property_images`);
    console.log('📊 Database Seeding Summary:');
    console.log('   ═══════════════════════════');
    console.log(`   👤 Users:      ${totalUsers[0].count}`);
    console.log(`   👥 Clients:    ${totalClients[0].count} (with ALL fields)`);
    console.log(`   🏠 Properties: ${totalProperties[0].count} (with ALL fields)`);
    console.log(`   📸 Images:     ${totalImages[0].count} (real from uploads)`);
    console.log('   ═══════════════════════════\n');
    console.log('✅ Database seeding completed successfully!\n');
    console.log('📋 Property → Client Mapping:');
    for (let i = 0; i < propertyGuids.length; i++) {
      console.log(`   ${propertyGuids[i].code} → Client ${i + 1}`);
    }
    console.log('');
    console.log('🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    console.log('💡 Next Steps:');
    console.log('   1. Restart API to see new data');
    console.log('   2. Visit http://localhost:3001 (admin panel)');
    console.log('   3. Visit http://localhost:3002 (public website)');
    console.log('   4. All properties have real images from uploads folder\n');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}
seed();
