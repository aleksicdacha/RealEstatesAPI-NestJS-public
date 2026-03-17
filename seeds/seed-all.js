/**
 * Comprehensive seed script for all entities.
 * Uses raw SQL via TypeORM DataSource — no TypeScript entity imports needed.
 *
 * Run from apps/api/:  node ../../seeds/seed-all.js
 * Or via npm script:   npm run seed:all
 */

const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: false,
  logging: false,
  entities: [],
});

async function clearExistingData(ds) {
  console.log('🗑️  Clearing existing data...');
  await ds.query('DELETE FROM property_images');
  await ds.query('DELETE FROM clients');
  await ds.query('DELETE FROM properties');
  await ds.query('DELETE FROM users');
  console.log('   ✔ Tables cleared');
}

async function seedUsers(ds) {
  console.log('\n👥 Seeding users...');
  const hash = async (pw) => bcrypt.hash(pw, 10);

  const adminHash   = await hash('admin123');
  const agentHash   = await hash('agent123');

  await ds.query(`
    INSERT INTO users (username, email, password, role) VALUES
    ('admin',    'admin@olymp.rs',    $1, 'admin'),
    ('manager',  'manager@olymp.rs',  $2, 'admin'),
    ('agent1',   'agent1@olymp.rs',   $3, 'user'),
    ('agent2',   'agent2@olymp.rs',   $3, 'user'),
    ('agent3',   'agent3@olymp.rs',   $3, 'user')
  `, [adminHash, adminHash, agentHash]);

  const count = await ds.query('SELECT COUNT(*) FROM users');
  console.log(`   ✔ ${count[0].count} users created`);
}

