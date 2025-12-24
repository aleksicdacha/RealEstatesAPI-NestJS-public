import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';

@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private readonly dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }

  async findFilteredProperties(options: FilterPropertyDto): Promise<[Property[], number]> {
    console.log('🔍 Backend received filter options:', JSON.stringify(options, null, 2));
    
    const queryBuilder = this.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.client', 'client');
    queryBuilder.leftJoinAndSelect('property.images', 'images');

    if (options.searchField && options.searchValue) {
      queryBuilder.andWhere(`property.${options.searchField} ILIKE :searchValue`, {
        searchValue: `%${options.searchValue}%`,
      });
    }

    // Status filter - handle both single value and array
    if (options.status) {
      const statusArray = Array.isArray(options.status) 
        ? options.status 
        : options.status.split(',').map(s => s.trim());
      
      if (statusArray.length > 0) {
        queryBuilder.andWhere('property.status IN (:...statuses)', { statuses: statusArray });
      }
    }

    // Property type filter - handle both single value and array
    if (options.propertyType) {
      const typeArray = Array.isArray(options.propertyType)
        ? options.propertyType
        : options.propertyType.split(',').map(t => t.trim());
      
      if (typeArray.length > 0) {
        queryBuilder.andWhere('property.propertyType IN (:...types)', { types: typeArray });
      }
    }

    // Price range filters
    if (options.minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice: options.minPrice });
    }

    if (options.maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: options.maxPrice });
    }

    // Area range filters
    if (options.minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea: options.minArea });
    }

    if (options.maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea: options.maxArea });
    }

    // City filter
    if (options.city) {
      queryBuilder.andWhere('LOWER(property.address) LIKE LOWER(:city)', { 
        city: `%${options.city}%` 
      });
    }

    // Neighborhood filter
    if (options.neighborhoods && options.neighborhoods.length > 0) {
      // Map UI values to actual neighborhood names and make case-insensitive
      const neighborhoodMap: { [key: string]: string } = {
        'medijana': 'Medijana',
        'palilula': 'Palilula',
        'pantelej': 'Pantelej',
        'crveni-krst': 'Crveni Krst',
        'niska-banja': 'Niška Banja',
        'bubanj': 'Bubanj',
        'duvaniste': 'Duvanjište',
        'cair': 'Čair',
        'bulevar': 'Bulevar',
        'vrezina': 'Vrežina',
        'durlan': 'Durlan',
        'beverly-hills': 'Beverly Hills',
        'jagodin-mala': 'Jagodin mala',
        'marger': 'Marger',
        'brzi-brod': 'Brzi Brod',
        'centar': 'Centar',
        'klinicki-centar': 'Klinički centar',
        'calije': 'Čalije',
        'pantelijmon': 'Pantelijmon',
        'vidriste': 'Vidrište',
        'pevac': 'Pevac',
        'cele-kula': 'Čele kula',
      };

      const mappedNeighborhoods = options.neighborhoods.map(n => 
        neighborhoodMap[n.toLowerCase()] || n
      );

      queryBuilder.andWhere('property.neighborhood IN (:...neighborhoods)', { 
        neighborhoods: mappedNeighborhoods 
      });
    }

    // Bathrooms filter
    if (options.bathrooms && options.bathrooms.length > 0) {
      queryBuilder.andWhere('property.bathrooms IN (:...bathrooms)', { 
        bathrooms: options.bathrooms 
      });
    }

    // Floor filter
    if (options.floors && options.floors.length > 0) {
      const floorConditions = options.floors.map((floor, index) => {
        if (floor === '2-4') {
          return `(property.floor >= 2 AND property.floor <= 4)`;
        } else if (floor === '5-10') {
          return `(property.floor >= 5 AND property.floor <= 10)`;
        } else if (floor === '11+') {
          return `property.floor >= 11`;
        } else {
          return `property.floor = ${parseInt(floor) || 0}`;
        }
      });
      queryBuilder.andWhere(`(${floorConditions.join(' OR ')})`);
    }

    // Room structure filter
    if (options.roomStructure && options.roomStructure.length > 0) {
      queryBuilder.andWhere('property.roomStructure IN (:...roomStructures)', { 
        roomStructures: options.roomStructure 
      });
    }

    // Heating filter
    if (options.heating && options.heating.length > 0) {
      queryBuilder.andWhere('property.heating IN (:...heating)', { 
        heating: options.heating 
      });
    }

    // Features filter - check if property has all specified features
    if (options.features && options.features.length > 0) {
      queryBuilder.andWhere('property.additionalEquipment @> :features', {
        features: JSON.stringify(options.features)
      });
    }

    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
    queryBuilder.orderBy(`property.${options.sortBy}`, options.order as 'ASC' | 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();
    return [items, total];
  }

  async softDeleteProperty(id: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Property)
      .set({ status: PropertyStatus.Deleted })
      .where('id = :id', { id })
      .execute();
  }
}
