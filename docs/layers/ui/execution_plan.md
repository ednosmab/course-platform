# 📋 PLANO DE EXECUÇÃO: DESIGN SYSTEM E COMPONENTES VISUAIS (Tamagui)

## 🎯 Objetivo Geral
Modelar e configurar fisicamente os tokens globais de estilo e criar componentes primitivos (Button, Card, Text, Container) responsivos e cross-platform em `packages/ui` para sustentar a interface do CMS e do mobile.

## 📌 Linha de Produção Estrita (Para o Agente Implementador)
- [ ] **TASK-01:** Instalar dependências necessárias do Tamagui em `packages/ui/package.json` (ex: `@tamagui/core`, `tamagui`).
- [ ] **TASK-02:** Configurar `packages/ui/src/tamagui.config.ts` injetando tokens de cores harmoniosas (paleta escura/indigo), pesos/tamanhos de fontes (Outfit/Inter) e proporções de espaçamento base 4px.
- [ ] **TASK-03:** Criar componente primitivo `Button.tsx` com variantes de estilo (primary, secondary, ghost) e animações reativas nativas.
- [ ] **TASK-04:** Criar componente primitivo `Card.tsx` para atuar como moldura responsiva dos blocos dinâmicos do Canvas.
- [ ] **TASK-05:** Criar wrappers tipográficos em `Text.tsx` e estruturas de layout responsivo em `Container.tsx`.
- [ ] **TASK-06:** Reexportar todos os componentes primitivos em `packages/ui/src/index.ts`.
- [ ] **TASK-07:** Executar `pnpm run lint` na pasta UI para certificar que a compilação cruzada (React Native e React Web) funciona sem quebras de tipos.
