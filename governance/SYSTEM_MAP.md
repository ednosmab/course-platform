# 🗺️ SYSTEM MAP — Mapa Centralizado do Sistema

> **Critério de sucesso:** Qualquer agente deve descobrir o fluxo completo consultando apenas este ficheiro.

---

## 1. Fluxo de Sessão

```text
INÍCIO
  │
  ├── 1. Ler WORKFLOW.md (governance/WORKFLOW.md)
  │       └── Determina o tipo de operação: FEATURE | BUG | REFACTOR | DOCUMENTATION | PLANNING
  │
  ├── 2. Ler context_buffer.yaml (governance/context/context_buffer.yaml)
  │       └── Obtém estado actual da sessão
  │
  ├── 3. Validar sessão (pnpm run validate:session)
  │
  ├── 4. Executar tarefa conforme WORKFLOW
  │
  └── 5. Encerrar sessão (pnpm run close:session)
```

---

## 2. Documentos por Agente

### Planner

| Ordem | Documento | Caminho |
|---|---|---|
| 1 | WORKFLOW | `governance/WORKFLOW.md` |
| 2 | Context Buffer | `governance/context/context_buffer.yaml` |
| 3 | AGENTS.md | `docs/AGENTS.md` |
| 4 | ADRs | `docs/adrs/` |
| 5 | BACKLOG | `docs/BACKLOG.md` |
| 6 | FORBIDDEN_OPERATIONS | `docs/FORBIDDEN_OPERATIONS.md` |
| 7 | SYSTEM MAP (este) | `governance/SYSTEM_MAP.md` |

### Executor (Build)

| Ordem | Documento | Caminho |
|---|---|---|
| 1 | WORKFLOW | `governance/WORKFLOW.md` |
| 2 | Context Buffer | `governance/context/context_buffer.yaml` |
| 3 | AGENTS.md | `docs/AGENTS.md` |
| 4 | ADRs relevantes | `docs/adrs/` |
| 5 | PLANO activo | `docs/plans/YYYY-MM-DD-<task>.md` |
| 6 | Validate Session | `pnpm run validate:session` |

### Reviewer

| Ordem | Documento | Caminho |
|---|---|---|
| 1 | WORKFLOW | `governance/WORKFLOW.md` |
| 2 | Context Buffer | `governance/context/context_buffer.yaml` |
| 3 | AGENTS.md | `docs/AGENTS.md` |
| 4 | ADRs relevantes | `docs/adrs/` |
| 5 | PLANO executado | `docs/plans/YYYY-MM-DD-<task>.md` |
| 6 | Testes | `pnpm run test` |
| 7 | Validate Session | `pnpm run validate:session` |

---

## 3. Documentos Globais (P0 — Sempre Carregados)

| # | Documento | Propósito |
|---|---|---|
| P0 | `docs/AGENTS.md` | Regras do time de engenharia de IA |
| P0.1 | `docs/FORBIDDEN_OPERATIONS.md` | Regras vinculantes (G-01 a G-05, CONFID-01) |
| P0.15 | `docs/DESDO.md` | Diretrizes de engenharia, SOLID, TDD, segurança |
| P0.2 | `docs/INDEX.md` | Índice geral do repositório |
| P0.3 | `docs/Requisitos_plataforma.md` | Requisitos da plataforma |
| P0.4 | `cognition/context/CONTEXT_HIERARCHY.md` | Hierarquia de precedência de contexto |

---

## 3.1 Documentação As-Built (Estado Real do Sistema)

> Estes documentos representam o estado real implementado, não o estado documentado.
> Devem ser consultados sempre que houver conflito entre documentação e código.

| Documento | Caminho | Responsabilidade |
|---|---|---|
| Estado Actual | `docs/CURRENT_STATE.md` | Estado real implementado (As-Built) |
| Análise de Gaps | `docs/GAP_ANALYSIS.md` | Diferença entre documentação e implementação |
| Backlog Técnico | `docs/BACKLOG_TECHNICAL_DEBT.md` | Acções necessárias para reduzir gaps e riscos |

