import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Property } from '../property.entity';

/**
 * Manages special offer reorganization logic
 * Extracted from PropertyService for Single Responsibility Principle
 */
@Injectable()
export class SpecialOfferManager {
  private readonly logger = new Logger(SpecialOfferManager.name);
  private readonly MAX_SPECIAL_OFFER = 20;
  private readonly MIN_SPECIAL_OFFER = 1;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Reorganizes special offers when a new value is set
   * Uses batch update instead of loop for performance optimization
   * If the desired value already exists, shifts that property and all higher values by 1
   * Properties with specialOffer > 20 get set to null
   */
  async reorganize(newSpecialOffer: number, excludePropertyId?: string): Promise<void> {
    if (!this.isValidSpecialOffer(newSpecialOffer)) {
      return; // Nothing to reorganize if value is invalid or null
    }

    await this.dataSource.transaction(async (manager) => {
      // Find all properties that need to be shifted
      const queryBuilder = manager
        .createQueryBuilder(Property, 'property')
        .where('property.specialOffer IS NOT NULL')
        .andWhere('property.specialOffer >= :newSpecialOffer', { newSpecialOffer })
        .orderBy('property.specialOffer', 'DESC');

      if (excludePropertyId) {
        queryBuilder.andWhere('property.id != :excludePropertyId', { excludePropertyId });
      }

      const affectedProperties = await queryBuilder.getMany();

      if (affectedProperties.length === 0) {
        return;
      }

      // Batch update: Set to null those that will exceed MAX
      const toSetNull = affectedProperties
        .filter(p => (p.specialOffer + 1) > this.MAX_SPECIAL_OFFER)
        .map(p => p.id);

      if (toSetNull.length > 0) {
        await manager
          .createQueryBuilder()
          .update(Property)
          .set({ specialOffer: null })
          .whereInIds(toSetNull)
          .execute();

        this.logger.debug(`Set ${toSetNull.length} properties to null (exceeded max ${this.MAX_SPECIAL_OFFER})`);
      }

      // Batch update: Increment valid ones
      const toIncrement = affectedProperties
        .filter(p => (p.specialOffer + 1) <= this.MAX_SPECIAL_OFFER)
        .map(p => p.id);

      if (toIncrement.length > 0) {
        // Use raw SQL for batch increment (more efficient than individual updates)
        await manager
          .createQueryBuilder()
          .update(Property)
          .set({ specialOffer: () => '"specialOffer" + 1' })
          .whereInIds(toIncrement)
          .execute();

        this.logger.debug(`Incremented specialOffer for ${toIncrement.length} properties`);
      }
    });
  }

  /**
   * Validates special offer value
   */
  isValidSpecialOffer(value: number | null | undefined): boolean {
    return value !== null
      && value !== undefined
      && value >= this.MIN_SPECIAL_OFFER
      && value <= this.MAX_SPECIAL_OFFER;
  }

  /**
   * Normalizes special offer value (returns null if invalid)
   */
  normalizeSpecialOffer(value: number | null | undefined): number | null {
    return this.isValidSpecialOffer(value) ? value : null;
  }
}
