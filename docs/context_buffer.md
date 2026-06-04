# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-04)
- 🔴 **Em curso:** 5A.5 — EditorContext testes (3 testes, ~45min)
- 🟡 **Parado:** 5A.1 → 5A.2 → 5A.3 (sprint à parte) [REVISIT: 2026-06-25]
- ⏭️ **Próximo:** 5A.6 — `git add` + commit 5A.4 (pendente autorização G-01)
- ⏸️ **Bloqueado / P1 paralelas:** build fix `@tamagui/constants` (due 2026-06-10), renderer test (due 2026-06-15)

> **Fonte canónica:** `docs/BACKLOG.md` (P0/P1/P2/P3 com Status, Due, Owner).

> 🚦 **Push para origin BLOQUEADO** — apenas quando o critério de MVP for definido (ver `docs/runbooks/push-strategy.md` e entrada P0 no BACKLOG). Até lá, trabalho permanece local em `feat/cert-editor-isolation`.

## Status Atual
**Sessão de governança + pipeline de merge concluídos.** Regra 9+10 do AGENTS.md activas; DT-01..DT-04 em vigor. Branch `feat/dsv2-reform` deletada (conteúdo já em develop). Pipeline de merge Caminho C executado com sucesso. Nova secção "POLÍTICA DE BRANCHES E PIPELINE DE MERGE" formalizada em AGENTS.md.

## 🎯 Tarefa em Execução
**Side-quest (tooling):** Reescrita de `opencode.json` para orquestração 3-fases de modelos.
- `plan` (built-in) → `opencode/minimax-m3-free` (Planner)
- `build` (built-in) → `opencode/deepseek-v4-flash-free` (Executor)
- `review` (NOVO primary) → `opencode/minimax-m3-free` (Reviewer, `edit:deny` + bash agressivo)
- `default_agent: "plan"` (Planner-first)
- Dead config removido: `agent.inference` e `agent.profile` (não reconhecidos pelo schema oficial)
- Sem `git commit` (G-01). Aguarda restart manual do opencode para carregar o novo config.

> Item BACKLOG em curso **inalterado**: 5A.4 (pendente commit G-01) e 5A.5 (próximo).

**5A.4 CONCLUÍDO** (código escrito, testes verdes, **pendente commit/G-01**).
EditorCanvas agora é **lesson-only**:
- 13 branches `isCertMode` removidas
- `PreviewCanvas` e o render principal já não conhecem `mode`/`certDesign*`/`certIsDoubleSided`
- `CertificateBlockRenderer` removido dos imports do EditorCanvas
- `Button` removido dos imports (era só usado no toggle double-sided)
- Variável `isBg` (cert-only) removida — dead code
- Novo ficheiro: `EditorCanvas.boundary.test.ts` (4 testes) — alinha com `CertificateEditor.boundary.test.ts` (7 testes, já existente)
- TDD estrito: RED (4 falhas) → GREEN (4/4 boundary + 4/4 regression passam) → REFACTOR (limpeza de imports e dead code)

**Sub-itens 5A.1-5A.3 rebaixados** para sprint à parte [REVISIT: 2026-06-25].

## 🌿 Estado de Branches (2026-06-04)
- `feat/cert-editor-isolation` (HEAD `7e244eb`) — sincronizada com develop, **5A.4 código pronto, pendente commit**
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
- **Troca do modelo padrão:** `opencode.json`, `docs/AGENTS.md` (secção 🧬 MODELO PREFERIDO) e `.opencode/agents/document-loader.md` — `deepseek-v4-flash-free` → `minimax-m3-free`. Pendente commit (G-01).
- **Orquestração 3-fases no opencode.json** (side-quest tooling, sem commit G-01): `plan`/`build`/`review` com 3 modelos (minimax / deepseek / minimax). `default_agent: "plan"`. Removidos dead config `agent.inference` e `agent.profile`. 4/4 `jq` validations passam. Working tree: +1 modified (`opencode.json`, 28+/6-). **Requer restart manual do opencode** (config não é hot-reloaded).
- **5A.4 — EditorCanvas lesson-only cleanup:** `EditorCanvas.tsx` (13 branches `isCertMode` removidas, import de `CertificateBlockRenderer`/`Button` removidos, `isBg` dead code removido, `PreviewCanvas` reescrita sem `mode`/`certDesign*`, destructure de `useEditor` sem campos cert) + novo `EditorCanvas.boundary.test.ts` (4 testes estáticos do contract). Pendente commit (G-01).

## ✅ Validação opencode.json 3-fases (2026-06-04)
- `jq '.default_agent'` → `"plan"` ✓
- `jq '.agent | keys'` → `["build","document-loader","plan","review"]` ✓
- `jq '.agent.build.model'` → `"opencode/deepseek-v4-flash-free"` ✓
- `jq '.agent.review.permission.edit'` → `"deny"` ✓
- `jq '.agent.review.model'` → `"opencode/minimax-m3-free"` ✓
- `jq '.agent.plan.model'` → `"opencode/minimax-m3-free"` ✓
- Bash rules do `review`: 9 padrões `allow` + `*: ask` (inserção ordenada) ✓
- Working tree: 1 modified (`opencode.json`, +28/-6)
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

## 📌 Próximos Passos
- **5A.6 (PENDENTE G-01):** `git add` + `git commit` das alterações 5A.4 (1 modified + 1 untracked)
- **5A.5:** EditorContext testes mínimos (3 testes, ~45min)
- Sprint à parte [REVISIT: 2026-06-25]: 5A.1 → 5A.2 → 5A.3
- P1 paralelas: build fix (due 2026-06-10), renderer test (due 2026-06-15)
- P1 paralelas: build fix (due 2026-06-10), renderer test (due 2026-06-15)
- Executar ritual de fim de sessão conforme AGENTS.md regra 10 e `session-template.md`
