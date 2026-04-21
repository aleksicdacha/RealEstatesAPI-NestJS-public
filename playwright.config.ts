import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const E2E_DIR = path.join(__dirname, 'e2e');

export default defineConfig({
  testDir: E2E_DIR,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // Sequential by default — tests share a DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // 1 worker to avoid DB race conditions
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'e2e/reports', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'e2e/reports', open: 'on-failure' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ── API contract & security tests (no browser, fastest) ──────────────────
    {
      name: 'api',
      testDir: path.join(E2E_DIR, 'tests/api'),
      use: {
        baseURL: process.env.API_URL ?? 'http://127.0.0.1:3000/v1/',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },

    // ── Admin web (Chrome) ───────────────────────────────────────────────────
    {
      name: 'admin-web',
      testDir: path.join(E2E_DIR, 'tests/admin-web'),
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL ?? 'http://127.0.0.1:3001',
        // storageState is set per-test via the adminAuth fixture
      },
      dependencies: ['api'], // API tests must pass first
    },

    // ── User-facing website (Chrome) ─────────────────────────────────────────
    {
      name: 'user-web',
      testDir: path.join(E2E_DIR, 'tests/user-web'),
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.USER_URL ?? 'http://127.0.0.1:3002',
      },
      dependencies: ['api'],
    },
  ],

  // Env file loaded by NPM scripts via dotenv-cli — no globalSetup needed
});
