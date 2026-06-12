# Sessão 06 — 21/05/2026: Correção de Login e i18n

## Objetivos Alcançados
- **Login com @supabase/ssr:** Substituído `createClient` de `@supabase/supabase-js` por `createBrowserClient`/`createServerClient` de `@supabase/ssr` no admin. Agora a sessão é armazenada em cookies (visível pelo middleware).
- **Role-based redirect:** Após login, busca `role` na tabela `profiles`. Se `student` → redireciona para `http://localhost:8081` (student app). Se `admin/teacher` → dashboard admin.
- **i18n deduplication:** Havia 3 cópias do `react-i18next` no `node_modules` (pnpm isolation), cada uma com seu próprio React Context. `I18nextProvider` do core e `useTranslation` do admin usavam cópias diferentes → contexto nunca se encontrava. Solução: mover `I18nProvider` para dentro do admin.

## Decisões Técnicas
- **Arquitetura de Login:** Admin agora usa `@supabase/ssr` com `createServerClient` no middleware (cookies getAll/setAll) e `createBrowserClient` no frontend. Sessão persiste via cookies, permitindo middleware enxergar autenticação.
- **Role routing:** Usuários student são redirecionados para o student app (Expo) via `NEXT_PUBLIC_STUDENT_APP_URL`. Admin/teacher permanecem no admin dashboard.
- **i18n isolation fix:** `react-i18next` movido para peerDependency do `@projeto/core`. `I18nProvider` movido para `apps/admin/src/providers/i18n-provider.tsx` para usar o mesmo React Context que `useTranslation` no admin.

## Estado do Repositório
- **Branch:** `feat/dsv2-reform`
- **Admin app:** Build OK (Next.js 16.2.6, Turbopack)
- **Student app:** Build OK (Expo Web)
- **Ladle:** 6 stories OK
- **MVP ~35% completo**

## Arquivos Criados/Modificados
- `apps/admin/src/lib/supabase-client.ts` (novo)
- `apps/admin/src/lib/supabase-server.ts` (novo)
- `apps/admin/src/providers/i18n-provider.tsx` (novo)
- `apps/admin/src/middleware.ts` (reescrito)
- `apps/admin/src/app/login/page.tsx` (modificado)
- `apps/admin/src/app/providers.tsx` (modificado)
- `apps/admin/next.config.ts` (modificado)
- `packages/core/package.json` (modificado)
- `packages/core/src/i18n/index.ts` (modificado)
