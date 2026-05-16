# 🧼 SKILL: PADRÕES DE CÓDIGO E CLEAN ARCHITECTURE (GLOBAL)

## 🎯 Objetivo
Manter o código legível, testável e fácil de manter por qualquer membro do time (ou Agente).

## 📜 Princípios Fundamentais
1. **DRY (Don't Repeat Yourself):** Se uma lógica se repete em 3 lugares, ela deve ir para `packages/core`. Se um componente se repete, vai para `packages/ui`.
2. **KISS (Keep It Simple, Stupid):** Prefira soluções simples e legíveis a abstrações prematuras e complexas.
3. **Nomenclatura Semântica:** 
   - Variáveis: `camelCase` (ex: `isUserAuthenticated`).
   - Componentes: `PascalCase` (ex: `CourseCard`).
   - Constantes/Enums: `UPPER_SNAKE_CASE` (ex: `MAX_UPLOAD_SIZE`).
4. **Early Return:** Evite aninhamento de `if/else`. Retorne o erro ou caso base o mais cedo possível.
5. **Comentários de "Porquê", não de "O quê":** O código deve ser autoexplicativo. Use comentários apenas para explicar decisões de arquitetura complexas ou hacks necessários.

## 🧪 Testes e Qualidade
- **Unitários:** Obrigatórios para lógica de negócio no `packages/core`.
- **Linting:** Nunca ignore avisos do ESLint ou erros do TypeScript (`@ts-ignore` é terminantemente proibido).
- **Refatoração:** "Deixe o código sempre um pouco mais limpo do que o encontrou".

## 📂 Onde Aplicar
- Em todo o monorepo.
