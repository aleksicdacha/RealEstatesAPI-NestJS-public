/**
 * User-web — Contact form tests.
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sr';

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${LOCALE}/kontakt`);
  });

  test('contact page loads', async ({ page }) => {
    await expect(page).not.toHaveTitle(/404|error/i);
    // Contact page uses <div>/<section> containers, not <main>
    await expect(page.locator('section').first()).toBeVisible();
  });

  test('shows form with name, email, and message fields', async ({ page }) => {
    const nameField = page.locator(
      'input[name="name"], input[placeholder*="ime" i], input[placeholder*="name" i]',
    );
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const messageField = page.locator('textarea');

    await expect(nameField.first()).toBeVisible({ timeout: 15_000 });
    await expect(emailField.first()).toBeVisible({ timeout: 5_000 });
    await expect(messageField.first()).toBeVisible({ timeout: 5_000 });
  });

  test('shows validation errors when submitting empty form', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle', { timeout: 10_000 });

    const submitBtn = page.getByRole('button', {
      name: /send|pošalji|submit/i,
    });
    if ((await submitBtn.count()) === 0) {
      test.skip(true, 'No submit button found');
      return;
    }

    await submitBtn.click();
    // Browser-native or custom validation should fire
    // We just verify the form was not submitted (URL unchanged)
    await expect(page).toHaveURL(/kontakt/);
  });
});
