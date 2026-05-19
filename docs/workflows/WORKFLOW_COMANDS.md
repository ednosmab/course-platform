# ⚡ WORKFLOW DE COMANDOS

## 📦 Setup Inicial
```bash
pnpm install                    # Instalar todas as dependências do monorepo
```

## 🖥️ Admin Web (Next.js — CMS)
```bash
pnpm --filter admin dev     # Dev server → http://localhost:3000
pnpm --filter admin build   # Build produção
pnpm --filter admin lint    # ESLint
```

## 📱 Aluno Mobile (Expo)
```bash
pnpm --filter student start    # Expo dev server (Metro bundler)
pnpm --filter student web      # Web mode → http://localhost:8081
pnpm --filter student android  # Android emulator
pnpm --filter student ios      # iOS simulator
```

## 🧪 Testes
```bash
pnpm --filter @projeto/core test    # Testes unitários (Vitest)
pnpm test:e2e                       # E2E headless (Playwright)
pnpm test:e2e:ui                    # E2E com UI interativa
```

## 🏗️ E2E (Playwright) — Como funciona
- `playwright.config.ts` no raiz — auto-start dos servidores:
  - admin na porta **3000**
  - student (web) na porta **8081**
- Test files: `tests/e2e/`
- Rodar sem servidor manual — o Playwright sobe tudo sozinho

## 🔄 Workflow típico de desenvolvimento
```bash
# Terminal 1 — Admin
pnpm --filter admin dev

# Terminal 2 — Aluno Mobile (web)
pnpm --filter student web

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
| admin | `apps/admin/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| student | `apps/student/.env` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
