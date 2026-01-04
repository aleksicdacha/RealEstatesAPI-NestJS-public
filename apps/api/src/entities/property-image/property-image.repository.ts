import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
import { access, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PropertyImageRepository extends Repository<PropertyImage> {
  private readonly logger = new Logger(PropertyImageRepository.name);

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
        this.logger.warn(`Image URL is undefined for image record in property ${propertyId}`);
        return;
      }

      // Check if the image is used by other properties
      const isUsedByOtherProperties = await this.isImageUsedByOtherProperties(image.url, propertyId);
      if (!isUsedByOtherProperties) {
        await this.deleteImageFile(image.url);
      }
    });

    // Process all deletion promises in parallel
    await Promise.all(deleteFilePromises);

    // Delete all image records associated with the property in one query
    await this.deleteImagesByPropertyId(propertyId);
  }

  async deleteImageFile(filePath: string): Promise<void> {
    const basePath = process.env.FILE_UPLOAD_PATH || '/var/www/RealEstatesAPI-NestJS/uploads';
    const fullPath = join(basePath, filePath);

    try {
      await access(fullPath);
      await unlink(fullPath);
      this.logger.debug(`Deleted file: ${fullPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`File not found: ${fullPath}, skipping deletion`);
      } else {
        this.logger.error(`Failed to delete file: ${fullPath}`, error.stack);
        throw error;
      }
    }
  }

}