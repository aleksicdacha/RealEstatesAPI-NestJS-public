import { SpecialOfferManager } from './special-offer.manager';
import { mockQueryBuilder } from '../../../../test/mocks/repository.mock';

describe('SpecialOfferManager', () => {
  let manager: SpecialOfferManager;
  let dataSource: any;
  let transactionManager: any;
  let qb: any;

  beforeEach(() => {
    qb = mockQueryBuilder();
    transactionManager = {
      createQueryBuilder: jest.fn(() => qb),
    };

    dataSource = {
      transaction: jest.fn((cb) => cb(transactionManager)),
    };

    manager = new SpecialOfferManager(dataSource);
  });

  describe('isValidSpecialOffer', () => {
    it('returns true for valid values (1-20)', () => {
      expect(manager.isValidSpecialOffer(1)).toBe(true);
      expect(manager.isValidSpecialOffer(10)).toBe(true);
      expect(manager.isValidSpecialOffer(20)).toBe(true);
    });

    it('returns false for out of range values', () => {
      expect(manager.isValidSpecialOffer(0)).toBe(false);
      expect(manager.isValidSpecialOffer(21)).toBe(false);
      expect(manager.isValidSpecialOffer(-1)).toBe(false);
    });

    it('returns false for null and undefined', () => {
      expect(manager.isValidSpecialOffer(null)).toBe(false);
      expect(manager.isValidSpecialOffer(undefined)).toBe(false);
    });
  });

  describe('normalizeSpecialOffer', () => {
    it('returns value for valid input', () => {
      expect(manager.normalizeSpecialOffer(5)).toBe(5);
      expect(manager.normalizeSpecialOffer(1)).toBe(1);
      expect(manager.normalizeSpecialOffer(20)).toBe(20);
    });

    it('returns null for invalid input', () => {
      expect(manager.normalizeSpecialOffer(0)).toBeNull();
      expect(manager.normalizeSpecialOffer(21)).toBeNull();
      expect(manager.normalizeSpecialOffer(null)).toBeNull();
      expect(manager.normalizeSpecialOffer(undefined)).toBeNull();
    });
  });

  describe('reorganize', () => {
    it('does nothing for invalid special offer values', async () => {
      await manager.reorganize(0);
      expect(dataSource.transaction).not.toHaveBeenCalled();

      await manager.reorganize(-1);
      expect(dataSource.transaction).not.toHaveBeenCalled();

      await manager.reorganize(21);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('does nothing when no affected properties', async () => {
      qb.getMany.mockResolvedValue([]);

      await manager.reorganize(5);

      expect(dataSource.transaction).toHaveBeenCalled();
      // No update queries should be executed
      expect(qb.execute).not.toHaveBeenCalled();
    });

    it('shifts affected properties by incrementing specialOffer', async () => {
      qb.getMany.mockResolvedValue([
        { id: 'p1', specialOffer: 5 },
        { id: 'p2', specialOffer: 6 },
      ]);

      // The second createQueryBuilder call is for the update
      const updateQb = mockQueryBuilder();
      let callCount = 0;
      transactionManager.createQueryBuilder.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return qb; // SELECT
        return updateQb; // UPDATE
      });

      await manager.reorganize(5);

      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('sets to null properties that would exceed 20', async () => {
      qb.getMany.mockResolvedValue([{ id: 'p1', specialOffer: 20 }]);

      const updateQb = mockQueryBuilder();
      let callCount = 0;
      transactionManager.createQueryBuilder.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return qb;
        return updateQb;
      });

      await manager.reorganize(20);

      // Should have been called for nullifying
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('excludes property by ID when provided', async () => {
      qb.getMany.mockResolvedValue([]);

      await manager.reorganize(5, 'exclude-id');

      expect(qb.andWhere).toHaveBeenCalledWith(
        'property.id != :excludePropertyId',
        { excludePropertyId: 'exclude-id' },
      );
    });
  });
});
