import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from './client.repository';
import { PropertyRepository } from '../property/property.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockClientRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockPropertyRepository = () => ({
  findOne: jest.fn(),
});

const mockClient = (overrides = {}) => ({
  id: 'client-uuid-1',
  name: 'Test Client',
  address: 'Test Address',
  email: 'client@test.com',
  phone: '0611234567',
  transactionType: 'seller',
  paymentType: 'cash',
  status: 'Active',
  property: null,
  ...overrides,
});

const mockProperty = (overrides = {}) => ({
  id: 1,
  guid: 'prop-guid-1',
  title: 'Test Property',
  ...overrides,
});

describe('ClientService', () => {
  let service: ClientService;
  let clientRepo: ReturnType<typeof mockClientRepository>;
  let propertyRepo: ReturnType<typeof mockPropertyRepository>;

  beforeEach(async () => {
    clientRepo = mockClientRepository();
    propertyRepo = mockPropertyRepository();
    service = new ClientService(clientRepo as any, propertyRepo as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates client without property', async () => {
      const dto = { name: 'New Client', address: 'Addr', phone: '123' };
      const saved = mockClient({ ...dto });
      clientRepo.create.mockReturnValue(saved);
      clientRepo.save.mockResolvedValue(saved);

      const result = await service.create(dto as any);
      expect(clientRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Client' }),
      );
      expect(result).toEqual(saved);
    });

    it('creates client linked to property', async () => {
      const prop = mockProperty();
      propertyRepo.findOne.mockResolvedValue(prop);
      const saved = mockClient({ property: prop, propertyId: prop.id });
      clientRepo.create.mockReturnValue(saved);
      clientRepo.save.mockResolvedValue(saved);

      const result = await service.create({
        name: 'C',
        address: 'A',
        phone: '1',
        propertyId: 1,
      } as any);
      expect(propertyRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.propertyId).toBe(1);
    });

    it('throws NotFoundException when property not found', async () => {
      propertyRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          name: 'C',
          address: 'A',
          phone: '1',
          propertyId: 999,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates basic fields', async () => {
      const client = mockClient();
      clientRepo.findOne
        .mockResolvedValueOnce(client) // find for update
        .mockResolvedValueOnce({ ...client, name: 'Updated' }); // return after save
      clientRepo.save.mockResolvedValue({ ...client, name: 'Updated' });

      const result = await service.update('client-uuid-1', {
        name: 'Updated',
      } as any);
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when client not found', async () => {
      clientRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException for duplicate email', async () => {
      const client = mockClient({ email: 'old@test.com' });
      clientRepo.findOne
        .mockResolvedValueOnce(client) // find client
        .mockResolvedValueOnce(
          mockClient({ id: 'other-uuid', email: 'taken@test.com' }),
        ); // email check

      await expect(
        service.update('client-uuid-1', { email: 'taken@test.com' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException for duplicate phone', async () => {
      const client = mockClient({ phone: '111' });
      clientRepo.findOne
        .mockResolvedValueOnce(client) // find client
        .mockResolvedValueOnce(mockClient({ id: 'other-uuid', phone: '222' })); // phone check

      await expect(
        service.update('client-uuid-1', { phone: '222' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('links property on update', async () => {
      const client = mockClient();
      const prop = mockProperty();
      clientRepo.findOne.mockResolvedValueOnce(client).mockResolvedValueOnce({
        ...client,
        property: prop,
        propertyId: prop.id,
      });
      propertyRepo.findOne.mockResolvedValue(prop);
      clientRepo.save.mockResolvedValue({ ...client, property: prop });

      const result = await service.update('client-uuid-1', {
        propertyId: 1,
      } as any);
      expect(result.propertyId).toBe(1);
    });

    it('unlinks property when propertyId is null', async () => {
      const client = mockClient({ property: mockProperty() });
      clientRepo.findOne
        .mockResolvedValueOnce(client)
        .mockResolvedValueOnce({ ...client, property: null });
      clientRepo.save.mockResolvedValue({ ...client, property: null });

      await service.update('client-uuid-1', { propertyId: null } as any);
      expect(client.property).toBeNull();
    });

    it('throws NotFoundException when linking non-existent property', async () => {
      clientRepo.findOne.mockResolvedValueOnce(mockClient());
      propertyRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('client-uuid-1', { propertyId: 999 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all clients', async () => {
      const clients = [mockClient(), mockClient({ id: 'uuid-2' })];
      clientRepo.find.mockResolvedValue(clients);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('filters by hasProperty', async () => {
      clientRepo.find.mockResolvedValue([]);
      await service.findAll({ hasProperty: true } as any);
      expect(clientRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ property: expect.anything() }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns client when found', async () => {
      const client = mockClient({ property: mockProperty() });
      clientRepo.findOne.mockResolvedValue(client);

      const result = await service.findOne('client-uuid-1');
      expect(result.propertyId).toBeDefined();
    });

    it('throws NotFoundException when not found', async () => {
      clientRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('disassociates property and removes client', async () => {
      const client = mockClient({ property: mockProperty() });
      clientRepo.findOne.mockResolvedValue(client);
      clientRepo.save.mockResolvedValue({ ...client, property: null });
      clientRepo.remove.mockResolvedValue(undefined);

      await service.remove('client-uuid-1');
      expect(clientRepo.save).toHaveBeenCalled(); // disassociate
      expect(clientRepo.remove).toHaveBeenCalled();
    });

    it('removes client without property directly', async () => {
      const client = mockClient({ property: null });
      clientRepo.findOne.mockResolvedValue(client);
      clientRepo.remove.mockResolvedValue(undefined);

      await service.remove('client-uuid-1');
      expect(clientRepo.save).not.toHaveBeenCalled();
      expect(clientRepo.remove).toHaveBeenCalledWith(client);
    });

    it('throws NotFoundException when client not found', async () => {
      clientRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update - transactionType validation', () => {
    it('throws Error for invalid transactionType', async () => {
      clientRepo.findOne.mockResolvedValue(mockClient());
      await expect(
        service.update('client-uuid-1', { transactionType: 'invalid' } as any),
      ).rejects.toThrow('Invalid transactionType');
    });
  });
});
