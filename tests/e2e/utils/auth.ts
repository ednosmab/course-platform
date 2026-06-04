import type { Page } from '@playwright/test';

const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001';

const MOCK_AUTH_USER = {
  id: FAKE_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@admin.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_TOKEN_RESPONSE = {
  access_token: 'fake-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'fake-refresh-token',
  user: MOCK_AUTH_USER,
};

/**
 * Logs the page in as admin (`admin@admin.com` / `123456`) by mocking
 * Supabase Auth + profiles + courses endpoints. After this resolves,
 * the page is on the dashboard (`/`).
 *
 * The route mocks persist for the lifetime of the page — they cover
 * any subsequent request to `/auth/v1/*` and `/rest/v1/profiles*` /
 * `courses*` from the dashboard data loaders.
 *
 * Each test should still mock the specific REST endpoints it needs
 * (e.g. /rest/v1/lessons) AFTER calling this helper.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.route('**/auth/v1/token*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TOKEN_RESPONSE),
      });
    } else {
      await route.fulfill({ status: 405 });
    }
  });

  await page.route('**/auth/v1/user*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AUTH_USER),
    });
  });

  await page.route('**/rest/v1/profiles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ role: 'admin' }),
    });
  });

  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@admin.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button').filter({ hasText: 'Entrar' }).click();
  await page.waitForURL('/', { timeout: 15000 });
}
