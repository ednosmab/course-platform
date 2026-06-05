# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-05)
- 🔴 **Em curso:** nenhum — fila livre
- 🟡 **Parado:** nenhum
- ⏭️ **Próximo:** telas/links pendentes → P0 "MVP Coverage & Audit" (tiered)
- ⏸️ **P1 paralelas:** todas resolvidas (P1-01 build ✅, P1-02 renderer test ✅)
- 🎯 **ICP genérico (2026-06-05):** B2B PaaS — plataforma para organizações que querem montar e vender cursos. **Nunca mencionar** nomes de alvos comerciais.

> **Fonte canónica:** `docs/BACKLOG.md` · 🚦 Push para origin BLOQUEADO (critério MVP indefinido).

## Status Atual
**Sessão 2026-06-05 — Governança + ICP + P1 datados + BACKLOG sincronizado, 10 commits em `feat/cert-editor-isolation`.**
- CONFID-01 (regra vinculante) + ICP genérico (B2B PaaS) + rename `uuid_bsgi` → `uuid_extranet` (código + 2 DB migrations aplicadas)
- P1-01 (`@tamagui/constants` build) ✅ Done · P1-02 (renderer test refactor) ✅ Done — ADR-019 arquivado
- **BACKLOG sincronizado:** ICP-01/02, 5A pai, 5A.4, 5A.5 movidos para Done; sub-tabela "Adiado para Fase 5B" limpa (subsunção do bug 1282)
- `opencode.json` endurecido: `loading_profile: "lite"`, `user_profile` T-shaped, `role` triádico, `_agent_role_mapping`
- `AGENTS.md`: regras 12-15 (review/plan/build/feedback) + Loading Profiles + Grafo de Dependências
- Path canónico `docs/plans/YYYY-MM-DD-<task>.md` formalizado

## 🎯 Tarefa em Execução
Fila livre. Próximo P0: telas/links pendentes → P0 "MVP Coverage & Audit".

## 🌿 Estado de Branches (2026-06-05)
- `feat/cert-editor-isolation` (HEAD `55ae1cb`) — 5A ✅, CONFID/ICP/P1 ✅, **pronta para merge Caminho C**
- `develop` (`c166872`) — contém merge de `feat/dnd-e2e-coverage`
- `main` (`43ae09b`) — inalterada, push bloqueado

## 🛠️ Alterações desta sessão (10 commits)
- `603aa44` governance: loading profiles, dep graph, user_profile, agent roles
- `d48f863` governance: CONFID-01 (confidencialidade comercial) — `FORBIDDEN_OPERATIONS.md` secção 9
- `6b5f17d` governance: ICP genérico (B2B PaaS) + remove confidential refs
- `dabef56` feat: rename `uuid_bsgi` → `uuid_extranet` (8 source files)
- `29853af` chore(db): rename index `certificates_uuid_bsgi_key` → `certificates_uuid_extranet_key`
- `c9bfe96` chore(backlog): P1-01 Done (build passing 3/3)
- `1d69659` chore(backlog): P1-02 pausado (Vitest/Tamagui SSR compat)
- `c4cb6ac` docs(adr): ADR-019 (test sanitizeHtml directamente, refactor P1-02)
- `55ae1cb` fix(tests): refactor `BlockRenderer.test.tsx` → `.ts` testando `sanitizeHtml` (10 testes)

## ✅ Validações (regra 7 AGENTS.md)
**147/147 ✅** (renderer 13/13 + admin 88/88 + core 46/46) · `verify:ui` 5/5 ✅ · `test:env-vars` OK · admin build 3/3 determinístico · working tree clean

## 📌 Próximos Passos
- Telas/links pendentes → P0 "MVP Coverage & Audit" · Merge `feat/cert-editor-isolation` → `develop` (Caminho C, com autorização) · ADR upgrade Vitest 2.x (deferred P1-02) · Ritual fim de sessão (regra 10) se utilizador sinalizar

## 🕹️ Documentos Carregados via MCP (último turno)
AGENTS.md, FORBIDDEN_OPERATIONS.md, DESDO.md, Requisitos_plataforma.md, CONTEXT_HIERARCHY.md, CONTEXT_MAP.md, context_buffer.md, BACKLOG.md, ADR-019, session-template.md
