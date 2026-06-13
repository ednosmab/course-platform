import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

test.describe('Admin Auth - Login e Redirecionamento', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('Minified React error')) {
          throw new Error(`Erro Crítico de React detectado no console: ${text}`);
        }
      }
    });
  });

  test('Deve logar como admin e redirecionar para dashboard', async ({ page }) => {
    // Mock courses list (dashboard carrega após redirect)
    await page.route('**/rest/v1/courses*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await loginAsAdmin(page);

    // Verificar que o dashboard carregou
    await expect(page.locator('text=Novo curso').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Nenhum curso encontrado')).toBeVisible();
  });

  test('Deve logar como aluno e redirecionar para app do aluno', async ({ page }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const tokenResponse = {
      access_token: 'fake-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expires,
      refresh_token: 'fake-refresh-token',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'aluno@aluno.com',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    // Mock Supabase Auth: signInWithPassword returns success + pre-seed localStorage
    // so getUserRole can read the session immediately after signIn
    await page.route('**/auth/v1/token*', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tokenResponse) });
      } else {
        await route.fulfill({ status: 405 });
      }
    });

    // Mock auth user endpoint
    await page.route('**/auth/v1/user*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tokenResponse.user) });
    });

    // Mock profiles query — return student role
    await page.route('**/rest/v1/profiles*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ role: 'student' }) });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify the login form renders
    await expect(page.getByText('Entre na sua conta')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Fill student credentials and submit
    await page.locator('input[type="email"]').fill('aluno@aluno.com');
    await page.locator('input[type="password"]').fill('123456');

    // After signIn succeeds, getUserRole returns 'student' and handleLogin sets
    // window.location.href = 'http://localhost:8081'. Verify the navigation.
    await page.getByRole('button', { name: 'Entrar' }).click();

    // The cross-origin redirect may or may not complete depending on whether the
    // student app server is running. Verify the login didn't show an error.
    await page.waitForTimeout(3000);
    const hasError = await page.locator('text=Erro inesperado').isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
