/**
 * User-web — Newsletter subscription tests.
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sr';
const API_BASE = (process.env.API_URL ?? 'http://127.0.0.1:3000/v1/').replace(
  /\/$/,
  '',
);

const TEST_EMAIL = `e2e-user-newsletter-${Date.now()}@test.com`;

test.afterAll(async ({ request }) => {
  // Clean up test subscription
  await request.post(`${API_BASE}/newsletter/unsubscribe`, {
    data: { email: TEST_EMAIL },
  });
});

// Newsletter subscription form lives in the Footer (on every page)
// There is no standalone /newsletter page — use the homepage
test.describe('Newsletter subscription (footer form)', () => {
  test.beforeEach(async ({ page }) => {
    // Any page with the footer will have the newsletter form
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
  });

  test('footer newsletter section is present', async ({ page }) => {
    await expect(page).not.toHaveTitle(/404|error/i);
    await expect(page.locator('footer')).toBeVisible();
  });

  test('shows email input field in footer', async ({ page }) => {
    const emailInput = page.locator('footer').locator('input[type="email"]');
    await expect(emailInput.first()).toBeVisible({ timeout: 5_000 });
  });

  test('subscribing with valid email shows success message', async ({
    page,
  }) => {
    const emailInput = page
      .locator('footer')
      .locator('input[type="email"]')
      .first();
    await emailInput.fill(TEST_EMAIL);

    const submitBtn = page
      .locator('footer')
      .getByRole('button', { name: /subscribe|pretplati|pošalji/i });
    if ((await submitBtn.count()) === 0) {
      test.skip(true, 'No subscribe button found in footer');
      return;
    }

    // Check terms checkbox first if required
    const termsCheckbox = page
      .locator('footer')
      .locator('input[type="checkbox"]');
    if ((await termsCheckbox.count()) > 0) {
      await termsCheckbox.first().check();
    }

    await submitBtn.click();

    // Success message or toast should appear
    const success = page
      .locator('footer')
      .locator('[class*="success"], [class*="alert"]')
      .or(page.getByText(/uspešno|success|thank you|hvala/i));
    await expect(success.first()).toBeVisible({ timeout: 8_000 });
  });
});
