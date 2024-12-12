import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyImage } from '../property-image/property-image.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
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

  // async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
  //   const { images, ...propertyData } = createPropertyDto;
  //
  //   // Create the property
  //   const property = this.propertyRepository.create(propertyData);
  //   const savedProperty = await this.propertyRepository.save(property);
  //
  //   // Save the images and associate them with the property
  //   if (images && images.length > 0) {
  //     const propertyImages = images.map((imageUrl, index) =>
  //       this.propertyImageRepository.create({
  //         url: imageUrl, // Use the string directly as the URL
  //         isFavorite: index === 0, // The first image isFavorite: true, others false
  //         order: index + 1, // Set order starting from 1
  //         property: savedProperty, // Associate with the property
  //       }),
  //     );
  //     await this.propertyImageRepository.save(propertyImages);
  //   }
  //
  //   return savedProperty;
  // }

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

  async update(
    guid: string,
    updatePropertyDto: UpdatePropertyDTO,
  ): Promise<Property> {
    await this.propertyRepository.update(guid, updatePropertyDto);
    return this.findOne(guid);
  }

  async remove(guid: string): Promise<void> {
    await this.propertyRepository.delete(guid);
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
