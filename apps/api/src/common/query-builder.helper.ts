import { SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export class QueryBuilderHelper {
  static applyQueryOptions<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: any,
    filters?: { [key: string]: any }
  ) {
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, { [key]: value });
        }
      });
    }

    // Apply search
    if (options.searchField && options.searchValue) {
      // Ensure valid search field
      const validSearchFields = ['code', 'username']; // Update this list with valid fields
      if (!validSearchFields.includes(options.searchField)) {
        throw new BadRequestException(`Invalid search field: ${options.searchField}`);
      }

      queryBuilder.andWhere(
        `"${queryBuilder.alias}"."${options.searchField}" ILIKE :searchValue`,
        { searchValue: `%${options.searchValue}%` }
      );
    }

    // Apply sorting
    if (options.sortBy && options.order) {
      queryBuilder.orderBy(
        `"${queryBuilder.alias}"."${options.sortBy}"`,
        options.order.toUpperCase()
      );
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    queryBuilder.skip((page - 1) * limit).take(limit);
  }
}
