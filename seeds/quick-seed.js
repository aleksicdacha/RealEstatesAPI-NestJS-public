const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// Simple DataSource without migrations
const tempDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'real_estate_user',
  password: process.env.DB_PASSWORD || '***REMOVED-BY-SECURITY-CLEANUP***',
  database: process.env.DB_DATABASE || 'real_estate_db',
  synchronize: false,
  logging: false,
  entities: []
});

async function quickSeed() {
  console.log('🌱 Starting comprehensive seeding...');
  
  try {
    await tempDataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await tempDataSource.query('DELETE FROM property_images');
    await tempDataSource.query('DELETE FROM client');
    await tempDataSource.query('DELETE FROM property');
    await tempDataSource.query('DELETE FROM "user"');

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await tempDataSource.query(`
      INSERT INTO "user" (username, password, role) VALUES 
      ('admin', '${hashedPassword}', 'admin'),
      ('agent1', '${hashedPassword}', 'user'),
      ('agent2', '${hashedPassword}', 'user'),
      ('manager', '${hashedPassword}', 'admin')
    `);

    // Create properties  
    console.log('🏠 Creating properties...');
    await tempDataSource.query(`
      INSERT INTO property (id, code, description, "propertyType", status, price, "salePrice", area, address, lat, lon, comment, elevator, "additionalEquipment", "constructionYear", bathrooms, floor, heating, "createdAt", "updatedAt") VALUES 
      (gen_random_uuid(), 'L001', 'Luxury apartment in city center with panoramic views and modern appliances', 'Apartment', 'active', 185000, 180000, 95.5, '123 Downtown Plaza, Belgrade', 44.7866, 20.4489, 'Prime location, recently renovated', true, '["Air conditioning", "Parking", "Balcony", "Storage"]', 2015, 2, 8, 'Central', NOW(), NOW()),
      (gen_random_uuid(), 'S001', 'Spacious family house with garden and garage', 'House', 'active', 240000, 235000, 150.0, '456 Residential Street, Novi Sad', 45.2671, 19.8335, 'Perfect for families, quiet neighborhood', false, '["Garden", "Garage", "Terrace", "Basement"]', 2010, 3, null, 'Gas central', NOW(), NOW()),
      (gen_random_uuid(), 'S002', 'Modern studio apartment for young professionals', 'Apartment', 'active', 75000, 72000, 35.0, '789 Student District, Novi Belgrade', 44.8125, 20.4612, 'Great investment opportunity', true, '["Furnished", "Internet", "Cable TV"]', 2018, 1, 3, 'Electric central', NOW(), NOW()),
      (gen_random_uuid(), 'A001', 'Commercial office space in business district', 'Office', 'active', 320000, 310000, 200.0, '321 Business Center, Belgrade', 44.8176, 20.4633, 'Premium office location', true, '["Reception", "Conference rooms", "Parking", "Security"]', 2020, 4, 5, 'Central', NOW(), NOW()),
      (gen_random_uuid(), 'V001', 'Vacation house by the lake with private dock', 'House', 'inactive', 150000, 145000, 85.0, '555 Lakeside Road, Zlatibor', 43.7294, 19.7109, 'Recently sold property', false, '["Lake access", "Dock", "Fireplace", "Mountain view"]', 2005, 2, null, 'Fireplace', NOW(), NOW())
    `);

    // Get property IDs for relationships
    const properties = await tempDataSource.query('SELECT id, code FROM property');
    const L001 = properties.find(p => p.code === 'L001')?.id;
    const S001 = properties.find(p => p.code === 'S001')?.id;
    const S002 = properties.find(p => p.code === 'S002')?.id;
    const A001 = properties.find(p => p.code === 'A001')?.id;
    const V001 = properties.find(p => p.code === 'V001')?.id;

    // Create clients with property relationships
    console.log('👤 Creating clients...');
    await tempDataSource.query(`
      INSERT INTO client (id, name, address, email, phone, status, "transactionType", "paymentType", comment, "moneyAmount", "propertyId") VALUES 
      (gen_random_uuid(), 'Marko Petrović', 'Knez Mihailova 42, Belgrade', 'marko.petrovic@email.rs', '+381601234567', 'active', 'buyer', 'cash', 'Interested in downtown apartments, cash buyer', 200000, '${L001}'),
      (gen_random_uuid(), 'Ana Jovanović', 'Strahinića Bana 15, Novi Sad', 'ana.jovanovic@gmail.com', '+381629876543', 'active', 'seller', 'credit', 'Selling family house, relocating for work', 240000, '${S001}'),
      (gen_random_uuid(), 'Nikola Stojanović', 'Bulevar Oslobođenja 25, Novi Beograd', 'nikola.stojanovic@yahoo.com', '+381611357924', 'active', 'buyer', 'credit', 'First-time buyer, looking for studio apartment', 75000, '${S002}'),
      (gen_random_uuid(), 'Milica Radić', 'Terazije 3, Belgrade', 'milica.radic@hotmail.com', '+381602468135', 'active', 'buyer', 'cash', 'Business owner looking for commercial space', 320000, '${A001}'),
      (gen_random_uuid(), 'Stefan Milanović', 'Kraljice Marije 8, Kragujevac', 'stefan.milanovic@gmail.rs', '+381631357924', 'inactive', 'seller', 'cash', 'Successfully sold vacation house', 150000, '${V001}'),
      (gen_random_uuid(), 'Jovana Đorđević', 'Makedonska 12, Niš', 'jovana.djordjevic@email.rs', '+381644567890', 'active', 'buyer', 'credit', 'Looking for apartment under 100k, pre-approved loan', 95000, null),
      (gen_random_uuid(), 'Dragan Maksimović', 'Vidovdanska 45, Subotica', 'dragan.maksimovic@yahoo.rs', '+381652345678', 'active', 'seller', 'cash', 'Planning to sell inherited property', 180000, null)
    `);

    // Create property images using existing upload files
    console.log('📷 Creating property images...');
    await tempDataSource.query(`
      INSERT INTO property_images (id, url, "order", "isFavorite", "propertyId", "createdAt", "updatedAt") VALUES 
      (gen_random_uuid(), '/uploads/L001-1740742789497.jpg', 0, true, '${L001}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S001-1734637092803.jpg', 0, true, '${S001}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S001-1734637092814.jpg', 1, false, '${S001}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S001-1734637092840.jpg', 2, false, '${S001}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S002-1734642441023.jpg', 0, true, '${S002}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S002-1734642441035.jpg', 1, false, '${S002}', NOW(), NOW()),
      (gen_random_uuid(), '/uploads/S002-1740761117321.jpg', 2, false, '${S002}', NOW(), NOW())
    `);

    // Verify final data
    const userCount = await tempDataSource.query('SELECT COUNT(*) FROM "user"');
    const propertyCount = await tempDataSource.query('SELECT COUNT(*) FROM property');
    const clientCount = await tempDataSource.query('SELECT COUNT(*) FROM client');
    const imageCount = await tempDataSource.query('SELECT COUNT(*) FROM property_images');

    console.log('\n📊 Final Database State:');
    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`🏠 Properties: ${propertyCount[0].count}`);
    console.log(`👤 Clients: ${clientCount[0].count}`);
    console.log(`📷 Property Images: ${imageCount[0].count}`);

    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('✅ All entities created with proper relationships');
    console.log('✅ Property images mapped from uploads folder to properties');
    console.log('✅ Clients linked to specific properties');
    console.log('✅ Ready for frontend testing!');

    console.log('\n🔑 Login Credentials:');
    console.log('• admin / admin123 (admin role)');
    console.log('• agent1 / admin123 (user role)');
    console.log('• agent2 / admin123 (user role)');
    console.log('• manager / admin123 (admin role)');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await tempDataSource.destroy();
    console.log('\n✅ Database connection closed');
  }
}

quickSeed()
  .then(() => {
    console.log('\n🚀 Database is ready! You can now test the frontend.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