**Princípio:** "Evidência acima da documentação" — quando houver conflito, o código e o runtime prevalecem. Actualizar a documentação para reflectir a realidade.

---

## 4. Camadas Técnicas do Código (Sob Demanda)

### 4.1 Contratos de Dados (packages/types)
| Arquivo | Caminho |
|---|---|
| Plano de execução | `docs/layers/types/execution_plan.md` |
| Validação Zod | `docs/skills/zod_validation.md` |
| Governança JSONB | `docs/skills/jsonb_governance.md` |
| Type safety Supabase | `docs/skills/supabase_type_safety.md` |
| Data lifecycle | `docs/layers/types/data-lifecycle.md` |
| Extensibilidade de blocos | `docs/skills/block-extensibility.md` |

### 4.2 Design System (packages/ui)
| Arquivo | Caminho |
|---|---|
| Plano de execução | `docs/layers/ui/execution_plan.md` |
| Tokenização Tamagui | `docs/layers/ui/tamagui_tokenization_skill.md` |
| UI Tamagui | `docs/skills/tamagui_ui.md` |
| Princípios UI/UX | `docs/skills/ui_ux_principles.md` |
| Token governance | `docs/layers/ui/token-governance.md` |
| Student header | `docs/skills/student-header.md` |
| Admin header | `docs/skills/admin-header.md` |
| Responsividade cross-platform | `docs/skills/responsividade.md` |
| Protocolo de animação | `docs/skills/animation_protocol.md` |

### 4.3 Banco de Dados e Segurança (Supabase)
| Arquivo | Caminho |
|---|---|
| Schema plan | `docs/layers/supabase/database_schema_plan.md` |
| RLS governance | `docs/skills/supabase_rls.md` |
| Auth JWT | `docs/skills/supabase_auth_jwt.md` |
| Edge Functions | `docs/skills/supabase_edge_functions.md` |
| Realtime | `docs/skills/supabase_realtime.md` |
| Storage | `docs/skills/supabase_storage.md` |
| Security policies | `docs/layers/supabase/security-policies.md` |

### 4.4 Aplicações (apps/admin + apps/student)
| Arquivo | Caminho |
|---|---|
| Admin canvas plan | `docs/layers/apps/admin_canvas_plan.md` |
| Mobile player plan | `docs/layers/apps/mobile_player_plan.md` |
| Preview fidelity (ADR-005) | `docs/adrs/ADR-005-preview-fidelity-law.md` |
| Workflow admin | `docs/workflows/workflow_adm.md` |
| App integration | `docs/skills/app_integration.md` |
| Optimistic UI | `docs/skills/optimistic_ui.md` |
| Next.js performance | `docs/skills/nextjs_performance_seo.md` |

### 4.5 Core & Domínio (packages/core)
| Arquivo | Caminho |
|---|---|
| Domain logic | `docs/layers/core/domain-logic.md` |
| Event architecture | `docs/layers/core/event-architecture.md` |
| Offline strategy | `docs/layers/core/offline-strategy.md` |
| DDD patterns | `docs/skills/ddd_patterns.md` |
| Offline first | `docs/skills/offline_first.md` |
| State management | `docs/skills/state_management_protocol.md` |

### 4.6 Renderer (packages/renderer)
| Arquivo | Caminho |
|---|---|
| Engine spec | `docs/layers/renderer/engine-spec.md` |
| Design patterns | `docs/skills/design_patterns.md` |

### 4.7 Infraestrutura & DevOps
| Arquivo | Caminho |
|---|---|
| Execution plan | `docs/layers/infra/execution_plan.md` |
| CI/CD pipeline | `docs/skills/ci_cd_pipeline.md` |
| Observability | `docs/layers/infra/observability.md` |
| Error handling | `docs/skills/error_handling_observability.md` |

