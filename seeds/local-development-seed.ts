import { DataSource } from 'typeorm';
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
  synchronize: false,
  logging: false,
});

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // ============================================
    // 1. CREATE DEFAULT ADMIN USER
    // ============================================
    console.log('👤 Creating users...');

    // Check if admin exists
    const existingAdmin = await AppDataSource.query(
      `SELECT * FROM users WHERE username = $1`,
      ['admin']
    );

    if (existingAdmin.length > 0) {
      console.log('   ⚠️  Admin user already exists');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await AppDataSource.query(
        `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@realestates.com', hashedPassword, 'admin']
      );

      console.log('   ✅ Admin user created');
      console.log('      Username: admin');
      console.log('      Email: admin@realestates.com');
      console.log('      Password: admin123\n');
    }

    // Create agent user
    const existingAgent = await AppDataSource.query(
      `SELECT * FROM users WHERE username = $1`,
      ['agent']
    );

    if (existingAgent.length > 0) {
      console.log('   ⚠️  Agent user already exists\n');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('agent123', salt);

      await AppDataSource.query(
        `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['agent', 'agent@realestates.com', hashedPassword, 'user']
      );

      console.log('   ✅ Agent user created');
      console.log('      Username: agent');
      console.log('      Email: agent@realestates.com');
      console.log('      Password: agent123\n');
    }

    // ============================================
    // 2. CREATE SAMPLE CLIENTS
    // ============================================
    console.log('👥 Creating sample clients...');

    const existingClients = await AppDataSource.query(`SELECT COUNT(*) as count FROM clients`);

    if (parseInt(existingClients[0].count) > 0) {
      console.log('   ⚠️  Clients already exist, skipping...\n');
    } else {
      const sampleClients = [
        {
          name: 'Marko Marković',
          address: 'Ul. Kralja Milana 25, Niš',
          email: 'marko.markovic@example.com',
          phone: '+381 64 123 4567',
          ownerJmbg: '0101990800001',
          ownerIdCardNumber: '001234567',
          transactionType: 'Seller',
        },
        {
          name: 'Ana Petrović',
          address: 'Bulevar Nemanjića 33, Niš',
          email: 'ana.petrovic@example.com',
          phone: '+381 64 234 5678',
          ownerJmbg: '1505985800002',
          ownerIdCardNumber: '002345678',
          transactionType: 'Seller',
        },
        {
          name: 'Nikola Jovanović',
          address: 'Vojvode Tankosića 12, Niš',
          email: 'nikola.jovanovic@example.com',
          phone: '+381 64 345 6789',
          ownerJmbg: '2203992800003',
          ownerIdCardNumber: '003456789',
          transactionType: 'Seller',
        },
      ];

      for (const client of sampleClients) {
        await AppDataSource.query(
          `INSERT INTO clients (name, address, email, phone, "ownerJmbg", "ownerIdCardNumber", "transactionType") 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [client.name, client.address, client.email, client.phone, client.ownerJmbg, client.ownerIdCardNumber, client.transactionType]
        );
      }

      console.log(`   ✅ Created ${sampleClients.length} sample clients\n`);
    }

    // ============================================
    // 3. CREATE SAMPLE PROPERTIES (Optional - can add via admin panel)
    // ============================================
    console.log('🏠 Properties can be created via the admin panel');
    console.log('   Navigate to http://localhost:3001 after login\n');

    // ============================================
    // SUMMARY
    // ============================================
    const totalUsers = await AppDataSource.query(`SELECT COUNT(*) as count FROM users`);
    const totalClients = await AppDataSource.query(`SELECT COUNT(*) as count FROM clients`);

    console.log('📊 Database Seeding Summary:');
    console.log('   ═══════════════════════════');
    console.log(`   👤 Users: ${totalUsers[0].count}`);
    console.log(`   👥 Clients: ${totalClients[0].count}`);
    console.log('   ═══════════════════════════\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    console.log('🔑 Default Agent Credentials:');
    console.log('   Username: agent');
    console.log('   Password: agent123\n');
    console.log('💡 Next Steps:');
    console.log('   1. Start the API: cd apps/api && npm run start:dev');
    console.log('   2. Start admin panel: cd apps/admin-web && npm run dev');
    console.log('   3. Login at http://localhost:3001');
    console.log('   4. Create properties via the admin panel\n');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed
seed();