async function seedProperties(ds) {
  console.log('\n🏠 Seeding properties...');

  // neighbourhood is shown publicly; address is hidden from public API
  const rows = [
    // apartments
    { code: 'BGD-001', type: 'Apartment', price: 129000, salePrice: 125000,  area: 72,  floor: 4,  bathrooms: 1, rooms: '2.5',  heating: 'Central',               elevator: true,  constructionYear: 2015, neighborhood: 'Vračar',         address: 'Maksima Gorkog 14, Beograd',            lat: 44.7983, lon: 20.4682, status: 'active',   specialOffer: 1, orientation: 'south',     description: 'Svetao stan u srcu Vračara sa balkonom i pogledom na park. Potpuno renoviran 2022. god.',        comment: 'Hitna prodaja - vlasnik seli u inostranstvo.' },
    { code: 'BGD-002', type: 'Apartment', price: 85000,  salePrice: 82000,   area: 48,  floor: 2,  bathrooms: 1, rooms: '1.5',  heating: 'Independently on gas',  elevator: false, constructionYear: 1985, neighborhood: 'Zemun',          address: 'Cara Dušana 32, Zemun',                 lat: 44.8413, lon: 20.4080, status: 'active',   specialOffer: 2, orientation: 'east',      description: 'Jednoiposoban stan u Zemunu, lep pogled na Kalemegdan. Nova stolarija i instalacije.',           comment: 'Dobra cena za lokaciju.' },
    { code: 'BGD-003', type: 'Apartment', price: 215000, salePrice: 210000,  area: 110, floor: 8,  bathrooms: 2, rooms: '3.5',  heating: 'Central',               elevator: true,  constructionYear: 2021, neighborhood: 'Novi Beograd',   address: 'Bulevar Mihajla Pupina 10b, Novi Beograd', lat: 44.8176, lon: 20.4133, status: 'active',   specialOffer: 3, orientation: 'southeast',  description: 'Luksuzni troiposoban stan u novogradnji. Podgrevanje poda, parking, ostava.',                   comment: 'Premium lokacija u blizini Arene.' },
    { code: 'BGD-004', type: 'Apartment', price: 62000,  salePrice: 60000,   area: 34,  floor: 3,  bathrooms: 1, rooms: '1.0',  heating: 'Electric central',      elevator: true,  constructionYear: 2019, neighborhood: 'Palilula',       address: 'Ruđera Boškovića 17, Beograd',          lat: 44.8061, lon: 20.4780, status: 'active',   specialOffer: null, orientation: 'north',   description: 'Garsonjera u novijoj gradnji, idealna za investiciju ili stanovanje. Odmah useljiva.',          comment: 'Zakupac plaća 350 EUR mesečno — odlična renta.' },
    // houses
    { code: 'NIS-001', type: 'House',     price: 168000, salePrice: 160000,  area: 195, floor: null, bathrooms: 3, rooms: '5.0', heating: 'Gas central',          elevator: false, constructionYear: 2008, neighborhood: 'Pantelej',       address: 'Vojvode Tankosića 8, Niš',              lat: 43.3209, lon: 21.9230, status: 'active',   specialOffer: 4, orientation: 'south',     description: 'Porodična kuća sa garažom, dvorištem i terasom. Mirna stambena zona, sve u blizini.',          comment: 'Vlasnik fleksibilan po ceni.' },
    { code: 'NIS-002', type: 'House',     price: 290000, salePrice: 285000,  area: 280, floor: null, bathrooms: 4, rooms: '6.0', heating: 'Floor',                elevator: false, constructionYear: 2017, neighborhood: 'Crveni Krst',    address: 'Kosančićeva 5, Niš',                    lat: 43.3229, lon: 21.9110, status: 'active',   specialOffer: null, orientation: 'southwest', description: 'Moderna vila sa bazenom, letnjom kuhinjom i video nadzorom. Vrhunska obrada.',                comment: 'Savršeno za reprezentativno stanovanje.' },
    // office / commercial
    { code: 'NS-001',  type: 'Office',    price: 185000, salePrice: 180000,  area: 130, floor: 5,  bathrooms: 2, rooms: null,   heating: 'Central',               elevator: true,  constructionYear: 2020, neighborhood: 'Centar',         address: 'Bulevar Mihajla Pupina 3, Novi Sad',    lat: 45.2551, lon: 19.8452, status: 'active',   specialOffer: 5, orientation: 'north',     description: 'Poslovni prostor u poslovnoj zgradi A+ klase. Recepcija, sala za sastanke, parking.',          comment: 'Zakupac u prostoru do kraja 2025.' },
    { code: 'NS-002',  type: 'CommercialSpace', price: 95000, salePrice: 92000, area: 65, floor: 0, bathrooms: 1, rooms: null,  heating: 'Air conditioner',       elevator: false, constructionYear: 2003, neighborhood: 'Liman',          address: 'Vojvođanskih brigada 14, Novi Sad',     lat: 45.2460, lon: 19.8480, status: 'active',   specialOffer: null, orientation: 'east',    description: 'Lokal u prizemlju stambene zgrade sa izlogom na prometnoj ulici. Pogodan za razne namene.',    comment: 'Može se adaptirati po dogovoru.' },
    // vacation / land
    { code: 'ZLT-001', type: 'VacationHome', price: 78000, salePrice: 75000, area: 68,  floor: null, bathrooms: 1, rooms: '2.0', heating: 'Fireplace',           elevator: false, constructionYear: 2001, neighborhood: 'Zlatibor centar', address: 'Put za Čigotu 22, Zlatibor',           lat: 43.7294, lon: 19.7133, status: 'active',   specialOffer: 6, orientation: 'west',      description: 'Vikendica na Zlatiboru sa odličnim pogledom na planinu. Sve usluge u pešačkoj dostupnosti.',   comment: 'Idealno za odmor ili kratkoročni najam.' },
    { code: 'BGD-010', type: 'Land',      price: 42000,  salePrice: 40000,   area: 420, floor: null, bathrooms: null, rooms: null, heating: null,                elevator: false, constructionYear: null, neighborhood: 'Surčin',        address: 'Ratarička 3, Surčin',                  lat: 44.7614, lon: 20.2774, status: 'inactive', specialOffer: null, orientation: null,      description: 'Plac u mirnom delu Surčina, urbanistički plan za stambenu izgradnju. Komunalna infrastruktura.',comment: 'Prodato — arhivski snimak.' },
  ];

  for (const p of rows) {
    const equipment = JSON.stringify(
      p.type === 'Apartment'
        ? ['Klima uređaj', 'Parking', 'Ostava']
        : p.type === 'House'
        ? ['Garaža', 'Dvorište', 'Terasa', 'Podrum']
        : p.type === 'Office' || p.type === 'CommercialSpace'
        ? ['Klima uređaj', 'Internet', 'Sigurnosni sistem']
        : []
    );

    await ds.query(`
      INSERT INTO properties
        (code, description, "propertyType", status, price, "salePrice", area,
         address, neighborhood, lat, lon, comment, elevator,
         "additionalEquipment", "constructionYear", bathrooms, floor,
         "roomStructure", heating, orientation, "specialOffer")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,$20,$21)
    `, [
      p.code, p.description, p.type, p.status, p.price, p.salePrice, p.area,
      p.address, p.neighborhood, p.lat, p.lon, p.comment, p.elevator,
      equipment, p.constructionYear, p.bathrooms, p.floor,
      p.rooms, p.heating, p.orientation, p.specialOffer
    ]);
  }

  const count = await ds.query('SELECT COUNT(*) FROM properties');
  console.log(`   ✔ ${count[0].count} properties created`);
}

