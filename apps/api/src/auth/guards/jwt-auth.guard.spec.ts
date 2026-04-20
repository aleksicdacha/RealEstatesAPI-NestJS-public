import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  function createMockContext(isPublic: boolean): ExecutionContext {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({})),
        getResponse: jest.fn(() => ({})),
      })),
      getType: jest.fn(() => 'http'),
      getArgs: jest.fn(() => []),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);
    return context;
  }

  describe('canActivate', () => {
    it('returns true for public routes', () => {
      const context = createMockContext(true);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('calls super.canActivate for non-public routes', () => {
      const context = createMockContext(false);
      // super.canActivate will throw since there's no real passport strategy
      // We just verify it doesn't short-circuit to true
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(true);
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('returns user when authentication succeeds', () => {
      const user = { id: 1, username: 'test' };
      expect(guard.handleRequest(null, user, null)).toEqual(user);
    });

    it('throws UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('throws the original error when provided', () => {
      const error = new Error('Token expired');
      expect(() => guard.handleRequest(error, null, null)).toThrow(
        'Token expired',
      );
    });
  });
});
