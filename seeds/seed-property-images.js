const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [
    path.join(__dirname, '../apps/api/src/entities/**/*.entity.js'),
    path.join(__dirname, '../apps/api/build/entities/**/*.entity.js'),
  ],
  synchronize: false,
});

async function seedPropertyImages() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Get all properties
    const properties = await AppDataSource.query('SELECT id, code FROM properties ORDER BY id');
    console.log(`Found ${properties.length} properties`);

    // Get all images from uploads folder
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const allFiles = fs.readdirSync(uploadsDir);
    const imageFiles = allFiles.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && !file.includes('?t=')
    );

    console.log(`Found ${imageFiles.length} images in uploads folder`);

    // Delete existing property images
    await AppDataSource.query('DELETE FROM property_images');
    console.log('Deleted existing property images');

    let totalImagesCreated = 0;

    for (const property of properties) {
      // Find images that start with property code
      let propertyImages = imageFiles.filter(file => 
        file.startsWith(property.code + '-')
      );

      // If no specific images found, assign some random ones
      if (propertyImages.length === 0) {
        // Assign 2-4 random images
        const count = Math.floor(Math.random() * 3) + 2;
        propertyImages = imageFiles
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      }

      // Create property images
      for (let i = 0; i < propertyImages.length; i++) {
        const fileName = propertyImages[i];
        const imageUrl = `/uploads/${fileName}`;
        
        await AppDataSource.query(
          'INSERT INTO property_images ("propertyId", url, "order", "isFavorite", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [property.id, imageUrl, i + 1, i === 0]
        );

        totalImagesCreated++;
      }

      console.log(`Assigned ${propertyImages.length} images to property ${property.code}`);
    }

    console.log(`\n✅ Successfully created ${totalImagesCreated} property images`);
    console.log(`✅ Assigned images to ${properties.length} properties`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding property images:', error);
    process.exit(1);
  }
}

seedPropertyImages();
