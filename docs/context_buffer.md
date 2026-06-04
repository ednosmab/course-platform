# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-04)
- 🔴 **Em curso:** 5A.4 — EditorCanvas cleanup (fix `EditorCanvas.tsx:1282`)
- 🟡 **Parado:** 5A.1 → 5A.2 → 5A.3 (sprint à parte) [REVISIT: 2026-06-25]
- ⏭️ **Próximo:** 5A.5 — EditorContext testes (3 testes, ~45min)
- ⏸️ **Bloqueado / P1 paralelas:** build fix `@tamagui/constants` (due 2026-06-10), renderer test (due 2026-06-15)

> **Fonte canónica:** `docs/BACKLOG.md` (P0/P1/P2/P3 com Status, Due, Owner).

> 🚦 **Push para origin BLOQUEADO** — apenas quando o critério de MVP for definido (ver `docs/runbooks/push-strategy.md` e entrada P0 no BACKLOG). Até lá, trabalho permanece local em `feat/cert-editor-isolation`.

## Status Atual
**Sessão de governança + pipeline de merge concluídos.** Regra 9+10 do AGENTS.md activas; DT-01..DT-04 em vigor. Branch `feat/dsv2-reform` deletada (conteúdo já em develop). Pipeline de merge Caminho C executado com sucesso. Nova secção "POLÍTICA DE BRANCHES E PIPELINE DE MERGE" formalizada em AGENTS.md.

## 🎯 Tarefa em Execução
**P0 activo no BACKLOG:** Fase 5A.4 — Fix do bug crítico `EditorCanvas.tsx:1282`. EditorCanvas renderiza bloco de certificado com `BlockContent` (lesson renderer) em vez de `CertificateBlockRenderer`. Acção: remover as 13 branches `isCertMode` em `EditorCanvas.tsx` (~2h).
**Sub-itens 5A.1-5A.3 rebaixados** para sprint à parte [REVISIT: 2026-06-25].

## 🌿 Estado de Branches (2026-06-04)
- `feat/cert-editor-isolation` (HEAD `0c66d62`) — sincronizada com develop, **em 5A.4**
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

## ✅ Validação pós-merge
- Working tree limpo
- Tests admin: 78/78 passam (5.81s)
- Build: ❌ `@tamagui/constants` não-hoisted (registrado como P1, due 2026-06-10)
- Lint: 143 erros `@typescript-eslint/no-explicit-any` em arquivos NOVOS do merge (dívida pré-existente em `feat/dnd-e2e-coverage`)
- Renderer test: 1 falha pré-existente em `BlockRenderer.test.tsx` (P1, due 2026-06-15)

## 📌 Próximos Passos
- **Iniciar 5A.4 (PRIORIDADE MÁXIMA)** — branch `feat/cert-editor-isolation` (HEAD `0c66d62`). TDD: RED → GREEN → REFACTOR sobre `EditorCanvas.tsx:1282`
- Após 5A.4, seguir para 5A.5 (EditorContext testes mínimos, 3 testes, ~45min)
- Sprint à parte [REVISIT: 2026-06-25]: 5A.1 → 5A.2 → 5A.3
- P1 paralelas: build fix (due 2026-06-10), renderer test (due 2026-06-15)
- Executar ritual de fim de sessão conforme AGENTS.md regra 10 e `session-template.md`
