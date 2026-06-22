# Nexus System — Engineering Systems for AI-Assisted Development

> **Nome público:** Nexus System
> **Ficheiro guia:** `docs/Nexus-System_GUIDE.md`
> **Versão:** 1.1 — 2026-06-11

---

## 1. O que é o Nexus System

O **Nexus System** é uma metodologia de governança para desenvolvimento de software assistido por inteligência artificial. Ele define **como** uma equipa de agentes IA deve ler, compreender, modificar e validar código num repositório complexo, de forma segura, rastreável e consistente.

### Princípio Fundamental

> **O Nexus System existe para reduzir a dependência de memória humana e memória do agente, transformando conhecimento em processos executáveis.**

Todo conhecimento tácito (regras, convenções, decisões arquitecturais, padrões de código) é convertido em:
- **Ficheiros estruturados** (YAML, MD) legíveis por máquinas
- **Protocolos obrigatórios** (workflows, checklists) que o agente segue sem decidir
- **Regras vinculantes** (FORBIDDEN_OPERATIONS) que impedem erros antes de acontecerem

O agente IA não precisa de "lembrar" — precisa de **ler**. O Nexus System garante que ele lê, na ordem certa, apenas o que precisa.

---

### Os 5 Layers do Nexus System

| Layer | Nome Oficial | Tecnologia Subjacente | Propósito |
|---|---|---|---|
| **Layer 1** | **Access Layer** | MCP (`@modelcontextprotocol/server-filesystem`) | Dar acesso directo ao filesystem ao LLM |
| **Layer 2** | **Memory Layer** | Ficheiros YAML/MD no repositório | Resolver amnésia de contexto entre sessões |
| **Layer 3** | **Context Layer** | Níveis P0→P4 de leitura | Optimizar tokens e evitar estouro de janela |
| **Layer 4** | **Execution Layer** | Protocolo operacional obrigatório | Garantir disciplina de execução |
| **Layer 5** | **Governance Layer** | ADRs + Políticas + FORBIDDEN_OPERATIONS | Prevenir erros arquitecturais e de segurança |

### O que resolve

Sem o Nexus System, um agente IA num repositório complexo sofre de:

- **Amnésia de sessão** — esquece o que fez na sessão anterior
- **Leitura desperdiçada** — lê ficheiros desnecessários, gasta tokens
- **Escrita perigosa** — sobrescreve código de produção sem querer
- **Falta de rastreabilidade** — ninguém sabe o que a IA alterou e porquê
- **Inconsistência arquitectural** — cada sessão toma decisões diferentes

O Nexus System elimina estes problemas através de 5 layers interligados.

---

## 2. Os 5 Layers do Nexus System

### Layer 1: Access Layer (Servidor MCP)

**O que é:** O servidor `@modelcontextprotocol/server-filesystem` dá ao LLM a capacidade de ler e escrever ficheiros directamente no sistema de arquivos local.

**Como funciona:**
- Configurado em `opencode.json` (bloco `mcp`)
- Restrito ao workspace root do repositório
- Variável de ambiente `AI_OPERATIONAL_RULES` injecta 10 regras operacionais

**Limites de segurança (ADR-004):**
- Escrita apenas dentro do workspace root
- Proibido aceder a `/tmp`, `/home`, `.git`
- `docs/history/` é append-only (imutável)

**Configuração actual:**
```json
"mcp": {
  "local-filesystem": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "."],
    "enabled": true,
    "environment": {
      "AI_OPERATIONAL_RULES": "1. PROIBIDO lógica de domínio em packages/ui..."
    }
  }
}
```

---

### Layer 2: Memory Layer (Arquitectura de Memória RAM/ROM)

**O que é:** Um sistema de dois níveis que persiste o estado da sessão activa e o histórico de decisões.

