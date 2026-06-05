# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-04)
- 🔴 **Em curso:** nenhum — fila livre, sessão concluída em 5A.5
- 🟡 **Parado:** nenhum
- ⏭️ **Próximo (decisão estratégica):** P0 "MVP Coverage & Audit" **NÃO está bloqueado** — Tier A (baseline) e Tier B (gaps) podem arrancar AGORA. P1 datados (build fix due 2026-06-10, renderer test due 2026-06-15) têm prioridade por SLA.
- ⏸️ **P1 datadas a atacar primeiro:** build fix `@tamagui/constants` (due 2026-06-10), renderer test (due 2026-06-15)

> **Fonte canónica:** `docs/BACKLOG.md` (P0/P1/P2/P3 com Status, Due, Owner).

> 🚦 **Push para origin BLOQUEADO** — apenas quando o critério de MVP for definido (ver `docs/runbooks/push-strategy.md` e entrada P0 no BACKLOG). Até lá, trabalho permanece local em `feat/cert-editor-isolation`.

## Status Atual
**Sessão de governança + pipeline de merge concluídos.** Regra 9+10 do AGENTS.md activas; DT-01..DT-04 em vigor. Branch `feat/dsv2-reform` deletada (conteúdo já em develop). Pipeline de merge Caminho C executado com sucesso. Nova secção "POLÍTICA DE BRANCHES E PIPELINE DE MERGE" formalizada em AGENTS.md.

**Sprint à parte 5A.1-5A.3 concluído em 2026-06-04.** Componentes já entregues em `feat/cert-editor-isolation` (commits `39a9957`, `1dd3854`, `0dd269b`); BACKLOG e buffer actualizados.

## 🎯 Tarefa em Execução
**5A.5 CONCLUÍDO** (código escrito, testes verdes, commit `9f2a0ba`).
EditorContext contract fixado com 6 testes (reducer puro, sem React, sem jsdom overhead):
- 2 contract tests (UNDO no-op em historyIndex 0; UNDO após ADD_BLOCK reverte)
- 1 contract test (REMOVE_BLOCK limpa activeBlockId + selectedBlockIds)
- 1 bug-hunt (ADD_BLOCK tipo desconhecido → fallback quiz)
- 1 bug-hunt (ADD_BLOCK injecta styles.side do activeSide)
- 1 bug-hunt (UPDATE_BLOCK cresce history em exactamente 1)
- Refactor mínimo: export de `EditorState`, `EditorAction`, `initialState`, `editorReducer` (necessário para teste directo)
- 2 refactors do BACKLOG desbloqueados: "Eliminar prop mode" e "Limpar 3 branches de init"
- Bugs reais do Provider (auto-save timer 2s, entityId vazio) ficam para o P0 (testes de integração com render real)

**5A.4 CONCLUÍDO** (commit `043d601`):
EditorCanvas agora é **lesson-only** — 13 branches `isCertMode` removidas, `CertificateBlockRenderer`/`Button` removidos, `isBg` dead code removido. Boundary test estático (4 testes) alinha com `CertificateEditor.boundary.test.ts`.

**Sub-itens 5A.1-5A.3 concluídos** (ver Status Atual e BACKLOG).

**Próxima direcção estratégica (acordada):** 5A.5 → telas/links pendentes → P0 "MVP Coverage & Audit" (vivo, tiered, com sister P0 para scalability).

## 🌿 Estado de Branches (2026-06-04)
- `feat/cert-editor-isolation` (HEAD `9c36a4d`) — sincronizada com develop, **5A.4/5A.5 commitados**
- `develop` (`c166872`) — contém merge de `feat/dnd-e2e-coverage` via `--no-ff`
- `feat/dnd-e2e-coverage` (`f0f928e`) — preservada, conteúdo já em develop
- `feat/dsv2-reform` — **deletada** (0 commits únicos vs develop, risco zero). Recriar quando houver item P0/P1 do DSv2.
- `main` (`43ae09b`) — inalterada, synced com origin

