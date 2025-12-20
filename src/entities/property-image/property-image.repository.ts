import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
import { access, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PropertyImageRepository extends Repository<PropertyImage> {
  constructor(private readonly dataSource: DataSource) {
    super(PropertyImage, dataSource.createEntityManager());
  }

  async deleteImagesByPropertyId(propertyId: string): Promise<void> {
    await this.createQueryBuilder('propertyImage') // Remove the alias 'propertyImage'
      .delete()
      .from(PropertyImage) // Reference the entity directly, not the alias
      .where('propertyId = :propertyId', { propertyId }) // No alias in 'propertyId'
      .execute();
  }

  async isImageUsedByOtherProperties(url: string, propertyId: string): Promise<boolean> {
    const count = await this.createQueryBuilder('propertyImage')
      .where('propertyImage.url = :url', { url })
      .andWhere('propertyImage.propertyId != :propertyId', { propertyId })
      .getCount();
    return count > 0;
  }

  async handlePropertyImagesParallel(manager, propertyId: string, images: PropertyImage[]): Promise<void> {
    const deleteFilePromises = images.map(async (image) => {
      if (!image.url) {
        console.warn(`Image URL is undefined for image record: ${JSON.stringify(image)}`);
        return; // Skip this image
      }

      // Check if the image is used by other properties
      const isUsedByOtherProperties = await this.isImageUsedByOtherProperties(image.url, propertyId);
      if (!isUsedByOtherProperties) {
        // Delete the image file if it's not used elsewhere
        await this.deleteImageFile(image.url);
      }
    });

    // Process all deletion promises in parallel
    await Promise.all(deleteFilePromises);

    // Delete all image records associated with the property in one query
    await this.deleteImagesByPropertyId(propertyId);
  }

  async deleteImageFile(filePath: string): Promise<void> {
    console.log('filePath:::', filePath);

    const basePath = process.env.FILE_UPLOAD_PATH || '/var/www/RealEstatesAPI-NestJS/uploads'; // Default fallback
    const fullPath = join(basePath, filePath);

    try {
      // Ensure file exists before attempting to delete
      await access(fullPath);
      await unlink(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`File not found: ${fullPath}, skipping deletion.`);
      } else {
        console.error(`Failed to delete file: ${fullPath}`, error);
        throw error; // Rethrow unexpected errors
      }
    }
  }

}