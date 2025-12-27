import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatsQueryDto, PropertyStatsDto } from './dto/property-stats.dto';
import { PublicPropertyDto } from './dto/public-property.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DataSource, Between, Not, IsNull } from 'typeorm';
import { PropertyRepository } from '@src/entities/property/property.repository';
import { PropertyImageRepository } from '@src/entities/property-image/property-image.repository';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository, // No @InjectRepository here
    private readonly propertyImageRepository: PropertyImageRepository, // Direct injection
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reorganizes special offers when a new value is set
   * If the desired value already exists, shifts that property and all higher values by 1
   * Properties with specialOffer > 20 get set to null
   */
  private async reorganizeSpecialOffers(newSpecialOffer: number, excludePropertyId?: string): Promise<void> {
    if (!newSpecialOffer || newSpecialOffer < 1 || newSpecialOffer > 20) {
      return; // Nothing to reorganize if value is invalid or null
    }

    // Find all properties with specialOffer >= newSpecialOffer (excluding the current property being updated)
    const whereCondition: any = {
      specialOffer: Not(IsNull()),
    };
    
    if (excludePropertyId) {
      whereCondition.id = Not(excludePropertyId);
    }

    const affectedProperties = await this.propertyRepository.find({
      where: whereCondition,
      order: { specialOffer: 'DESC' }, // Start from highest to avoid conflicts
    });

    // Filter properties with specialOffer >= newSpecialOffer
    const toShift = affectedProperties.filter(p => p.specialOffer >= newSpecialOffer);

    // Shift each property's specialOffer by 1
    for (const property of toShift) {
      const newValue = property.specialOffer + 1;
      
      if (newValue > 20) {
        // Set to null if exceeds 20
        await this.propertyRepository.update(property.id, { specialOffer: null });
      } else {
        // Increment by 1
        await this.propertyRepository.update(property.id, { specialOffer: newValue });
      }
    }
  }

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const { code, images, specialOffer, ...propertyData } = createPropertyDto;

    // Check if the code already exists
    const existingProperty = await this.propertyRepository.findOne({ where: { code } });
    if (existingProperty) {
      throw new ConflictException(`Property with code "${code}" already exists.`);
    }

    // Reorganize special offers if a new value is being set
    if (specialOffer && specialOffer >= 1 && specialOffer <= 20) {
      await this.reorganizeSpecialOffers(specialOffer);
    }

    // Create the property
    try {
      const property = this.propertyRepository.create({ 
        code, 
        ...propertyData,
        specialOffer: (specialOffer && specialOffer >= 1 && specialOffer <= 20) ? specialOffer : null,
      });
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
    const { code, images, additionalEquipment, specialOffer, ...propertyData } = updatePropertyDto;

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

    // Reorganize special offers if the value is being changed
    if (specialOffer !== undefined && specialOffer !== property.specialOffer) {
      if (specialOffer && specialOffer >= 1 && specialOffer <= 20) {
        await this.reorganizeSpecialOffers(specialOffer, id);
      }
    }

    // Serialize additional_equipment if provided
    const updatedData = {
      ...propertyData,
      code,
      additionalEquipment: additionalEquipment ?? null,
      specialOffer: (specialOffer && specialOffer >= 1 && specialOffer <= 20) ? specialOffer : null,
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
    return this.propertyRepository.findOne({ where: { id }, relations: ['client', 'client.representative', 'images'] });
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

  /**
   * Public-facing API for user-web frontend
   * Returns sanitized property data without sensitive information
   * Automatically filters only ACTIVE properties
   */
  async findAllPublic(options: FilterPropertyDto): Promise<Pagination<PublicPropertyDto>> {
    // Force status to 'active' for public API - ignore any status filter from client
    const paginationOptions = {
      ...options,
      status: 'active', // Always filter only active properties for public
      page: options.page || 1,
      limit: options.limit || 10,
      sortBy: options.sortBy || 'createdAt',
      order: (options.order || 'DESC') as 'ASC' | 'DESC'
    };

    const [items, totalItems] = await this.propertyRepository.findFilteredProperties(paginationOptions);

    // Transform to public DTOs (exclude sensitive data)
    const publicItems = items.map(property => this.transformToPublicDto(property));

    return new Pagination<PublicPropertyDto>(publicItems, {
      totalItems,
      itemCount: publicItems.length,
      itemsPerPage: paginationOptions.limit,
      totalPages: Math.ceil(totalItems / paginationOptions.limit),
      currentPage: paginationOptions.page,
    });
  }

  /**
   * Transform Property entity to PublicPropertyDto
   * Excludes: salePrice, comment, client, createdAt, updatedAt, contractNumber, cadastralParcel, cadastralMunicipality
   */
  private transformToPublicDto(property: Property): PublicPropertyDto {
    return {
      id: property.id,
      code: property.code,
      description: property.description,
      propertyType: property.propertyType,
      price: property.price, // Only public price
      area: property.area,
      neighborhood: property.neighborhood,
      lat: property.lat,
      lon: property.lon,
      elevator: property.elevator,
      additionalEquipment: property.additionalEquipment || [],
      constructionYear: property.constructionYear,
      bathrooms: property.bathrooms,
      floor: property.floor,
      roomStructure: property.roomStructure,
      heating: property.heating,
      orientation: property.orientation, // Public-facing
      youtubeUrl: property.youtubeUrl, // Public-facing for video embed
      specialOffer: property.specialOffer, // For homepage ordering
      images: property.images?.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isFavorite,
        displayOrder: img.order,
      })) || [],
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['client', 'client.representative', 'images'], // Eager load the images relation
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
        ownerJmbg: property.client.ownerJmbg,
        ownerBirthplace: property.client.ownerBirthplace,
        ownerIdCardNumber: property.client.ownerIdCardNumber,
        ownerIdCardIssuePlace: property.client.ownerIdCardIssuePlace,
        representative: property.client.representative,
      } : null,
    };
  }

  /**
   * Public-facing single property endpoint for user-web frontend
   * Returns sanitized property data without sensitive information
   */
  async findOnePublic(id: string): Promise<PublicPropertyDto> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return this.transformToPublicDto(property);
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

  async getFilterOptions() {
    // Helper function to convert Cyrillic to Latin
    const cyrillicToLatin = (text: string): string => {
      const cyrillicToLatinMap: { [key: string]: string } = {
        'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
        'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ',
        'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž', 'З': 'Z', 'з': 'z',
        'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
        'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm',
        'Н': 'N', 'н': 'n', 'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o',
        'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
        'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
        'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c',
        'Ч': 'Č', 'ч': 'č', 'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'š': 'š'
      };
      return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
    };

    // Extract unique cities from address field (second part: "Street, City, Country")
    const citiesRaw = await this.propertyRepository
      .createQueryBuilder('property')
      .select('property.address', 'address')
      .where('property.address IS NOT NULL')
      .getRawMany();

    // Parse cities from address format: "Street, City, Country" or "Street, City PostalCode, Country"
    const cities = citiesRaw
      .map(row => {
        const parts = row.address.split(',');
        if (parts.length >= 2) {
          // Get the second part (City or "City PostalCode")
          const cityPart = parts[1].trim();
          // Remove postal code if exists (e.g., "Beograd 11000" -> "Beograd")
          // Postal codes are typically numeric, so remove trailing numbers
          const cityName = cityPart.replace(/\s+\d+.*$/, '').trim();
          // Convert Cyrillic to Latin
          return cyrillicToLatin(cityName);
        }
        return null;
      })
      .filter(c => c && c.length > 0);

    // Get unique cities
    const uniqueCities = [...new Set(cities)].sort();

    // Extract unique neighborhoods
    const neighborhoods = await this.propertyRepository
      .createQueryBuilder('property')
      .select('DISTINCT property.neighborhood', 'neighborhood')
      .where('property.neighborhood IS NOT NULL')
      .orderBy('property.neighborhood', 'ASC')
      .getRawMany();

    return {
      cities: uniqueCities,
      neighborhoods: neighborhoods
        .map(n => {
          const trimmed = n.neighborhood?.trim();
          // Convert Cyrillic to Latin for neighborhoods too
          return trimmed ? cyrillicToLatin(trimmed) : null;
        })
        .filter(n => n && n.length > 0),
    };
  }
}
