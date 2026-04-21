/**
 * Custom Playwright fixtures.
 *
 * Usage:
 *   import { test, expect } from '@e2e/fixtures';
 *
 * Available extras on top of base test:
 *   - adminToken: string — valid JWT for the admin user
 *   - adminPage:  Page   — browser page pre-authenticated as admin (storageState)
 */

import {
  test as base,
  expect,
  Page,
  APIRequestContext,
} from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { apiLogin, authHeaders } from '../utils/api-helpers';

const ADMIN_STORAGE = path.join(__dirname, '../.auth/admin.json');

export type E2EFixtures = {
  /** Raw access token for the admin user. Use in API-level tests. */
  adminToken: string;
  /** Browser page with admin session already authenticated (storageState). */
  adminPage: Page;
};

export const test = base.extend<E2EFixtures>({
  /**
   * Obtain (and cache) an admin access token.
   * Token is refreshed once per test worker process.
   */
  adminToken: async ({ request }, use) => {
    const { accessToken } = await apiLogin(request);
    await use(accessToken);
  },

  /**
   * A browser page that has already logged in as admin via storageState.
   * The storageState file is created once per test run in globalSetup-like fashion.
   *
   * For simplicity we log in via the UI on first use and save the state.
   */
  adminPage: async ({ browser, request }, use) => {
    // Ensure auth directory exists
    const authDir = path.dirname(ADMIN_STORAGE);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    let context;
    if (fs.existsSync(ADMIN_STORAGE)) {
      context = await browser.newContext({ storageState: ADMIN_STORAGE });
    } else {
      // First run: log in via UI and save storageState
      context = await browser.newContext();
      const page = await context.newPage();
      const adminUrl = process.env.ADMIN_URL ?? 'http://127.0.0.1:3001';
      await page.goto(`${adminUrl}/login`);
      await page
        .getByLabel(/email|username/i)
        .fill(process.env.TEST_ADMIN_EMAIL ?? 'admin');
      await page
        .getByLabel(/password|lozinka/i)
        .fill(process.env.TEST_ADMIN_PASSWORD ?? 'admin123');
      await page.getByRole('button', { name: /login|prijava/i }).click();
      // Wait for successful redirect away from /login
      await page.waitForURL((url) => !url.pathname.includes('/login'));
      await context.storageState({ path: ADMIN_STORAGE });
      await page.close();
    }

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