## 🛠️ Alterações desta sessão (2026-06-04)
- `docs/AGENTS.md`: + secção "POLÍTICA DE BRANCHES E PIPELINE DE MERGE" (4 subsecções: branches canónicas, refactor de longa duração, Caminho C, branch estratégica `feat/dsv2-reform`)
- `docs/roadmaps/design-system-reforma.md`: + cross-reference à política de branches (obrigatoriedade de `feat/dsv2-reform`)
- `docs/runbooks/merge-dnd-to-develop.md` (NOVO em `f0f928e`): runbook do Caminho C
- `feat/dsv2-reform` — branch local deletada
- Merge `feat/dnd-e2e-coverage` → `develop` (commit `c166872`), fast-forward de `feat/cert-editor-isolation` para `c166872`
- **Troca do modelo padrão:** `opencode.json`, `docs/AGENTS.md` (secção 🧬 MODELO PREFERIDO) e `.opencode/agents/document-loader.md` — `deepseek-v4-flash-free` → `minimax-m3-free` (commit `7e244eb`).
- **Orquestração 3-fases no opencode.json** (side-quest tooling, **commit `e5e33ea`**): `plan`/`build`/`review` com 3 modelos (minimax / deepseek / minimax). `default_agent: "plan"`. Removidos dead config `agent.inference` e `agent.profile`. 4/4 `jq` validations passam. **Requer restart manual do opencode** (config não é hot-reloaded).
- **5A.4 — EditorCanvas lesson-only cleanup:** `EditorCanvas.tsx` (13 branches `isCertMode` removidas, import de `CertificateBlockRenderer`/`Button` removidos, `isBg` dead code removido, `PreviewCanvas` reescrita sem `mode`/`certDesign*`, destructure de `useEditor` sem campos cert) + novo `EditorCanvas.boundary.test.ts` (4 testes estáticos do contract, commit `043d601`).
- **5A.5 — EditorContext contract tests:** `EditorContext.tsx` (export de `EditorState`/`EditorAction`/`initialState`/`editorReducer` para testabilidade) + novo `EditorContext.test.tsx` (6 testes do reducer puro: 3 contract + 3 bug-hunt, commit `9f2a0ba`). 88/88 admin tests passam.

## ✅ Validação opencode.json 3-fases (2026-06-04)
- `jq '.default_agent'` → `"plan"` ✓
- `jq '.agent | keys'` → `["build","document-loader","plan","review"]` ✓
- `jq '.agent.build.model'` → `"opencode/deepseek-v4-flash-free"` ✓
- `jq '.agent.review.permission.edit'` → `"deny"` ✓
- `jq '.agent.review.model'` → `"opencode/minimax-m3-free"` ✓
- `jq '.agent.plan.model'` → `"opencode/minimax-m3-free"` ✓
- Bash rules do `review`: 9 padrões `allow` + `*: ask` (inserção ordenada) ✓
- **Post-commit diagnostic (regra 7):** `test:env-vars` OK · `pnpm ls zod` resolved · `pnpm ls @supabase/supabase-js` resolved · `verify:ui` 5/5 OK
- **Aguarda restart manual do opencode** (config não é hot-reloaded — `customize-opencode` skill).

## ✅ Validação pós-merge
- Working tree limpo
- Tests admin: 78/78 passam (5.81s)
- Build: ❌ `@tamagui/constants` não-hoisted (registrado como P1, due 2026-06-10)
- Lint: 143 erros `@typescript-eslint/no-explicit-any` em arquivos NOVOS do merge (dívida pré-existente em `feat/dnd-e2e-coverage`)
- Renderer test: 1 falha pré-existente em `BlockRenderer.test.tsx` (P1, due 2026-06-15)

## ✅ Validação 5A.4 (2026-06-04)
- TDD: 4/4 boundary RED → 4/4 GREEN, 4/4 regression GREEN
- Admin tests: 82/82 passam (4.83s) — inclui 4 boundary + 4 EditorCanvas + 7 CertificateEditor.boundary + 42 CertificateCanvas + 8 CertificatePalette + 11 upload + 4 page + 1 supabase-coupling + 1 health
- UI tests: 57/57 passam (7.38s) — sem regressão
- Renderer tests: 3/3 testes passam (1 ficheiro pré-existente com erro de parse, **não-regressão**: confirmado via `git stash`)
- `verify:ui`: 5/5 regras OK (NO_LUCIDE, NO_STYLESHEET, NO_HTML_TAGS, NO_HARDCODED_COLORS)
- `test:env-vars`: OK
- `test:react-consistency`: OK
- Working tree: 1 modified (`EditorCanvas.tsx`) + 1 untracked (`EditorCanvas.boundary.test.ts`)

## ✅ Validação 5A.5 (2026-06-04)
- TDD: 6/6 testes pass-through (contract fixado sem RED visível — lógica trivial já implementada)
- Admin tests: 88/88 passam (5.45s) — inclui 6 EditorContext + 82 anteriores
- UI tests: 57/57 passam — sem regressão
- Refactor mínimo: 4 symbols exportados em EditorContext.tsx (não-breaking)
- Working tree: 1 modified (`EditorContext.tsx`) + 1 untracked (`EditorContext.test.tsx`)

## 📌 Próximos Passos
- ~~**5A.7 (PENDENTE G-01):** `git add` + `git commit` das alterações 5A.5 (1 modified + 1 untracked)~~ — resolvido pelo commit `9f2a0ba`
- **telas/links pendentes** (próxima fase de trabalho, items P0/P1 do BACKLOG)
- **P0 "MVP Coverage & Audit"** (a construir DEPOIS das telas/links, para evitar refactor)
- P1 paralelas: build fix (due 2026-06-10), renderer test (due 2026-06-15)
- Executar ritual de fim de sessão conforme AGENTS.md regra 10 e `session-template.md`
