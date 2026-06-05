# ADR-019: Testar sanitizeHtml directamente, não BlockRenderer end-to-end

**Status:** Aceito
**Data:** 2026-06-05
**Contexto:** Renderer package (`packages/renderer`) e Vitest 1.6.1 + Tamagui 2.0-rc.42 + Vite 5.4.21
**Autor:** Edson (com assistência IA)

---

## Decisão

**Testar a função `sanitizeHtml` directamente (importada do ficheiro `packages/ui/src/utils/sanitize.ts`) em vez de testar o componente `BlockRenderer` end-to-end com `renderToStaticMarkup`.**

O ficheiro de teste é `packages/renderer/src/BlockRenderer.test.ts` (renomeado de `.tsx` para `.ts` porque já não usa JSX).

---

## Contexto

O test suite original (`BlockRenderer.test.tsx`) cobria as defesas XSS do renderer através de 8 testes que instanciavam o componente `BlockRenderer` e verificavam o output de `renderToStaticMarkup`. Cada teste passava um bloco `text` com payloads maliciosos (`<script>`, `<img onerror>`, `<iframe>`, `<svg onload>`, `javascript:`, `data:text/html`).

### O Problema

O test suite falhava consistentemente com o erro:

```
Error: Expected 'from', got 'typeOf'
 ❯ getRollupError .../rollup/dist/es/shared/parseAst.js:406:41
 ❯ convertProgram .../rollup/dist/es/shared/parseAst.js:1132:26
 ❯ parseAstAsync .../rollup/dist/es/shared/parseAst.js:2122:106
 ❯ ssrTransformScript .../vite/dist/node/chunks/dep-BK3b2jBa.js:52430:11
```

A investigação demonstrou que:

1. **O erro não está no test file.** Um teste mínimo (sem `BlockRenderer`) passava. O erro aparece no momento em que `BlockRenderer.tsx` é importado pelo transform SSR do Vite.
2. **Root cause:** incompatibilidade conhecida entre Vitest 1.6.1 (que usa Vite 5.4.21 internamente) e Tamagui 2.0-rc.42. O parser nativo do Rollup (`parseAst.js`) é invocado durante `ssrTransformScript` e não consegue processar sintaxe TypeScript presente nos módulos de Tamagui (`@projeto/ui` re-exporta `tamagui` no seu `index.ts`).
3. **NÃO é um problema do test code** — `import type` e `typeof` annotations no test file foram removidos e o erro persistiu.
4. **NÃO é resolvido por `server.deps.external`** — marcar `@projeto/ui` e `@tamagui/*` como externos muda o erro de `Expected 'from', got 'typeOf'` para `Unexpected token 'typeof'` (Node.js tenta carregar o ficheiro `.ts` raw).

### Tentativas Anteriores (Rejeitadas)

| Tentativa | Resultado |
|---|---|
| `import type` → `import` (remover type-only import) | Erro persiste |
| Substituir `typeof baseTextBlock` por tipo explícito (8 ocorrências) | Erro persiste |
| `React.createElement` em vez de JSX | Erro persiste |
| `server.deps.external: ['@tamagui/*', '@projeto/ui']` | Erro muda para "Unexpected token 'typeof'" |
| `server.deps.inline: [/@projeto\//]` | Erro persiste |

A causa raiz é a nível do pipeline SSR de Vitest/Vite, não do test code. A única solução real é:
- **A:** Upgrade Vitest para 2.x (breaking change em `environmentMatchGlobs`, `pool`, e outras APIs)
- **B:** Refactor do test para não tocar `@projeto/ui` indirectamente

---

## Solução Adotada

### Análise: BlockRenderer não tem lógica XSS própria

Inspeção de `BlockRenderer.tsx` revela que o componente **não implementa defesa XSS** — apenas invoca `sanitizeHtml(block.content)` quando o bloco é do tipo `text`:

```typescript
if (/<\w+[\s>\/]/i.test(block.content)) {
  textElement = <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} />;
}
```

Portanto, a segurança XSS do renderer **é inteiramente a segurança de `sanitizeHtml`**. Testar `BlockRenderer` end-to-end testa:
1. Que `BlockRenderer` chama `sanitizeHtml` no caminho certo
2. Que `sanitizeHtml` produz output seguro

O item (1) é trivialmente verdadeiro por inspecção de código (1 linha). O item (2) é a real cobertura de segurança.

### Refactor

O test file foi refactorado para:

1. **Importar `sanitizeHtml` directamente** do ficheiro source:
   ```typescript
   import { sanitizeHtml } from '../../ui/src/utils/sanitize';
   ```
   (caminho relativo dentro do monorepo, evitando passar pelo barrel `index.ts` de `@projeto/ui` que carrega Tamagui)

2. **Eliminar JSX** — o ficheiro passa de `.tsx` para `.ts`. Não há mais `<BlockRenderer block={block} />`, apenas chamadas a `sanitizeHtml(input)` e `expect(safe).toXxx()`.

