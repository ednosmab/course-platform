# 📋 PLANO DE EXECUÇÃO: DESIGN SYSTEM E COMPONENTES VISUAIS (Tamagui) — DSv2

## 🎯 Objetivo Geral
Completar a reforma do Design System (DSv2): modularizar tokens, migrar apps para `@projeto/ui`, criar componentes de bloco CMS, padronizar ícones e estabelecer governança.

> **Plano Mestre:** `docs/roadmaps/design-system-reforma.md` — ler antes de executar qualquer task.

## ✅ Tasks Concluídas (Fase Inicial — Legado)
- [x] TASK-01: Instalar dependências do Tamagui em `packages/ui/package.json`
- [x] TASK-02: Configurar `packages/ui/src/tamagui.config.ts` com tokens e temas
- [x] TASK-03: Criar `Button.tsx` (primary, secondary, ghost)
- [x] TASK-04: Criar `Card.tsx` (default, outlined, glass, interactive)
- [x] TASK-05: Criar `Text.tsx` (h1-h3, body, caption, meta) e `Container.tsx` (small, medium, large, fluid)
- [x] TASK-06: Reexportar primitivos em `packages/ui/src/index.ts`
- [x] TASK-07: Lint na pasta UI — compilação cross-platform OK

## 📌 FASE 0 — Fundação (Token Modular + Governança)
- [x] **TASK-08:** Criar `packages/ui/src/tokens/colors.ts` — extrair cores do `tamagui.config.ts`
- [x] **TASK-09:** Criar `packages/ui/src/tokens/spacing.ts` — extrair size/space/radius/zIndex
- [x] **TASK-10:** Criar `packages/ui/src/tokens/typography.ts` — extrair font definitions
- [x] **TASK-11:** Criar `packages/ui/src/tokens/shadows.ts` — extrair shadow presets
- [x] **TASK-12:** Criar `packages/ui/src/tokens/animations.ts` — extrair animation presets
- [x] **TASK-13:** Refatorar `tamagui.config.ts` para importar de `./tokens/*`
- [x] **TASK-14:** Preencher `docs/layers/ui/token-governance.md` com regras de nomenclatura, criação e proibição de hardcoded

## 📌 FASE 1 — Adoção em `admin`
- [x] **TASK-15:** Mapear/substituir `<button>` por `<Button>` do `@projeto/ui`
- [x] **TASK-16:** Substituir `<div>`/`<span>` por `<YStack>`/`<XStack>`/`<Text>` do Tamagui
- [x] **TASK-17:** Migrar `globals.css` — remover tokens CSS duplicados
- [x] **TASK-18:** Eliminar `page.module.css`
  > ⚠️ **Nota:** Tasks 15-16 foram marcadas como concluídas, mas `apps/admin/src/components/editor/` (5 arquivos) ainda usam extensivamente `<div>`, `<button>`, CSS classes e cores hardcoded. Refatoração real ainda pendente — ver `docs/BACKLOG.md` P0.

## 📌 FASE 2 — Adoção em `student`
- [x] **TASK-19:** Substituir `<View>` por `<YStack>`/`<XStack>` do Tamagui
- [x] **TASK-20:** Substituir `<Text>` nativo por `<Text>` do `@projeto/ui`
- [x] **TASK-21:** Substituir `<TouchableOpacity>` por `<Button>` ou `Pressable` Tamagui
- [x] **TASK-22:** Remover `StyleSheet.create()` — usar tokens Tamagui
- [x] **TASK-23:** Eliminar cores hex/rgb hardcoded

## 📌 FASE 3 — Componentes de Bloco CMS em `@projeto/ui`
- [x] **TASK-24:** Criar `blocks/TextBlock.tsx` — markdown renderer com Tamagui
- [x] **TASK-25:** Criar `blocks/VideoBlock.tsx` — YouTube/Vimeo/HTML5
- [x] **TASK-26:** Criar `blocks/QuizBlock.tsx` — alternativas, múltipla escolha
- [x] **TASK-27:** Criar `blocks/ImageBlock.tsx` — imagem com caption
- [x] **TASK-28:** Criar `blocks/QuoteBlock.tsx` — citação destacada
- [x] **TASK-29:** Criar `blocks/HTMLBlock.tsx` — raw HTML sanitizado
- [x] **TASK-30:** Extrair `renderSimpleMarkdown` para `packages/ui/src/utils/markdown.tsx`
- [x] **TASK-31:** Reexportar blocos em `packages/ui/src/index.ts`
- [x] **Fase 3 — Refatoração:** `student/BlockRenderer.tsx` atualizado para importar blocos de `@projeto/ui`
- [x] **Fase 3 — Infra:** `@projeto/ui` com entry points separados (`.main` + `./native`) para evitar dependências RN em web
- [x] **Fase 3 — Fix:** `admin` — Providers wrapper + TamaguiProvider no layout
- [x] **Fase 3 — Fix:** `packages/core` — `setTimeout` type error (`ReturnType<typeof setTimeout>`)

## 📌 FASE 4 — Sistema de Ícones
- [x] **TASK-32:** Criar `Icon.tsx` / `Icon.native.tsx` — wrapper cross-platform lucide
- [x] **TASK-33:** Substituir imports diretos de lucide nos apps (51 usos em 8 arquivos)

## 📌 FASE 5 — Preview de Componentes
- [x] **TASK-34:** Configurar Ladle em `packages/ui`
- [x] **TASK-35:** Criar 6 stories (Button, Card, Text, Icon, TextBlock, QuoteBlock)

## 📌 FASE 6 — Governança Final
- [x] **TASK-36:** Criar script `scripts/verify-ui-rules.ts` (4 regras)
- [x] **TASK-37:** Atualizar `docs/AGENTS.md` com regras de governança do DS
- [x] **TASK-38:** CI workflow (`.github/workflows/ci.yml`) — build:verify + react-consistency + verify:ui + ladle:build
