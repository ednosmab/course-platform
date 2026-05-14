# 📑 Software Development Plan (SDP) - Plataforma de Cursos com CMS Modular

Este documento formaliza as etapas de desenvolvimento, a metodologia de trabalho híbrida e a matriz de responsabilidades das IAs para a construção da infraestrutura proprietária de educação.

---

## 📅 1. Cronograma e Entregáveis Estratégicos (8 Semanas)

### 📌 Semanas 1-2: Design de Componentes & Contratos Base
- **Foco:** Definição dos moldes de dados e arquitetura visual atômica unificada.
- **Entregáveis:** 
  - Contrato de tipos globais e esquemas de validação em `packages/types/`.
  - Configuração do Design System (`tamagui.config.ts`) e primitivos universais em `packages/ui/`.

### 📌 Semanas 3-4: Motor do Editor (Canvas Drag & Drop Engine)
- **Foco:** Lógica estrutural de arrastar, soltar, reordenar e edição "In-Place" (em tempo real).
- **Entregáveis:**
  - Gerenciamento de estado global otimizado para o Canvas (sem estouro de re-renderizações).
  - Integração de bibliotecas de Drag & Drop no painel administrativo web.

### 📌 Semana 5: Infraestrutura de Mídia e Persistência de Dados
- **Foco:** Integração com banco de dados, armazenamento seguro e pipelines de persistência.
- **Entregáveis:**
  - Migrações do banco com suporte a dados semiestruturados (`JSONB`).
  - Buckets de armazenamento e políticas de segurança RLS (Row Level Security).
  - Mecanismo de salvamento automático com tratamento de retardo (*debounce*).

### 📌 Semanas 6-7: Entrega do Painel CMS (Estúdio do Administrador)
- **Foco:** Console de gerenciamento do administrador e fluxos de publicação.
- **Entregáveis:**
  - Dashboard completo conectando listagens, gerenciamento de módulos e o editor visual.
  - Feedback visual resiliente (estados de carregamento e tratamento de erros de rede).

### 📌 Semana 8: Portal do Aluno (Experiência Mobile Híbrida)
- **Foco:** Consumo multiplataforma nativo e leitura da árvore de componentes estruturados.
- **Entregáveis:**
  - Aplicativo mobile rodando em Expo com rotas dinâmicas.
  - Interpretador universal convertendo os blocos JSON persistidos em interfaces nativas fluidas.

---

## 🔄 2. Workflow Padrão por Tarefa (Esteira MCP)

Toda nova funcionalidade, sem exceção, deve percorrer obrigatoriamente o ciclo linear de 5 passos abaixo antes de atingir o estágio de conclusão:

1. **[FASE DE CONTRATO] ➡️ Agente 1 (Gemini 3 Flash):** Analisa o escopo técnico e cria estritamente os esquemas de validação Zod e tipagem TypeScript em `packages/types/src/index.ts`.
2. **[FASE DE ARQUITETURA] ➡️ Agente 2 (MiniMax M2.5):** Consome os contratos definidos na fase 1. Cria as tabelas relacionais ou scripts de migração no Supabase e os componentes de UI puros (primitivos) isolados com Tamagui em `packages/ui/src/`.
3. **[FASE DE IMPLEMENTAÇÃO] ➡️ Agente 3 (DeepSeek V4 Flash):** Consome as definições de tipo e componentes atômicos gerados nas fases anteriores. Escreve a lógica do frontend, conexões com clientes de API, hooks customizados e renderiza as telas finais em `apps/`.
4. **[FASE DE VALIDAÇÃO] ➡️ Usuário (Edson):** O fluxo é pausado. A IA notifica o usuário e solicita que a aplicação seja testada e validada manualmente no ambiente de desenvolvimento local (Web ou Mobile).
5. **[FASE DE REGISTRO] ➡️ Git Versionamento:** Após a aprovação explícita do usuário, a IA gera uma sugestão de mensagem de commit curta, concisa, estritamente em inglês e seguindo a especificação dos *Conventional Commits*. O commit é gravado.

---

## 🎛️ 3. Matriz de Responsabilidade por Agente (RACI)



| Atividade Técnica | Agente 1 (Gemini) | Agente 2 (MiniMax) | Agente 3 (DeepSeek) |
| :--- | :---: | :---: | :---: |
| Modelagem de Esquemas de Validação (Zod) | **Responsável** | Consultado | - |
| Definição de Tipagem Global (.ts) | **Responsável** | Consultado | Consultado |
| Configuração de Tokens do Design System | Informado | **Responsável** | - |
| Escrita de Scripts SQL e Regras RLS | - | **Responsável** | Informado |
| Componentização Atômica (Tamagui styled) | Consultado | **Responsável** | - |
| Integração de Bibliotecas Externas (D&D) | Informado | Consultado | **Responsável** |
| Construção de Componentes de Tela e Views | - | Consultado | **Responsável** |
| Criação de Hooks Customizados e Clientes API | - | - | **Responsável** |
