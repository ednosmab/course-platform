# ADR-004: Governança de Acesso do Servidor MCP de File System

## Status
Aprovado

## Data
2026-05-16

## Contexto
O servidor MCP filesystem (`@modelcontextprotocol/server-filesystem`) concede ao LLM a capacidade direta de interagir com os arquivos do sistema de arquivos local do usuário (ler, escrever, alterar e listar diretórios). 
Sem uma política de governança de segurança estrita e delimitação clara de escopo, um agente descontrolado pode causar perda acidental de dados, sobrescrever código crítico de produção ou ler informações sensíveis fora do workspace do monorepo da plataforma de cursos.
Precisamos estabelecer limites rígidos de operações de arquivos (boundaries) e definir regras de auditoria operacional.

## Decisão
Estabelecemos a governança determinística do servidor MCP baseada em limites físicos de workspace e sandboxing conceitual:

### 🛡️ 1. Sandboxing de Workspace (Boundaries Físicos)
1. **Diretório Raiz Bloqueado:** Todas as ferramentas MCP de gravação de arquivos estão restritas e blindadas estritamente dentro da raiz do workspace local `/media/edson-ubuntu/Data1/Plataforma de Cursos com CMS/plataforma_cursos`.
2. **Proibição de Escrita Externa:** Qualquer tentativa de acessar ou escrever em `/tmp`, `/home`, `.git` interno ou diretórios de sistema operacional vizinhos está bloqueada e resultará em falha operacional imediata.
3. **Imutabilidade Histórica:** A pasta `/docs/history/` é de gravação "apenas de acréscimo" (append-only) para novas sessões. É expressamente proibido sobrescrever arquivos de histórico existentes.

### 🚫 2. Tabela de Operações Proibidas e Permitidas
1. **Permitido:**
   * Leitura sob demanda (lazy loading) orientada a escopo por meio do arquivo `docs/CONTEXT_MAP.md`.
   * Criação de novos arquivos em diretórios dedicados (`runtime/`, `governance/`, `cognition/`, `audit/`, `apps/`, `packages/`).
   * Edição cirúrgica de trechos contíguos de arquivos de código (`.ts`, `.tsx`, `.sql`, `.md`, `.yaml`, `.json`).
2. **Proibido (Forbidden):**
   * Sobrescrever arquivos inteiros de código-fonte de produção para fazer modificações pequenas (isso consome tokens desnecessários e aumenta o risco de deletar código preexistente).
   * Modificar dependências raiz (`package.json`) ou scripts globais sem autorização explícita do usuário em tarefas autorizadas.
   * Commits ou pushes automáticos via `git` sem validação manual prévia e aprovação por texto do usuário (Edson).

### 🔍 3. Rastreabilidade Cognitiva e Auditoria
Toda ação de handoff cognitiva entre agentes deve ser registrada na pasta `/audit/handoffs/` no formato `WF-HANDOFF-[agente_origem]-to-[agente_destino]-v[versao].md`. 
O Orquestrador lerá esses logs para auditar o progresso e certificar que nenhum agente violou seu escopo exclusivo (Agente 1 restrito a `packages/types/`, Agente 2 a `packages/ui/` + `supabase/`, Agente 3 a `apps/`).

## Consequências
* **Positivas:**
  * Segurança absoluta para o sistema hospedeiro do usuário.
  * Mitigação de riscos de destruição acidental de arquivos de código legados.
  * Facilidade de auditoria e revisão de alterações.
* **Negativas:**
  * O agente precisa gastar etapas extras de validação e verificação de arquivos para garantir conformidade com as regras de caminhos de arquivos.
