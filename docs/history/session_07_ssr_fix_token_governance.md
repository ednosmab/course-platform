# Sessão 07 — 23/05/2026: Correção SSR 500 + Governança de Tokens em Inline Styles

## Objetivos Alcançados
- **Lazy Supabase Client:** Substituído `createClient()` eager no módulo por `getSupabaseClient()` lazy + Proxy para `supabase` export, prevenindo crash SSR 500 no GET `/studio/[courseId]` quando variáveis de ambiente não estão disponíveis.
- **Renomeado `schema_version` → `version`:** `LessonSchema` agora usa `version` para bater com a coluna real do banco, eliminando ZodError do `.strict()`.
- **Restaurado tokens `$info`/`$secondary`:** `EditorCanvas.tsx` — `borderColor`, `color` e `hoverStyle` voltaram a usar tokens Tamagui (`$info`, `$secondary`). Constante `C` não utilizada removida.
- **Removido `colors.ts` morto:** Arquivo `apps/admin/src/constants/colors.ts` ficou órfão — deletado junto com o diretório vazio.
- **Documentada diretriz de resolução de tokens:** Adicionada regra #6 em `docs/skills/tamagui_ui.md` e exceção em `docs/layers/ui/token-governance.md` — tokens `$token` resolvem apenas em props de componentes Tamagui; `<div style={{}}>` nativo exige hex ou constantes.

## Decisões Técnicas
- **Proxy pattern:** `supabase` export usa `new Proxy({}, { get, set })` que delega para `getSupabaseClient()`, permitindo SSR importar o módulo sem executar `createClient('', '')`.
- **resolvedEnv helper:** Função `resolveEnv(key)` centraliza a leitura de env vars com fallback entre `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*` e `SUPABASE_*`.
- **hoverStyle aceita tokens:** `hoverStyle={{ bg: '$secondary' }}` funciona porque `hoverStyle` é processado pelo engine do Tamagui, ao contrário de `style={{ }}` em `<div>` cru.

## Estado do Repositório
- **Branch:** `feat/dsv2-reform`
- **Último commit:** `b5cb191` — `fix: lazy supabase client to prevent SSR 500 + token governance docs update`
- **Testes:** 62/62 passando (core 50, renderer 3, admin 2, student 5)
- **Dependências:** zod@3.25.76, @supabase/supabase-js@2.105.4

## Arquivos Modificados
- `packages/core/src/supabase.ts` — lazy init + Proxy
- `packages/types/src/database.ts` — `schema_version` → `version`
- `apps/admin/src/components/editor/EditorCanvas.tsx` — tokens restaurados, C const removida
- `apps/admin/src/constants/colors.ts` — deletado (dead code)
- `docs/skills/tamagui_ui.md` — regra #6 (inline style token limitation)
- `docs/layers/ui/token-governance.md` — exceção para `<div style={{}}>` nativo