### 4.8 Padrões Globais
| Arquivo | Caminho |
|---|---|
| Clean code | `docs/skills/clean_code_standards.md` |
| TDD workflow | `docs/skills/tdd_workflow.md` |
| SOLID principles | `docs/skills/solid_principles.md` |
| pnpm management | `docs/skills/pnpm_management.md` |
| Code hygiene | `docs/skills/codebase_hygiene_git.md` |
| Architectural integrity | `docs/skills/architectural_integrity.md` |
| XSS prevention | `docs/skills/security_xss_prevention.md` |

### 4.9 Testes E2E (Playwright)
| Arquivo | Caminho |
|---|---|
| E2E plan | `docs/layers/testing/e2e_playwright_plan.md` |
| Test strategy | `docs/layers/testing/estratégia_de_testes.md` |
| Test files | `tests/e2e/*.spec.ts` |
| Config | `playwright.config.ts` |
| E2E testing skill | `docs/skills/e2e_testing.md` |

### 4.10 Escalabilidade e Performance
| Arquivo | Caminho |
|---|---|
| Scalability plan | `docs/roadmaps/scalability-plan.md` |
| PostgreSQL perf | `docs/skills/postgresql_performance.md` |
| Redis caching | `docs/skills/redis_caching_strategy.md` |
| Connection pooling | `docs/skills/connection_pooling.md` |
| Rate limiting | `docs/skills/rate_limiting.md` |
| Multitenancy RLS | `docs/skills/multitenancy_rls.md` |
| Video streaming CDN | `docs/skills/video_streaming_cdn.md` |
| Edge runtime | `docs/skills/edge_runtime_middleware.md` |

---

## 5. Skills Obrigatórias (Sempre que houver código)

| Skill | Caminho | Quando activar |
|---|---|---|
| Senior Engineer | `docs/skills/senior-engineer.md` | Toda sessão com escrita/modificação de código |
| TDD Agent | `docs/skills/tdd-agent.md` | Toda sessão com testes ou implementação |
| Document Loader | `docs/skills/document-loader.md` | Toda sessão com implementação/alteração de código |

---

## 6. Scripts de Validação

| Script | Comando | Função |
|---|---|---|
| Validate Session | `pnpm run validate:session` | Verifica integridade da sessão (task activa, ADRs, config, buffer) |
| Close Session | `pnpm run close:session` | Checklist de encerramento (working tree, testes, buffer, backlog) |

---

## 7. Estrutura do Repositório (Visão Geral)

```text
/
├── governance/              ← Entrada obrigatória + governança
│   ├── WORKFLOW.md           ← Fluxo da sessão
│   ├── SYSTEM_MAP.md         ← Mapa central (este)
│   ├── context/
│   │   └── context_buffer.yaml
│   ├── agents/               ← Contratos de agentes
│   ├── contracts/            ← Índice de contratos
│   ├── handoffs/             ← Protocolos de transição
│   └── policies/             ← Políticas operacionais
│
├── docs/                    ← Documentação do projecto
│   ├── AGENTS.md
│   ├── FORBIDDEN_OPERATIONS.md
│   ├── DESDO.md
│   ├── INDEX.md
│   ├── Requisitos_plataforma.md
│   ├── BACKLOG.md
│   ├── adrs/
│   ├── plans/
│   ├── skills/
│   ├── layers/
│   ├── workflows/
│   └── roadmaps/
│
├── scripts/                 ← Scripts de automação
│   ├── validate-session.ts
│   ├── close-session.ts
│   ├── verify-ui-rules.ts
│   └── ...
│
├── cognition/               ← Infraestrutura cognitiva
│   ├── context/
│   ├── memory/
│   └── prompts/
│
├── packages/                ← Monorepo
│   ├── ui/
│   ├── core/
│   ├── types/
│   └── renderer/
│
├── apps/                    ← Aplicações
│   ├── admin/
│   └── student/
│
└── supabase/                ← Banco de dados
    └── migrations/
```
