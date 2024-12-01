import { DataSource } from 'typeorm';
import { User } from '../src/user/user.entity';
import * as bcrypt from 'bcrypt';

// Database configuration (should match your TypeORM configuration in app.module.ts)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [User],
  synchronize: false, // Avoid schema changes
  logging: true,
});

async function seed() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Connected to the database.');

    // Access the repository
    const userRepository = AppDataSource.getRepository(User);

    // Check if the user already exists
    const existingUser = await userRepository.findOne({ where: { email: 'john.doe@example.com' } });
    if (existingUser) {
      console.log('User already exists. Skipping seed.');
      return;
    }

    // Create a new user
    const salt = await bcrypt.genSalt(10); // Encrypt the password
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = userRepository.create({
      username: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
    });

    // Save the user to the database
    await userRepository.save(user);
    console.log('User has been seeded successfully:', user);
  } catch (error) {
    console.error('Error while seeding the database:', error);
  } finally {
    // Close the database connection
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seed();
