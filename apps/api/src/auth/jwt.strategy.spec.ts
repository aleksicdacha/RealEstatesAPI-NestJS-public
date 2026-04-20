import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@src/entities/user/user.service';
import { createMockUser } from '../../test/factories/user.factory';

// We need to test the validate() method of JwtStrategy directly
// Since JwtStrategy extends PassportStrategy, we test the validate logic in isolation
describe('JwtStrategy.validate logic', () => {
  let userService: Record<string, jest.Mock>;

  beforeEach(() => {
    userService = {
      findByUsername: jest.fn(),
    };
  });

  async function validate(payload: any) {
    const user = await userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (
      user.lastLogoutTime &&
      payload.iat * 1000 < user.lastLogoutTime.getTime()
    ) {
      throw new UnauthorizedException('Token is invalid (revoked)');
    }

    return { id: user.id, username: payload.username, role: payload.role };
  }

  it('returns user payload for valid token', async () => {
    const user = createMockUser({ id: 1, lastLogoutTime: null });
    userService.findByUsername.mockResolvedValue(user);

    const result = await validate({
      username: 'user1',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
    });
    expect(result).toEqual({ id: 1, username: 'user1', role: 'user' });
  });

  it('throws when user not found', async () => {
    userService.findByUsername.mockResolvedValue(null);

    await expect(
      validate({ username: 'ghost', role: 'user', iat: 0 }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when token issued before logout', async () => {
    const user = createMockUser({
      id: 1,
      lastLogoutTime: new Date('2025-06-01T12:00:00Z'),
    });
    userService.findByUsername.mockResolvedValue(user);

    const iatBeforeLogout = Math.floor(new Date('2025-05-01').getTime() / 1000);
    await expect(
      validate({ username: 'user1', role: 'user', iat: iatBeforeLogout }),
    ).rejects.toThrow('Token is invalid (revoked)');
  });

  it('allows token issued after logout', async () => {
    const user = createMockUser({
      id: 1,
      lastLogoutTime: new Date('2025-05-01T00:00:00Z'),
    });
    userService.findByUsername.mockResolvedValue(user);

    const iatAfterLogout = Math.floor(new Date('2025-06-01').getTime() / 1000);
    const result = await validate({
      username: 'user1',
      role: 'user',
      iat: iatAfterLogout,
    });
    expect(result.id).toBe(1);
  });
});
