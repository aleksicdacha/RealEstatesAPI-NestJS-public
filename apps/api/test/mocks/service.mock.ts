export function createMockConfigService(overrides: Record<string, any> = {}) {
  const defaults: Record<string, any> = {
    'jwt.secret': 'test-jwt-secret-32-chars-minimum!',
    'jwt.expiresIn': '7d',
    'database.host': 'localhost',
    'database.port': 5432,
    NODE_ENV: 'test',
    ...overrides,
  };

  return {
    get: jest.fn((key: string) => defaults[key]),
    getOrThrow: jest.fn((key: string) => {
      if (defaults[key] === undefined)
        throw new Error(`Config key ${key} not found`);
      return defaults[key];
    }),
  };
}

export function createMockJwtService() {
  return {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 1, username: 'testuser' }),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 1, username: 'testuser' }),
  };
}

export function createMockEmailService() {
  return {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendContactFormEmail: jest.fn().mockResolvedValue(undefined),
  };
}

export function createMockI18nService() {
  return {
    t: jest.fn((key: string) => key),
    translate: jest.fn((key: string) => key),
  };
}
