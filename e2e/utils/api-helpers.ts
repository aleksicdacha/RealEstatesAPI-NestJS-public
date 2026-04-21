/**
 * API helper utilities for e2e tests.
 * All functions use the native Playwright APIRequestContext
 * so they work in both API-project tests and browser-project tests
 * (via `request` fixture).
 */

import { APIRequestContext, expect } from '@playwright/test';

const API_BASE = (process.env.API_URL ?? 'http://127.0.0.1:3000/v1/').replace(
  /\/$/,
  '',
);

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Log in and return access + refresh tokens.
 * Throws if login fails so callers get a clear failure message.
 */
export async function apiLogin(
  request: APIRequestContext,
  email = process.env.TEST_ADMIN_EMAIL ?? 'admin',
  password = process.env.TEST_ADMIN_PASSWORD ?? 'admin123',
): Promise<LoginResult> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { username: email, password },
  });
  if (res.status() === 429) {
    throw new Error(
      `Login throttled (429) for ${email}. Wait for the throttle window (15 min) to expire and re-run.`,
    );
  }
  expect(res.status(), `Login failed for ${email}`).toBe(200);
  const body = await res.json();
  return { accessToken: body.accessToken, refreshToken: body.refreshToken };
}

/**
 * Return headers with Authorization JWT preset.
 */
export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create a minimal valid property via the admin API and return its guid.
 * Useful for tests that need an existing property without going through the UI.
 */
export async function createTestProperty(
  request: APIRequestContext,
  token: string,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const payload = {
    // API requires explicit UUID (see CreatePropertyDto: @IsString() id)
    id: crypto.randomUUID(),
    code: `TEST-${Date.now()}`,
    propertyType: 'apartment',
    status: 'active',
    price: 50000,
    salePrice: 48000,
    area: 55,
    address: 'Ulica Test 1',
    neighborhood: 'Centar',
    floor: 2,
    bathrooms: 1,
    heating: 'central',
    ...overrides,
  };

  const res = await request.post(`${API_BASE}/properties`, {
    data: payload,
    headers: authHeaders(token),
  });
  expect(res.status(), 'createTestProperty failed').toBe(201);
  const body = await res.json();
  return body.id as string;
}

/**
 * Delete a property by guid. Fails silently in afterAll cleanup.
 */
export async function deleteTestProperty(
  request: APIRequestContext,
  token: string,
  guid: string,
): Promise<void> {
  await request.delete(`${API_BASE}/properties/${guid}`, {
    headers: authHeaders(token),
  });
}
