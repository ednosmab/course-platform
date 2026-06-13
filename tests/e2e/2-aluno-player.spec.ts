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
    await page.addInitScript(() => {
      (window as any).__E2E_BYPASS_AUTH__ = true;
    });

    // Set Supabase auth cookie on student app domain.
    // The Supabase JS client reads sessions from cookies, not localStorage.
    // The cookie name format is: sb-<project-ref>-auth-token
    const context = page.context();
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const tokenResponse = {
      access_token: 'fake-e2e-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expires,
      refresh_token: 'fake-e2e-refresh-token',
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
    await context.addCookies([{
      name: 'sb-limqrpxdzxejvuqjiwpn-auth-token',
      value: encodeURIComponent(JSON.stringify(tokenResponse)),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    }]);

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

    // Mock lesson_blocks for LessonService.getLessonBlocks
    await page.route('**/rest/v1/lesson_blocks*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock auth user for AuthService.getSession
    await page.route('**/auth/v1/user*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000001',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'aluno@aluno.com',
        }),
      });
    });

    // Mock student_progress for ProgressService
    await page.route('**/rest/v1/student_progress*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock profiles for getCurrentProfile (used by useCourseAccess)
    await page.route('**/rest/v1/profiles*', async route => {
      const accept = route.request().headers()['accept'] || '';
      if (accept.includes('vnd.pgrst.object')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', email: 'aluno@aluno.com', role: 'student', created_at: new Date().toISOString() }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: '00000000-0000-0000-0000-000000000001', email: 'aluno@aluno.com', role: 'student', created_at: new Date().toISOString() }]) });
      }
    });

    // Mock course_access for useCourseAccess (free access)
    await page.route('**/rest/v1/course_access*', async route => {
      const accept = route.request().headers()['accept'] || '';
      if (accept.includes('vnd.pgrst.object')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ course_id: MOCK_COURSE.id, access_mode: 'free', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ course_id: MOCK_COURSE.id, access_mode: 'free', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]) });
      }
    });
  });

  test('Smoke: app carrega sem crash no dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Oi,')).toBeVisible({ timeout: 30000 });
  });

  test('Deve renderizar o placeholder do YouTube e o Quiz estatico', async ({ page }) => {
    await page.goto(`/course/${MOCK_COURSE.id}/play?lessonId=${MOCK_LESSON.id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 1. YouTube video placeholder (renderer renders static placeholder, not iframe)
    await expect(page.locator('text=youtube').first()).toBeVisible({ timeout: 15000 });

    // 2. Quiz block renders question and options as static read-only content
    //    The shared renderer (@projeto/renderer) renders quiz as plain HTML without interactivity
    await expect(page.getByText('Teste E2E: Pergunta Difícil')).toBeVisible();
    await expect(page.getByText('Resposta Errada')).toBeVisible();
    await expect(page.getByText('Resposta Certa')).toBeVisible();

    // 3. Concluir aula button is present
    await expect(page.getByText('Concluir aula')).toBeVisible();
  });
});
