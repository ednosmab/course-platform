# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO CONCLUIDA — SSR 500 corrigido, token governance documentada, 62/62 testes verdes, commit `b5cb191`.

## 🎯 Tarefa Executada
**Correção SSR 500 + Governança de Tokens em Inline Styles + Rename schema_version → version**

Objetivo: Corrigir crash SSR no GET `/studio/[courseId]`, eliminar ZodError do `.strict()`, restaurar tokens visuais no EditorCanvas, e documentar diretriz de resolução de tokens.

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes (D-03: inline CSS)
- `docs/DESDO.md` — Seção 8 (Tamagui governance)
- `docs/skills/tamagui_ui.md` — Skill de estilização Tamagui
- `docs/layers/ui/token-governance.md` — Governança de tokens
- `docs/layers/ui/execution_plan.md` — Plano DSv2
- `docs/context_buffer.md` — Este arquivo (sessão anterior)

## 📋 Checklist de Progresso (Sessão Atual)
- [x] **Passo 1:** Supabase client lazy via Proxy — SSR 500 fixo
- [x] **Passo 2:** `schema_version` → `version` no LessonSchema — ZodError eliminado
- [x] **Passo 3:** Tamagui tokens restaurados em EditorCanvas (`$info`, `$secondary`)
- [x] **Passo 4:** `C` constant removida (dead code) + `colors.ts` deletado
- [x] **Passo 5:** Diretriz documentada em `tamagui_ui.md` (#6) e `token-governance.md` (exceção)
- [x] **Commit:** `b5cb191` — `fix: lazy supabase client to prevent SSR 500 + token governance docs update`
- [x] **Pós-commit:** `pnpm ls zod` ✅, `pnpm ls @supabase/supabase-js` ✅, `pnpm run test` 62/62 ✅

## ⚠️ Violações Corrigidas nesta Sessão

| # | Violação | Correção |
|---|----------|----------|
| 1 | `createClient('', '')` executado em SSR | Lazy init via `getSupabaseClient()` + Proxy |
| 2 | `schema_version` no schema vs `version` no banco | Renomeado para `version` |
| 3 | `$info` usado em `<div style={{}}>` (não resolve) | Restaurado hex nas inline styles; token mantido em props Tamagui |
| 4 | `C` constante definida mas nunca usada | Removida |
| 5 | `apps/admin/src/constants/colors.ts` órfão | Deletado |

## Key Decisions
- **Lazy Supabase:** Proxy pattern evita `createClient('', '')` em SSR sem alterar imports dos adapters. `supabase` export continua funcionando como antes (interface idêntica).
- **Token governance:** `$token` resolve em props Tamagui (YStack, XStack, Text, hoverStyle, pressStyle). Em `<div style={{}}>` nativo, usar hex ou constantes. Documentado em `tamagui_ui.md` regra #6 e `token-governance.md` exceção.
- **hoverStyle aceita tokens:** Diferente de `style={{}}`, `hoverStyle` é processado pelo engine do Tamagui e resolve `$token` normalmente.
- **dead code:** `colors.ts` removido por violar DESDO.md (código morto proibido na main).

## Relevant Files (Sessão Atual)
- `docs/history/session_07_ssr_fix_token_governance.md`: Registro histórico desta sessão
- `packages/core/src/supabase.ts`: Lazy Supabase client via Proxy
- `packages/types/src/database.ts`: `schema_version` → `version`
- `apps/admin/src/components/editor/EditorCanvas.tsx`: Tokens restaurados, dead code removido
- `docs/skills/tamagui_ui.md`: Regra #6 — resolução de tokens
- `docs/layers/ui/token-governance.md`: Exceção para inline styles nativos
