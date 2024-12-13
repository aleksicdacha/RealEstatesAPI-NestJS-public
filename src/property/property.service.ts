import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyImage } from '../property-image/property-image.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { DataSource } from 'typeorm';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const { images, ...propertyData } = createPropertyDto;

    // Create the property
    const property = this.propertyRepository.create(propertyData);
    const savedProperty = await this.propertyRepository.save(property);

    // Save the images and associate them with the property
    if (images && images.length > 0) {
      const propertyImages = images.map((imageUrl, index) =>
        this.propertyImageRepository.create({
          url: imageUrl, // Use the string directly as the URL
          isFavorite: index === 0, // The first image isFavorite: true, others false
          order: index + 1, // Set order starting from 1
          property: savedProperty, // Associate with the property
        }),
      );
      await this.propertyImageRepository.save(propertyImages);
    }

    // Fetch the property again, including the images
    return await this.propertyRepository.findOne({
      where: { id: savedProperty.id },
      relations: ['images'], // Ensure the images are loaded
    });

  }

  async findAll(options: FilterPropertyDto): Promise<Pagination<Property>> {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    // Join the images relation
    queryBuilder.leftJoinAndSelect('property.images', 'images');

    // Apply search
    if (options.searchField && options.searchValue) {
      queryBuilder.andWhere(`property.${options.searchField} ILIKE :searchValue`, {
        searchValue: `%${options.searchValue}%`,
      });
    }

    // Apply filters
    if (options.status) {
      queryBuilder.andWhere('property.status = :status', { status: options.status });
    }

    // Apply pagination
    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);

    // Apply sorting
    queryBuilder.orderBy(`property.${options.sortBy}`, options.order as 'ASC' | 'DESC');

    // Fetch results
    const totalItems = await queryBuilder.getCount();
    const items = await queryBuilder.getMany();

    return new Pagination<Property>(items, {
      totalItems,
      itemCount: items.length,
      itemsPerPage: options.limit,
      totalPages: Math.ceil(totalItems / options.limit),
      currentPage: options.page,
    });
  }

  async findOne(id: string): Promise<Property> {
    return this.propertyRepository.findOne({
      where: { id },
      relations: ['images'], // Eager load the images relation
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDTO): Promise<Property> {
    const { images, ...propertyData } = updatePropertyDto;

    // Update the property fields
    await this.propertyRepository.update(id, propertyData);

    // Fetch the property including its current images
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!property) {
      throw new Error(`Property with id ${id} not found`);
    }

    if (images) {
      // Existing image IDs from the database
      const existingImageIds = property.images.map((img) => img.id);

      // New images to add
      const newImages = images.filter((img) => !img.id);

      // Images to update
      const imagesToUpdate = images.filter((img) => img.id);

      // Update existing images
      for (const img of imagesToUpdate) {
        if (existingImageIds.includes(img.id)) {
          await this.propertyImageRepository.update(img.id, {
            url: img.url,
            isFavorite: img.isFavorite,
            order: img.order,
          });
        }
      }

      // Add new images
      if (newImages.length > 0) {
        const propertyImages = newImages.map((image, index) =>
          this.propertyImageRepository.create({
            url: image.url,
            isFavorite: image.isFavorite ?? false,
            order: image.order ?? property.images.length + index + 1, // Order starts from the last existing order
            property,
          }),
        );
        await this.propertyImageRepository.save(propertyImages);
      }

      // Delete images that are not in the update payload
      const updatedImageIds = imagesToUpdate.map((img) => img.id);
      const imagesToDelete = property.images.filter(
        (img) => !updatedImageIds.includes(img.id),
      );
      if (imagesToDelete.length > 0) {
        await this.propertyImageRepository.remove(imagesToDelete);
      }
    }

    // Fetch and return the updated property
    return await this.propertyRepository.findOne({
      where: { id },
      relations: ['images'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Fetch the property with its associated images
      const property = await manager
        .createQueryBuilder(Property, 'property')
        .leftJoinAndSelect('property.images', 'images')
        .setLock('pessimistic_write', undefined, ['property']) // Lock only the "property"
        .where('property.id = :id', { id })
        .getOne();

      if (!property) {
        throw new Error(`Property with ID ${id} not found`);
      }

      // Process images associated with the property
      if (property.images && property.images.length > 0) {
        await this.handlePropertyImages(manager, id, property.images);
      }

      // Remove the property
      await manager.delete(Property, { id });
    });
  }


  // Helper functions


  async handlePropertyImages(manager, propertyId: string, images: PropertyImage[]): Promise<void> {
    for (const image of images) {
      if (!image.url) {
        console.warn(`Image URL is undefined for image record: ${JSON.stringify(image)}`);
        continue;
      }

      const isUsedByOtherProperties = await this.isImageUsedByOtherProperties(manager, image.url, propertyId);

      if (!isUsedByOtherProperties) {
        await this.deleteImageFile(image.url);
      }
    }

    // Remove image records from the database
    await manager.delete(PropertyImage, { property: { id: propertyId } });
  }

  async isImageUsedByOtherProperties(manager, url: string, propertyId: string): Promise<boolean> {
    const count = await manager
      .createQueryBuilder(PropertyImage, 'propertyImage')
      .where('propertyImage.url = :url', { url })
      .andWhere('propertyImage.propertyId != :id', { id: propertyId })
      .getCount();

    return count > 0;
  }

  async deleteImageFile(url: string): Promise<void> {
    const fileName = url.split('/uploads/')[1];

    if (!fileName) {
      console.warn(`Invalid image URL format: ${url}`);
      return;
    }

    const filePath = join(process.cwd(), 'uploads', fileName);

    try {
      await unlink(filePath);
      console.log(`Successfully deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }

  // async findNearby(
  //   centerLatitude: number,
  //   centerLongitude: number,
  //   radiusKm: number,
  // ): Promise<Property[]> {
  //   return await this.propertyRepository.query(`
  //   SELECT *,
  //     (6371 * acos(
  //         cos(radians(${centerLatitude}))
  //         * cos(radians(lat))
  //         * cos(radians(lon) - radians(${centerLongitude}))
  //         + sin(radians(${centerLatitude}))
  //         * sin(radians(lat))
  //     )) AS distance
  //   FROM properties
  //   HAVING distance <= ${radiusKm}
  //   ORDER BY distance;
  // `);
  // }
}
