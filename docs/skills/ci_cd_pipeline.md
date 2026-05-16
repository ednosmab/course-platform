# 🚀 SKILL: CI/CD PIPELINE & GITHUB ACTIONS

## 🎯 Objetivo
Padronizar a criação e manutenção dos pipelines de Integração Contínua (CI) e Deploy Contínuo (CD) do monorepo, garantindo builds rápidos, cache eficiente e segurança antes de mesclar código.

## 🛠️ Stack e Ferramentas Padrão
- **CI Provider:** GitHub Actions
- **Package Manager:** `pnpm` (Obrigatório o uso do `pnpm/action-setup`)
- **Test Runner:** `vitest`

## ⚙️ Regras de Ouro do CI (Integração Contínua)
1. **Gatilhos (Triggers):** O CI deve rodar em todos os *Pull Requests* para a `develop` e `main`, e em *pushes* diretos para a `develop`.
2. **Ordem de Execução (Fail-Fast):**
   - **Instalação:** Baixar dependências usando o cache do `pnpm`.
   - **Análise Estática:** Rodar Linter e Type Checking (`pnpm run lint` / `pnpm tsc`). Se falhar, o pipeline aborta aqui para poupar recursos.
   - **Testes TDD:** Rodar testes automatizados (`pnpm run test`).
   - **Build:** Garantir que as aplicações finais conseguem compilar para produção (`pnpm run build`).

## 🔄 Regras de Ouro do CD (Continuous Deployment)
1. **Gatilhos (Triggers):** Executado APENAS quando um *Pull Request* é mesclado com sucesso da `develop` para a `main`.
2. **Automação:** O CD pode fazer merge automático e publicar releases, ou atualizar o ambiente de Produção.
3. **Living README:** Um job dentro do pipeline ou isolado deve atualizar badges dinâmicos (Coverage, Build Status) no `README.md` da raiz.

## 💾 Estratégia de Cache (Performance)
Em projetos monorepo, a instalação de node_modules é o gargalo. Sempre utilize esta estrutura no YAML:
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 9 # Versão atual do projeto

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm' # Cacheia a pasta virtual do pnpm automaticamente
```

## 🚨 Prevenção de Erros Comuns
- **Nunca use `npm install` ou `yarn`** nos pipelines do GitHub Actions deste projeto. Apenas `pnpm install` ou `pnpm install --frozen-lockfile`.
- Certifique-se de que variáveis de ambiente sigilosas (`SUPABASE_KEY`) sejam passadas via `secrets.GITHUB_TOKEN` ou Actions Secrets, e nunca hardcoded no YAML.
