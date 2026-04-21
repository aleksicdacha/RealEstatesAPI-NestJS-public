/**
 * Admin-web authentication tests.
 *
 * Tests login flow, redirect behavior, and session persistence.
 * Uses the admin-web project which has baseURL=http://localhost:3001.
 */

import { test, expect } from '@playwright/test';

// Admin uses locale-prefixed routes — default to /sr
const LOCALE = 'sr';

test.describe('Admin login page', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    // Should be redirected to login
    await expect(page).toHaveURL(/login/);
  });

  test('shows login form with username and password fields', async ({
    page,
  }) => {
    await page.goto(`/${LOCALE}/login`);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /login|prijava/i }),
    ).toBeVisible();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto(`/${LOCALE}/login`);
    await page.locator('#username').fill('wrong@user.com');
    // PrimeReact Password component renders an input inside wrapper — use inner input only
    await page.locator('#password input').first().fill('wrongpass');
    await page.getByRole('button', { name: /login|prijava/i }).click();
    // PrimeReact Message component renders error text — match by text content
    await expect(
      page.getByText(
        /neispravno|invalid.*credentials|wrong.*password|unauthorized/i,
      ),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.goto(`/${LOCALE}/login`);
    await page
      .locator('#username')
      .fill(process.env.TEST_ADMIN_EMAIL ?? 'admin');
    // PrimeReact Password wraps input — target the native input inside
    const passwordInput = page.locator('#password input').first();
    await passwordInput.fill(process.env.TEST_ADMIN_PASSWORD ?? 'admin123');
    await page.getByRole('button', { name: /login|prijava/i }).click();

    // After login, URL should no longer contain /login
    await page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 10_000,
    });
    await expect(page).not.toHaveURL(/login/);
  });
});

test.describe('Admin session persistence', () => {
  test.use({
    storageState: 'e2e/.auth/admin.json',
  });

  test.beforeAll(async ({ browser }) => {
    // Create storage state by logging in once
    // Pass storageState: undefined to avoid reading the not-yet-created file
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    const adminUrl = process.env.ADMIN_URL ?? 'http://127.0.0.1:3001';
    await page.goto(`${adminUrl}/${LOCALE}/login`);
    await page
      .locator('#username')
      .fill(process.env.TEST_ADMIN_EMAIL ?? 'admin');
    await page
      .locator('#password input')
      .first()
      .fill(process.env.TEST_ADMIN_PASSWORD ?? 'admin123');
    await page.getByRole('button', { name: /login|prijava/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 10_000,
    });
    await context.storageState({ path: 'e2e/.auth/admin.json' });
    await context.close();
  });

  test('authenticated user can access dashboard', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await expect(page).not.toHaveURL(/login/);
  });

  test('authenticated user can access properties page', async ({ page }) => {
    await page.goto(`/${LOCALE}/properties`);
    // Should load properties table, not redirect to login
    await expect(page).not.toHaveURL(/login/);
    // PrimeReact DataTable must be visible
    await expect(page.locator('.p-datatable')).toBeVisible({ timeout: 15_000 });
  });
});