```
┌─────────────────────────────────────────────────────────┐
│              MEMÓRIA DE CURTO PRAZO (RAM)               │
│       governance/context/context_buffer.yaml            │
│   Estado activo, impedimentos, tarefa em curso          │
└────────────────────────────┬────────────────────────────┘
                             │
                  (Consolidação de Sessão)
                             ▼
┌─────────────────────────────────────────────────────────┐
│             MEMÓRIA DE LONGO PRAZO (ROM)                │
│         docs/history/ (IMUTÁVEL)                        │
│   Logs densos e definitivos de decisões e progresso     │
└─────────────────────────────────────────────────────────┘
```

**RAM (Mutável):** `governance/context/context_buffer.yaml`
- Actualizado a cada turno do agente
- Contém: tarefa activa, impedimentos, documentos carregados
- Formato YAML estruturado para leitura por máquinas

**ROM (Imutável):** `docs/history/`
- Gerado no encerramento de cada sessão
- Protegido contra regravação
- Formato: `YYYY-MM-DD-sessao-NN.md`

**Referência:** ADR-003 (`docs/adrs/ADR-003-memory-architecture.md`)

---

### Layer 3: Context Layer (Hierarquia P0→P4)

**O que é:** Uma ordem de leitura obrigatória que garante que o agente carrega apenas o necessário, optimizando tokens.

```
[Nível 0: P0] docs/AGENTS.md              ← Regras Globais (SEMPRE)
       │
       ▼
[Nível 1: P1] governance/context/
             context_buffer.yaml           ← Estado Actual
       │
       ▼
[Nível 2: P2] docs/layers/[camada]/
             execution_plan.md             ← Plano Técnico
       │
       ▼
[Nível 3: P3] Código e Arquivos           ← Escrita Cirúrgica
       │
       ▼
[Nível 4: P4] docs/history/               ← Auditoria (Sob Demanda)
       │
       ▼
[⚡ Cross-cutting] docs/skills/
             senior-engineer.md            ← Postura Operacional
```

**Como se aplica:** O agente nunca decide o que ler primeiro. O WORKFLOW (`governance/WORKFLOW.md`) e a hierarquia P0→P4 determinam a ordem.

**Referência:** `cognition/context/CONTEXT_HIERARCHY.md`

---

### Layer 4: Execution Layer (Workflow de 4 Passos)

**O que é:** O protocolo operacional obrigatório que todo agente deve seguir antes de escrever qualquer código.

```
PASSO 1: DIAGNÓSTICO E LEITURA PREGUIÇOSA
  │  → Ler WORKFLOW.md
  │  → Ler SYSTEM_MAP.md
  │  → Ler context_buffer.yaml
  │  → Ler planos/skills da camada
  ▼
PASSO 2: ACTUALIZAÇÃO DA MEMÓRIA RAM (Before-Code)
  │  → Actualizar context_buffer.yaml
  │  → Registar tarefa em execução
  │  → Registar documentos carregados
  ▼
PASSO 3: EXECUÇÃO CIRÚRGICA
  │  → Escrever código apenas na pasta permitida
  │  → Se erro → parar, documentar no buffer, corrigir
  ▼
PASSO 4: CONSOLIDAÇÃO E PURGA (After-Code)
     → Marcar [x] no plano
     → Limpar impedimentos do buffer
     → Exibir estado resumido
```

**Referência:** `docs/AGENTS.md` (linhas 216-231), `docs/skills/document-loader.md`

---

### Quick Start — O que faço agora?

> Novos agentes e developers normalmente procuram: **"O que faço agora?"** Estes fluxos respondem exactamente isso.

#### Nova Feature

```
1. Ler WORKFLOW.md                          ← Determinar tipo de operação
2. Ler context_buffer.yaml                  ← Obter estado actual
3. Executar PREMORTEM (pnpm run premortem:check)
   → O que pode quebrar?
   → Existe ADR relacionada?
   → Existe impacto arquitectural?
4. Criar plano em docs/plans/
5. Ler planos/skills da camada (P2)
6. Actualizar buffer com tarefa em execução
7. Implementar código cirurgicamente
8. Executar pnpm run test + pnpm run lint
9. Executar pnpm run validate:session
10. Executar pnpm run close:session
11. Preencher SESSION_REVIEW
```