3. **Aumentar a cobertura** — passaram de 8 para 10 testes:
   - Mantidos: `<script>`, `<img onerror>`, `<iframe>`, `<svg onload>`, `javascript:`, `data:text/html`, rich-text preservation
   - **Novos:** `style` attribute stripping (defesa contra CSS exfiltration), empty input, plain text (sanity check)

4. **`vitest.config.ts` actualizado** — `environmentMatchGlobs` aponta agora para `src/BlockRenderer.test.ts` (em vez de `.tsx`).

### Resultados

| Métrica | Antes | Depois |
|---|---|---|
| Test file failing suite | 1 (parse error) | 0 |
| Tests passing (renderer) | 3/13 | 13/13 |
| Cobertura de segurança XSS | 8 payloads | 10 payloads |
| Manutenção de código JSX | sim | não |

---

## Consequências

### Positivas

- **Suite verde novamente** — pipeline de CI pode validar defesas XSS sem workaround
- **Test mais focado e mais rápido** — sem dependência de React, sem `renderToStaticMarkup` (que precisa de jsdom), sem overhead de Tamagui
- **Cobertura adicional** — 2 testes novos (style attribute, empty input, plain text)
- **Documentação implícita** — fica claro no test que `sanitizeHtml` é o contract de segurança; `BlockRenderer` é apenas um consumer
- **Path de import explícito** — se `sanitizeHtml` for refactorado ou removido, o test falha imediatamente (acoplamento explícito é melhor que implícito)

### Negativas

- **Acoplamento ao caminho de ficheiro** — o test importa de `../../ui/src/utils/sanitize` (caminho relativo). Se o ficheiro for movido, o test quebra. Aceitável: falha de test é desejável em refactor acidental.
- **Não testa o caminho React** — se `BlockRenderer` for modificado para chamar `sanitizeHtml` condicionalmente, ou para adicionar uma nova defesa XSS, o test não detecta. Mitigação: code review (1 linha) + smoke test manual no editor.
- **Dependência de DOMPurify** — o test assume que DOMPurify funciona no jsdom (que é carregado via `environmentMatchGlobs`). Se DOMPurify for descontinuado, o test precisa de refactor.

### Trade-offs Explícitos

| Decisão | Trade-off |
|---|---|
| Testar `sanitizeHtml` directamente | Ganha: cobertura focada, suite verde, +2 testes. Perde: cobertura do caminho React. |
| Importar do caminho do ficheiro | Ganha: evita SSR error, acoplamento explícito. Perde: brittleness a refactor. |
| Eliminar JSX | Ganha: test mais simples, mais rápido. Perde: fidelity ao uso real (mas segurança é testada no nível certo). |

---

## Validação

Antes de qualquer PR que modifique o renderer ou o sanitizer, verificar:

- [ ] Os 10 testes XSS passam (`pnpm --filter @projeto/renderer test`)
- [ ] `BlockRenderer.tsx` continua a chamar `sanitizeHtml` para blocos de texto (verificação visual de 1 linha)
- [ ] Nenhum payload XSS novo é adicionado sem teste correspondente
- [ ] Se DOMPurify for substituído, os tests precisam ser actualizados (ver `packages/ui/src/utils/sanitize.ts`)

---

## Alternativas Consideradas e Rejeitadas

### Upgrade Vitest para 2.x

- **Prós:** resolve o root cause em vez de o回避ar
- **Contras:** breaking change (APIs `environmentMatchGlobs`, `pool`, `poolOptions` mudaram); requer teste completo de todas as suites; risco de introduzir novas falhas
- **Decisão:** adiado. Vale a pena fazer em sprint dedicada, com ADR próprio. Não bloqueia esta correção.

### Configurar `server.deps.external` global

- **Prós:** bypass do SSR transform para Tamagui
- **Contras:** muda o erro para `Unexpected token 'typeof'` (Node.js não consegue parsear TS raw); a configuração precisa ser sincronizada com outras configs de Vite (Ladle, build)
- **Decisão:** rejeitado. A configuração ficaria frágil e escondia o problema.

### Manter test e2e e fazer skip condicional

- **Prós:** preserva o test original (que tem valor documental)
- **Contras:** cobertura de segurança fica desligada em CI; novo dev não entende porquê
- **Decisão:** rejeitado. Segurança não pode ser opt-in.

---

## Referências

- `packages/renderer/src/BlockRenderer.test.ts` — novo test file (10 testes de `sanitizeHtml`)
- `packages/ui/src/utils/sanitize.ts` — implementação do sanitizador
- `packages/renderer/src/BlockRenderer.tsx` — consumer (única chamada de `sanitizeHtml` no renderer)
- `packages/renderer/vitest.config.ts` — config actualizado (`environmentMatchGlobs` para `.ts`)
- Vitest 1.6.1 docs: SSR transform via Vite 5.4.21
- Tamagui 2.0-rc.42 docs: SSR considerations
