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
6. **Resolução de Tokens `$token`:** Tokens `$color`, `$size`, `$space` etc. resolvem **apenas** em props de componentes Tamagui (`YStack`, `XStack`, `Text`, `Button`, etc.) e em `hoverStyle`/`pressStyle`. Em `<div style={{}}>` nativo, `boxShadow` inline ou strings CSS concatenadas, usar valores hex explícitos ou constantes — o Token Resolver do Tamagui não processa objetos `style` de elementos HTML nativos.
7. **EXCEÇÃO — Print CSS para Certificados:** `@page { size: A4 landscape; }` e regras `@media print` não possuem API equivalente em React/Tamagui. É permitido um arquivo `.css` minimalista exclusivamente para print de certificados, limitado a `@page`, `@media print` e `print-color-adjust`. Esta é a **única** exceção à regra de zero CSS. O arquivo deve ser nomeado `CertificatePrint.css` e mantido em `packages/ui/src/components/Certificate/`.

## 🧱 Estrutura de Componentes
- **Atômicos:** Botões, Inputs, Cards (Puros Tamagui).
- **Blocos do CMS:** Componentes que mapeiam diretamente os tipos definidos pelo Agente 1 (Texto, Vídeo, Quiz).
- **Layouts:** Grids e containers que mantêm o alinhamento global.

## 📂 Onde Aplicar
- `packages/ui/src/`
- `apps/admin/components/`
- `apps/student/components/`