#### Bug Report

```
1. Ler WORKFLOW.md                          ← Identificar como BUG
2. Ler context_buffer.yaml                  ← Estado actual
3. Reproduzir erro / identificar causa raiz
4. Documentar erro no buffer (seção Impedimentos)
5. Corrigir código cirurgicamente
6. Executar pnpm run test (validar correção)
7. Actualizar context_buffer.yaml
8. Executar pnpm run close:session
```

#### Refactor

```
1. Ler WORKFLOW.md                          ← Identificar como REFACTOR
2. Ler ADRs relacionadas + SYSTEM_MAP.md
3. Executar premortem:check                 ← Verificar impacto
4. Ler plano da camada (P2)
5. Executar refactoração conforme plano
6. Executar pnpm run test + pnpm run lint
7. Executar pnpm run validate:session
8. Actualizar context_buffer.yaml
9. Executar pnpm run close:session
```

#### Nova Feature (resumo rápido)

| Passo | Acção | Comando/Verificação |
|---|---|---|
| 1 | Ler WORKFLOW.md | `governance/WORKFLOW.md` |
| 2 | Ler buffer | `governance/context/context_buffer.yaml` |
| 3 | Premortem | `pnpm run premortem:check` |
| 4 | Planear | Criar `docs/plans/YYYY-MM-DD-<task>.md` |
| 5 | Carregar P2 | Ler plano da camada via MCP |
| 6 | Actualizar buffer | Escrever tarefa em execução |
| 7 | Implementar | Código na pasta permitida |
| 8 | Testar | `pnpm run test && pnpm run lint` |
| 9 | Validar sessão | `pnpm run validate:session` |
| 10 | Encerrar | `pnpm run close:session` |

---

### Layer 5: Governance Layer (Regras Vinculantes)

**O que é:** O conjunto de regras absolutas que nenhum agente pode violar.

**Fontes de regras:**

| Documento | Caminho | Propósito |
|---|---|---|
| FORBIDDEN_OPERATIONS | `docs/FORBIDDEN_OPERATIONS.md` | 24 regras vinculantes (G-01, S-01, etc.) |
| ADR-004 | `docs/adrs/ADR-004-mcp-server-governance.md` | Sandboxing e operações proibidas |
| ADR-003 | `docs/adrs/ADR-003-memory-architecture.md` | Arquitectura de memória |
| GOV-POLICY | `governance/policies/GOV-POLICY-operational-rules-v1.md` | Regras operacionais de agentes |
| DESDO | `docs/DESDO.md` | Diretrizes de engenharia (SOLID, TDD, segurança) |

**Regras críticas (resumo):**
- Nenhum commit sem autorização explícita do usuário
- Nenhuma escrita fora do workspace root
- Nenhuma estilização fora de Tamagui
- Nenhum input sem validação Zod
- `docs/history/` é imutável

---

## 3. Directórios Envolvidos

### 3.1 Configuração do Nexus System

```
.opencode/
├── agents/
│   └── document-loader.md          ← Agente subordinado
├── skills/
│   └── document-loader/
│       └── SKILL.md                ← Protocolo de leitura
├── package.json
└── package-lock.json
```

### 3.2 Governança (Núcleo do Sistema)

```
governance/
├── WORKFLOW.md                     ← Entrada única obrigatória
├── SYSTEM_MAP.md                   ← Mapa centralizado
├── context/
│   └── context_buffer.yaml         ← RAM mutável (estado activo)
├── agents/                         ← Contratos de agentes AI
├── contracts/                      ← Índice de contratos
├── handoffs/                       ← Protocolos de transição
└── policies/                       ← Políticas operacionais
```

### 3.3 Cognição (Arquitectura Mental)

