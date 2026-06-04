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
    // Mock Supabase Auth: signInWithPassword (precisa de mocks diferentes do helper admin)
    await page.route('**/auth/v1/token*', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'fake-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
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
          }),
        });
      } else {
        await route.fulfill({ status: 405 });
      }
    });

    // Mock profiles query — role = student
    await page.route('**/rest/v1/profiles*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ role: 'student' }),
      });
    });

    // Mock student app data (cursos)
    await page.route('**/rest/v1/courses*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Preencher formulário de login
    await page.locator('input[type="email"]').fill('aluno@aluno.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.locator('button').filter({ hasText: 'Entrar' }).click();

    // Aguardar redirect para student app (localhost:8081)
    await page.waitForURL(/http:\/\/localhost:8081/, { timeout: 15000 });

    // Verificar que o app do aluno carregou
    await expect(page.getByText('Bem-vindo ao Mosaico')).toBeVisible({ timeout: 15000 });
  });
});
