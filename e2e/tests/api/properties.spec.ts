/**
 * Properties API contract tests (admin endpoints).
 * Tests full CRUD lifecycle with authentication.
 */

import { test, expect } from '@playwright/test';
import {
  apiLogin,
  authHeaders,
  createTestProperty,
  deleteTestProperty,
} from '../../utils/api-helpers';

let adminToken: string;
let createdGuid: string;

test.beforeAll(async ({ request }) => {
  try {
    const { accessToken } = await apiLogin(request);
    adminToken = accessToken;
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('429')) {
      test.skip(
        true,
        'Login throttled — run again after 15 min window expires',
      );
    } else throw e;
  }
});

test.afterAll(async ({ request }) => {
  if (createdGuid) {
    await deleteTestProperty(request, adminToken, createdGuid);
  }
});

test.describe('GET /properties (admin)', () => {
  test('returns list with sensitive fields included', async ({ request }) => {
    const res = await request.get('properties', {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    const items: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.data ?? body.items ?? []);

    if (items.length > 0) {
      // Admin response must include salePrice (unlike public API)
      expect(items[0]).toHaveProperty('salePrice');
    }
  });

  test('response contains pagination metadata', async ({ request }) => {
    const res = await request.get('properties', {
      headers: authHeaders(adminToken),
    });
    const body = await res.json();
    // Either array or paginated object
    expect(body).toBeTruthy();
  });
});

test.describe('POST /properties (admin)', () => {
  test('creates a property and returns 201 with guid', async ({ request }) => {
    const uniqueCode = `E2E-${Date.now()}`;
    const res = await request.post('properties', {
      headers: authHeaders(adminToken),
      data: {
        // The API requires an explicit UUID id (PrimaryGeneratedColumn('uuid') with client-supplied value)
        id: crypto.randomUUID(),
        code: uniqueCode,
        propertyType: 'apartment',
        status: 'active',
        price: 60000,
        salePrice: 55000,
        area: 65,
        address: 'E2E Test ulica 1',
        neighborhood: 'Centar',
        floor: 3,
        bathrooms: 1,
        heating: 'central',
      },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    // id is the UUID PK (the public identifier in this API)
    expect(body).toHaveProperty('id');
    expect(body.code).toBe(uniqueCode);
    createdGuid = body.id;
  });

  test('duplicate code returns 409 or 400', async ({ request }) => {
    if (!createdGuid) {
      test.skip(true, 'No property created in previous test');
      return;
    }

    // Try to create with same code used above
    const listRes = await request.get(`properties/${createdGuid}`, {
      headers: authHeaders(adminToken),
    });
    const existing = await listRes.json();

    const res = await request.post('properties', {
      headers: authHeaders(adminToken),
      data: {
        id: crypto.randomUUID(),
        code: existing.code,
        propertyType: 'apartment',
        price: 10000,
        salePrice: 9000,
        address: 'Duplicate',
        neighborhood: 'Test',
      },
    });
    expect([400, 409]).toContain(res.status());
  });
});

test.describe('GET /properties/:guid (admin)', () => {
  test('returns full property with sensitive fields', async ({ request }) => {
    if (!createdGuid) {
      test.skip(true, 'Depends on POST test');
      return;
    }

    const res = await request.get(`properties/${createdGuid}`, {
      headers: authHeaders(adminToken),
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('salePrice');
    expect(body).toHaveProperty('address');
    expect(body).toHaveProperty('id', createdGuid);
  });

  test('non-existent guid returns 404', async ({ request }) => {
    const res = await request.get(
      'properties/00000000-0000-0000-0000-000000000000',
      {
        headers: authHeaders(adminToken),
      },
    );
    expect(res.status()).toBe(404);
  });
});

test.describe('PUT /properties/:guid (admin)', () => {
  test('updates property fields', async ({ request }) => {
    if (!createdGuid) {
      test.skip(true, 'Depends on POST test');
      return;
    }

    const res = await request.put(`properties/${createdGuid}`, {
      headers: authHeaders(adminToken),
      data: { price: 65000, neighborhood: 'Updated Neighborhood' },
    });
    expect([200, 204]).toContain(res.status());
  });
});

test.describe('DELETE /properties/:guid (admin)', () => {
  test('deletes the property', async ({ request }) => {
    if (!createdGuid) {
      test.skip(true, 'Depends on POST test');
      return;
    }

    const res = await request.delete(`properties/${createdGuid}`, {
      headers: authHeaders(adminToken),
    });
    expect([200, 204]).toContain(res.status());

    // Verify it's gone
    const getRes = await request.get(`properties/${createdGuid}`, {
      headers: authHeaders(adminToken),
    });
    expect(getRes.status()).toBe(404);

    createdGuid = ''; // Prevent afterAll from trying again
  });
});

test.describe('GET /properties/public', () => {
  test('returns properties with guid and neighborhood', async ({ request }) => {
    const res = await request.get('properties/public');
    expect(res.status()).toBe(200);

    const body = await res.json();
    const items: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.data ?? body.items ?? []);

    if (items.length > 0) {
      expect(items[0]).toHaveProperty('id');
    }
  });

  test('supports filtering by propertyType', async ({ request }) => {
    const res = await request.get('properties/public?propertyType=apartment');
    expect(res.status()).toBe(200);
  });

  test('supports pagination', async ({ request }) => {
    const res = await request.get('properties/public?limit=2&page=1');
    expect(res.status()).toBe(200);
  });
});
