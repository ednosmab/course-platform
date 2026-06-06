# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-05)
- 🔴 **Em curso:** nenhum — fila livre
- 🟡 **Parado:** nenhum
- ⏭️ **Próximo:** telas/links pendentes → P0 "MVP Coverage & Audit" (tiered)
- ⏸️ **P1 paralelas:** todas resolvidas · 🎯 ICP genérico (B2B PaaS, sem nomes comerciais)

> **Fonte canónica:** `docs/BACKLOG.md` · 🚦 Push para origin BLOQUEADO (critério MVP indefinido).

## Status Atual
**Sessão 2026-06-05 — Governança + ICP + P1 + isReady refactor, 12 commits em `feat/cert-editor-isolation`.**
- CONFID-01 (regra vinculante) + ICP genérico (B2B PaaS) + rename `uuid_bsgi` → `uuid_extranet` (código + 2 DB migrations)
- P1-01/P1-02 Done · **BACKLOG sincronizado** (ICP-01/02, 5A, 5A.4/5A.5 → Done)
- **`useMobileProgress` isReady refactor** (2 commits): elimina race condition estrutural no hook do student app
- Pre-merge CI descobriu regressão pré-existente em test mock (regra 7) — corrigida em par com o refactor

## 🎯 Tarefa em Execução
Fila livre. Próximo P0: telas/links pendentes → P0 "MVP Coverage & Audit".

## 🌿 Estado de Branches (2026-06-05)
- `feat/cert-editor-isolation` (HEAD `5edaa17`) — 5A + CONFID/ICP/P1 + isReady ✅, **pronta para merge Caminho C**
- `develop` (`c166872`) — contém merge de `feat/dnd-e2e-coverage`
- `main` (`43ae09b`) — inalterada, push bloqueado

## 🛠️ Alterações desta sessão (12 commits)
- `603aa44` governance: loading profiles, dep graph, user_profile, agent roles
- `d48f863` governance: CONFID-01 (confidencialidade comercial) — `FORBIDDEN_OPERATIONS.md` secção 9
- `6b5f17d` governance: ICP genérico (B2B PaaS) + remove confidential refs
- `dabef56` feat: rename `uuid_bsgi` → `uuid_extranet` (8 source files)
- `29853af` chore(db): rename index `certificates_uuid_bsgi_key` → `certificates_uuid_extranet_key`
- `c9bfe96` chore(backlog): P1-01 Done (build passing 3/3)
- `1d69659` chore(backlog): P1-02 pausado (Vitest/Tamagui SSR compat)
- `c4cb6ac` docs(adr): ADR-019 (test sanitizeHtml directamente, refactor P1-02)
- `55ae1cb` fix(tests): refactor `BlockRenderer.test.tsx` → `.ts` testando `sanitizeHtml` (10 testes)
- `8342262` chore(backlog): sync status (ICP-01/02, 5A → Done)
- `84b4707` refactor(student): expose `isReady` from `useMobileProgress` hook (elimina race condition)
- `5edaa17` test(student): cover `!userId` guard in `useMobileProgress` (2 novos testes)

## 🛠️ Refatorações Aplicadas (regra 4)
1. **`useMobileProgress` isReady flag** (commits `84b4707`, `5edaa17`): hook expõe `isReady` que vira `true` após o `useEffect` async de auth completar. Elimina a race condition onde `result.current.saveProgressMobile` ainda era a closure da primeira render (com `userId=null`). Adicionados 2 testes que cobrem o guard `if (!userId) return` em `saveProgressMobile` e `syncPending`. Plano arquivado em `docs/plans/2026-06-05-usemobileprogress-isready.md`.

## ✅ Validações (regra 7 AGENTS.md)
**211/211 ✅** (admin 88 + core 46 + renderer 13 + student 7 + ui 57) · `verify:ui` 5/5 ✅ · working tree clean
**Step 8 (tsc student):** bloqueado por bug pré-existente TS 5.9.3 + Expo (`RangeError: Maximum call stack size exceeded`); reproduzido com working tree stashed — não é regressão deste refactor.

## 📌 Próximos Passos
- Telas/links pendentes → P0 "MVP Coverage & Audit" · Merge `feat/cert-editor-isolation` → `develop` (Caminho C, com autorização) · ADR upgrade Vitest 2.x (deferred P1-02) · ADR fix TS 5.9.3 student crash (regressão pré-existente descoberta nesta sessão) · Ritual fim de sessão (regra 10) se utilizador sinalizar

## 🕹️ Documentos Carregados via MCP (último turno)
AGENTS.md, FORBIDDEN_OPERATIONS.md, DESDO.md, Requisitos_plataforma.md, CONTEXT_HIERARCHY.md, CONTEXT_MAP.md, context_buffer.md, BACKLOG.md, ADR-019, plans/TEMPLATE.md, plans/2026-06-05-usemobileprogress-isready.md
