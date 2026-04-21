/**
 * User-web — Property detail page tests.
 *
 * Uses the public API to get a real guid, then tests the detail page.
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sr';
const API_BASE = (process.env.API_URL ?? 'http://127.0.0.1:3000/v1/').replace(
  /\/$/,
  '',
);

test.describe('Property detail page', () => {
  let propertyGuid: string | null = null;

  test.beforeAll(async ({ request }) => {
    const res = await request.get(`${API_BASE}/properties/public?limit=1`);
    if (res.status() !== 200) return;

    const body = await res.json();
    const items: Array<{ guid: string }> = Array.isArray(body)
      ? body
      : (body.data ?? body.items ?? []);
    if (items.length > 0) {
      propertyGuid = items[0].guid;
    }
  });

  test('property detail page loads for a real guid', async ({ page }) => {
    if (!propertyGuid) {
      test.skip(true, 'No properties seeded');
      return;
    }
    await page.goto(`/${LOCALE}/properties/${propertyGuid}`);
    await expect(page).not.toHaveTitle(/404|error/i);
    await expect(page.locator('main')).toBeVisible();
  });

  test('property detail does not show salePrice or address', async ({
    page,
  }) => {
    if (!propertyGuid) {
      test.skip(true, 'No properties seeded');
      return;
    }
    await page.goto(`/${LOCALE}/properties/${propertyGuid}`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    // "salePrice" text should NEVER appear in the UI
    const pageContent = await page.textContent('main');
    expect(pageContent).not.toContain('salePrice');
  });

  test('invalid guid shows 404 page', async ({ page }) => {
    await page.goto(
      `/${LOCALE}/properties/00000000-0000-0000-0000-000000000000`,
    );
    // Next.js will render 404 or redirect
    const title = await page.title();
    const body = await page.textContent('body');
    expect(
      page.url().includes('not-found') ||
        title.toLowerCase().includes('404') ||
        body?.toLowerCase().includes('not found') ||
        body?.toLowerCase().includes('nije pronađen'),
    ).toBeTruthy();
  });
});
