import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';
import {
  FloorFilterMapper,
  NeighborhoodMapper,
  RoomStructureMapper,
  BEOGRAD_NEIGHBORHOODS
} from './utils/filter-mappers.util';

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
          beogradNeighborhoods: BEOGRAD_NEIGHBORHOODS
        });
      } else if (options.city === 'Beograd') {
        queryBuilder.andWhere('property.neighborhood IN (:...beogradNeighborhoods)', { 
          beogradNeighborhoods: BEOGRAD_NEIGHBORHOODS
        });
      }
    }

    // Neighborhood filter - use mapper utility
    if (options.neighborhoods && options.neighborhoods.length > 0) {
      const mappedNeighborhoods = NeighborhoodMapper.mapBatch(options.neighborhoods);
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

    // Floor filter - use mapper utility
    if (options.floors && options.floors.length > 0) {
      const floorConditions = FloorFilterMapper.mapFloors(options.floors);

      if (floorConditions.length > 0) {
        queryBuilder.andWhere(`(${floorConditions.join(' OR ')})`);
      }
    }

    // Room structure filter - use mapper utility
    if (options.roomStructure && options.roomStructure.length > 0) {
      const mappedStructures = RoomStructureMapper.mapBatch(options.roomStructure);

      if (mappedStructures.length > 0) {
        queryBuilder.andWhere('property.roomStructure IN (:...roomStructures)', { 
          roomStructures: mappedStructures
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