```
cognition/
├── context/
│   └── CONTEXT_HIERARCHY.md        ← Hierarquia P0-P4
├── memory/
│   └── MEM-operational-state-v1.json  ← Estado operacional
└── prompts/
    ├── executor/                   ← Prompts do executor
    ├── planner/                    ← Prompts do planner
    ├── reviewer/                   ← Prompts do reviewer
    └── shared/                     ← Regras partilhadas
```

### 3.4 Documentação & ADRs

```
docs/
├── AGENTS.md                       ← Regras do time (P0)
├── FORBIDDEN_OPERATIONS.md         ← Regras vinculantes (P0)
├── DESDO.md                        ← Diretrizes de engenharia (P0)
├── BACKLOG.md                      ← Fila de tarefas
├── CONTEXT_MAP.md                  ← Mapa de contexto por camada
├── Requisitos_plataforma.md        ← Requisitos (P0)
├── INDEX.md                        ← Índice geral
├── Nexus-System_GUIDE.md           ← Este ficheiro
├── adrs/                           ← Architecture Decision Records
├── feedback/                       ← Feedback de sessões
├── history/                        ← Registos históricos (ROM)
├── layers/                         ← Planos por camada técnica
├── plans/                          ← Planos de execução
├── skills/                         ← Skills operacionais
└── roadmaps/                       ← Roadmaps de desenvolvimento
```

### 3.5 Scripts de Validação

```
scripts/
├── validate-session.ts             ← Validação de sessão
├── close-session.ts                ← Encerramento de sessão
├── verify-ui-rules.ts              ← Verificação de regras UI
└── check-test-env-vars.sh          ← Validação de env vars
```

### 3.6 Código (Monorepo)

```
packages/
├── ui/                             ← Design System (Tamagui)
├── types/                          ← Contratos de dados (Zod)
├── core/                           ← Lógica de domínio
└── renderer/                       ← Motor de renderização

apps/
├── admin/                          ← App Admin (Next.js)
└── student/                        ← App Aluno (Expo)

supabase/
└── migrations/                     ← Migrations SQL
```

---

## 4. Como Funciona — Fluxo Completo

### Início de Sessão

```
Utilizador envia tarefa
        │
        ▼
┌──────────────────────────┐
│  PASSO 1: DIAGNÓSTICO    │
│  Ler WORKFLOW.md          │
│  Ler context_buffer.yaml  │
│  Identificar tipo:        │
│  FEATURE | BUG | REFACTOR │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  PASSO 2: CARREGAR       │
│  Ler P0 (AGENTS.md, etc) │
│  Ler P1 (buffer)         │
│  Ler P2 (plano da camada)│
│  via MCP filesystem      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  PASSO 3: EXECUTAR       │
│  Escrever código         │
│  Cirurgicamente          │
│  (apenas pasta permitida)│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  PASSO 4: VALIDAR        │
│  pnpm run test           │
│  pnpm run lint           │
│  tsc --noEmit            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  PASSO 5: CONSOLIDAR     │
│  Actualizar buffer       │
│  Marcar [x] no plano     │
│  Gerar histórico (ROM)   │
└──────────────────────────┘
```

### Fluxo por Tipo de Operação

| Tipo | Fluxo | Entrada |
|---|---|---|
| **FEATURE** | Carregar → Premortem → Planear → Implementar → Validar → Encerrar | `WORKFLOW.md` § Fluxo FEATURE |
| **BUG** | Carregar → Reproduzir → Corrigir → Validar → Encerrar | `WORKFLOW.md` § Fluxo BUG |
| **REFACTOR** | Carregar → Verificar impacto → Executar → Validar → Encerrar | `WORKFLOW.md` § Fluxo REFACTOR |
| **DOCUMENTATION** | Carregar → Escrever → Validar consistência → Encerrar | `WORKFLOW.md` § Fluxo DOCUMENTATION |
| **PLANNING** | Carregar → Premortem → Planear → Actualizar backlog → Encerrar | `WORKFLOW.md` § Fluxo PLANNING |

