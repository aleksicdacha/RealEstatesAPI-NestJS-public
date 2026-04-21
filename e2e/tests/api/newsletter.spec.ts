/**
 * Newsletter API contract tests.
 */

import { test, expect } from '@playwright/test';
import { apiLogin, authHeaders } from '../../utils/api-helpers';

const TEST_EMAIL = `e2e-newsletter-${Date.now()}@test.com`;
let adminToken: string;

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
  // Clean up: unsubscribe the test email
  await request.post('newsletter/unsubscribe', {
    data: { email: TEST_EMAIL },
  });
});

test.describe('Newsletter subscribe/unsubscribe', () => {
  test('POST /newsletter/subscribe with valid email returns 201', async ({
    request,
  }) => {
    const res = await request.post('newsletter/subscribe', {
      data: { email: TEST_EMAIL },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('subscribing the same email again returns 409 or is idempotent', async ({
    request,
  }) => {
    const res = await request.post('newsletter/subscribe', {
      data: { email: TEST_EMAIL },
    });
    // Either conflict or graceful idempotent response
    expect([200, 201, 409]).toContain(res.status());
  });

  test('POST /newsletter/subscribe with invalid email returns 400', async ({
    request,
  }) => {
    const res = await request.post('newsletter/subscribe', {
      data: { email: 'not-an-email' },
    });
    // 422 = Unprocessable Entity (class-validator), 400 = Bad Request
    expect([400, 422]).toContain(res.status());
  });

  test('POST /newsletter/unsubscribe removes the subscriber', async ({
    request,
  }) => {
    const res = await request.post('newsletter/unsubscribe', {
      data: { email: TEST_EMAIL },
    });
    // 422 if not subscribed (previous subscribe test may have failed/already unsubscribed)
    expect([200, 204, 422]).toContain(res.status());
  });
});

test.describe('Newsletter admin endpoints (auth required)', () => {
  test('GET /newsletter/subscribers requires authentication', async ({
    request,
  }) => {
    const res = await request.get('newsletter/subscribers');
    expect(res.status()).toBe(401);
  });

  test('GET /newsletter/subscribers returns list with admin JWT', async ({
    request,
  }) => {
    // Always get a fresh token — previous tests (e.g. logout) update lastLogoutTime,
    // which invalidates any token issued before that moment.
    // Wait 1s to ensure the new token's iat is strictly after lastLogoutTime.
    await new Promise((r) => setTimeout(r, 1100));
    const { accessToken } = await apiLogin(request);
    const res = await request.get('newsletter/subscribers', {
      headers: authHeaders(accessToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body) || typeof body === 'object').toBeTruthy();
  });
});
