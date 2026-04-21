import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: ['src/entities/**/*.entity.ts'],
  synchronize: false,
});

async function createAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository('User');

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = userRepository.create({
      username: 'admin',
      email: 'admin@olymp-nekretnine.rs',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    await userRepository.save(adminUser);
    console.log('✅ Admin user created successfully:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: ADMIN');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

createAdminUser();
