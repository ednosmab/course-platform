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

## 📌 FASE 1 — Adoção em `admin-web`
- [ ] **TASK-15:** Mapear/substituir `<button>` por `<Button>` do `@projeto/ui`
- [ ] **TASK-16:** Substituir `<div>`/`<span>` por `<YStack>`/`<XStack>`/`<Text>` do Tamagui
- [ ] **TASK-17:** Migrar `globals.css` — remover tokens CSS duplicados
- [ ] **TASK-18:** Eliminar `page.module.css`

## 📌 FASE 2 — Adoção em `aluno-mobile`
- [ ] **TASK-19:** Substituir `<View>` por `<YStack>`/`<XStack>` do Tamagui
- [ ] **TASK-20:** Substituir `<Text>` nativo por `<Text>` do `@projeto/ui`
- [ ] **TASK-21:** Substituir `<TouchableOpacity>` por `<Button>` ou `Pressable` Tamagui
- [ ] **TASK-22:** Remover `StyleSheet.create()` — usar tokens Tamagui
- [ ] **TASK-23:** Eliminar cores hex/rgb hardcoded

## 📌 FASE 3 — Componentes de Bloco CMS em `@projeto/ui`
- [ ] **TASK-24:** Criar `blocks/TextBlock.tsx` — markdown renderer com Tamagui
- [ ] **TASK-25:** Criar `blocks/VideoBlock.tsx` — YouTube/Vimeo/HTML5
- [ ] **TASK-26:** Criar `blocks/QuizBlock.tsx` — alternativas, múltipla escolha
- [ ] **TASK-27:** Criar `blocks/ImageBlock.tsx` — imagem com caption
- [ ] **TASK-28:** Criar `blocks/QuoteBlock.tsx` — citação destacada
- [ ] **TASK-29:** Criar `blocks/HTMLBlock.tsx` — raw HTML sanitizado
- [ ] **TASK-30:** Extrair `renderSimpleMarkdown` para `packages/ui/src/utils/markdown.ts`
- [ ] **TASK-31:** Reexportar blocos em `packages/ui/src/index.ts`

## 📌 FASE 4 — Sistema de Ícones
- [ ] **TASK-32:** Criar `Icon.tsx` — wrapper cross-platform lucide
- [ ] **TASK-33:** Substituir imports diretos de lucide nos apps

## 📌 FASE 5 — Preview de Componentes
- [ ] **TASK-34:** Configurar Ladle ou Storybook em `packages/ui`
- [ ] **TASK-35:** Criar stories para primitivos e blocos

## 📌 FASE 6 — Governança Final
- [ ] **TASK-36:** Criar script `verify-ui-rules.ts` — proibir CSS nativo/StyleSheet
- [ ] **TASK-37:** Atualizar `docs/AGENTS.md` com regras de governança
- [ ] **TASK-38:** Lint final — `pnpm run lint` em todo monorepo
