# CONTEXT_HIERARCHY: Hierarquia de Contexto do Servidor MCP

## 🎯 1. Objetivo
Mapear de forma clara e determinística a precedência e a árvore de resolução de contexto para garantir que os agentes inteligentes executem leitura preguiçosa (lazy loading) otimizada, reduzindo custos de tokens e prevenindo o estouro da janela de contexto.

---

## 📐 2. A Árvore de Precedência Cognitiva (Níveis de Leitura)

A leitura do repositório por qualquer agente cognitivo deve seguir estritamente a hierarquia linear abaixo:

```
[Nível 0: P0] docs/AGENTS.md ── (Regras Globais e Limites)
       │
       ▼
[Nível 1: P1] docs/context_buffer.md ── (RAM Ativa, Status e Impedimentos)
       │
       ▼
[Nível 2: P2] docs/layers/[camada]/execution_plan.md ── (O Plano Técnico)
       │
       ▼
[Nível 3: P3] Código e Arquivos Correlatos da Camada ── (Escrita Cirúrgica)
       │
       ▼
[Nível 4: P4] docs/history/ ── (Auditoria Histórica e ROM - Sob Demanda)
       │
       ▼
[⚡ Cross-cutting] docs/skills/senior-engineer.md ── (Postura Operacional — obrigatório em TODO código)
```

> **⚡ Cross-cutting:** A skill `docs/skills/senior-engineer.md` aplica-se a **todas as camadas** sempre que houver escrita, refatoração ou revisão de código. Deve ser activada em paralelo com o P2 da camada corrente, antes de qualquer alteração. Define a postura metódica, a verificação pós-step e a proibição de alterações fora de escopo.

---

## 🛠️ 3. Resolução Prática de Contexto por Camada
Ao receber uma solicitação de tarefa do usuário, o Orquestrador indicará qual camada está ativa. O agente ativo deve carregar *apenas* os arquivos recomendados para aquela camada descritos em [docs/CONTEXT_MAP.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/CONTEXT_MAP.md):

### Camada 1: Contratos de Dados (Types)
* **Contexto Primário:** `docs/layers/types/execution_plan.md` + `docs/skills/zod_validation.md`
* **Escopo Físico:** `packages/types/`

### Camada 2: Design System e Interface (UI)
* **Contexto Primário:** `docs/layers/ui/execution_plan.md` + `docs/skills/tamagui_ui.md`
* **Escopo Físico:** `packages/ui/`

### Camada 3: Banco de Dados e Segurança (Supabase)
* **Contexto Primário:** `docs/layers/supabase/database_schema_plan.md` + `docs/skills/supabase_rls.md`
* **Escopo Físico:** `supabase/migrations/`

### Camada 4: Aplicações (Apps)
* **Contexto Primário:** `docs/layers/apps/[admin_canvas_plan | mobile_player_plan].md`
* **Escopo Físico:** `apps/admin/` ou `apps/student/`