---

## 5. Como Usar — Guia Prático

### 5.1 Para um Novo Developer

1. Ler este ficheiro (`Nexus-System_GUIDE.md`)
2. Ler `governance/WORKFLOW.md` — entender os fluxos
3. Ler `docs/AGENTS.md` — regras do time
4. Ler `governance/context/context_buffer.yaml` — estado actual
5. Seguir o fluxo do tipo de tarefa atribuída

### 5.2 Para um Agente IA

O agente **nunca** decide o que ler. O protocolo é:

```
1. Ler WORKFLOW.md (sempre primeiro)
2. Ler context_buffer.yaml (obrigatório)
3. Seguir hierarquia P0→P4
4. Actualizar buffer antes de escrever código
5. Validar após implementar
6. Gerar histórico ao encerrar
```

### 5.3 Mapa de Camadas vs Documentos

| Camada | Pasta | Documento P2 |
|--------|-------|-------------|
| Types (contratos) | `packages/types/` | `docs/layers/types/execution_plan.md` |
| UI (Design System) | `packages/ui/` | `docs/layers/ui/execution_plan.md` |
| Supabase (DB) | `supabase/migrations/` | `docs/layers/supabase/database_schema_plan.md` |
| Admin App | `apps/admin/` | `docs/layers/apps/admin_canvas_plan.md` |
| Student App | `apps/student/` | `docs/layers/apps/mobile_player_plan.md` |
| Core (domínio) | `packages/core/` | `docs/layers/core/domain-logic.md` |
| Renderer | `packages/renderer/` | `docs/layers/renderer/engine-spec.md` |
| Infra/DevOps | — | `docs/layers/infra/execution_plan.md` |

### 5.4 Scripts de Validação

| Script | Comando | Função |
|---|---|---|
| Validate Session | `pnpm run validate:session` | Verifica integridade da sessão |
| Close Session | `pnpm run close:session` | Checklist de encerramento |
| Verify UI Rules | `pnpm run verify:ui` | Valida regras de design system |
| Premortem Check | `pnpm run premortem:check` | Análise de riscos prévia |

---

## 6. Regras Vinculantes (Resumo)

### Proibições Absolutas

| # | Regra | Fonte |
|---|---|---|
| G-01 | Nenhum `git commit` sem autorização explícita | FORBIDDEN_OPERATIONS |
| F-01 | Nenhuma lógica de domínio em `packages/ui` | FORBIDDEN_OPERATIONS |
| F-03 | Nenhum import cruzado entre apps | FORBIDDEN_OPERATIONS |
| F-04 | Nenhum schema Zod fora de `packages/types` | FORBIDDEN_OPERATIONS |
| D-03 | Nenhum Tailwind, Sass ou CSS inline | FORBIDDEN_OPERATIONS |
| S-01 | Nenhum HTML de CMS sem sanitização | FORBIDDEN_OPERATIONS |
| S-02 | Nenhuma tabela sem RLS configurado | FORBIDDEN_OPERATIONS |
| DB-01 | Nenhuma mutação JSONB sem validação Zod | FORBIDDEN_OPERATIONS |
| ENV-01 | Nenhuma flag de teste em configs de deploy | FORBIDDEN_OPERATIONS |
| CONFID-01 | Nenhuma informação comercial sensível em código | FORBIDDEN_OPERATIONS |

### Regras de Código

| # | Regra | Fonte |
|---|---|---|
| 1 | Commits em inglês (Conventional Commits) | GOV-POLICY |
| 2 | JSDoc em todas as funções exportadas | DESDO §6 |
| 3 | Nenhuma cor hex hardcoded — usar tokens `$color` | AGENTS.md |
| 4 | Nenhum `<div>`/`<span>`/`<button>` cru em `packages/ui` | AGENTS.md |
| 5 | Nenhum import direto de `lucide-react` | AGENTS.md |
| 6 | Testes actualizados ou criados | DESDO §3 |
| 7 | `pnpm run test` verde antes de commitar | AGENTS.md |

