---
name: document-loader
description: |
  Use BEFORE implementing any code change in the CMS monorepo. This skill is triggered automatically when the task involves creating, modifying, or refactoring code. It enforces the mandatory project document loading protocol (P0→P1→P2→P3→P4 hierarchy from CONTEXT_HIERARCHY.md).

  Trigger keywords: implement, refactor, create, add, fix, change, modify, migrate, deploy, build, test, write code, develop, codificar, implementar, refatorar, criar, adicionar, corrigir, modificar
---

# 📖 Document Loading Protocol — Mandatory

## Hierarquia de Leitura Obrigatória

Sempre que receber uma tarefa de **implementação, refatoração, correção ou alteração de código**, você DEVE executar este protocolo de leitura em ordem, ANTES de qualquer modificação:

```
P0 (sempre) →
  docs/AGENTS.md
  docs/FORBIDDEN_OPERATIONS.md
  docs/DESDO.md
  docs/Requisitos_plataforma.md
  cognition/context/CONTEXT_HIERARCHY.md
  docs/INDEX.md

P1 →
  docs/context_buffer.md

P2 (específico da camada) →
  Ver docs/CONTEXT_MAP.md para identificar a camada

P3 →
  Arquivos correlatos do código-fonte

P4 (apenas se solicitado) →
  docs/history/
```

## Algoritmo de 4 Passos (AGENTS.md)

Use o MCP **local-filesystem** (já configurado) para ler os arquivos.

### PASSO 1: Diagnóstico e Leitura Preguiçosa
- Leia `docs/CONTEXT_MAP.md` → localize a camada da task
- Leia `docs/context_buffer.md` → estado da última execução
- Leia os planos/skills da camada afetada

### PASSO 2: Atualização da Memória RAM (Before-Code)
- Reescreva `docs/context_buffer.md` com:
  - `## 🎯 Tarefa em Execução` — objetivo imediato
  - `## 🕹️ Documentos Carregados via MCP` — arquivos lidos

### PASSO 3: Execução Cirúrgica
- Código dentro da pasta permitida
- Se erro de TypeScript/Lint/Zod → pare, documente no buffer, depois corrija

### PASSO 4: Consolidação e Purga (After-Code)
- Marque `[x]` no plano
- Limpe `⚠️ Impedimentos` do buffer
- Exiba estado resumido

## Mapa de Camadas vs Documentos

| Camada | Pasta | Documento P2 |
|--------|-------|-------------|
| Types (contratos) | `packages/types/` | `docs/layers/types/execution_plan.md` + skills de Zod |
| UI (Design System) | `packages/ui/` | `docs/layers/ui/execution_plan.md` + skills Tamagui |
| Supabase (DB) | `supabase/migrations/` | `docs/layers/supabase/database_schema_plan.md` + skills RLS |
| Admin App | `apps/admin/` | `docs/layers/apps/admin_canvas_plan.md` |
| Student App | `apps/student/` | `docs/layers/apps/mobile_player_plan.md` |
| Core (domínio) | `packages/core/` | `docs/layers/core/domain-logic.md` |
| Renderer | `packages/renderer/` | `docs/layers/renderer/engine-spec.md` |
| Infra/DevOps | — | `docs/layers/infra/execution_plan.md` |

## Checklist de Conformidade (pós-task)

Antes de finalizar qualquer tarefa, verifique:
- [ ] Commits em **inglês** (Conventional Commits)
- [ ] JSDoc em todas as funções exportadas novas/modificadas (DESDO.md §6)
- [ ] Nenhum `console.error`/`throw` em português
- [ ] Nenhuma cor hex hardcoded — use tokens `$color`
- [ ] Nenhum `<div>`/`<span>`/`<button>` cru em `packages/ui/`
- [ ] Nenhum import direto de `lucide-react`
- [ ] Testes atualizados ou criados
- [ ] `pnpm run test` verde
- [ ] `pnpm run build:verify` verde
