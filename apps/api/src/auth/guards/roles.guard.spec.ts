import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(
    user: any,
    roles: string[] | undefined,
  ): ExecutionContext {
    jest.spyOn(reflector, 'get').mockReturnValue(roles);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user })),
      })),
    } as unknown as ExecutionContext;
  }

  it('allows access when no roles are defined', () => {
    const context = createMockContext({ role: 'user' }, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows admin access to admin-only route', () => {
    const context = createMockContext({ role: 'admin', username: 'admin1' }, [
      'admin',
    ]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies user access to admin-only route', () => {
    const context = createMockContext({ role: 'user', username: 'user1' }, [
      'admin',
    ]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('allows access when user has one of required roles', () => {
    const context = createMockContext({ role: 'admin', username: 'admin1' }, [
      'user',
      'admin',
    ]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when no user in request', () => {
    const context = createMockContext(null, ['admin']);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies access when user has no role property', () => {
    const context = createMockContext({ username: 'norole' }, ['admin']);
    expect(guard.canActivate(context)).toBe(false);
  });
});
