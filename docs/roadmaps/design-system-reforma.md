# Design System v2 — Plano de Reforma

## Diagnóstico

- `packages/ui` possui tokens Tamagui e 4 primitivos (Button, Card, Text, Container)
- NENHUM app consome `@projeto/ui` — admin-web usa CSS classes, aluno-mobile usa StyleSheet
- Tokens duplicados em 3 lugares (tamagui.config.ts, globals.css, valores hardcoded)
- `packages/ui/src/tokens/` vazio
- `docs/layers/ui/token-governance.md` — stub vazio
- Componentes de bloco do CMS (texto, video, quiz, imagem, quote, html) são JSX bruto nos apps

## Fases

### Fase 0 — Fundação (Token Modular + Governança)

**Objetivo:** Organizar tokens em módulos, preencher governança, preparar terreno.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 0.1 | Modularizar tokens em `packages/ui/src/tokens/` — criar `colors.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`, `animations.ts` exportando objetos | `packages/ui/src/tokens/*.ts`, `tamagui.config.ts` | Tokens extraídos para arquivos individuais, `tamagui.config.ts` importa de lá |
| 0.2 | Preencher `docs/layers/ui/token-governance.md` com regras de: quando criar token, quando criar variante, nomenclatura, proibição de valores hardcoded | `docs/layers/ui/token-governance.md` | Documento com diretrizes concretas e exemplos |
| 0.3 | Atualizar `docs/layers/ui/execution_plan.md` com as tasks expandidas da reforma | `docs/layers/ui/execution_plan.md` | Plano reflete todas as fases |

---

### Fase 1 — Adoção em `admin-web` (Next.js)

**Objetivo:** Substituir CSS classes e estilos inline por componentes `@projeto/ui`.

**Estratégia:** Migração por componente, não por página. Começar pelos primitivos (Button, Text, Card, Container) e depois bloco a bloco.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 1.1 | Mapear todos usos de `<button>`, `<div className="btn-*">` no admin-web e substituir por `<Button>` do `@projeto/ui` | `apps/admin-web/src/**/*.tsx` | Zero `<button>` nativo no JSX do admin-web |
| 1.2 | Substituir `<div>` de layout por `<YStack>`, `<XStack>`, `<Container>` do Tamagui | `apps/admin-web/src/**/*.tsx` | Layouts usam Tamagui stacks |
| 1.3 | Substituir `<span>`, `<p>`, `<h1-6>` por `<Text variant="...">` do `@projeto/ui` | `apps/admin-web/src/**/*.tsx` | Zero tags de texto HTML nativo |
| 1.4 | Migrar `globals.css` — remover tokens CSS duplicados, manter apenas resets e estilos de canvas | `apps/admin-web/src/app/globals.css` | CSS vars duplicadas removidas |
| 1.5 | Eliminar `page.module.css` se existir | `apps/admin-web/src/app/page.module.css` | Arquivo deletado |

---

### Fase 2 — Adoção em `aluno-mobile` (Expo)

**Objetivo:** Substituir `StyleSheet.create()` e `View`/`Text` nativo por componentes `@projeto/ui`.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 2.1 | Substituir `<View>` por `<YStack>`, `<XStack>` do Tamagui | `apps/aluno-mobile/src/**/*.tsx` | Zero `<View>` nativo |
| 2.2 | Substituir `<Text>` nativo por `<Text variant="...">` do `@projeto/ui` | `apps/aluno-mobile/src/**/*.tsx` | Zero `<Text>` nativo do RN |
| 2.3 | Substituir `<TouchableOpacity>` por `<Button>` ou `Pressable` do Tamagui | `apps/aluno-mobile/src/**/*.tsx` | Zero `TouchableOpacity` |
| 2.4 | Remover blocos `StyleSheet.create()` e usar tokens Tamagui | `apps/aluno-mobile/src/**/*.tsx` | Zero `StyleSheet.create()` |
| 2.5 | Remover cores hardcoded (ex: `#f8fafc`, `#1e293b`) — usar `$color` tokens | `apps/aluno-mobile/src/**/*.tsx` | Zero strings de cor hex/rgb soltas |

---

### Fase 3 — Componentes de Bloco do CMS em `@projeto/ui`

