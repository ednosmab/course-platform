# ADR-003: Arquitetura de Memória Ativa e de Longo Prazo

## Status
Aprovado

## Data
2026-05-16

## Contexto
Durante longas sessões de desenvolvimento com múltiplos agentes cognitivos no servidor MCP, há um risco severo de "vazamento de contexto" ou "amnésia de sessão" devido aos limites de janela de contexto do LLM. 
Informações cruciais como status atual de compilação, bugs recentes corrigidos, decisões de nomenclatura de banco de dados e pendências imediatas de implementação podem se perder quando uma nova sessão de chat é inicializada ou quando há alternância de agente.
Precisamos de um mecanismo resiliente, persistente no File System e estruturado de forma legível por humanos e máquinas para representar o estado da sessão ativa e o histórico acumulado.

## Decisão
Implementaremos uma arquitetura de memória em duas camadas distintas armazenadas no sistema de arquivos local do servidor MCP:

```
┌─────────────────────────────────────────────────────────┐
│              MEMÓRIA DE CURTO PRAZO (RAM)               │
│          docs/context_buffer.md (MUTÁVEL)               │
│ Mapeia o estado imediato, impedimentos e próxima task  │
└────────────────────────────┬────────────────────────────┘
                             │
                  (Consolidação de Sessão)
                             ▼
┌─────────────────────────────────────────────────────────┐
│             MEMÓRIA DE LONGO PRAZO (ROM)                │
│    docs/history/session_XX_[nome].md (IMUTÁVEL)          │
│ Logs densos e definitivos de decisões e progresso       │
└─────────────────────────────────────────────────────────┘
```

### 🧠 1. Memória Ativa (RAM) - `docs/context_buffer.md`
Este arquivo atua como o registrador do processador do agente. É **mutável** e deve ser lido e atualizado obrigatoriamente a cada turno.
* **Seção status:** Define se o projeto está em `AGUARDANDO_PLANEJAMENTO`, `EM_EXECUCAO`, `AGUARDANDO_REVISAO` ou se há impedimentos ativos.
* **Impedimentos:** Qualquer erro de linting, teste quebrado ou restrição física do sistema de arquivos é catalogado detalhadamente aqui, impedindo que o agente avance sem antes resolver o bug.

### 💾 2. Memória Histórica de Longo Prazo (ROM) - `docs/history/`
Ao encerrar uma sessão de desenvolvimento ou concluir uma fase inteira do cronograma, o agente atual é obrigado a gerar um log estático consolidado na pasta `docs/history/`.
* **Imutabilidade:** Arquivos históricos antigos são marcados como imutáveis e protegidos contra regravação para evitar adulteração de decisões passadas de arquitetura.
* **Formato:** Cada arquivo segue a nomenclatura padrão `session_[id]_[foco].md` e armazena os objetivos alcançados, decisões técnicas estruturais e o commit associado.

## Consequências
* **Positivas:**
  * O contexto se torna virtualmente infinito e resiliente a quedas de chat.
  * Facilidade extrema para novos agentes se ambientarem instantaneamente ao workspace lendo um único arquivo (`docs/context_buffer.md`).
  * Auditoria precisa de regressões ou erros de decisões arquiteturais históricas.
* **Negativas:**
  * Exige disciplina absoluta dos agentes para não esquecerem de atualizar o `context_buffer.md` antes de encerrarem o turno de execução.