async function seedPropertyImages(ds) {
  console.log('\n🖼️  Seeding property images (picsum placeholders)...');

  // Map property code → array of placeholder image URLs
  const imageSets = {
    'BGD-001': [
      'https://picsum.photos/seed/bgd001a/800/600',
      'https://picsum.photos/seed/bgd001b/800/600',
      'https://picsum.photos/seed/bgd001c/800/600',
    ],
    'BGD-002': [
      'https://picsum.photos/seed/bgd002a/800/600',
      'https://picsum.photos/seed/bgd002b/800/600',
    ],
    'BGD-003': [
      'https://picsum.photos/seed/bgd003a/800/600',
      'https://picsum.photos/seed/bgd003b/800/600',
      'https://picsum.photos/seed/bgd003c/800/600',
    ],
    'BGD-004': [
      'https://picsum.photos/seed/bgd004a/800/600',
    ],
    'NIS-001': [
      'https://picsum.photos/seed/nis001a/800/600',
      'https://picsum.photos/seed/nis001b/800/600',
    ],
    'NIS-002': [
      'https://picsum.photos/seed/nis002a/800/600',
      'https://picsum.photos/seed/nis002b/800/600',
      'https://picsum.photos/seed/nis002c/800/600',
    ],
    'NS-001': [
      'https://picsum.photos/seed/ns001a/800/600',
      'https://picsum.photos/seed/ns001b/800/600',
    ],
    'NS-002': [
      'https://picsum.photos/seed/ns002a/800/600',
    ],
    'ZLT-001': [
      'https://picsum.photos/seed/zlt001a/800/600',
      'https://picsum.photos/seed/zlt001b/800/600',
    ],
  };

  let total = 0;
  for (const [code, urls] of Object.entries(imageSets)) {
    const [prop] = await ds.query('SELECT id FROM properties WHERE code = $1', [code]);
    if (!prop) continue;

    for (let i = 0; i < urls.length; i++) {
      await ds.query(
        `INSERT INTO property_images (url, "order", "isFavorite", "propertyId") VALUES ($1, $2, $3, $4)`,
        [urls[i], i, i === 0, prop.id]
      );
      total++;
    }
  }

  console.log(`   ✔ ${total} property images created`);
}

