import { test, expect } from '@playwright/test';

const MOCK_COURSES = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Curso de Teste E2E',
    description: 'Descrição do curso mockado para testes automatizados.',
    is_published: true,
    thumbnail_url: null,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Rascunho em Andamento',
    description: 'Curso ainda não publicado.',
    is_published: false,
    thumbnail_url: null,
    created_at: '2025-01-02T00:00:00Z',
  },
];

test.describe('Admin Dashboard - Listagem de Cursos', () => {
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

  test('Deve carregar cursos do Supabase e exibir cards reais (sem mock visual)', async ({ page }) => {
    // Intercepta a chamada ao Supabase REST API para courses
    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_COURSES),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Loading state desapareceu
    await expect(page.locator('text=Carregando cursos…')).not.toBeVisible();

    // Verifica que os títulos dos cursos (dados mockados do Supabase) aparecem
    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();
    await expect(page.locator('text=Rascunho em Andamento')).toBeVisible();

    // Verifica que descrições reais aparecem
    await expect(page.locator('text=Descrição do curso mockado para testes automatizados.')).toBeVisible();

    // Verifica que os badges de status estão corretos (acessible name do link inclui o badge)
    await expect(page.getByRole('link', { name: /Publicado.*Curso de Teste E2E/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rascunho.*Rascunho em Andamento/ })).toBeVisible();

    // Verifica que cada card tem link para o studio
    const linkA = page.locator(`a[href="/studio/${MOCK_COURSES[0].id}"]`);
    await expect(linkA).toBeVisible();
    const linkB = page.locator(`a[href="/studio/${MOCK_COURSES[1].id}"]`);
    await expect(linkB).toBeVisible();

    // Verifica que não há spans genéricos de "cards fakes" (títulos de placeholder)
    await expect(page.locator('text=Curso Exemplo')).not.toBeVisible();
    await expect(page.locator('text=Card Mockado')).not.toBeVisible();
  });

  test('Deve mostrar estado vazio quando não há cursos no banco', async ({ page }) => {
    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Nenhum curso encontrado')).toBeVisible();
    await expect(page.locator('text=Clique em "Novo curso" para começar.')).toBeVisible();
  });

  test('Deve mostrar filtros e alternar entre Todos / Publicados / Rascunhos', async ({ page }) => {
    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_COURSES),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clicar em "Publicados" — só o curso publicado deve aparecer
    await page.locator('text=Publicados').click();
    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();
    await expect(page.locator('text=Rascunho em Andamento')).not.toBeVisible();

    // Clicar em "Rascunhos" — só o rascunho deve aparecer
    await page.locator('text=Rascunhos').click();
    await expect(page.locator('text=Curso de Teste E2E')).not.toBeVisible();
    await expect(page.locator('text=Rascunho em Andamento')).toBeVisible();

    // Clicar em "Todos" — ambos aparecem
    await page.locator('text=Todos').click();
    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();
    await expect(page.locator('text=Rascunho em Andamento')).toBeVisible();
  });

  test('Deve iniciar com loading state e depois transicionar para dados', async ({ page }) => {
    // Atrasa a resposta para ver o loading state
    await page.route('**/rest/v1/courses*', async route => {
      await new Promise(r => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_COURSES),
      });
    });

    await page.goto('/');

    // Loading state deve aparecer
    await expect(page.locator('text=Carregando cursos…')).toBeVisible();

    // Aguarda dados carregarem
    await page.waitForLoadState('networkidle');

    // Loading state desapareceu
    await expect(page.locator('text=Carregando cursos…')).not.toBeVisible();

    // Dados apareceram
    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();
  });

  test('Deve exibir erro silenciosamente quando API falha (sem cards fakes)', async ({ page }) => {
    // Simula falha HTTP 500 (em vez de abort, que pode travar o fetch)
    await page.route('**/rest/v1/courses*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');
    await expect(page.locator('text=Carregando cursos…')).not.toBeVisible({ timeout: 15000 });

    // Não deve mostrar nenhum card fake
    await expect(page.locator('text=Curso de Teste E2E')).not.toBeVisible();
    await expect(page.locator('text=Rascunho em Andamento')).not.toBeVisible();

    // Deve cair no empty state (courses = [])
    await expect(page.locator('text=Nenhum curso encontrado')).toBeVisible();
  });
});
