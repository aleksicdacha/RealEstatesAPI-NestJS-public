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
    const queryBuilder = this.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.client', 'client');
    queryBuilder.leftJoinAndSelect('property.images', 'images');

    if (options.searchField && options.searchValue) {
      queryBuilder.andWhere(`property.${options.searchField} ILIKE :searchValue`, {
        searchValue: `%${options.searchValue}%`,
      });
    }

    if (options.status) {
      queryBuilder.andWhere('property.status = :status', { status: options.status });
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
