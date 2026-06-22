# Workflow Commands — Lint & Code Quality

## Lint Root (Monorepo)

```bash
# Verificar erros de lint em todo o monorepo (exclui apps/admin)
pnpm run lint

# Corrigir automaticamente erros de lint
pnpm run lint:fix
```

## Lint Admin (App Next.js)

```bash
# Verificar erros de lint no app admin
pnpm --filter admin run lint
```

## Lint Student (App Expo)

```bash
# Verificar erros de lint no app student
pnpm --filter student run lint
```

## Verificação Completa

```bash
# Lint + testes + verificação de UI
pnpm run verify:all
```

## Regras de Governança (ESLint)

| Regra | Severidade | Descrição |
|---|---|---|
| `governance/no-lucide-react` | warn → error | Proíbe import directo de `lucide-react` |
| `governance/no-html-elements` | warn → error | Proíbe `<div>`, `<span>`, etc. (usar Tamagui) |
| `governance/no-hardcoded-colors` | warn | Proíbe hex/rgb hardcoded (usar `$color` tokens) |
| `governance/no-stylesheet-create` | warn → error | Proíbe `StyleSheet.create()` (usar Tamagui) |

> **Evolução:** Governance rules começam como `warn` e são escaladas para `error` à medida que o codebase é limpo.

## Pre-Commit Hook

O Husky executa automaticamente `lint-staged` antes de cada commit:
- Ficheiros `*.{ts,tsx}` passam por `eslint --fix`
- Alterações são staged automaticamente
