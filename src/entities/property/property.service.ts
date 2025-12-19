import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatsQueryDto, PropertyStatsDto } from './dto/property-stats.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DataSource, Between } from 'typeorm';
import { PropertyRepository } from '@src/entities/property/property.repository';
import { PropertyImageRepository } from '@src/entities/property-image/property-image.repository';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository, // No @InjectRepository here
    private readonly propertyImageRepository: PropertyImageRepository, // Direct injection
    private readonly dataSource: DataSource,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const { code, images, ...propertyData } = createPropertyDto;

    // Check if the code already exists
    const existingProperty = await this.propertyRepository.findOne({ where: { code } });
    if (existingProperty) {
      throw new ConflictException(`Property with code "${code}" already exists.`);
    }

    // Create the property
    try {
      const property = this.propertyRepository.create({ code, ...propertyData });
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
    } catch (e) {
      console.log('error', e)
    }
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDTO): Promise<Property> {
    const { code, images, additionalEquipment, ...propertyData } = updatePropertyDto;

    // Fetch the property to update
    const property = await this.propertyRepository.findOne({ where: { id }, relations: ['images'] });
    if (!property) {
      throw new NotFoundException(`Property with id "${id}" not found.`);
    }

    // Check if the code is being updated and if it already exists
    if (code && code !== property.code) {
      const existingProperty = await this.propertyRepository.findOne({ where: { code } });
      if (existingProperty) {
        throw new ConflictException(`Property with code "${code}" already exists.`);
      }
    }

    // Serialize additional_equipment if provided
    const updatedData = {
      ...propertyData,
      code,
      additionalEquipment: additionalEquipment ?? null,
    };

    // Update the property fields
    await this.propertyRepository.update(id, updatedData);

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
    }

    // Return the updated property
    return this.propertyRepository.findOne({ where: { id }, relations: ['images'] });
  }

  async findAll(options: FilterPropertyDto): Promise<Pagination<Property>> {
    // Set default values for pagination
    const paginationOptions = {
      ...options,
      page: options.page || 1,
      limit: options.limit || 10,
      sortBy: options.sortBy || 'createdAt',
      order: (options.order || 'DESC') as 'ASC' | 'DESC'
    };

    const [items, totalItems] = await this.propertyRepository.findFilteredProperties(paginationOptions);

    return new Pagination<Property>(items, {
      totalItems,
      itemCount: items.length,
      itemsPerPage: paginationOptions.limit,
      totalPages: Math.ceil(totalItems / paginationOptions.limit),
      currentPage: paginationOptions.page,
    });
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['client', 'images'], // Eager load the images relation
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Handle the case where client is null
    if (!property.client) {
      console.warn(`Property with id "${id}" has no associated client.`);
    } else {
      console.log('Client ID:', property.client.id); // Access client ID safely
    }

    return {
      ...property,
      client: property.client ? {
        id: property.client.id,
        name: property.client.name,
        address: property.client.address,
        phone: property.client.phone,
        email: property.client.email,
        transactionType: property.client.transactionType,
        paymentType: property.client.paymentType,
        comment: property.client.comment,
        status: property.client.status,
        moneyAmount: property.client.moneyAmount,
      } : null,
    };
  }


  async remove(id: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Fetch the property with associated images
        const property = await manager
          .createQueryBuilder(Property, 'property')
          .leftJoinAndSelect('property.images', 'images')
          .setLock('pessimistic_write', undefined, ['property']) // Lock the property to prevent concurrent modifications
          .where('property.id = :id', { id })
          .getOne();

        if (!property) {
          throw new NotFoundException(`Property with ID ${id} not found`);
        }

        console.log(`Removing property with ID: ${id}`);

        if (property.images && property.images.length > 0) {
          console.log(`Found ${property.images.length} associated images for property ID: ${id}`);

          // Handle property images with optimized parallel processing
          await this.propertyImageRepository.handlePropertyImagesParallel(manager, id, property.images);
        } else {
          console.log(`No images associated with property ID: ${id}`);
        }

        // Delete the property itself
        await manager.delete(Property, { id });
        console.log(`Property with ID ${id} successfully removed.`);
      });
    } catch (error) {
      console.log(error);
      console.error(`Failed to remove property with ID ${id}:`, error);
      throw error; // Rethrow to propagate the error up the call chain
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const property = await manager.findOne(Property, {
        where: { id },
        relations: ['images'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!property) {
        throw new Error(`Property with ID ${id} not found`);
      }

      await this.propertyRepository.softDeleteProperty(id);
    });
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

  async getAveragePriceByType(query: PropertyStatsQueryDto): Promise<PropertyStatsDto[]> {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    // Apply date filters if provided
    if (query.startDate && query.endDate) {
      queryBuilder.where('property.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.where('property.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    } else if (query.endDate) {
      queryBuilder.where('property.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    // Group by property type and calculate average price
    const results = await queryBuilder
      .select('property.propertyType', 'propertyType')
      .addSelect('AVG(property.price)', 'averagePrice')
      .addSelect('COUNT(property.id)', 'count')
      .groupBy('property.propertyType')
      .getRawMany();

    return results.map(result => ({
      propertyType: result.propertyType,
      averagePrice: parseFloat(result.averagePrice),
      count: parseInt(result.count),
    }));
  }
}
