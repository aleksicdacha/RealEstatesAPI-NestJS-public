import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';

@Injectable()
export class PropertyRepository extends Repository<Property> {
  private readonly logger = new Logger(PropertyRepository.name);

  constructor(private readonly dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }

  async findFilteredProperties(options: FilterPropertyDto): Promise<[Property[], number]> {
    this.logger.debug(`Filtering properties with options: ${JSON.stringify(options)}`);
    
    const queryBuilder = this.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.client', 'client');
    queryBuilder.leftJoinAndSelect('client.representative', 'representative');
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

    // Client transaction type filter (prodaja/izdavanje)
    if (options.clientTransactionType) {
      queryBuilder.andWhere('client.transactionType = :clientTransactionType', { clientTransactionType: options.clientTransactionType });
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

    if (options.elevator !== undefined) {
      queryBuilder.andWhere('property.elevator = :elevator', { elevator: options.elevator });
    }

    // City filter
    if (options.city) {
      if (options.city === 'Niš') {
        // For Niš, include all neighborhoods except Beograd ones
        queryBuilder.andWhere('property.neighborhood NOT IN (:...beogradNeighborhoods)', { 
          beogradNeighborhoods: ['Beograd mala', 'Beverli Hils', 'MZ Dedinje']
        });
      } else if (options.city === 'Beograd') {
        queryBuilder.andWhere('property.neighborhood IN (:...beogradNeighborhoods)', { 
          beogradNeighborhoods: ['Beograd mala', 'Beverli Hils', 'MZ Dedinje']
        });
      }
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

    // Floor filter - handle both arrays and single values
    if (options.floors && options.floors.length > 0) {
      const floorConditions = options.floors.map((floor) => {
        const floorStr = String(floor).trim();
        
        // Handle special values
        if (floorStr === 'SU' || floorStr.toLowerCase() === 'suteren') {
          return `property.floor = -1`;
        } else if (floorStr === 'VPR' || floorStr.toLowerCase() === 'visoko prizemlje') {
          return `property.floor = 0`;
        } else if (floorStr === 'PR' || floorStr.toLowerCase() === 'prizemlje') {
          return `property.floor = 0`;
        } else if (floorStr === 'PTK' || floorStr.toLowerCase() === 'potkrovlje') {
          return `property.floor >= 10`; // Assume PTK is high floor
        } else if (floorStr === '2-4') {
          return `(property.floor >= 2 AND property.floor <= 4)`;
        } else if (floorStr === '5-10') {
          return `(property.floor >= 5 AND property.floor <= 10)`;
        } else if (floorStr === '11+') {
          return `property.floor >= 11`;
        } else {
          // Try to parse as number
          const floorNum = parseInt(floorStr);
          if (!isNaN(floorNum)) {
            return `property.floor = ${floorNum}`;
          }
          return null;
        }
      }).filter(Boolean); // Remove null conditions
      
      if (floorConditions.length > 0) {
        queryBuilder.andWhere(`(${floorConditions.join(' OR ')})`);
      }
    }

    // Room structure filter - handle both numeric (1, 2, 3) and Serbian names
    if (options.roomStructure && options.roomStructure.length > 0) {
      const roomStructureMap: { [key: string]: string[] } = {
        'garsonjera': ['garsonjera', '0.5', '0,5'],
        '1': ['jednosoban', '1'],
        '1.5': ['jednoiposoban', '1.5', '1,5'],
        '2': ['dvosoban', '2'],
        '2.5': ['dvoiposoban', '2.5', '2,5'],
        '3': ['trosoban', '3'],
        '3.5': ['troiposoban', '3.5', '3,5'],
        '4': ['cetvorosoban', 'četvorosoban', 'cetvoroiposoban', '4', '4.5', '4,5'],
        '5': ['petosoban', '5'],
      };

      const mappedStructures: string[] = [];
      options.roomStructure.forEach(rs => {
        // If it's a number, get mapped values
        if (roomStructureMap[rs]) {
          mappedStructures.push(...roomStructureMap[rs]);
        } else {
          // Otherwise use the value as-is (for direct Serbian names)
          mappedStructures.push(rs);
        }
      });

      if (mappedStructures.length > 0) {
        queryBuilder.andWhere('property.roomStructure IN (:...roomStructures)', { 
          roomStructures: [...new Set(mappedStructures)] // Remove duplicates
        });
      }
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
