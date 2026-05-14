# 🛠️ AGENTS.md - REGRAS DO TIME DE ENGENHARIA DE IA

## 📐 ARQUITETURA E PADRÕES DO REPOSITÓRIO (OBRIGATÓRIO)
- **Monorepo Híbrido:** Next.js (App Router), Expo (Router), Supabase e TypeScript.
- **Princípio DRY de Estilização:** É PROIBIDO usar Tailwind, Sass ou CSS inline. Toda e qualquer estilização visual deve ser feita exclusivamente via **Tamagui** no diretório `packages/ui`.
- **Propriedades Dinâmicas:** Os blocos do CMS precisam aceitar modificações dinâmicas enviadas do banco do Supabase através de propriedades (`props`) injetadas diretamente nos componentes base do Tamagui.
- **Banco de Dados:** Tabelas de dados flexíveis do CMS devem usar o tipo `JSONB` no Supabase para armazenar a árvore de componentes da aula.
- **Validação:** Todas as entradas de dados e contratos de API devem usar **Zod** para validação em tempo de execução.
- **Registros de Arquitetura (ADRs):** Toda decisão arquitetural de alto impacto está documentada na pasta `docs/adrs/`. É OBRIGATÓRIO ler e respeitar os ADRs existentes. Caso uma nova biblioteca estrutural precise ser adicionada, você deve primeiro sugerir a criação de um novo arquivo ADR para aprovação do usuário.

---

## 🛑 REGRAS CRUCIAIS DE WORKFLOW E GIT (LEI ABSOLUTA)

1. **NUNCA FAÇA COMMIT SEM PERMISSÃO:** É ESTREITAMENTE PROIBIDO executar comandos de `git commit` ou `git push` de forma automatizada. Você deve SEMPRE solicitar que o usuário teste as alterações localmente primeiro. Apenas após a confirmação visual e autorização explícita do usuário você poderá avançar ou sugerir o commit.
2. **COMMITS CURTOS EM INGLÊS:** Quando um commit for autorizado, a mensagem de commit gerada ou sugerida DEVE ser escrita em inglês. Ela deve ser altamente concisa, resumida e seguir rigorosamente a especificação do Conventional Commits (ex: `feat: add text block schema`, `chore: update database rules`). Evite explicações longas ou genéricas no título do commit.

---

## 🤖 DIVISÃO DE PAPÉIS DO TIME

### 📋 AGENTE 1: Gerente de Produto
- **Foco:** Contratos de Dados, Tipos Globais, Esquemas Zod e Regras de Negócio.
- **Escopo:** Atua estritamente na pasta `packages/types/`.
- **Instruções:** Você define os contratos e validações de dados para os blocos de Texto, Vídeo e Quiz. Você nunca escreve código visual ou tabelas SQL.

### 🧠 AGENTE 2: Tech Lead & Arquiteto
- **Foco:** Banco de Dados (Supabase SQL/RLS) e Componentes Base de UI (Tamagui Config e Primitivos).
- **Escopo:** Atua em `supabase/migrations/` e `packages/ui/`.
- **Instruções:** Você cria o arquivo de configuração do Tamagui (`tamagui.config.ts`) e projeta as estruturas lógicas dos blocos. Você garante que o código seja limpo e reutilizável.

### 💻 AGENTE 3: Desenvolvedor Pleno
- **Foco:** Montagem de Telas, Fluxos de Interface, Hooks de Salvamento e Clientes Supabase.
- **Escopo:** Atua em `apps/admin-web/` e `apps/aluno-mobile/`.
- **Instruções:** Você une os tipos criados pelo Agente 1 e as peças visuais criadas pelo Agente 2 para montar as interfaces de usuário finais da aplicação web e mobile.
