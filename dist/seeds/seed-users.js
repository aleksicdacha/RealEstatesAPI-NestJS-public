"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/entities/user/user.entity");
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
    entities: [user_entity_1.User],
    synchronize: false,
    logging: true,
});
console.log('Environment Variables:');
console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to the database.');
        const userRepository = AppDataSource.getRepository(user_entity_1.User);
        const existingUser = await userRepository.findOne({ where: { username: 'john.doe@example.com' } });
        if (existingUser) {
            console.log('User already exists. Skipping seed.');
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const user = userRepository.create({
            username: 'john.doe@example.com',
            password: hashedPassword,
        });
        await userRepository.save(user);
        console.log('User has been seeded successfully:', user);
    }
    catch (error) {
        console.error('Error while seeding the database:', error);
    }
    finally {
        await AppDataSource.destroy();
        console.log('Database connection closed.');
    }
}
seed();
//# sourceMappingURL=seed-users.js.map