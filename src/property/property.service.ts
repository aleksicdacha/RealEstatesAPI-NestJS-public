import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, ILike, Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property, PropertyType } from './entities/property.entity/property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyImage } from './entities/property-image.entity/property-image.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const property = this.propertyRepository.create(createPropertyDto);

    return this.propertyRepository.save(property);
  }

  async findAll(query: FilterPropertyDto): Promise<Property[]> {
    const {
      search,
      // propertyType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
    } = query;

    const options: FindManyOptions<Property> = {
      where: {},
      order: { createdAt: 'DESC' }, // Default order
    };

    if (search) {
      options.where = {
        ...options.where,
        name: ILike(`%${search}%`),
      };
    }

    // if (propertyType) {
    //   options.where = {
    //     ...options.where,
    //     propertyType,
    //   };
    // }

    if (minPrice || maxPrice) {
      options.where = {
        ...options.where,
        price: Between(minPrice || 0, maxPrice || Infinity),
      };
    }

    if (minArea || maxArea) {
      options.where = {
        ...options.where,
        area: Between(minArea || 0, maxArea || Infinity),
      };
    }

    if (minLatitude || maxLatitude) {
      options.where = {
        ...options.where,
        lat: Between(minLatitude || -90, maxLatitude || 90),
      };
    }

    if (minLongitude || maxLongitude) {
      options.where = {
        ...options.where,
        lon: Between(minLongitude || -180, maxLongitude || 180),
      };
    }

    const [items, total] = await this.propertyRepository.findAndCount(options);

    // return { items, total };

    return this.propertyRepository.find({ relations: ['images'] });
  }

  async findAllByPropertyWithPagination(
    propertyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: PropertyImage[]; meta: any }> {
    const [items, total] = await this.propertyImageRepository.findAndCount({
      where: { property: { id: propertyId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { order: 'ASC' },
    });

    const meta = {
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };

    return { items, meta };
  }


  async findOne(guid: string): Promise<Property> {
    return this.propertyRepository.findOneBy({ guid });
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
  //         * cos(radians(latitude))
  //         * cos(radians(longitude) - radians(${centerLongitude}))
  //         + sin(radians(${centerLatitude}))
  //         * sin(radians(latitude))
  //     )) AS distance
  //   FROM properties
  //   HAVING distance <= ${radiusKm}
  //   ORDER BY distance;
  // `);
  // }
}
