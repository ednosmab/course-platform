# E2E Testing with Playwright

> Como correr e desenvolver testes E2E neste monorepo. Cobre a flag
> `E2E_BYPASS_AUTH`, mocks de Supabase Auth, e a whitelist de env vars
> de teste.

## Stack

- **Playwright** (v1.60) — runner + browser automation
- **Testes em:** `tests/e2e/*.spec.ts`
- **Project split:** `playwright.config.ts` define 2 projects
  - `Admin Web - Desktop Chrome` — match `admin-*.spec.ts`, baseURL `:3000`
  - `Aluno Mobile - Web Mobile Chrome` — match `2-aluno-player.spec.ts`, baseURL `:8081`
- **Web servers** (Turbopack + Expo): arrancados pelo `playwright.config.ts` → `webServer`
- **Unit tests (vitest):** separados, vivem em `apps/admin/src/**/*.test.tsx` e
  `packages/*/src/**/*.test.ts`. NÃO são E2E.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm run test:e2e` | Corre todos os specs E2E com Playwright |
| `pnpm run test:e2e tests/e2e/admin-image-drop.spec.ts` | Corre um spec isolado |
| `pnpm exec playwright test --list` | Lista todos os testes sem executar |
| `pnpm run test:e2e:debug` | Headed mode com Playwright Inspector |

## A flag `E2E_BYPASS_AUTH`

### O que é

Define `E2E_BYPASS_AUTH=1` no `webServer.env` do Playwright. Quando o
middleware `apps/admin/src/middleware.ts` vê esta var, pula a chamada
`supabase.auth.getUser()` e deixa o request passar.

### Porquê existe

O `getUser()` é server-side (Edge Runtime do Next.js) e portanto não
pode ser mockado com `page.route` (que só intercepta requests do
browser). Sem o bypass, todos os testes que acedem a `/studio/...`
seriam redirecionados para `/login?redirect=...`.

### Whitelist

A flag SÓ pode aparecer em `playwright.config.ts` → `webServer.env`. É
**proibido** setá-la em:
- `.env*` committed ao repo
- `next.config.*` (admin ou student)
- `vercel.json`, `wrangler.toml`, `netlify.toml` ou qualquer config de deploy
- Secrets de GitHub Actions
- Documentação como "exemplo de uso"

### Como o safeguard funciona

`scripts/check-test-env-vars.sh` corre em:
- `pnpm run verify` (gate local)
- `.github/workflows/ci.yml` (gate antes de build/test)
- `.github/workflows/cd.yml` (gate antes do merge develop→main)

Se a flag aparecer em qualquer dos locais proibidos, o script falha
com exit code 1 e o teste/deploy é bloqueado.

## Padrão de mock Supabase Auth

```ts
// tests/e2e/utils/auth.ts (ou inline)
await page.route('**/auth/v1/token*', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 200, body: JSON.stringify({...}) });
  } else {
    await route.fulfill({ status: 405 });
  }
});
```

**Atenção:** este mock só intercepta chamadas do **browser**. As chamadas
server-side do middleware são bypassadas pela flag `E2E_BYPASS_AUTH`.
Sem a flag, o middleware vê um token fake e rejeita.

## Padrão de mock Supabase REST

```ts
await page.route('**/rest/v1/courses*', async (route) => {
  const r = route.request();
  if (r.method() === 'GET' && r.headers()['accept']?.includes('vnd.pgrst.object')) {
    await route.fulfill({ status: 200, body: JSON.stringify(MOCK_COURSE) });
  } else {
    await route.fulfill({ status: 200, body: JSON.stringify([MOCK_COURSE]) });
  }
});
```

O `accept: application/vnd.pgrst.object+json` indica pedido de objecto
único (Supabase PostgREST). Sem ele, devolve array.

## Anatomia de um spec

```ts
import { test, expect, Page, Route } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

const COURSE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test.describe('Feature X', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('Minified React error')) {
          throw new Error(`React error: ${text}`);
        }
      }
    });
  });

  test('happy path', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/studio/${COURSE_ID}`);
    await expect(page.locator('text=...')).toBeVisible();
  });
});
```

## Drag-and-drop de imagem em testes

`packages/ui/src/components/Certificate/CertificateBlockRenderer.tsx` e
`apps/admin/src/components/editor/EditorCanvas.tsx` ambos aceitam
`onDrop` com `DataTransfer`. Em Playwright, simula-se assim:

```ts
async function dropImageOnto(page: Page, selector: string, filename: string) {
  const dataUrl = 'data:image/png;base64,...';
  await page.evaluate(({ selector, dataUrl, filename }) => {
    const target = document.querySelector(selector);
    if (!target) throw new Error(`Target not found: ${selector}`);
    const file = new File(
      [Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0))],
      filename,
      { type: 'image/png' }
    );
    const dt = new DataTransfer();
    dt.items.add(file);
    target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { selector, dataUrl, filename });
}
```

O `data-block-id` attribute está em todos os outer divs de bloco
(desktop + mobile/tablet) para servir de selector estável.

## Visual regression (snapshots)

`playwright.config.ts` define `snapshotDir: './tests/e2e/snapshots'`.
Specs que usam `toHaveScreenshot()` criam baselines aí. CI gera diff
visual; PR que mude baseline tem de actualizar com `playwright test --update-snapshots`.

## Solução de problemas

| Sintoma | Causa provável | Fix |
|---|---|---|
| Redirect para `/login?redirect=...` | `E2E_BYPASS_AUTH` não está no `webServer.env` | Verificar `playwright.config.ts` |
| `getByRole('button', { name: 'Entrar' })` timeout | Button do Tamagui é `<div role="button">` | Usar `getByRole` (não `locator('button')`) |
| Inputs vazios após `fill()` | Página em `<Suspense>` ainda não hidratou | Adicionar `await page.waitForLoadState('networkidle')` |
| Test flakey no primeiro run | Dev server ainda a aquecer | `playwright.config.ts` → `webServer.timeout` |

## Referências

- [`docs/AGENTS.md`](../AGENTS.md) §Arquitetura — regra ENV-01
- [`docs/FORBIDDEN_OPERATIONS.md`](../FORBIDDEN_OPERATIONS.md) §7 — ENV-01
- `apps/admin/src/middleware.ts` — local da flag bypass
- `playwright.config.ts` — única whitelist da flag
- `scripts/check-test-env-vars.sh` — guardrail automatizado
