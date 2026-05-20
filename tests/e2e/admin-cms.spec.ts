import { test, expect } from '@playwright/test';

// Constante com os blocos simulados para não sujar o banco de dados
const MOCK_BLOCKS = [
  {
    id: 'block-text-1',
    type: 'text',
    content: 'Teste E2E Automatizado',
    styles: { align: 'left', fontSize: 'medium' }
  }
];

test.describe('Admin CMS - Editor de Aulas', () => {
  // Configura os interceptadores de rede ANTES de cada teste
  test.beforeEach(async ({ page }) => {
    // Escutar por erros severos no console (Previne o erro de Hydration do Next.js)
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Não falhar por erros de rede intencionais, mas falhar por Hydration Mismatch
        if (text.includes('Hydration') || text.includes('Minified React error')) {
          throw new Error(`Erro Crítico de React detectado no console: ${text}`);
        }
      }
    });

    // Mock das requisições para a tabela 'lessons' do Supabase
    await page.route('**/rest/v1/lessons*', async route => {
      const request = route.request();
      const method = request.method();

      // Mock da requisição GET (Carga Inicial)
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '11111111-1111-1111-1111-111111111111',
              module_id: '00000000-0000-0000-0000-000000000000',
              title: 'Aula de Teste E2E',
              order_index: 1,
              is_published: true,
              blocks: MOCK_BLOCKS
            }
          ])
        });
      }
      // Mock das requisições de Salvamento (POST para Upsert)
      else if (method === 'POST' || method === 'PATCH') {
        await route.fulfill({
          status: 200, // Simula sucesso absoluto para evitar o erro PGRST116 silencioso
          contentType: 'application/json',
          body: JSON.stringify([]) 
        });
      } else {
        await route.continue();
      }
    });
  });

  test('Deve carregar o CMS sem erros de hidratação e salvar alterações com sucesso (Upsert Seguro)', async ({ page }) => {
    // Abre a página do CMS
    await page.goto('/');

    // 1. Validar que o bloco de texto mockado foi carregado na tela no canvas
    const textCanvas = page.locator('div').filter({ hasText: /^Teste E2E Automatizado$/ }).first();
    await expect(textCanvas).toBeVisible();

    // 2. Simular interação com o editor clicando no bloco no canvas para abri-lo no sidebar
    await textCanvas.click();
    
    // Agora preenchemos o textarea que aparece no sidebar de configurações
    const textArea = page.locator('textarea').first();
    await textArea.fill('Edição de Teste E2E Modificada');

    // 3. Validar a transição de estado no Header do CMS
    // Deve mostrar "Salvando alterações..."
    const savingIndicator = page.locator('text=Salvando alterações...');
    await expect(savingIndicator).toBeVisible({ timeout: 2000 }); // O debounce é de 1.5s

    // Deve transitar para "Salvo com sucesso!" indicando que o mock do upsert funcionou
    const savedIndicator = page.locator('text=Salvo com sucesso!');
    await expect(savedIndicator).toBeVisible({ timeout: 3000 });
  });
});
