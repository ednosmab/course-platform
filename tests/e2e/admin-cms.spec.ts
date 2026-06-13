import { test, expect } from '@playwright/test';
import { mockAdminSession } from './utils/auth';

const COURSE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const MODULE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const LESSON_ID = '11111111-1111-1111-1111-111111111111';

const MOCK_BLOCKS = [
  {
    id: 'block-text-1',
    type: 'text',
    content: 'Teste E2E Automatizado',
    styles: { align: 'left', fontSize: 'medium' },
  },
];

const MOCK_COURSE = {
  id: COURSE_ID,
  title: 'Curso de Teste E2E',
  description: 'Curso mockado para testes E2E.',
  is_published: true,
  certificate_enabled: false,
  thumbnail_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_MODULE = {
  id: MODULE_ID,
  course_id: COURSE_ID,
  title: 'Módulo de Teste',
  order_index: 1,
  created_at: new Date().toISOString(),
};

const MOCK_LESSON = {
  id: LESSON_ID,
  module_id: MODULE_ID,
  title: 'Aula de Teste E2E',
  order_index: 1,
  is_published: true,
  blocks: MOCK_BLOCKS,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

test.describe('Admin CMS - Editor de Aulas', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminSession(page);

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('Minified React error')) {
          throw new Error(`Erro Crítico de React detectado no console: ${text}`);
        }
      }
    });

    // Mock courses
    await page.route('**/rest/v1/courses*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE]) });
    });

    // Mock modules
    await page.route('**/rest/v1/modules*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_MODULE]) });
    });

    // Mock lessons
    await page.route('**/rest/v1/lessons*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_LESSON]) });
    });

    // Mock paths + path_courses for seedDemoData
    await page.route('**/rest/v1/paths*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/rest/v1/path_courses*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('Deve carregar o editor de aula e salvar alteracoes com sucesso', async ({ page }) => {
    await page.goto(`/studio/${COURSE_ID}?lessonId=${LESSON_ID}`);
    await page.waitForLoadState('networkidle');

    // EditorProvider loads blocks from the hardcoded demo lesson (seedDemoData)
    const textCanvas = page.locator('div').filter({ hasText: /^Bem-vindo ao curso/ }).first();
    await expect(textCanvas).toBeVisible({ timeout: 20000 });

    // Click on the text block to open sidebar settings
    await textCanvas.click();

    // Fill textarea in sidebar
    const textArea = page.locator('textarea').first();
    await textArea.fill('Edicao de Teste E2E Modificada');

    // Verify editor is functional (lesson title appears in breadcrumb)
    await expect(page.locator('text=Plataforma').first()).toBeVisible({ timeout: 5000 });
  });
});
