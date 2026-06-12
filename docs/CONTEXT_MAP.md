# 🗺️ MAPA DE CONTEXTO - INFRAESTRUTURA DE EDUCAÇÃO COM CMS

# 📖 ORDEM OBRIGATÓRIA DE LEITURA

* P0 → docs/AGENTS.md
* P0.1 → docs/FORBIDDEN_OPERATIONS.md (Regras vinculantes para IA — leitura obrigatória)
* P0.15 → docs/DESDO.md (Diretrizes de engenharia, SOLID, TDD, segurança, documentação)
* P0.2 → docs/INDEX.md
* P0.3 → docs/Requisitos_plataforma.md (Bíblia de Requisitos da Plataforma)
* P0.4 → cognition/context/CONTEXT_HIERARCHY.md
* P1 → docs/context_buffer.md
* P2 → layer específica da task
* P3 → arquivos correlatos
* P4 → docs/history/

Você deve consultar os arquivos abaixo via MCP *apenas quando* o usuário solicitar tarefas relacionadas ao escopo descrito. Não leia todos os arquivos de uma vez.

## 💾 1. Camada de Contratos de Dados (Packages/Types)
- **Escopo:** Mudanças nas tipagens TypeScript, esquemas de validação Zod, estruturas JSONB dos blocos e payloads de API.
- **Arquivos para ler se acionado:** 
  - `docs/layers/types/execution_plan.md`
  - `docs/skills/zod_validation.md`
  - `docs/skills/jsonb_governance.md`
  - `docs/skills/supabase_type_safety.md`
  - `docs/layers/types/jsonb-governance.md`
  - `docs/layers/types/data-lifecycle.md`

## 🎨 2. Design System e Componentes Visuais (Packages/UI)
- **Escopo:** Configuração de tokens Tamagui, temas, componentes atômicos do Canvas (Texto, Vídeo, Quiz), compilação Cross-Platform e reforma do Design System (DSv2).
- **Plano Mestre:** `docs/roadmaps/design-system-reforma.md`
- **Arquivos para ler se acionado:**
  - `docs/layers/ui/execution_plan.md`
  - `docs/layers/ui/tamagui_tokenization_skill.md`
  - `docs/skills/tamagui_ui.md`
  - `docs/skills/ui_ux_principles.md`
  - `docs/skills/responsividade.md`
  - `docs/skills/animation_protocol.md`
  - `docs/layers/ui/token-governance.md`
  - `packages/ui/src/tokens/*.ts`
  - `docs/skills/student-header.md`
  - `docs/skills/admin-header.md`

## 🛡️ 3. Persistência, Banco de Dados e Segurança (Supabase)
- **Escopo:** Migrations do PostgreSQL, tabelas de aulas, colunas JSONB, políticas RLS e Storage de mídias.
- **Arquivos para ler se acionado:**
  - `docs/layers/supabase/database_schema_plan.md`
  - `docs/layers/supabase/rls_governance_skill.md`
  - `docs/skills/supabase_rls.md`
  - `docs/skills/supabase_auth_jwt.md`
  - `docs/skills/supabase_edge_functions.md`
  - `docs/skills/supabase_realtime.md`
  - `docs/skills/supabase_storage.md`
  - `docs/skills/postgresql_performance.md`
  - `docs/layers/supabase/security-policies.md`

## 🌐 4. Aplicações Finais (Apps Admin-Web & Aluno-Mobile)
- **Escopo:** Telas do construtor visual (estilo Canva), hooks de consumo, sincronização de dados e roteamento no Next.js / Expo.
- **Arquivos para ler se acionado:**
  - `docs/layers/apps/admin_canvas_plan.md`
  - `docs/layers/apps/mobile_player_plan.md`
  - `docs/adrs/ADR-005-preview-fidelity-law.md`
  - `docs/workflows/workflow_adm.md`
  - `docs/skills/app_integration.md`
  - `docs/skills/optimistic_ui.md`
  - `docs/skills/nextjs_performance_seo.md`

## 🧠 5. Core & Domínio Compartilhado (Packages/Core)
- **Escopo:** Regras de negócio isoladas da interface, serviços compartilhados, policies, use cases, adapters, event bus, undo/redo e estratégia offline.
- **Arquivos para ler se acionado:
  - `docs/layers/core/domain-logic.md`
  - `docs/layers/core/event-architecture.md`
  - `docs/layers/core/offline-strategy.md`
  - `docs/skills/ddd_patterns.md`
  - `docs/skills/offline_first.md`
  - `docs/skills/state_management_protocol.md`

## ⚙️ 6. Motor de Renderização (Packages/Renderer)
- **Escopo:** Registry de componentes, dynamic imports, lazy loading, plugins e marketplace futuro do CMS.
- **Arquivos para ler se acionado:**
  - `docs/layers/renderer/engine-spec.md`
  - `docs/skills/design_patterns.md`

## 🔍 7. Infraestrutura, DevOps & Observabilidade
- **Escopo:** CI/CD (GitHub Actions), Telemetria, logs estruturados, tracing, métricas, lint arquitetural, scanner de imports, validação de boundaries e automação de schemas.
- **Arquivos para ler se acionado:**
  - `docs/layers/infra/execution_plan.md`
  - `docs/skills/ci_cd_pipeline.md`
  - `docs/layers/infra/observability.md`
  - `docs/skills/error_handling_observability.md`
  - `docs/layers/infra/future-automation.md`

## 🧼 8. Padrões Globais & Qualidade
- **Escopo:** Padrões de Clean Code, arquitetura, nomenclatura e diretrizes de qualidade do monorepo.
- **Arquivos para ler se acionado:**
  - `docs/skills/clean_code_standards.md`
  - `docs/skills/tdd_workflow.md`
  - `docs/skills/solid_principles.md`
  - `docs/skills/pnpm_management.md`
  - `docs/skills/codebase_hygiene_git.md`
  - `docs/skills/architectural_integrity.md`
  - `docs/skills/security_xss_prevention.md`

## 🧪 9. Testes de Ponta a Ponta (E2E) e Qualidade (Playwright)
- **Escopo:** Configuração do Playwright, suítes de teste automatizadas para os fluxos principais (CMS e Portal do Aluno), mocking de chamadas ao banco de dados e políticas antifalha de regressão.
- **Arquivos para ler se acionado:
  - `docs/layers/testing/e2e_playwright_plan.md`
  - `docs/layers/testing/estratégia_de_testes.md`
  - `docs/layers/infra/execution_plan.md`
  - `tests/e2e/*.spec.ts`
  - `playwright.config.ts`

## ⚡ 10. Escalabilidade e Performance
- **Escopo:** Suporte a 3k/10k/50k+ conexões simultâneas, cache, pool de conexões, rate limiting, CDN, multitenancy, observabilidade.
- **Arquivos para ler se acionado:**
  - `docs/roadmaps/scalability-plan.md` — Plano mestre de escalabilidade
  - `docs/skills/postgresql_performance.md` — Performance PostgreSQL
  - `docs/skills/redis_caching_strategy.md` — Cache Redis e Write-Behind
  - `docs/skills/connection_pooling.md` — PgBouncer e Pooler
  - `docs/skills/rate_limiting.md` — Rate limiting com Redis
  - `docs/skills/multitenancy_rls.md` — Multitenancy com RLS
  - `docs/skills/video_streaming_cdn.md` — CDN de vídeo (Bunny/Cloudflare)
  - `docs/skills/edge_runtime_middleware.md` — Edge Runtime e Middleware
  - `docs/skills/observability.md` — Logs, métricas e alertas
  - `docs/layers/infra/execution_plan.md` — Plano de execução de infra
