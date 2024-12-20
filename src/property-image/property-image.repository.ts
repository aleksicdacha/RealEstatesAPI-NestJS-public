import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PropertyImage } from '@src/property-image/property-image.entity';
import { access, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PropertyImageRepository extends Repository<PropertyImage> {
  constructor(private readonly dataSource: DataSource) {
    super(PropertyImage, dataSource.createEntityManager());
  }

  async deleteImagesByPropertyId(propertyId: string): Promise<void> {
    await this.createQueryBuilder('propertyImage')
      .delete()
      .from(PropertyImage) // Ensure correct table reference
      .where('propertyImage.propertyId = :propertyId', { propertyId }) // Match column name
      .execute();
  }

  async isImageUsedByOtherProperties(url: string, propertyId: string): Promise<boolean> {
    const count = await this.createQueryBuilder('propertyImage')
      .where('propertyImage.url = :url', { url })
      .andWhere('propertyImage.propertyId != :propertyId', { propertyId })
      .getCount();
    return count > 0;
  }

  async handlePropertyImages(manager, propertyId: string, images: PropertyImage[]): Promise<void> {
    for (const image of images) {
      if (!image.url) {
        console.warn(`Image URL is undefined for image record: ${JSON.stringify(image)}`);
        continue;
      }

      // Check if the image is used by other properties
      const isUsedByOtherProperties = await this.isImageUsedByOtherProperties(image.url, propertyId);

      if (!isUsedByOtherProperties) {
        // Delete the image file if it's not used elsewhere
        await this.deleteImageFile(image.url);
      }
    }

    // Delete all image records associated with the property
    await this.deleteImagesByPropertyId(propertyId);
  }

  // async deleteImageFile(url: string): Promise<void> {
  //   const fileName = url.split('/uploads/')[1];
  //
  //   if (!fileName) {
  //     console.warn(`Invalid image URL format: ${url}`);
  //     return;
  //   }
  //
  //   const filePath = join(process.cwd(), 'uploads', fileName);
  //
  //   try {
  //     await unlink(filePath);
  //     console.log(`Successfully deleted file: ${filePath}`);
  //   } catch (error) {
  //     console.error(`Failed to delete file: ${filePath}`, error);
  //   }
  // }

  async deleteImageFile(filePath: string): Promise<void> {
    console.log('filePath:::', filePath)
    // const fullPath = process.env.BASE_URL + filePath;
    // console.log('fullPath:::', fullPath)      // Use base path from config
    const basePath = process.env.FILE_UPLOAD_PATH;
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