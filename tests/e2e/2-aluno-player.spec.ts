import { test, expect } from '@playwright/test';

const MOCK_COURSE = {
  id: '99999999-9999-9999-9999-999999999999',
  title: 'Curso de Teste E2E',
  description: 'Curso mockado para E2E.',
  is_published: true,
  thumbnail_url: null,
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
      id: 'block-video-1',
      type: 'video',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      provider: 'youtube',
    },
    {
      id: 'block-quiz-1',
      type: 'quiz',
      question: 'Teste E2E: Pergunta Difícil',
      options: [
        { id: 'opt-wrong', text: 'Resposta Errada', isCorrect: false },
        { id: 'opt-right', text: 'Resposta Certa', isCorrect: true },
      ],
    },
  ],
};

test.describe('Portal do Aluno - Player Móvel/Web', () => {
  test.use({ baseURL: 'http://localhost:8081' });

  test.beforeEach(async ({ page }) => {
    // Mock courses — select('*') sem .single() retorna array
    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      if (request.headers()['accept']?.includes('vnd.pgrst.object')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE]) });
      }
    });

    // Mock modules
    await page.route('**/rest/v1/modules*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_MODULE]) });
    });

    // Mock lessons
    await page.route('**/rest/v1/lessons*', async route => {
      const request = route.request();
      if (request.headers()['accept']?.includes('vnd.pgrst.object')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LESSON) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_LESSON]) });
      }
    });
  });

  test('Smoke: app carrega sem crash no dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Bem-vindo ao Mosaico')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveScreenshot('player-dashboard.png');
  });

  test('Deve renderizar o iFrame do YouTube e respeitar a regra Try Again do Quiz', async ({ page }) => {
    // ?mode=player faz o App.tsx montar o LessonPlayer diretamente
    await page.goto('/?mode=player', { waitUntil: 'domcontentloaded' });

    // Aguarda o LessonPlayer carregar dados do Supabase (mocks)
    // Nota: networkidle não funciona pois LessonPlayer mantém WebSocket Realtime aberto
    await page.waitForTimeout(3000);

    // 1. Validar o iframe do YouTube
    const youtubeIframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

    // 2. Validar o texto da pergunta do Quiz
    const quizQuestion = page.getByText('Teste E2E: Pergunta Difícil');
    await expect(quizQuestion).toBeVisible();

    // 2.1 Clicar na opção incorreta
    await page.getByText('Resposta Errada').click({ force: true });
    await page.getByText('Confirm Answer').click({ force: true });

    // 2.2 Mensagem de erro e botão "Try Again" devem aparecer
    await expect(page.getByText('Incorrect Answer.')).toBeVisible();

    const retryButton = page.getByText('Try Again');
    await expect(retryButton).toBeVisible();

    // 2.3 Clicar em Try Again e escolher a certa
    await retryButton.click({ force: true });
    await page.getByText('Resposta Certa').click({ force: true });
    await page.getByText('Confirm Answer').click({ force: true });

    // 2.4 Mensagem de sucesso
    await expect(page.getByText('Correct Answer!')).toBeVisible();

    // Visual regression: player com quiz respondido corretamente
    // Nota: networkidle não funciona pois LessonPlayer mantém WebSocket Realtime aberto
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('player-quiz-correct.png');
  });
});
