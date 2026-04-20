import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '@src/entities/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { I18nService } from 'nestjs-i18n';
import {
  createMockJwtService,
  createMockConfigService,
  createMockEmailService,
  createMockI18nService,
} from '../../test/mocks/service.mock';
import { createMockUser } from '../../test/factories/user.factory';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: Record<string, jest.Mock>;
  let jwtService: ReturnType<typeof createMockJwtService>;
  let configService: ReturnType<typeof createMockConfigService>;
  let emailService: ReturnType<typeof createMockEmailService>;

  beforeEach(async () => {
    userService = {
      findOne: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      clearRefreshToken: jest.fn(),
      updateLastLogoutTime: jest.fn(),
      createPasswordResetToken: jest.fn(),
      findByResetToken: jest.fn(),
      resetPassword: jest.fn(),
    };
    jwtService = createMockJwtService();
    configService = createMockConfigService();
    emailService = createMockEmailService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      const user = createMockUser();
      userService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('user1', 'password');
      expect(result).toEqual(user);
    });

    it('returns null when user not found', async () => {
      userService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');
      expect(result).toBeNull();
    });

    it('returns null when password is invalid', async () => {
      userService.findByUsername.mockResolvedValue(createMockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('user1', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns tokens and user info on valid credentials', async () => {
      const user = createMockUser({ id: 1, username: 'admin', role: 'admin' });
      jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);
      jwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.login({
        username: 'admin',
        password: 'pass',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.user).toEqual({ id: 1, username: 'admin', role: 'admin' });
      expect(userService.updateRefreshToken).toHaveBeenCalled();
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(service, 'validateUser' as any).mockResolvedValue(null);

      await expect(
        service.login({ username: 'bad', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears refresh token and updates logout time', async () => {
      userService.findOne.mockResolvedValue(createMockUser({ id: 5 }));

      const result = await service.logout(5);

      expect(userService.updateLastLogoutTime).toHaveBeenCalledWith(5);
      expect(userService.clearRefreshToken).toHaveBeenCalledWith(5);
      expect(result.message).toContain('logged out');
    });

    it('throws when user not found', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(service.logout(999)).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('returns new access token for valid refresh token', async () => {
      const user = createMockUser({ id: 1, lastLogoutTime: null });
      jwtService.verify.mockReturnValue({
        sub: 1,
        username: 'user1',
        iat: Math.floor(Date.now() / 1000),
      });
      userService.findOne.mockResolvedValue(user);
      userService.validateRefreshToken.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('throws when refresh token hash does not match', async () => {
      jwtService.verify.mockReturnValue({
        sub: 1,
        username: 'user1',
        iat: Math.floor(Date.now() / 1000),
      });
      userService.findOne.mockResolvedValue(createMockUser());
      userService.validateRefreshToken.mockResolvedValue(false);

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when token was issued before logout', async () => {
      const user = createMockUser({ lastLogoutTime: new Date('2025-06-01') });
      jwtService.verify.mockReturnValue({
        sub: 1,
        username: 'user1',
        iat: Math.floor(new Date('2025-05-01').getTime() / 1000),
      });
      userService.findOne.mockResolvedValue(user);
      userService.validateRefreshToken.mockResolvedValue(true);

      await expect(service.refreshToken('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when jwt verify fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('garbage')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('sends reset email for existing user', async () => {
      const user = createMockUser({ id: 3, email: 'test@test.com' });
      userService.findByEmail.mockResolvedValue(user);
      userService.createPasswordResetToken.mockResolvedValue('reset-token-123');

      const result = await service.forgotPassword({ email: 'test@test.com' });

      expect(userService.createPasswordResetToken).toHaveBeenCalledWith(3);
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@test.com',
        'reset-token-123',
        expect.any(String),
      );
      expect(result).toHaveProperty('message');
    });

    it('returns success even for non-existent email (anti-enumeration)', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'nobody@test.com' });

      expect(result).toHaveProperty('message');
      expect(userService.createPasswordResetToken).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('resets password with valid token', async () => {
      const user = createMockUser({ id: 7 });
      userService.findByResetToken.mockResolvedValue(user);

      const result = await service.resetPassword({
        token: 'valid-token',
        password: 'newpass123',
      });

      expect(userService.resetPassword).toHaveBeenCalledWith(7, 'newpass123');
      expect(result).toHaveProperty('message');
    });

    it('throws BadRequestException for invalid token', async () => {
      userService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad-token', password: 'newpass' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('delegates to userService.create', async () => {
      const dto = { username: 'newuser', password: 'pass123', role: 'user' };
      userService.create.mockResolvedValue({ id: 10, ...dto });

      const result = await service.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(10);
    });
  });

  describe('parseExpiresIn (via login)', () => {
    it('parses days correctly', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'jwt.expiresIn') return '7d';
        return undefined;
      });
      const user = createMockUser();
      jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);

      const result = await service.login({ username: 'u', password: 'p' });
      expect(result.expiresIn).toBe(604800); // 7 * 86400
    });

    it('parses hours correctly', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'jwt.expiresIn') return '1h';
        return undefined;
      });
      const user = createMockUser();
      jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);

      const result = await service.login({ username: 'u', password: 'p' });
      expect(result.expiresIn).toBe(3600);
    });

    it('defaults to 3600 for invalid format', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'jwt.expiresIn') return 'invalid';
        return undefined;
      });
      const user = createMockUser();
      jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);

      const result = await service.login({ username: 'u', password: 'p' });
      expect(result.expiresIn).toBe(3600);
    });
  });
});