---

## 7. Referências

### Documentos Primários (ler para entender o Nexus System)

| Documento | Caminho | Propósito |
|---|---|---|
| ADR-004 | `docs/adrs/ADR-004-mcp-server-governance.md` | Sandboxing e governança MCP |
| ADR-003 | `docs/adrs/ADR-003-memory-architecture.md` | Arquitectura de memória RAM/ROM |
| CONTEXT_HIERARCHY | `cognition/context/CONTEXT_HIERARCHY.md` | Hierarquia de leitura P0-P4 |
| document-loader SKILL | `docs/skills/document-loader.md` | Protocolo de leitura obrigatório |
| WORKFLOW | `governance/WORKFLOW.md` | Fluxo de sessão (entrada única) |
| SYSTEM_MAP | `governance/SYSTEM_MAP.md` | Mapa centralizado do sistema |

### Documentos Secundários (referência detalhada)

| Documento | Caminho | Propósito |
|---|---|---|
| AGENTS.md | `docs/AGENTS.md` | Regras do time de engenharia |
| FORBIDDEN_OPERATIONS | `docs/FORBIDDEN_OPERATIONS.md` | 24 regras vinculantes |
| DESDO | `docs/DESDO.md` | Diretrizes de engenharia |
| GOV-POLICY | `governance/policies/GOV-POLICY-operational-rules-v1.md` | Políticas operacionais |
| context_buffer | `governance/context/context_buffer.yaml` | Estado activo da sessão |
| BACKLOG | `docs/BACKLOG.md` | Fila de tarefas |
| CONTEXT_MAP | `docs/CONTEXT_MAP.md` | Roteador de contexto por camada |
| INDEX | `docs/INDEX.md` | Índice geral da documentação |
| Requisitos | `docs/Requisitos_plataforma.md` | Requisitos da plataforma |
| opencode.json | `opencode.json` | Configuração do servidor MCP |

### Documentos Operacionais (uso diário)

| Documento | Caminho | Propósito |
|---|---|---|
| SESSION_REVIEW | `governance/reviews/SESSION_REVIEW.md` | Template de feedback de sessão |
| session-template | `docs/session-template.md` | Template de fim de sessão |
| feedback | `docs/feedback/` | Feedback diário de sessões |
| history | `docs/history/` | Registos históricos (ROM) |

---

## 8. Glossário

| Termo | Definição |
|---|---|
| **Nexus System** | Metodologia de governança para dev assistido por IA |
| **Access Layer** | Layer 1 — servidor MCP para acesso ao filesystem |
| **Memory Layer** | Layer 2 — arquitectura de memória RAM/ROM |
| **Context Layer** | Layer 3 — hierarquia de contexto P0-P4 |
| **Execution Layer** | Layer 4 — workflow de 4 passos |
| **Governance Layer** | Layer 5 — regras vinculantes e políticas |
| **MCP** | Model Context Protocol — protocolo para acesso ao filesystem |
| **RAM** | Memória de curto prazo (context_buffer.yaml) — mutável |
| **ROM** | Memória de longo prazo (docs/history/) — imutável |
| **P0-P4** | Níveis de hierarquia de contexto (P0 = sempre, P4 = sob demanda) |
| **Premortem** | Análise de riscos prévia à implementação |
| **Lazy Loading** | Leitura preguiçosa — carregar apenas o necessário |
| **Sandboxing** | Restrição de escrita ao workspace root |
| **ADR** | Architecture Decision Record — registo de decisão arquitectural |
| **FORBIDDEN_OPERATIONS** | Regras vinculantes que nenhum agente pode violar |

---

## 9. Changelog

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-06-11 | Criação do guia unificado do Nexus System |
| 1.1 | 2026-06-11 | Adicionado Princípio Fundamental, nomes oficiais dos Layers, secção Quick Start |
