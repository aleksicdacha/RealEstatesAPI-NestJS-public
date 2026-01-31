import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env.production' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'estates_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'estates_prod',
  synchronize: false,
  logging: false,
});

async function seedProduction() {
  try {
    console.log('🔐 Production Seed - Creating Initial Admin User...\n');

    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Check if any admin user already exists
    const existingAdmins = await AppDataSource.query(
      `SELECT * FROM users WHERE role = $1 LIMIT 1`,
      ['admin']
    );

    if (existingAdmins.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping seed.');
      console.log('   Use the admin panel to create additional users.\n');
      return;
    }

    // Get admin password from environment or use default (should be changed immediately)
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the initial admin user
    await AppDataSource.query(
      `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`,
      ['admin', 'admin@system.local', hashedPassword, 'admin']
    );

    console.log('✅ Initial admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 PRODUCTION ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('   Username: admin');
    console.log('   Password: ' + adminPassword);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('');
    console.log('1. Login immediately at http://YOUR_SERVER:3001');
    console.log('2. Change the admin password in your profile');
    console.log('3. Create additional admin/user accounts');
    console.log('4. Consider disabling this default admin after setup');
    console.log('');
    console.log('💡 To set a custom password, add to .env.production:');
    console.log('   ADMIN_DEFAULT_PASSWORD=YourSecurePassword123!');
    console.log('');

  } catch (error) {
    console.error('❌ Error during production seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed
seedProduction();