**Objetivo:** Criar componentes Tamagui para cada tipo de bloco do CMS, consumíveis por ambos os apps.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 3.1 | Criar `TextBlock.tsx` — renderiza markdown com estilos Tamagui, suporta props dinâmicas | `packages/ui/src/components/blocks/TextBlock.tsx` | Substitui `parseSimpleMarkdown` nos apps |
| 3.2 | Criar `VideoBlock.tsx` — wrapper para YouTube/Vimeo/HTML5 video | `packages/ui/src/components/blocks/VideoBlock.tsx` | Cross-platform (web + native) |
| 3.3 | Criar `QuizBlock.tsx` — alternativas, múltipla escolha, feedback | `packages/ui/src/components/blocks/QuizBlock.tsx` | Renderiza quiz com estados |
| 3.4 | Criar `ImageBlock.tsx` — imagem com caption, lazy load | `packages/ui/src/components/blocks/ImageBlock.tsx` | Suporta fallback e loading |
| 3.5 | Criar `QuoteBlock.tsx` — citação destacada | `packages/ui/src/components/blocks/QuoteBlock.tsx` | Variantes com/som author |
| 3.6 | Criar `HTMLBlock.tsx` — raw HTML sanitizado (admin-web apenas) | `packages/ui/src/components/blocks/HTMLBlock.tsx` | Sanitização XSS obrigatória |
| 3.7 | Reexportar todos os block components em `packages/ui/src/index.ts` | `packages/ui/src/index.ts` | Import `from '@projeto/ui/blocks'` funciona |
| 3.8 | Extrair `renderSimpleMarkdown` para utilitário compartilhado em `@projeto/ui` | `packages/ui/src/utils/markdown.ts` | Ambas as plataformas usam o mesmo parser |

---

### Fase 4 — Sistema de Ícones Padronizado

**Objetivo:** Abstrair `lucide-react` e `lucide-react-native` em um wrapper unificado.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 4.1 | Criar `packages/ui/src/components/Icon.tsx` — detecta platform e usa o lucide correto | `packages/ui/src/components/Icon.tsx` | `import { Icon } from '@projeto/ui'` funciona em ambos |
| 4.2 | Substituir imports diretos de lucide nos apps pelo `Icon` do `@projeto/ui` | `apps/*/src/**/*.tsx` | Zero imports diretos de `lucide-react` ou `lucide-react-native` |

---

### Fase 5 — Preview de Componentes (Storybook/Ladle)

**Objetivo:** Ter um ambiente de visualização e teste dos componentes isolados.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 5.1 | Escolher e configurar ferramenta (Ladle recomendo por ser mais leve que Storybook) | `packages/ui/.ladle/` | `pnpm ladle` abre preview dos componentes |
| 5.2 | Criar stories para todos os primitivos (Button, Card, Text, Container) | `packages/ui/src/**/*.stories.tsx` | Cada componente tem ao menos 1 story |
| 5.3 | Criar stories para os block components (TextBlock, VideoBlock, etc.) | `packages/ui/src/components/blocks/*.stories.tsx` | Stories para todos os blocos |

---

### Fase 6 — Governança e Documentação Final

**Objetivo:** Garantir que o design system não regrida.

| # | Task | Arquivos | Critério de Aceite |
|---|------|----------|-------------------|
| 6.1 | Criar lint rule ou script de verificação que proíba imports de CSS nativo / StyleSheet nos apps | `scripts/verify-ui-rules.ts` | `pnpm verify:ui` falha se detectar violação |
| 6.2 | Atualizar `docs/AGENTS.md` com as regras de governança do DS | `docs/AGENTS.md` | Regras de uso obrigatório de `@projeto/ui` |
| 6.3 | Adicionar seção de Design System no CONTEXT_MAP | `docs/CONTEXT_MAP.md` | Mapa reflete novo escopo |

---

## Matriz de Dependências

```
Fase 0 ──► Fase 1 ──► Fase 3 ──► Fase 5
                  │
                  └──► Fase 2 ──► Fase 3
                  
Fase 4 (ícones) independente — pode ocorrer em paralelo
Fase 6 (governança) — ao final, após tudo consolidado
```

## Critérios de Sucesso

1. Zero `<div>`, `<span>`, `<button>`, `<p>`, `<h1-6>` nos componentes dos apps (exceto canvas container)
2. Zero `StyleSheet.create()` no aluno-mobile
3. Zero cores hex/rgb hardcoded nos apps
4. Todos os blocos do CMS vivem em `packages/ui/src/components/blocks/`
5. Ambos os apps importam blocos de `@projeto/ui`
6. `tamagui.config.ts` importa tokens de `packages/ui/src/tokens/*.ts`
7. `pnpm run lint` passa sem erros
8. Ambos os apps compilam sem warnings
