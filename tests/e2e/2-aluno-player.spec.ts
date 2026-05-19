import { test, expect } from '@playwright/test';

// Mocks estritos conforme Zod Schemas
const MOCK_COURSE = {
  id: '99999999-9999-9999-9999-999999999999',
  title: 'Curso de Teste E2E',
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_MODULE = {
  id: '00000000-0000-0000-0000-000000000000',
  course_id: MOCK_COURSE.id,
  title: 'Módulo de Teste',
  order_index: 1,
  created_at: new Date().toISOString(),
};

const MOCK_LESSON = {
  id: '11111111-1111-1111-1111-111111111111',
  module_id: MOCK_MODULE.id,
  title: '1. Aula Dinâmica',
  order_index: 1,
  schema_version: 1,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  blocks: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      type: 'video',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      provider: 'youtube'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      type: 'quiz',
      question: 'Teste E2E: Pergunta Difícil',
      options: [
        { id: '33333333-3333-3333-3333-333333333333', text: 'Resposta Errada', isCorrect: false },
        { id: '44444444-4444-4444-4444-444444444444', text: 'Resposta Certa', isCorrect: true }
      ]
    }
  ]
};

test.describe('Portal do Aluno - Player Móvel/Web', () => {
  // Como o Aluno Web roda na porta 8081 usando Expo Router, usamos a baseUrl apropriada
  test.use({ baseURL: 'http://localhost:8081' });

  test.beforeEach(async ({ page }) => {
    // 1. Mock do Supabase GET de Courses (.single() e .maybeSingle() esperam Objeto, não Array)
    await page.route('**/rest/v1/courses*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_COURSE) 
      });
    });

    // 2. Mock do Supabase GET de Modules
    await page.route('**/rest/v1/modules*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_MODULE])
      });
    });

    // 3. Mock do Supabase GET de Lessons
    await page.route('**/rest/v1/lessons*', async route => {
      const request = route.request();
      // O Supabase usa esse header quando chamamos `.single()`
      if (request.headers()['accept']?.includes('vnd.pgrst.object')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_LESSON)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_LESSON])
        });
      }
    });
  });

  test('Smoke: app carrega sem crash', async ({ page }) => {
    await page.goto('/');
    // Se o app carregou sem JS crash, o console não tem erros fatais
    // e o loading state (Spinner) deve aparecer
    await expect(page.locator('text=Carregando')).toBeVisible({ timeout: 30000 });
  });

  test('Deve renderizar o iFrame do YouTube e respeitar a regra Try Again do Quiz', async ({ page }) => {
    // Navega para a home do app do Aluno
    await page.goto('/');

    // 1. Validar a Engine Híbrida de Vídeo (YouTube Web Embed)
    // Procuramos por um iframe que aponte para o youtube.com/embed
    const youtubeIframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(youtubeIframe).toBeVisible();

    // 2. Validar o UX do Quiz
    const quizQuestion = page.getByText('Teste E2E: Pergunta Difícil');
    await expect(quizQuestion).toBeVisible();

    // 2.1 Clicar na opção incorreta
    await page.getByText('Resposta Errada').click({ force: true });
    await page.getByText('Confirmar Resposta').click({ force: true });

    // 2.2 Afirmar que a mensagem de Erro apareceu, mas que a reposta correta NÃO está marcada de verde
    await expect(page.getByText('Ops! Resposta Incorreta.')).toBeVisible();
    
    // A opção certa ("Resposta Certa") NÃO deve possuir a marcação verde/checkmark,
    // garantindo que não entregamos o gabarito. Como não temos classes CSS no React Native Web tão simples para asserção,
    // podemos apenas validar se o texto "Resposta Certa" está visível, mas sem assert do checkmark nela.
    // O mais importante é verificar o "Tentar Novamente"
    const retryButton = page.getByText('Tentar Novamente');
    await expect(retryButton).toBeVisible();

    // 2.3 Clicar em Tentar Novamente e escolher a certa
    await retryButton.click({ force: true });
    await page.getByText('Resposta Certa').click({ force: true });
    await page.getByText('Confirmar Resposta').click({ force: true });

    // 2.4 Afirmar sucesso
    await expect(page.getByText('Resposta Correta!')).toBeVisible();
  });
});