async function seedClients(ds) {
  console.log('\n👤 Seeding clients...');

  // Each property can have at most ONE client (UNIQUE constraint on propertyId).
  // Fetch property IDs by code.
  const getPropertyId = async (code) => {
    const [row] = await ds.query('SELECT id FROM properties WHERE code = $1', [code]);
    return row ? row.id : null;
  };

  const clients = [
    {
      name: 'Marko Petrović',
      address: 'Knez Mihailova 42, Beograd',
      email: 'marko.petrovic@gmail.com',
      phone: '+381601234567',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'cash',
      comment: 'Kupuje stan u centru, isplata odmah. Ozbiljan kupac.',
      moneyAmount: 130000,
      propertyCode: 'BGD-001',
    },
    {
      name: 'Ana Jovanović',
      address: 'Strahinića Bana 15, Novi Sad',
      email: 'ana.jovanovic@gmail.com',
      phone: '+381629876543',
      status: 'active',
      transactionType: 'seller',
      paymentType: 'cash',
      comment: 'Prodaje stan, seli se u inostranstvo. Rok 3 meseca.',
      moneyAmount: 85000,
      propertyCode: 'BGD-002',
    },
    {
      name: 'Nikola Stojanović',
      address: 'Bulevar Oslobođenja 88, Beograd',
      email: 'nikola.stojanovic@yahoo.com',
      phone: '+381611357924',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'credit',
      comment: 'Stambeni kredit odobren, traži stan do 220k EUR.',
      moneyAmount: 215000,
      propertyCode: 'BGD-003',
    },
    {
      name: 'Milica Radić',
      address: 'Terazije 3, Beograd',
      email: 'milica.radic@hotmail.com',
      phone: '+381602468135',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'cash',
      comment: 'Investitor, kupuje garsonjeru radi iznajmljivanja.',
      moneyAmount: 65000,
      propertyCode: 'BGD-004',
    },
    {
      name: 'Dragan Milosavljević',
      address: 'Vojvode Putnika 5, Niš',
      email: 'dragan.milosavljevic@email.rs',
      phone: '+381631235678',
      status: 'active',
      transactionType: 'seller',
      paymentType: 'cash',
      comment: 'Prodaje porodičnu kuću u Nišu. Cena dogovorljiva.',
      moneyAmount: 168000,
      propertyCode: 'NIS-001',
    },
    {
      name: 'Jelena Nikolić',
      address: 'Cara Lazara 12, Niš',
      email: 'jelena.nikolic@email.rs',
      phone: '+381641234567',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'combined',
      comment: 'Kombinovana uplata — gotovina + kredit. Traži vilu.',
      moneyAmount: 290000,
      propertyCode: 'NIS-002',
    },
    {
      name: 'Stefan Lazović',
      address: 'Zmaj Jovina 8, Novi Sad',
      email: 'stefan.lazovic@ns.rs',
      phone: '+381652345678',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'cash',
      comment: 'Traži poslovni prostor u NS za firmu.',
      moneyAmount: 190000,
      propertyCode: 'NS-001',
    },
    {
      name: 'Vojislav Đorđević',
      address: 'Šajkaška 3, Novi Sad',
      email: 'vojislav.djordjevic@yahoo.rs',
      phone: '+381663457890',
      status: 'active',
      transactionType: 'rents',
      paymentType: 'cash',
      comment: 'Želi da zakupi lokal u NS, mesečna zakupnina 500–700 EUR.',
      moneyAmount: 700,
      propertyCode: 'NS-002',
    },
    {
      name: 'Slobodan Vasić',
      address: 'Partizanska 2, Zlatibor',
      email: 'slobodan.vasic@zlatibor.rs',
      phone: '+381674321098',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'cash',
      comment: 'Želi vikendicu na Zlatiboru, budžet oko 80k EUR.',
      moneyAmount: 78000,
      propertyCode: 'ZLT-001',
    },
    // extra clients without specific properties
    {
      name: 'Ivana Popović',
      address: 'Makedonska 7, Beograd',
      email: 'ivana.popovic@email.rs',
      phone: '+381685678901',
      status: 'active',
      transactionType: 'buyer',
      paymentType: 'credit',
      comment: 'Prvobitni kupac, traži jednosoban u Beogradu do 70k.',
      moneyAmount: 70000,
      propertyCode: null,
    },
    {
      name: 'Aleksandar Kovačević',
      address: 'Kneza Miloša 22, Beograd',
      email: 'aleksandar.kovacevic@gmail.rs',
      phone: '+381696789012',
      status: 'inactive',
      transactionType: 'seller',
      paymentType: 'cash',
      comment: 'Odustao od prodaje privremeno.',
      moneyAmount: 155000,
      propertyCode: null,
    },
  ];

  for (const c of clients) {
    const propertyId = c.propertyCode ? await getPropertyId(c.propertyCode) : null;

    await ds.query(
      `INSERT INTO clients
         (name, address, email, phone, status, "transactionType", "paymentType",
          comment, "moneyAmount", "propertyId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [c.name, c.address, c.email, c.phone, c.status, c.transactionType,
       c.paymentType, c.comment, c.moneyAmount, propertyId]
    );
  }

  const count = await ds.query('SELECT COUNT(*) FROM clients');
  console.log(`   ✔ ${count[0].count} clients created`);
}

async function printSummary(ds) {
  const [users]   = await ds.query('SELECT COUNT(*) FROM users');
  const [props]   = await ds.query('SELECT COUNT(*) FROM properties');
  const [imgs]    = await ds.query('SELECT COUNT(*) FROM property_images');
  const [clients] = await ds.query('SELECT COUNT(*) FROM clients');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Seed completed — final counts:');
  console.log(`   👥 users:            ${users.count}`);
  console.log(`   🏠 properties:       ${props.count}`);
  console.log(`   🖼️  property_images:  ${imgs.count}`);
  console.log(`   👤 clients:          ${clients.count}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔑 Login credentials:');
  console.log('   admin    / admin123  (role: admin)');
  console.log('   manager  / admin123  (role: admin)');
  console.log('   agent1   / agent123  (role: user)');
  console.log('   agent2   / agent123  (role: user)');
  console.log('   agent3   / agent123  (role: user)');
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  try {
    await AppDataSource.initialize();
    console.log('✔ Database connected');

    await clearExistingData(AppDataSource);
    await seedUsers(AppDataSource);
    await seedProperties(AppDataSource);
    await seedPropertyImages(AppDataSource);
    await seedClients(AppDataSource);
    await printSummary(AppDataSource);

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
    console.log('\n✔ Database connection closed');
  }
}

main();
