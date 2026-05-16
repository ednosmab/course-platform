# 🎨 SKILL: DESIGN SYSTEM & COMPONENTIZAÇÃO TAMAGUI (AGENTE 2)

## 🎯 Objetivo
Criar uma base visual consistente, performática e cross-platform (Web & Mobile) usando Tamagui, seguindo o princípio DRY.

## 📐 Regras de Ouro (UI/UX)
1. **Zero Tailwind/CSS-in-JS Externo:** Toda estilização deve ser feita via props do Tamagui (`YStack`, `XStack`, `Text`, etc.) ou no `tamagui.config.ts`.
2. **Uso de Tokens:** Nunca use valores "mágicos" (ex: `padding: 17`). Use sempre os tokens definidos no tema (ex: `$4`, `$small`).
3. **Propriedades Dinâmicas:** Os componentes base na `packages/ui` devem estar preparados para receber estilos via `props` que venham do CMS (JSONB).
   - Use o helper `styled` do Tamagui para criar variantes reutilizáveis.
4. **Responsividade:** Utilize a sintaxe de array/objeto do Tamagui para breakpoints (ex: `width={{ lg: 500, sm: '100%' }}`).
5. **Acessibilidade:** Garanta que todos os componentes interativos possuam estados de `hover`, `press` e `focus` bem definidos visualmente.

## 🧱 Estrutura de Componentes
- **Atômicos:** Botões, Inputs, Cards (Puros Tamagui).
- **Blocos do CMS:** Componentes que mapeiam diretamente os tipos definidos pelo Agente 1 (Texto, Vídeo, Quiz).
- **Layouts:** Grids e containers que mantêm o alinhamento global.

## 📂 Onde Aplicar
- `packages/ui/src/`
- `apps/admin-web/components/`
- `apps/aluno-mobile/components/`
