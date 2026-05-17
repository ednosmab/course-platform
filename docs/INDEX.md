# ÍNDICE GERAL DE GOVERNANÇA E DOCUMENTAÇÃO (INDEX.md)

Este índice centraliza todo o ecossistema documental, regras cognitivas e planos de execução estruturados no monorepo para facilitar o mapeamento preguiçoso do servidor MCP.

---

## 🏛️ 1. Governança e Regras Globais (P0 / P1)
* **Regras Mestre de Engenharia:** [docs/AGENTS.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/AGENTS.md)
* **Memória RAM Ativa de Sessão:** [docs/context_buffer.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/context_buffer.md)
* **Roteador Geral de Camadas (Lazy Loading):** [docs/CONTEXT_MAP.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/CONTEXT_MAP.md)

---

## 🛠️ 2. Registros de Decisões de Arquitetura (ADRs)
* **ADR-001 (Escolha da Stack e Primitivos Tamagui):** [docs/adrs/0001-escolha-da-stack-e-estilizacao.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/adrs/0001-escolha-da-stack-e-estilizacao.md)
* **ADR-002 (Motor de Workflow Multiagente):** [docs/adrs/ADR-002-workflow-engine.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/adrs/ADR-002-workflow-engine.md)
* **ADR-003 (Arquitetura de Memória Ativa/Histórica):** [docs/adrs/ADR-003-memory-architecture.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/adrs/ADR-003-memory-architecture.md)
* **ADR-004 (Governança e Segurança do Servidor MCP):** [docs/adrs/ADR-004-mcp-server-governance.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/adrs/ADR-004-mcp-server-governance.md)

---

## 📐 3. Planos de Execução por Camadas (P2)
* **Contratos de Dados (Types):** [docs/layers/types/execution_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/types/execution_plan.md)
* **Design System (UI):** [docs/layers/ui/execution_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/ui/execution_plan.md)
* **Banco de Dados (Supabase Plan):** [docs/layers/supabase/database_schema_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/supabase/database_schema_plan.md)
* **Banco de Dados (RLS Governance):** [docs/layers/supabase/rls_governance_skill.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/supabase/rls_governance_skill.md)
* **Aplicação Construtor (Admin Canvas):** [docs/layers/apps/admin_canvas_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/apps/admin_canvas_plan.md)
* **Aplicação Player (Mobile Player):** [docs/layers/apps/mobile_player_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/apps/mobile_player_plan.md)
* **DevOps e Automação (Infra Plan):** [docs/layers/infra/execution_plan.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/layers/infra/execution_plan.md)

---

## 🤖 4. Contratos de IA & Handoffs (/governance/)
* **Índice de Contratos:** [governance/contracts/CONTRACTS_INDEX.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/governance/contracts/CONTRACTS_INDEX.md)
* **Regras Operacionais Globais:** [governance/policies/GOV-POLICY-operational-rules-v1.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/governance/policies/GOV-POLICY-operational-rules-v1.md)
* **Handoff Planner -> Executor:** [governance/handoffs/WF-HANDOFF-planner-to-executor-v1.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/governance/handoffs/WF-HANDOFF-planner-to-executor-v1.md)
* **Handoff Executor -> Reviewer:** [governance/handoffs/WF-HANDOFF-executor-to-reviewer-v1.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/governance/handoffs/WF-HANDOFF-executor-to-reviewer-v1.md)
* **Handoff Reviewer -> Orchestrator:** [governance/handoffs/WF-HANDOFF-reviewer-to-orchestrator-v1.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/governance/handoffs/WF-HANDOFF-reviewer-to-orchestrator-v1.md)

---

## 🧠 5. Cognição e Inteligência Contextual (/cognition/)
* **Hierarquia de Contexto:** [cognition/context/CONTEXT_HIERARCHY.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/cognition/context/CONTEXT_HIERARCHY.md)
* **Memória Operacional Ativa (JSON):** [cognition/memory/MEM-operational-state-v1.json](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/cognition/memory/MEM-operational-state-v1.json)
