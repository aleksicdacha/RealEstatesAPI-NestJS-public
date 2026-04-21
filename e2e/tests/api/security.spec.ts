/**
 * Security tests for the public API.
 *
 * These are the highest-priority tests — they verify that sensitive fields
 * are NEVER leaked through the public endpoints and that auth guards work.
 *
 * These tests use Playwright's APIRequestContext (no browser).
 */

import { test, expect } from '@playwright/test';
import { apiLogin, authHeaders } from '../../utils/api-helpers';

const SENSITIVE_FIELDS = [
  'salePrice',
  'address',
  'comment',
  'client',
  'createdAt',
  'updatedAt',
];

test.describe('Public API — sensitive field leakage', () => {
  test('GET /properties/public does not expose sensitive fields', async ({
    request,
  }) => {
    const res = await request.get('properties/public');
    expect(res.status()).toBe(200);

    const body = await res.json();
    // Response is { data: [...], total: number } or similar array shape
    const items: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.data ?? body.items ?? []);

    for (const item of items.slice(0, 5)) {
      for (const field of SENSITIVE_FIELDS) {
        expect(
          item,
          `Public endpoint must not expose field "${field}"`,
        ).not.toHaveProperty(field);
      }
    }
  });

  test('GET /properties/public/:guid does not expose sensitive fields', async ({
    request,
  }) => {
    // Fetch list first to get a real guid
    const listRes = await request.get('properties/public');
    const listBody = await listRes.json();
    const items: Array<{ id: string }> = Array.isArray(listBody)
      ? listBody
      : (listBody.data ?? listBody.items ?? []);

    if (items.length === 0) {
      test.skip(true, 'No properties seeded — skipping detail security check');
      return;
    }

    const guid = items[0].id;
    const res = await request.get(`properties/public/${guid}`);
    expect(res.status()).toBe(200);

    const item = await res.json();
    for (const field of SENSITIVE_FIELDS) {
      expect(
        item,
        `Public detail endpoint must not expose field "${field}"`,
      ).not.toHaveProperty(field);
    }
  });

  test('Public endpoints return neighborhood but not address', async ({
    request,
  }) => {
    const res = await request.get('properties/public');
    const body = await res.json();
    const items: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.data ?? body.items ?? []);

    if (items.length === 0) {
      test.skip(true, 'No properties seeded');
      return;
    }

    const item = items[0];
    // neighborhood is allowed on public API
    expect(item).toHaveProperty('neighborhood');
    // address must be hidden
    expect(item).not.toHaveProperty('address');
  });
});

test.describe('Auth guards — unauthenticated access', () => {
  test('GET /properties returns 401 without token', async ({ request }) => {
    const res = await request.get('properties');
    expect(res.status()).toBe(401);
  });

  test('POST /properties returns 401 without token', async ({ request }) => {
    const res = await request.post('properties', {
      data: { code: 'HACK-001' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /clients returns 401 without token', async ({ request }) => {
    const res = await request.get('clients');
    expect(res.status()).toBe(401);
  });

  test('GET /users returns 401 without token', async ({ request }) => {
    const res = await request.get('users');
    expect(res.status()).toBe(401);
  });

  test('POST /upload returns 401 without token', async ({ request }) => {
    const res = await request.post('upload');
    expect(res.status()).toBe(401);
  });

  test('GET /newsletter/subscribers returns 401 without token', async ({
    request,
  }) => {
    const res = await request.get('newsletter/subscribers');
    expect(res.status()).toBe(401);
  });
});

test.describe('Auth guards — wrong role', () => {
  /**
   * A non-admin user should not be able to access /users.
   * This test creates a regular user account and verifies the 403.
   */
  test.skip('GET /users returns 403 for non-admin JWT', async ({ request }) => {
    // TODO: create a seeded non-admin user and log in as that user
    // Skipped until a fixture for non-admin users is built
  });
});

test.describe('Public endpoints require no auth', () => {
  test('GET /properties/public is accessible without token', async ({
    request,
  }) => {
    const res = await request.get('properties/public');
    expect(res.status()).toBe(200);
  });

  test('GET /properties/filters/options is accessible without token', async ({
    request,
  }) => {
    const res = await request.get('properties/filters/options');
    expect(res.status()).toBe(200);
  });

  test('GET /properties/stats/average-price-by-type is accessible without token', async ({
    request,
  }) => {
    const res = await request.get('properties/stats/average-price-by-type');
    expect(res.status()).toBe(200);
  });

  test('POST /contact/send is accessible without token', async ({
    request,
  }) => {
    // Should return 200/201, not 401 (even if validation fails it won't be 401)
    const res = await request.post('contact/send', {
      data: { name: 'Test', email: 'test@test.com', message: 'Hello' },
    });
    expect(res.status()).not.toBe(401);
  });
});
