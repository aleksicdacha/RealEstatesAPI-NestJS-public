import { DataSource } from 'typeorm';
import { Property } from '../apps/api/src/entities/property/property.entity';
import { PropertyImage } from '../apps/api/src/entities/property-image/property-image.entity';
import * as fs from 'fs';
import * as path from 'path';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  entities: [Property, PropertyImage],
  synchronize: false,
});

async function seedPropertyImages() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const propertyRepo = AppDataSource.getRepository(Property);
    const imageRepo = AppDataSource.getRepository(PropertyImage);

    // Get all properties
    const properties = await propertyRepo.find();
    console.log(`Found ${properties.length} properties`);

    // Get all images from uploads folder
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const allFiles = fs.readdirSync(uploadsDir);
    const imageFiles = allFiles.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && !file.includes('?t=')
    );

    console.log(`Found ${imageFiles.length} images in uploads folder`);

    // Delete existing property images
    await imageRepo.delete({});
    console.log('Deleted existing property images');

    let totalImagesCreated = 0;

    for (const property of properties) {
      // Find images that start with property code
      const propertyImages = imageFiles.filter(file => 
        file.startsWith(property.code + '-') || 
        (property.code.startsWith('NEW') && file.startsWith('NEW'))
      );

      // If no specific images found, assign some random ones
      let imagesToAssign = propertyImages;
      if (imagesToAssign.length === 0) {
        // Assign 2-4 random images
        const count = Math.floor(Math.random() * 3) + 2;
        imagesToAssign = imageFiles
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      }

      // Create property images
      for (let i = 0; i < imagesToAssign.length; i++) {
        const fileName = imagesToAssign[i];
        const imageUrl = `/uploads/${fileName}`;
        
        const propertyImage = imageRepo.create({
          property: property,
          url: imageUrl,
          order: i + 1,
          isFavorite: i === 0, // First image is featured
        });

        await imageRepo.save(propertyImage);
        totalImagesCreated++;
      }

      console.log(`Assigned ${imagesToAssign.length} images to property ${property.code}`);
    }

    console.log(`\n✅ Successfully created ${totalImagesCreated} property images`);
    console.log(`✅ Assigned images to ${properties.length} properties`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding property images:', error);
    process.exit(1);
  }
}

seedPropertyImages();
