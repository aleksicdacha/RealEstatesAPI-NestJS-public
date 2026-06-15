import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';
import {
  FloorFilterMapper,
  NeighborhoodMapper,
  RoomStructureMapper,
} from './utils/filter-mappers.util';
import {
  getCityNeighborhoods,
  DEFAULT_CITY,
} from './utils/city-neighborhood.map';

@Injectable()
export class PropertyRepository extends Repository<Property> {
  private readonly logger = new Logger(PropertyRepository.name);

  constructor(private readonly dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }

  async findFilteredProperties(
    options: FilterPropertyDto,
  ): Promise<[Property[], number]> {
    this.logger.debug(
      `Filtering properties with options: ${JSON.stringify(options)}`,
    );

    const queryBuilder = this.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.client', 'client');
    queryBuilder.leftJoinAndSelect('client.representative', 'representative');
    queryBuilder.leftJoinAndSelect('property.images', 'images');

    if (options.searchField && options.searchValue) {
      queryBuilder.andWhere(
        `property.${options.searchField} ILIKE :searchValue`,
        {
          searchValue: `%${options.searchValue}%`,
        },
      );
    }

    // Status filter - handle both single value and array
    if (options.status) {
      const statusArray = Array.isArray(options.status)
        ? options.status
        : options.status.split(',').map((s) => s.trim());

      if (statusArray.length > 0) {
        queryBuilder.andWhere('property.status IN (:...statuses)', {
          statuses: statusArray,
        });
      }
    }

    // Client transaction type filter (prodaja/izdavanje)
    if (options.clientTransactionType) {
      queryBuilder.andWhere('client.transactionType = :clientTransactionType', {
        clientTransactionType: options.clientTransactionType,
      });
    }

    if (options.propertyType) {
      const typeArray = Array.isArray(options.propertyType)
        ? options.propertyType
        : options.propertyType.split(',').map((t) => t.trim());

      if (typeArray.length > 0) {
        queryBuilder.andWhere('property.propertyType IN (:...types)', {
          types: typeArray,
        });
      }
    }

    // Price range filters
    if (options.minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', {
        minPrice: options.minPrice,
      });
    }

    if (options.maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', {
        maxPrice: options.maxPrice,
      });
    }

    // Area range filters
    if (options.minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', {
        minArea: options.minArea,
      });
    }

    if (options.maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', {
        maxArea: options.maxArea,
      });
    }

    if (options.elevator !== undefined) {
      queryBuilder.andWhere('property.elevator = :elevator', {
        elevator: options.elevator,
      });
    }

    // City filter — uses the city→neighborhood map to determine which
    // neighborhoods belong to the selected city
    if (options.city) {
      const cityNeighborhoods = getCityNeighborhoods(options.city);
      if (options.city === DEFAULT_CITY && cityNeighborhoods.length === 0) {
        // Default city with no neighborhood restrictions → match all.
        // This is the agency's primary market.
      } else if (cityNeighborhoods.length > 0) {
        const conditions = cityNeighborhoods.map(
          (_, i) => `property.neighborhood ILIKE :cityNh${i}`,
        );
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`);
        cityNeighborhoods.forEach((nh, i) => {
          queryBuilder.setParameter(`cityNh${i}`, `%${nh}%`);
        });
      } else {
        // City exists in map but has no neighborhoods → match nothing.
        queryBuilder.andWhere('1 = 0');
      }
    }

    // Neighborhood filter - use mapper utility
    if (options.neighborhoods && options.neighborhoods.length > 0) {
      const mappedNeighborhoods = NeighborhoodMapper.mapBatch(
        options.neighborhoods,
      );
      queryBuilder.andWhere('property.neighborhood IN (:...neighborhoods)', {
        neighborhoods: mappedNeighborhoods,
      });
    }

    // Bathrooms filter
    if (options.bathrooms && options.bathrooms.length > 0) {
      queryBuilder.andWhere('property.bathrooms IN (:...bathrooms)', {
        bathrooms: options.bathrooms,
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
      const mappedStructures = RoomStructureMapper.mapBatch(
        options.roomStructure,
      );

      if (mappedStructures.length > 0) {
        queryBuilder.andWhere(
          'property.roomStructure IN (:...roomStructures)',
          {
            roomStructures: mappedStructures,
          },
        );
      }
    }

    // Heating filter
    if (options.heating && options.heating.length > 0) {
      queryBuilder.andWhere('property.heating IN (:...heating)', {
        heating: options.heating,
      });
    }

    // Features filter - check if property has all specified features
    if (options.features && options.features.length > 0) {
      queryBuilder.andWhere('property.additionalEquipment @> :features', {
        features: JSON.stringify(options.features),
      });
    }

    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
    queryBuilder.orderBy(
      `property.${options.sortBy}`,
      options.order as 'ASC' | 'DESC',
    );

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

  /**
   * Find properties similar to the source property.
   * @param source - the property to find similars for
   * @param transactionType - filter by client transaction type (sale/rent), undefined = no filter
   * @param priceRange - price range ratio (0.4 = ±40%)
   * @param ignoreType - if true, don't filter by propertyType
   */
  async findSimilarProperties(
    source: Property,
    transactionType?: string,
    priceRange = 0.4,
    ignoreType = false,
  ): Promise<Property[]> {
    const qb = this.createQueryBuilder('property')
      .leftJoinAndSelect('property.client', 'client')
      .leftJoinAndSelect('property.images', 'images')
      .where('property.id != :sourceId', { sourceId: source.id })
      .andWhere('property.status = :status', { status: PropertyStatus.Active });

    // Same property type (unless ignoreType)
    if (!ignoreType) {
      qb.andWhere('property.propertyType = :propertyType', {
        propertyType: source.propertyType,
      });
    }

    // Same transaction type (if provided)
    if (transactionType) {
      qb.andWhere('client.transactionType = :transactionType', {
        transactionType,
      });
    }

    // Price range
    const minPrice = Math.floor(source.price * (1 - priceRange));
    const maxPrice = Math.ceil(source.price * (1 + priceRange));
    qb.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
      minPrice,
      maxPrice,
    });

    // Sort: same neighborhood first, then specialOffer, then price closeness
    if (source.neighborhood) {
      qb.addSelect(
        `CASE WHEN property.neighborhood ILIKE :neighborhood THEN 1 ELSE 2 END`,
        'neighbor_score',
      );
      qb.setParameter(
        'neighborhood',
        `%${source.neighborhood.split(',')[0].trim()}%`,
      );
      qb.orderBy('neighbor_score', 'ASC');
    }

    qb.addOrderBy('property.specialOffer', 'ASC', 'NULLS LAST');
    qb.addOrderBy('property.price', 'ASC');

    qb.take(8);

    return qb.getMany();
  }
}
