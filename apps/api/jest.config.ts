import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.interface.ts',
    '!src/migrations/**',
    '!src/data-source.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFiles: ['./test/jest-setup.ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
  },
};

export default config;
