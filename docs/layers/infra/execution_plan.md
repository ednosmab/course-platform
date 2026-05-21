# 📋 PLANO DE EXECUÇÃO: CAMADA DE INFRAESTRUTURA E DEVOPS

## 🎯 Objetivo Geral
Estabelecer um pipeline de Integração Contínua (CI) blindado e adotar o desenvolvimento guiado a testes (TDD) estrito usando Vitest e GitHub Actions.

## 📌 Linha de Produção Estrita (Para o Agente Implementador)

- [x] **TASK-01:** Modificar `docs/AGENTS.md` alterando a regra de testes para exigir o **TDD Estrito (Test-First)**, garantindo que testes sejam escritos antes da implementação lógica.
- [x] **TASK-02:** Instalar `vitest` e `@testing-library/react` na raiz do monorepo e configurar o `vitest.workspace.ts`.
- [x] **TASK-03:** Adicionar os scripts `"test"` e `"test:watch"` no `package.json` raiz.
- [x] **TASK-04:** Ajustar `.github/workflows/ci.yml` para rodar testes em pushes/PRs nas branches `develop` e `main`.
- [x] **TASK-05:** Testar localmente (simulando o CI) a execução do `pnpm run test` — 21 testes, 0 falhas.
- [x] **TASK-06:** Configurar pipeline de Continuous Deployment (CD) para automatizar o merge/deploy seguro da branch `develop` para a `main`.
- [ ] **TASK-07:** Implementar rotina de "Living README" no GitHub Actions. ⏭️ **Adiado para pós-MVP.**

## 💡 Diretrizes Adicionais para a Implementação
- **Branching:** A branch `develop` agora atua como espelho seguro da `main`. Nenhuma funcionalidade vai para `main` sem passar pela `develop` e seus testes automatizados primeiro.
- Todos os próximos agentes (`Agente 2`, `Agente 3`) são obrigados a ler as regras de testes e aplicar a skill definida em `docs/skills/tdd_workflow.md`.
