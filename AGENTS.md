# 🛠️ AGENTS.md - REGRAS DO TIME DE ENGENHARIA DE IA

## 📐 ARQUITETURA E PADRÕES DO REPOSITÓRIO (OBRIGATÓRIO)
- **Monorepo Híbrido:** Next.js (App Router), Expo (Router), Supabase e TypeScript.
- **Princípio DRY de Estilização:** É PROIBIDO usar Tailwind, Sass ou CSS inline. Toda e qualquer estilização visual deve ser feita exclusivamente via **Tamagui** no diretório `packages/ui`.
- **Propriedades Dinâmicas:** Os blocos do CMS precisam aceitar modificações dinâmicas enviadas do banco do Supabase através de propriedades (`props`) injetadas diretamente nos componentes base do Tamagui.
- **Banco de Dados:** Tabelas de dados flexíveis do CMS devem usar o tipo `JSONB` no Supabase para armazenar a árvore de componentes da aula.
- **Validação:** Todas as entradas de dados e contratos de API devem usar **Zod** para validação em tempo de execução.
- **Registros de Arquitetura (ADRs):** Toda decisão arquitetural de alto impacto está documentada na pasta `docs/adrs/`. É OBRIGATÓRIO ler e respeitar os ADRs existentes. Caso uma nova biblioteca estrutural precise ser adicionada, você deve primeiro sugerir a criação de um novo arquivo ADR para aprovação do usuário.
- **Plano de Desenvolvimento (SDP):** O cronograma detalhado de 8 semanas, o fluxo de trabalho da esteira MCP e a matriz de responsabilidades estão documentados em `docs/roadmaps/sdp.md`. É OBRIGATÓRIO ler e seguir este plano.


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

### ⏳ Diretriz de Leitura Preguiçosa (Lazy Loading)
- Você está PROIBIDO de realizar buscas globais (globbing) ou ler múltiplos arquivos da pasta `docs/` de forma simultânea no início do chat.
- Sempre que o usuário solicitar uma tarefa, analise o escopo e use o arquivo `docs/CONTEXT_MAP.md` para identificar os caminhos exatos dos arquivos de plano e skill necessários.
- Use a ferramenta MCP para ler exclusivamente os arquivos mapeados para a tarefa atual e ignore as demais pastas de documentação.

## 🤖 ALGORITMO OBRIGATÓRIO DE GESTÃO DE CONTEXTO (WORKFLOW ATIVO)

Sempre que o usuário enviar uma nova mensagem ou comando, você DEVE executar rigorosamente os 4 passos abaixo na ordem exata, usando suas ferramentas MCP:

### 🔄 PASSO 1: DIAGNÓSTICO E LEITURA PREGUIÇOSA (LAZY LOADING)
- Use o MCP para ler `docs/CONTEXT_MAP.md` e localize a pasta da camada da tarefa.
- Use o MCP para ler `docs/context_buffer.md` para extrair o estado da última execução.
- Use o MCP para ler a Skill e o Plano de Execução específicos da camada afetada.

### 📝 PASSO 2: ATUALIZAÇÃO DA MEMÓRIA RAM (BEFORE-CODE)
- Antes de modificar qualquer código fonte, reescreva o `docs/context_buffer.md`.
- Atualize o campo `## 🎯 Tarefa em Execução` com o objetivo imediato do turno.
- Atualize `## 🕹️ Camada Ativa e Documentos Carregados via MCP` com os arquivos que usará.

### 💻 PASSO 3: EXECUÇÃO CIRÚRGICA
- Escreva ou altere o código estritamente dentro da pasta permitida ao seu Agente.
- Se o usuário reportar erros de terminal (TypeScript/Lint/Zod), pare imediatamente.
- Escreva o erro detalhado na seção `## ⚠️ Impedimentos & Logs de Erro Recentes` do buffer.
- Tente a correção apenas após documentar o erro no buffer.

### 🧹 PASSO 4: CONSOLIDAÇÃO E PURGA (AFTER-CODE)
- Assim que o código compilar com sucesso, marque `[x]` na tarefa correspondente do plano.
- Limpe a seção de `⚠️ Impedimentos` do buffer inserindo: "*Nenhum erro ativo.*"
- Termine sua resposta exibindo o estado atual resumido do buffer e o consumo estimado da sessão.

### 📜 Protocolo de Registro Histórico de Longo Prazo
1. **Imutabilidade:** Os arquivos dentro de `docs/history/` são registros históricos. Você está PROIBIDO de alterar arquivos de sessões passadas.
2. **Geração de Saída:** Quando o usuário solicitar o encerramento ou resumo de uma sessão para transição de chat, sintetize os pontos em um formato denso contendo: Data, Objetivos Alcançados, Decisões Técnicas de Arquitetura e Estado do Repositório.
3. **Leitura Sob Demanda:** Você só deve ler a pasta `docs/history/` se o usuário solicitar explicitamente uma retrospectiva sobre o motivo de uma decisão tomada em sessões anteriores.
