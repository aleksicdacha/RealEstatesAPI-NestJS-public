let counter = 0;

export function createMockUser(overrides: Partial<any> = {}): any {
  counter++;
  return {
    id: counter,
    username: `user${counter}`,
    email: `user${counter}@test.com`,
    password: '$2a$10$hashedpassword', // bcrypt hash placeholder
    role: 'user',
    refreshTokenHash: null,
    lastLogoutTime: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    ...overrides,
  };
}

export function createMockAdmin(overrides: Partial<any> = {}): any {
  return createMockUser({ role: 'admin', ...overrides });
}
