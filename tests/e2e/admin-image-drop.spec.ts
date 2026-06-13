import { test, expect, Page, Route } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

const COURSE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const MODULE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const LESSON_ID = '11111111-1111-1111-1111-111111111111';

const IMAGE_BLOCK_ID = 'image-block-1';

const MOCK_BLOCKS = [
  {
    id: IMAGE_BLOCK_ID,
    type: 'image',
    url: null,
    alt: '',
    styles: { objectFit: 'contain' },
    layouts: { desktop: { x: 0, y: 0, w: 320, h: 240 } },
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

/**
 * Dispatches a synthetic `drop` event on a target element with a real
 * `File` payload (built from base64) attached to the DataTransfer.
 * The DataURL is read by the editor's `FileReader` and stored on
 * `block.url`, so we assert against the rendered `<img>` afterwards.
 */
async function dropImageOnto(page: Page, selector: string, filename: string) {
  const dataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAEUlEQVR42mNk+M9QzwAEjDAGABCfAwGfaD+xAAAAAElFTkSuQmCC';

  await page.evaluate(
    ({ selector, dataUrl, filename }) => {
      const target = document.querySelector(selector);
      if (!target) throw new Error(`Target not found: ${selector}`);

      const file = new File([Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0))], filename, {
        type: 'image/png',
      });
      const dt = new DataTransfer();
      dt.items.add(file);

      const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
      target.dispatchEvent(event);
    },
    { selector, dataUrl, filename }
  );
}

/**
 * Mounts the lesson editor using the demo lesson (which always loads via
 * the hardcoded path in editor-modes.ts). After the demo blocks load,
 * we add an image block via the palette so we have a target for the drop test.
 */
async function mountLessonEditor(page: Page) {
  await loginAsAdmin(page);

  await page.route('**/rest/v1/courses*', async (route: Route) => {
    const accept = route.request().headers()['accept'] || '';
    if (accept.includes('vnd.pgrst.object')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE]) });
    }
  });

  await page.route('**/rest/v1/modules*', async (route: Route) => {
    const accept = route.request().headers()['accept'] || '';
    if (accept.includes('vnd.pgrst.object')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MODULE) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_MODULE]) });
    }
  });

  await page.route('**/rest/v1/lessons*', async (route: Route) => {
    const accept = route.request().headers()['accept'] || '';
    if (accept.includes('vnd.pgrst.object')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LESSON) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_LESSON]) });
    }
  });

  await page.route('**/rest/v1/lesson_blocks*', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  // Mock paths + path_courses + path_lessons for seedDemoData
  await page.route('**/rest/v1/paths*', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/path_courses*', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route('**/rest/v1/path_lessons*', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  // Navigate to the demo lesson (hardcoded ID triggers demo path in editor-modes.ts)
  const DEMO_LESSON_ID = '11111111-1111-1111-1111-111111111111';
  await page.goto(`/studio/${COURSE_ID}?lessonId=${DEMO_LESSON_ID}`);
  // Wait for the editor canvas to appear (demo blocks: text, video, quiz)
  await expect(page.locator('text=Bem-vindo ao curso').first()).toBeVisible({ timeout: 20000 });

  // Click "Adicionar bloco Imagem" from the palette to create a new image block
  // Note: BlockBtn uses Tamagui YStack with role="button", not a <button> element
  await page.locator('[role="button"][aria-label="Adicionar bloco Imagem"]').click();
  // The new image block should show "Arraste uma imagem aqui"
  await expect(page.locator('text=Arraste uma imagem aqui').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Admin Image Drop - Lesson Editor (SDR-001 + dnd-e2e)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('Minified React error')) {
          throw new Error(`Erro Crítico de React detectado no console: ${text}`);
        }
      }
    });
  });

  test('desktop: drop em image block atualiza o src do <img>', async ({ page }) => {
    await mountLessonEditor(page);

    // Find the image block dynamically (added via palette, random ID)
    const imageBlockId = await page.evaluate(() => {
      const blocks = document.querySelectorAll('[data-block-id]');
      for (const block of blocks) {
        if (block.textContent?.includes('Arraste uma imagem aqui')) {
          return block.getAttribute('data-block-id');
        }
      }
      return null;
    });
    expect(imageBlockId).toBeTruthy();
    const outerSelector = `[data-block-id="${imageBlockId}"]`;

    await dropImageOnto(page, outerSelector, 'test-image.png');
    await expect(page.locator(`${outerSelector} img`).first()).toHaveAttribute('src', /^data:image\/png/);
  });

  test('tablet: drop em image block atualiza o src do <img>', async ({ page }) => {
    await mountLessonEditor(page);

    await page.locator('[data-testid="viewport-tablet"]').click();

    const imageBlockId = await page.evaluate(() => {
      const blocks = document.querySelectorAll('[data-block-id]');
      for (const block of blocks) {
        if (block.textContent?.includes('Arraste uma imagem aqui')) {
          return block.getAttribute('data-block-id');
        }
      }
      return null;
    });
    expect(imageBlockId).toBeTruthy();
    const outerSelector = `[data-block-id="${imageBlockId}"]`;

    await dropImageOnto(page, outerSelector, 'test-image.png');
    await expect(page.locator(`${outerSelector} img`).first()).toHaveAttribute('src', /^data:image\/png/);
  });

  test('mobile: drop em image block atualiza o src do <img>', async ({ page }) => {
    await mountLessonEditor(page);

    await page.locator('[data-testid="viewport-mobile"]').click();

    const imageBlockId = await page.evaluate(() => {
      const blocks = document.querySelectorAll('[data-block-id]');
      for (const block of blocks) {
        if (block.textContent?.includes('Arraste uma imagem aqui')) {
          return block.getAttribute('data-block-id');
        }
      }
      return null;
    });
    expect(imageBlockId).toBeTruthy();
    const outerSelector = `[data-block-id="${imageBlockId}"]`;

    await dropImageOnto(page, outerSelector, 'test-image.png');
    await expect(page.locator(`${outerSelector} img`).first()).toHaveAttribute('src', /^data:image\/png/);
  });
});
