import { UserService } from './user.service';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Role } from './enums/role.enum';
import { createMockI18nService } from '../../../test/mocks/service.mock';

jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('nestjs-i18n', () => ({
  I18nContext: { current: () => ({ lang: 'en' }) },
  I18nService: jest.fn(),
}));

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  password: 'hashedPassword123',
  role: Role.USER,
  refreshTokenHash: null,
  lastLogoutTime: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  ...overrides,
});

describe('UserService', () => {
  let service: UserService;
  let repo: ReturnType<typeof mockUserRepository>;
  let i18nService: ReturnType<typeof createMockI18nService>;

  beforeEach(() => {
    repo = mockUserRepository();
    i18nService = createMockI18nService();
    service = new UserService(repo as any, i18nService as any);

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedValue');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findOne', () => {
    it('returns user when found', async () => {
      const user = mockUser();
      repo.findOneBy.mockResolvedValue(user);
      expect(await service.findOne(1)).toEqual(user);
    });

    it('throws NotFoundException when user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('hashes password and creates user', async () => {
      const dto = {
        username: 'newuser',
        password: 'plain123',
        email: 'new@test.com',
      };
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ ...dto, password: 'hashedValue' });
      repo.save.mockResolvedValue({ id: 2, ...dto, password: 'hashedValue' });

      const result = await service.create(dto as any);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plain123', 'salt');
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashedValue',
      });
      expect(result.id).toBe(2);
    });

    it('throws BadRequestException for duplicate username', async () => {
      repo.findOne.mockResolvedValue(mockUser());
      await expect(
        service.create({ username: 'testuser', password: 'pass' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      repo.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(new Error('bcrypt fail'));
      await expect(
        service.create({ username: 'user', password: 'pass' } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUser', () => {
    it('updates user without password change', async () => {
      const user = mockUser();
      repo.findOneBy.mockResolvedValue(user);
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOneBy
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ ...user, email: 'new@test.com' });

      const result = await service.updateUser(1, { email: 'new@test.com' });
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
    });

    it('hashes password when password is updated', async () => {
      const user = mockUser();
      repo.findOneBy.mockResolvedValue(user);
      repo.update.mockResolvedValue({ affected: 1 });

      await service.updateUser(1, { password: 'newpass' });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 'salt');
      expect(repo.update).toHaveBeenCalledWith(1, { password: 'hashedValue' });
    });

    it('throws NotFoundException when user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        service.updateUser(999, { email: 'x@x.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteUser(1);
      expect(result.message).toContain('deleted successfully');
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUser', () => {
    it('returns user when credentials valid', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'plain123');
      expect(result).toEqual(user);
    });

    it('returns null when user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await service.validateUser('nouser', 'pass')).toBeNull();
    });

    it('returns null when password invalid', async () => {
      repo.findOne.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      expect(await service.validateUser('testuser', 'wrong')).toBeNull();
    });
  });

  describe('refresh token management', () => {
    it('setRefreshToken hashes and stores token', async () => {
      await service.setRefreshToken(1, 'token123');
      expect(bcrypt.hash).toHaveBeenCalledWith('token123', 10);
      expect(repo.update).toHaveBeenCalledWith(1, {
        refreshTokenHash: 'hashedValue',
      });
    });

    it('validateRefreshToken returns true for valid token', async () => {
      repo.findOneBy.mockResolvedValue(
        mockUser({ refreshTokenHash: 'hashed' }),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      expect(await service.validateRefreshToken(1, 'token')).toBe(true);
    });

    it('validateRefreshToken returns false when no hash stored', async () => {
      repo.findOneBy.mockResolvedValue(mockUser({ refreshTokenHash: null }));
      expect(await service.validateRefreshToken(1, 'token')).toBe(false);
    });

    it('validateRefreshToken returns false when user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      expect(await service.validateRefreshToken(999, 'token')).toBe(false);
    });

    it('clearRefreshToken sets hash to null', async () => {
      await service.clearRefreshToken(1);
      expect(repo.update).toHaveBeenCalledWith(
        { id: 1 },
        { refreshTokenHash: null },
      );
    });

    it('clearRefreshToken throws when userId is falsy', async () => {
      await expect(service.clearRefreshToken(0)).rejects.toThrow(
        'User ID is required',
      );
    });
  });

  describe('password reset', () => {
    it('createPasswordResetToken generates and stores hashed token', async () => {
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => 'plaintoken',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedtoken');

      const token = await service.createPasswordResetToken(1);

      expect(token).toBe('plaintoken');
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          resetPasswordToken: 'hashedtoken',
          resetPasswordExpires: expect.any(Date),
        }),
      );
    });

    it('findByResetToken returns user with matching token', async () => {
      const user = mockUser({ resetPasswordToken: 'hashed' });
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.findByResetToken('plaintoken');
      expect(result).toEqual(user);
    });

    it('findByResetToken returns null when no match', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      expect(await service.findByResetToken('invalid')).toBeNull();
    });

    it('resetPassword hashes new password and clears token', async () => {
      await service.resetPassword(1, 'newpass');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 'salt');
      expect(repo.update).toHaveBeenCalledWith(1, {
        password: 'hashedValue',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated users', async () => {
      const users = [mockUser(), mockUser({ id: 2, username: 'user2' })];
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(users),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('findByUsername', () => {
    it('returns user by username', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      expect(await service.findByUsername('testuser')).toEqual(user);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await service.findByUsername('noone')).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns user by email', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      expect(await service.findByEmail('test@test.com')).toEqual(user);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await service.findByEmail('no@test.com')).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('hashes and stores new refresh token', async () => {
      await service.updateRefreshToken(1, 'newtoken');
      expect(bcrypt.hash).toHaveBeenCalledWith('newtoken', 'salt');
      expect(repo.update).toHaveBeenCalledWith(1, {
        refreshTokenHash: 'hashedValue',
      });
    });
  });

  describe('updateLastLogoutTime', () => {
    it('updates logout timestamp', async () => {
      await service.updateLastLogoutTime(1);
      expect(repo.update).toHaveBeenCalledWith(1, {
        lastLogoutTime: expect.any(Date),
      });
    });
  });
});
