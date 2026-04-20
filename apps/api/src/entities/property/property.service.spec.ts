import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyRepository } from './property.repository';
import { PropertyImageRepository } from '@src/entities/property-image/property-image.repository';
import { SpecialOfferManager } from './utils/special-offer.manager';
import { DataSource } from 'typeorm';
import { createMockProperty } from '../../../test/factories/property.factory';
import {
  createMockRepository,
  createMockDataSource,
} from '../../../test/mocks/repository.mock';

describe('PropertyService', () => {
  let service: PropertyService;
  let propertyRepository: Record<string, jest.Mock>;
  let propertyImageRepository: Record<string, jest.Mock>;
  let dataSource: any;
  let specialOfferManager: Record<string, jest.Mock>;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  beforeEach(async () => {
    propertyRepository = createMockRepository();
    propertyImageRepository = createMockRepository();
    dataSource = createMockDataSource();
    specialOfferManager = {
      reorganize: jest.fn().mockResolvedValue(undefined),
      normalizeSpecialOffer: jest.fn((val) =>
        val >= 1 && val <= 20 ? val : null,
      ),
      isValidSpecialOffer: jest.fn((val) => val >= 1 && val <= 20),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: PropertyRepository, useValue: propertyRepository },
        { provide: PropertyImageRepository, useValue: propertyImageRepository },
        { provide: DataSource, useValue: dataSource },
        { provide: SpecialOfferManager, useValue: specialOfferManager },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  describe('create', () => {
    it('creates a property successfully', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null); // no duplicate code
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp); // reload

      const result = await service.create({
        code: 'NIS-001',
        price: 50000,
        salePrice: 48000,
        area: 60,
        address: 'Test 1, Niš',
        images: ['image1.jpg'],
      } as any);

      expect(result).toBeDefined();
      expect(propertyRepository.save).toHaveBeenCalled();
    });

    it('throws ConflictException for duplicate code', async () => {
      propertyRepository.findOne.mockResolvedValue(createMockProperty());

      await expect(service.create({ code: 'NIS-001' } as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('sets first image as favorite', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyImageRepository.create.mockImplementation((data) => data);
      propertyImageRepository.save.mockResolvedValue([]);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-002',
        price: 50000,
        images: ['img1.jpg', 'img2.jpg'],
      } as any);

      const createCalls = propertyImageRepository.create.mock.calls;
      expect(createCalls[0][0].isFavorite).toBe(true);
      expect(createCalls[1][0].isFavorite).toBe(false);
    });

    it('sets image order starting from 1', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyImageRepository.create.mockImplementation((data) => data);
      propertyImageRepository.save.mockResolvedValue([]);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-003',
        price: 50000,
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      } as any);

      const calls = propertyImageRepository.create.mock.calls;
      expect(calls[0][0].order).toBe(1);
      expect(calls[1][0].order).toBe(2);
      expect(calls[2][0].order).toBe(3);
    });

    it('calls specialOfferManager.reorganize when specialOffer is set', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-004',
        price: 50000,
        specialOffer: 5,
      } as any);

      expect(specialOfferManager.reorganize).toHaveBeenCalledWith(5);
    });

    it('does not call reorganize when specialOffer is null', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-005',
        price: 50000,
        specialOffer: null,
      } as any);

      expect(specialOfferManager.reorganize).not.toHaveBeenCalled();
    });

    it('does not call reorganize when specialOffer is out of range', async () => {
      const mockProp = createMockProperty();
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-006',
        price: 50000,
        specialOffer: 25,
      } as any);

      expect(specialOfferManager.reorganize).not.toHaveBeenCalled();
    });

    it('handles creation without images', async () => {
      const mockProp = createMockProperty({ images: [] });
      propertyRepository.findOne.mockResolvedValueOnce(null);
      propertyRepository.create.mockReturnValue(mockProp);
      propertyRepository.save.mockResolvedValue(mockProp);
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.create({
        code: 'NIS-007',
        price: 50000,
      } as any);

      expect(propertyImageRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates property fields', async () => {
      const mockProp = createMockProperty({
        id: 'uuid-1',
        code: 'NIS-001',
        images: [],
      });
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);
      propertyRepository.update.mockResolvedValue({ affected: 1 });
      propertyRepository.findOne.mockResolvedValueOnce({
        ...mockProp,
        price: 60000,
      });

      const result = await service.update('uuid-1', { price: 60000 } as any);
      expect(propertyRepository.update).toHaveBeenCalled();
    });

    it('throws NotFoundException for non-existent property', async () => {
      propertyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when changing to existing code', async () => {
      const mockProp = createMockProperty({ id: 'uuid-1', code: 'NIS-001' });
      propertyRepository.findOne
        .mockResolvedValueOnce(mockProp)
        .mockResolvedValueOnce(
          createMockProperty({ id: 'uuid-2', code: 'NIS-002' }),
        );

      await expect(
        service.update('uuid-1', { code: 'NIS-002' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('reorganizes special offers on change', async () => {
      const mockProp = createMockProperty({
        id: 'uuid-1',
        specialOffer: 3,
        images: [],
      });
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);
      propertyRepository.update.mockResolvedValue({ affected: 1 });
      propertyRepository.findOne.mockResolvedValueOnce(mockProp);

      await service.update('uuid-1', { specialOffer: 5 } as any);

      expect(specialOfferManager.reorganize).toHaveBeenCalledWith(5, 'uuid-1');
    });
  });

  describe('findAll', () => {
    it('returns paginated results', async () => {
      const properties = [createMockProperty(), createMockProperty()];
      propertyRepository.findFilteredProperties.mockResolvedValue([
        properties,
        2,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.items).toHaveLength(2);
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.currentPage).toBe(1);
    });

    it('uses default pagination values', async () => {
      propertyRepository.findFilteredProperties.mockResolvedValue([[], 0]);

      await service.findAll({} as any);

      expect(propertyRepository.findFilteredProperties).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });

  describe('findAllPublic', () => {
    it('forces status to active', async () => {
      propertyRepository.findFilteredProperties.mockResolvedValue([[], 0]);

      await service.findAllPublic({ status: 'inactive' } as any);

      expect(propertyRepository.findFilteredProperties).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
    });

    it('transforms results to PublicPropertyDto', async () => {
      const prop = createMockProperty({
        salePrice: 48000,
        comment: 'secret note',
        address: 'Secret Address 1',
        client: { id: 'c1', name: 'Owner' },
        contractNumber: 'CN-1',
        cadastralParcel: 'CP-1',
        cadastralMunicipality: 'CM-1',
      });
      propertyRepository.findFilteredProperties.mockResolvedValue([[prop], 1]);

      const result = await service.findAllPublic({} as any);
      const publicProp = result.items[0];

      expect(publicProp).not.toHaveProperty('salePrice');
      expect(publicProp).not.toHaveProperty('comment');
      expect(publicProp).not.toHaveProperty('address');
      expect(publicProp).not.toHaveProperty('client');
      expect(publicProp).not.toHaveProperty('contractNumber');
      expect(publicProp).not.toHaveProperty('cadastralParcel');
      expect(publicProp).not.toHaveProperty('cadastralMunicipality');
      expect(publicProp).not.toHaveProperty('createdAt');
      expect(publicProp).not.toHaveProperty('updatedAt');

      expect(publicProp).toHaveProperty('code');
      expect(publicProp).toHaveProperty('price');
      expect(publicProp).toHaveProperty('neighborhood');
      expect(publicProp).toHaveProperty('area');
      expect(publicProp).toHaveProperty('propertyType');
    });

    it('transforms image fields correctly', async () => {
      const prop = createMockProperty({
        images: [
          {
            id: 'img-1',
            url: 'test.jpg',
            isFavorite: true,
            order: 1,
          },
        ],
      });
      propertyRepository.findFilteredProperties.mockResolvedValue([[prop], 1]);

      const result = await service.findAllPublic({} as any);
      const image = result.items[0].images[0];

      expect(image).toHaveProperty('id');
      expect(image).toHaveProperty('url');
      expect(image).toHaveProperty('isPrimary', true);
      expect(image).toHaveProperty('displayOrder', 1);
    });
  });

  describe('findOne', () => {
    it('returns property with relations', async () => {
      const prop = createMockProperty();
      propertyRepository.findOne.mockResolvedValue(prop);

      const result = await service.findOne('uuid-1');
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when not found', async () => {
      propertyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOnePublic', () => {
    it('returns sanitized property', async () => {
      const prop = createMockProperty({ salePrice: 99999, comment: 'secret' });
      propertyRepository.findOne.mockResolvedValue(prop);

      const result = await service.findOnePublic('uuid-1');

      expect(result).not.toHaveProperty('salePrice');
      expect(result).not.toHaveProperty('comment');
      expect(result).not.toHaveProperty('address');
      expect(result).not.toHaveProperty('client');
    });

    it('throws NotFoundException when not found', async () => {
      propertyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOnePublic('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transformToPublicDto — security tests', () => {
    const sensitiveFields = [
      'salePrice',
      'comment',
      'address',
      'client',
      'createdAt',
      'updatedAt',
      'contractNumber',
      'cadastralParcel',
      'cadastralMunicipality',
    ];

    it('excludes ALL sensitive fields from public output', async () => {
      const prop = createMockProperty({
        salePrice: 48000,
        comment: 'internal note',
        address: '123 Secret St',
        client: { id: 'c1', name: 'John' },
        contractNumber: 'CN-123',
        cadastralParcel: 'CP-456',
        cadastralMunicipality: 'CM-789',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      propertyRepository.findOne.mockResolvedValue(prop);

      const result = await service.findOnePublic('uuid-1');

      for (const field of sensitiveFields) {
        expect(result).not.toHaveProperty(field);
      }
    });

    it('includes all expected public fields', async () => {
      const prop = createMockProperty();
      propertyRepository.findOne.mockResolvedValue(prop);

      const result = await service.findOnePublic('uuid-1');

      const expectedFields = [
        'id',
        'code',
        'description',
        'propertyType',
        'price',
        'area',
        'neighborhood',
        'lat',
        'lon',
        'elevator',
        'additionalEquipment',
        'constructionYear',
        'bathrooms',
        'floor',
        'roomStructure',
        'heating',
        'orientation',
        'youtubeUrl',
        'specialOffer',
        'images',
      ];

      for (const field of expectedFields) {
        expect(result).toHaveProperty(field);
      }
    });

    it('handles null images gracefully', async () => {
      const prop = createMockProperty({ images: null });
      propertyRepository.findOne.mockResolvedValue(prop);

      const result = await service.findOnePublic('uuid-1');
      expect(result.images).toEqual([]);
    });
  });

  describe('remove', () => {
    it('throws InternalServerErrorException on transaction failure', async () => {
      dataSource.transaction.mockRejectedValue(new Error('DB error'));

      await expect(service.remove('uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAveragePriceByType', () => {
    it('returns stats grouped by property type', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { propertyType: 'apartment', averagePrice: '75000', count: '10' },
          { propertyType: 'house', averagePrice: '120000', count: '5' },
        ]),
      };
      propertyRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAveragePriceByType({});

      expect(result).toHaveLength(2);
      expect(result[0].averagePrice).toBe(75000);
      expect(result[0].count).toBe(10);
    });
  });
});
