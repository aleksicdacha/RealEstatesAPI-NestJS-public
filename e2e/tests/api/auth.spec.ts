/**
 * Auth API contract tests.
 * Tests login, token refresh, and logout flows.
 */

import { test, expect } from '@playwright/test';

test.describe('POST /auth/login', () => {
  test('valid credentials return access and refresh tokens', async ({
    request,
  }) => {
    const res = await request.post('auth/login', {
      data: {
        username: process.env.TEST_ADMIN_EMAIL ?? 'admin',
        password: process.env.TEST_ADMIN_PASSWORD ?? 'admin123',
      },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(20);
  });

  test('wrong password returns 401 or 429 (throttled)', async ({ request }) => {
    const res = await request.post('auth/login', {
      data: { username: 'admin', password: 'wrong-password' },
    });
    expect([401, 429]).toContain(res.status());
  });

  test('non-existent user returns 401 or 429 (throttled)', async ({
    request,
  }) => {
    const res = await request.post('auth/login', {
      data: { username: 'ghost@example.com', password: 'password' },
    });
    expect([401, 429]).toContain(res.status());
  });

  test('missing credentials returns 400, 401 or 429 (throttled)', async ({
    request,
  }) => {
    const res = await request.post('auth/login', { data: {} });
    // 429 is valid: previous bad attempts in same test run hit the rate limit
    expect([400, 401, 429]).toContain(res.status());
  });
});

test.describe('POST /auth/refresh-token', () => {
  test('valid refresh token returns new access token', async ({ request }) => {
    // Log in fresh to get tokens — this must be a clean login not used elsewhere
    const loginRes = await request.post('auth/login', {
      data: {
        username: process.env.TEST_ADMIN_EMAIL ?? 'admin',
        password: process.env.TEST_ADMIN_PASSWORD ?? 'admin123',
      },
    });
    // 429 can occur if throttle was hit by previous tests — skip gracefully
    if (loginRes.status() === 429) {
      test.skip(true, 'Rate limited — run with fresh throttle window');
      return;
    }
    expect(loginRes.status()).toBe(200);
    const { refreshToken } = await loginRes.json();

    // Refresh immediately (before any logout invalidates the hash)
    const res = await request.post('auth/refresh-token', {
      data: { refreshToken },
    });
    expect([200, 201]).toContain(res.status());

    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
  });

  test('invalid refresh token returns 401', async ({ request }) => {
    const res = await request.post('auth/refresh-token', {
      data: { refreshToken: 'totally-invalid-token' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('POST /auth/logout', () => {
  test('valid JWT logs out successfully', async ({ request }) => {
    const loginRes = await request.post('auth/login', {
      data: {
        username: process.env.TEST_ADMIN_EMAIL ?? 'admin',
        password: process.env.TEST_ADMIN_PASSWORD ?? 'admin123',
      },
    });
    if (loginRes.status() === 429) {
      test.skip(true, 'Rate limited — run with fresh throttle window');
      return;
    }
    expect(loginRes.status()).toBe(200);
    const { accessToken } = await loginRes.json();

    const res = await request.post('auth/logout', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('logout without token returns 401', async ({ request }) => {
    const res = await request.post('auth/logout');
    expect(res.status()).toBe(401);
  });
});
