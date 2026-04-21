/**
 * Admin-web — Property CRUD tests.
 *
 * Assumes a valid admin session in e2e/.auth/admin.json.
 * Run auth.spec.ts first (or add --project=admin-web which depends on API project).
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sr';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Properties list page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${LOCALE}/properties`);
    // Wait for table to load
    await expect(page.locator('.p-datatable')).toBeVisible({ timeout: 15_000 });
  });

  test('renders DataTable', async ({ page }) => {
    await expect(page.locator('.p-datatable-thead')).toBeVisible();
  });

  test('shows "New" / "Dodaj" button to create property', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /new|dodaj|add|nova/i }),
    ).toBeVisible();
  });

  test('has at least one column header', async ({ page }) => {
    const headers = page.locator('.p-datatable-thead th');
    await expect(headers.first()).toBeVisible();
  });
});

test.describe('Create property via wizard', () => {
  test('opens the property wizard dialog', async ({ page }) => {
    await page.goto(`/${LOCALE}/properties`);
    await expect(page.locator('.p-datatable')).toBeVisible({ timeout: 15_000 });

    // Click the "add / new property" button
    await page.getByRole('button', { name: /new|dodaj|add|nova/i }).click();

    // PrimeReact Dialog should appear
    await expect(page.locator('.p-dialog')).toBeVisible({ timeout: 5_000 });
  });

  test('wizard first step has required code field', async ({ page }) => {
    await page.goto(`/${LOCALE}/properties`);
    await expect(page.locator('.p-datatable')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /new|dodaj|add|nova/i }).click();
    await expect(page.locator('.p-dialog')).toBeVisible({ timeout: 5_000 });

    // Code input should be present
    const codeInput = page
      .getByLabel(/code|šifra|kod/i)
      .or(page.locator('input[placeholder*="NIS"], input[id*="code"]'));
    await expect(codeInput.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Delete property confirmation dialog', () => {
  test('delete button triggers confirm dialog', async ({ page }) => {
    await page.goto(`/${LOCALE}/properties`);
    await expect(page.locator('.p-datatable-tbody tr').first()).toBeVisible({
      timeout: 15_000,
    });

    // Find a delete button in the first row
    const deleteBtn = page
      .locator('.p-datatable-tbody tr')
      .first()
      .getByRole('button', {
        name: /delete|obriši|trash/i,
      });

    if ((await deleteBtn.count()) === 0) {
      test.skip(
        true,
        'No delete button visible — possibly no properties in DB',
      );
      return;
    }

    await deleteBtn.click();
    // PrimeReact ConfirmDialog should appear
    await expect(page.locator('.p-confirmdialog')).toBeVisible({
      timeout: 5_000,
    });

    // Click "No" / "Cancel" to not actually delete
    const cancelBtn = page.locator('.p-confirmdialog').getByRole('button', {
      name: /no|cancel|ne|otkaži/i,
    });
    await cancelBtn.click();
    await expect(page.locator('.p-confirmdialog')).not.toBeVisible();
  });
});
