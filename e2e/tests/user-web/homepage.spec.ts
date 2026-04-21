/**
 * User-web — Homepage tests.
 *
 * Verifies that the public-facing homepage loads correctly with key sections.
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sr';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${LOCALE}`);
  });

  test('loads successfully (no 404, no error)', async ({ page }) => {
    await expect(page).not.toHaveTitle(/404|error/i);
    await expect(page.locator('main')).toBeVisible();
  });

  test('hero section is visible', async ({ page }) => {
    // Hero section is the first section on the page
    await expect(page.locator('main section').first()).toBeVisible();
  });

  test('has navigation link to property listing', async ({ page }) => {
    const prodajaLink = page.getByRole('link', { name: /prodaja|for sale/i });
    await expect(prodajaLink.first()).toBeVisible();
  });

  test('locale switch EN works', async ({ page }) => {
    await page.goto('/en');
    await expect(page).not.toHaveURL(/\/sr\//);
    await expect(page.locator('main')).toBeVisible();
  });
});
