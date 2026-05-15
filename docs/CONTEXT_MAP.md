# 🗺️ MAPA DE CONTEXTO - INFRAESTRUTURA DE EDUCAÇÃO COM CMS

# 📖 ORDEM OBRIGATÓRIA DE LEITURA

* P0 → docs/AGENTS.md
* P1 → docs/context_buffer.md
* P2 → layer específica da task
* P3 → arquivos correlatos
* P4 → docs/history/

Você deve consultar os arquivos abaixo via MCP *apenas quando* o usuário solicitar tarefas relacionadas ao escopo descrito. Não leia todos os arquivos de uma vez.

## 💾 1. Camada de Contratos de Dados (Packages/Types)
- **Escopo:** Mudanças nas tipagens TypeScript, esquemas de validação Zod, estruturas JSONB dos blocos e payloads de API.
- **Arquivos para ler se acionado:** 
  - `docs/layers/types/execution_plan.md`
  - `docs/layers/types/zod_strict_validation_skill.md`
  - `docs/layers/types/jsonb-governance.md`
  - `docs/layers/types/data-lifecycle.md`

## 🎨 2. Design System e Componentes Visuais (Packages/UI)
- **Escopo:** Configuração de tokens Tamagui, temas, componentes atômicos do Canvas (Texto, Vídeo, Quiz) e compilação Cross-Platform.
- **Arquivos para ler se acionado:
  - `docs/layers/ui/execution_plan.md`
  - `docs/layers/ui/tamagui_tokenization_skill.md`
  - `docs/layers/ui/token-governance.md`

## 🛡️ 3. Persistência, Banco de Dados e Segurança (Supabase)
- **Escopo:** Migrations do PostgreSQL, tabelas de aulas, colunas JSONB, políticas RLS e Storage de mídias.
- **Arquivos para ler se acionado:
  - `docs/layers/supabase/database_schema_plan.md`
  - `docs/layers/supabase/rls_governance_skill.md`
  - `docs/layers/supabase/security-policies.md`

## 🌐 4. Aplicações Finais (Apps Admin-Web & Aluno-Mobile)
- **Escopo:** Telas do construtor visual (estilo Canva), hooks de consumo, sincronização de dados e roteamento no Next.js / Expo.
- **Arquivos para ler se acionado:
  - `docs/layers/apps/admin_canvas_plan.md`
  - `docs/layers/apps/mobile_player_plan.md`

## 🧠 5. Core & Domínio Compartilhado (Packages/Core)
- **Escopo:** Regras de negócio isoladas da interface, serviços compartilhados, policies, use cases, adapters, event bus, undo/redo e estratégia offline.
- **Arquivos para ler se acionado:
  - `docs/layers/core/domain-logic.md`
  - `docs/layers/core/event-architecture.md`
  - `docs/layers/core/offline-strategy.md`

## ⚙️ 6. Motor de Renderização (Packages/Renderer)
- **Escopo:** Registry de componentes, dynamic imports, lazy loading, plugins e marketplace futuro do CMS.
- **Arquivos para ler se acionado:
  - `docs/layers/renderer/engine-spec.md`

## 🔍 7. Infraestrutura & Observabilidade
- **Escopo:** Telemetria, logs estruturados, tracing, métricas, lint arquitetural, scanner de imports, validação de boundaries e automação de schemas.
- **Arquivos para ler se acionado:
  - `docs/layers/infra/observability.md`
  - `docs/layers/infra/future-automation.md`
