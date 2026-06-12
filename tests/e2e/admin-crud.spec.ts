import { test, expect } from '@playwright/test';

const COURSE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const NEW_COURSE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const MODULE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const LESSON_ID = '11111111-1111-1111-1111-111111111111';

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

const MOCK_MODULES = [
  {
    id: MODULE_ID,
    course_id: COURSE_ID,
    title: 'Módulo de Teste',
    order_index: 1,
    created_at: new Date().toISOString(),
  },
];

const MOCK_LESSONS = [
  {
    id: LESSON_ID,
    module_id: MODULE_ID,
    title: 'Aula de Teste E2E',
    order_index: 1,
    is_published: true,
    blocks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

test.describe('Admin CMS - CRUD Completo', () => {
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

  test('Deve criar um novo curso via modal', async ({ page }) => {
    let createdCourse: any = null;

    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        if (createdCourse) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE, createdCourse]) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE]) });
        }
      } else if (method === 'POST') {
        const postBody = request.postDataJSON();
        createdCourse = {
          id: NEW_COURSE_ID,
          title: postBody.title,
          description: postBody.description || '',
          is_published: false,
          thumbnail_url: null,
          created_at: new Date().toISOString(),
        };
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([createdCourse]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();

    await page.locator('text=Novo curso').first().click();
    await expect(page.locator('input[placeholder="Ex: Desenvolvimento Web Full Stack"]')).toBeVisible();

    await page.locator('input[placeholder="Ex: Desenvolvimento Web Full Stack"]').fill('Curso Criado via E2E');
    await page.locator('textarea[placeholder="Descreva o curso em poucas palavras..."]').fill('Descrição criada via E2E');
    await page.getByText('Criar curso').click();

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Curso Criado via E2E')).toBeVisible();
    await expect(page.getByRole('link', { name: /Rascunho.*Curso Criado via E2E/ })).toBeVisible();
  });

  test('Deve exibir erro se título estiver vazio ao criar curso', async ({ page }) => {
    await page.route('**/rest/v1/courses*', async route => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_COURSE]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('text=Novo curso').first().click();
    await expect(page.getByText('Criar curso')).toBeDisabled();
  });

  test('Deve abrir o studio, editar configurações e salvar com sucesso', async ({ page }) => {
    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      const method = request.method();
      if (method === 'GET') {
        if (request.headers()['accept']?.includes('vnd.pgrst.object')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      } else if (method === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.route('**/rest/v1/modules*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MODULES) });
    });

    await page.route('**/rest/v1/lessons*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LESSONS) });
    });

    await page.goto(`/studio/${COURSE_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Módulo de Teste')).toBeVisible({ timeout: 15000 });

    await page.locator('text=Configurações').click();
    await expect(page.locator('text=Título do curso')).toBeVisible();

    const titleInput = page.locator('input').filter({ has: page.locator('[value="Curso de Teste E2E"]') }).first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('');
      await titleInput.fill('Curso Editado via E2E');
    }

    await page.locator('text=Salvar configurações').click();
    await expect(page.locator('text=Configurações salvas com sucesso!')).toBeVisible({ timeout: 5000 });
  });

  test('Deve criar módulo e aula dentro do studio', async ({ page }) => {
    let modules: any[] = [...MOCK_MODULES];
    let lessons: any[] = [...MOCK_LESSONS];

    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      const method = request.method();
      if (method === 'GET') {
        if (request.headers()['accept']?.includes('vnd.pgrst.object')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.route('**/rest/v1/modules*', async route => {
      const request = route.request();
      const method = request.method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(modules) });
      } else if (method === 'POST') {
        const body = request.postDataJSON();
        const newModule = { id: 'new-mod-id', ...body, created_at: new Date().toISOString() };
        modules = [...modules, newModule];
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newModule) });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.route('**/rest/v1/lessons*', async route => {
      const request = route.request();
      const method = request.method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(lessons) });
      } else if (method === 'POST') {
        const body = request.postDataJSON();
        const newLesson = { id: 'new-lesson-id', ...body, blocks: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        lessons = [...lessons, newLesson];
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newLesson) });
      } else if (method === 'DELETE') {
        const url = request.url();
        if (url.includes(`eq.${LESSON_ID}`)) {
          lessons = lessons.filter(l => l.id !== LESSON_ID);
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else if (method === 'PATCH') {
        const url = request.url();
        if (url.includes('eq.')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.goto(`/studio/${COURSE_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Módulo de Teste')).toBeVisible({ timeout: 15000 });

    await page.locator('text=Novo módulo').click();
    await page.locator('input[placeholder="Título do módulo"]').fill('Módulo E2E');
    await page.locator('text=Adicionar').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Módulo E2E')).toBeVisible({ timeout: 5000 });

    await page.locator('text=Módulo de Teste').first().locator('..').locator('..').getByText('+ Aula').click();

    await page.locator('input[placeholder="Título da aula"]').fill('Aula E2E');
    await page.locator('text=Adicionar').first().click();
    await page.waitForLoadState('networkidle');
  });

  test('Deve excluir curso do dashboard', async ({ page }) => {
    let courses = [MOCK_COURSE];

    await page.route('**/rest/v1/courses*', async route => {
      const request = route.request();
      const method = request.method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(courses) });
      } else if (method === 'DELETE') {
        courses = [];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Curso de Teste E2E')).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await page.locator('text=Excluir').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Curso de Teste E2E')).not.toBeVisible();
    await expect(page.locator('text=Nenhum curso encontrado')).toBeVisible();
  });
});
