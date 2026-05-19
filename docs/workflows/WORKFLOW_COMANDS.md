# ⚡ WORKFLOW DE COMANDOS

## 📦 Setup Inicial
```bash
pnpm install                    # Instalar todas as dependências do monorepo
```

## 🖥️ Admin Web (Next.js — CMS)
```bash
pnpm --filter admin-web dev     # Dev server → http://localhost:3000
pnpm --filter admin-web build   # Build produção
pnpm --filter admin-web lint    # ESLint
```

## 📱 Aluno Mobile (Expo)
```bash
pnpm --filter aluno-mobile start    # Expo dev server (Metro bundler)
pnpm --filter aluno-mobile web      # Web mode → http://localhost:8081
pnpm --filter aluno-mobile android  # Android emulator
pnpm --filter aluno-mobile ios      # iOS simulator
```

## 🧪 Testes
```bash
pnpm --filter @projeto/core test    # Testes unitários (Vitest)
pnpm test:e2e                       # E2E headless (Playwright)
pnpm test:e2e:ui                    # E2E com UI interativa
```

## 🏗️ E2E (Playwright) — Como funciona
- `playwright.config.ts` no raiz — auto-start dos servidores:
  - admin-web na porta **3000**
  - aluno-mobile (web) na porta **8081**
- Test files: `tests/e2e/`
- Rodar sem servidor manual — o Playwright sobe tudo sozinho

## 🔄 Workflow típico de desenvolvimento
```bash
# Terminal 1 — Admin
pnpm --filter admin-web dev

# Terminal 2 — Aluno Mobile (web)
pnpm --filter aluno-mobile web

# Terminal 3 — Testes
pnpm --filter @projeto/core test -- --watch
```

## 🔧 TypeScript (check rápido)
```bash
npx tsc --noEmit                 # Roda no workspace atual
```

## ⚠️ Variáveis de Ambiente
| App | Arquivo | Variáveis |
|---|---|---|
| admin-web | `apps/admin-web/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| aluno-mobile | `apps/aluno-mobile/.env` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
