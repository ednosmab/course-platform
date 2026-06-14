# 📊 Nexus Guide — Relatório de Estado

> **Data:** 2026-06-13
> **Versão:** 2.0 (pós-actualização)
> **Estado:** Actualizado e operacional

---

## 1. Resumo Executivo

O Nexus Guide foi actualizado em 2026-06-13 para reflectir o estado actual do projeto, incorporando lições aprendidas da Fase P0 (especialmente a invalidação da ADR-022 Connection Pooling). As alterações focam em 4 áreas principais:

1. **Fluxo de Investigação** — Novo tipo de operação para validar hipóteses arquiteturais
2. **Princípio "Evidência Acima da Documentação"** — Regra absoluta para decisões técnicas
3. **Estados Formais de Item** — 8 estados com 2 terminais independentes
4. **Documentação As-Built** — Formalização do estado real do sistema

---

## 2. Documentos Actualizados

### 2.1 WORKFLOW.md (Framework de Desenvolvimento)

| Secção | Alteração | Impacto |
|---|---|---|
| Tipos de operação | Adicionado `INVESTIGATION` | Novo fluxo para validação de hipóteses |
| Fluxo INVESTIGATION | Secção completa (5 passos) | Hipótese → Investigação → Evidência → Decisão → Encerramento |
| Estrutura do repositório | Adicionados As-Built docs | CURRENT_STATE.md, GAP_ANALYSIS.md, BACKLOG_TECHNICAL_DEBT.md |

**Impacto:** Agentes podem agora operar em modo de investigação quando hipóteses arquiteturais precisam ser validadas antes de implementação.

### 2.2 AGENTS.md (Regras do Time de Engenharia)

| Regra | Conteúdo | Origem |
|---|---|---|
| #18 | **Evidência Acima da Documentação** | Lição da ADR-022 |
| #19 | **Medir Antes de Optimizar** | Princípio fundamental |
| #20 | **Estados de Item do Backlog** | 8 estados formais |
| #21 | **Checklist de Conclusão** | 4 requisitos obrigatórios |

**Impacto:** Regras claras para:
- Decisões baseadas em evidências (não documentação)
- Optimizações apenas com métricas que as justifiquem
- Estados de item padronizados (concluído ≠ encerrado)
- Checklist de conclusão (docs + backlog + validação + decisão)

### 2.3 FORBIDDEN_OPERATIONS.md (Regras Vinculantes)

| Regra | Conteúdo | Justificativa |
|---|---|---|
| DT-05 | **PROIBIDO optimizar sem métricas** | Excepto P0 (risco activo) |

**Impacto:** Nenhuma optimização de performance, cache ou escalabilidade pode avançar sem evidência que a justifique.

### 2.4 SYSTEM_MAP.md (Mapa Centralizado)

| Secção | Conteúdo | Propósito |
|---|---|---|
| 3.1 Documentação As-Built | 3 ficheiros formalizados | Estado real vs. estado documentado |

**Impacto:** Documentação As-Built agora é parte oficial do mapa do sistema.

---

## 3. Evidência Técnica

### 3.1 Commits da Actualização

```
766d962 docs(backlog): add P1-01 Observabilidade and P1-02 Testes de Carga to main backlog
b3ccc6f docs(governance): update Nexus Guide with investigation flow, evidence principle, item states
```

### 3.2 Ficheiros Alterados

| Ficheiro | Linhas Adicionadas | Linhas Removidas | Net |
|---|---|---|---|
| `governance/WORKFLOW.md` | 41 | 1 | +40 |
| `docs/AGENTS.md` | 29 | 1 | +28 |
| `docs/FORBIDDEN_OPERATIONS.md` | 1 | 0 | +1 |
| `governance/SYSTEM_MAP.md` | 15 | 1 | +14 |
| `docs/BACKLOG.md` | 6 | 0 | +6 |
| `governance/context/context_buffer.yaml` | 1 | 0 | +1 |
| **Total** | **93** | **3** | **+90** |

### 3.3 Mudança por Documento

```
governance/WORKFLOW.md       | 41 ++++++++++++++++++++++++++++++++++++++++-
docs/AGENTS.md               | 29 ++++++++++++++++++++++++++++-
governance/SYSTEM_MAP.md     | 15 +++++++++++++++
docs/FORBIDDEN_OPERATIONS.md |  1 +
docs/BACKLOG.md              |  6 ++++++
```

---

## 4. Alinhamento com Estado Actual do Projeto

### 4.1 Fase P0 (Concluída)

| Item | Estado | Evidência |
|---|---|---|
| Rate Limiting | ✅ Implementado | `packages/core/src/infrastructure/rate-limiter.ts` |
| Dev RLS Override | ✅ Documentado | `supabase/migrations/20260517000001_dev_permissions.sql` |
| Connection Pooling | ❌ Invalidado | ADR-022 — evidência: SDK HTTP only |

### 4.2 Fase P1 (Próxima)

| Item | Prioridade | Dependências |
|---|---|---|
| P1-01 Observabilidade | 🔴 Crítico | Nenhuma |
| P1-02 Testes de Carga | 🟠 Alto | P1-01 |

### 4.3 Fluxos Operacionais

| Fluxo | Estado | Documentação |
|---|---|---|
| FEATURE | ✅ Operacional | WORKFLOW.md § Fluxo FEATURE |
| BUG | ✅ Operacional | WORKFLOW.md § Fluxo BUG |
| REFACTOR | ✅ Operacional | WORKFLOW.md § Fluxo REFACTOR |
| DOCUMENTATION | ✅ Operacional | WORKFLOW.md § Fluxo DOCUMENTATION |
| PLANNING | ✅ Operacional | WORKFLOW.md § Fluxo PLANNING |
| INVESTIGATION | ✅ Operacional | WORKFLOW.md § Fluxo INVESTIGATION |

---

## 5. Conformidade com Princípios

### 5.1 Princípio "Evidência Acima da Documentação"

| Caso | Documentação Dizia | Evidência Mostrou | Decisão |
|---|---|---|---|
| ADR-022 | "Connection pooling necessário" | "SDK HTTP only, zero acesso directo" | Invalidado |

### 5.2 Princípio "Medir Antes de Optimizar"

| Optimização | Métricas Exigidas | Gate |
|---|---|---|
| Redis Cache | queries/second > 50 | P1-02 Testes de Carga |
| CDN | latency p95 > 500ms | P1-01 Observabilidade |
| Connection Pooling | conexões > 80% do limite | Invalidado (ADR-022) |

### 5.3 Estados Formais de Item

| Estado | Terminal | Exemplo de Uso |
|---|---|---|
| `concluído` | Sim | Rate Limiting implementado |
| `encerrado` | Sim | Connection Pooling invalidado |
| `em investigação` | Não | Hipótese a ser validada |
| `pausado` | Não | Bloqueio externo |

---

## 6. Próximos Passos

### 6.1 Imediatos (Próxima Sessão)

1. **Elaborar plano detalhado P1-01 Observabilidade**
   - Library de métricas (opções: `@vercel/analytics`, `prom-client`, `pino`)
   - Dashboard (request rate, error rate, latency P50/P95/P99)
   - Alertas (P95 > 500ms, error rate > 1%)
   - Logs estruturados JSON

2. **Revisar arquitetura operacional futura**
   - Infraestrutura de deployment
   - CI/CD pipeline
   - Monitoramento e alertas

### 6.2 Curto Prazo (≤ 30 dias)

| Item | Severidade | Dependências |
|---|---|---|
| P1-01 Observabilidade | 🔴 Crítico | Nenhuma |
| P1-02 Testes de Carga | 🟠 Alto | P1-01 |

### 6.3 Médio Prazo (≤ 90 dias)

| Item | Dependências |
|---|---|
| P1-03 Cache Invalidation | P1-01, P1-02 |
| P1-04 Monitoramento de Conexões | P1-01, P1-02 |

---

## 7. Validação

### 7.1 Conformidade do Nexus Guide

| Critério | Estado | Evidência |
|---|---|---|
| Fluxos operacionais definidos | ✅ | WORKFLOW.md (6 fluxos) |
| Regras vinculantes documentadas | ✅ | FORBIDDEN_OPERATIONS.md (DT-01 a DT-05) |
| Estados formais de item | ✅ | AGENTS.md regra #20 |
| Documentação As-Built | ✅ | SYSTEM_MAP.md secção 3.1 |
| Princípios de decisão | ✅ | AGENTS.md regras #18 e #19 |

### 7.2 Conformidade com o Projeto

| Critério | Estado | Evidência |
|---|---|---|
| P0 fechado | ✅ | context_buffer.yaml milestone.status |
| P1 definido | ✅ | BACKLOG.md secção P1 |
| ADR-022 registada | ✅ | docs/adrs/ADR-022-connection-pooling-removal.md |
| Commits empurrados | ✅ | `git log --oneline -5` |

---

## 8. Conclusão

O Nexus Guide está **actualizado e operacional**, refletindo fielmente o estado actual do projeto:

- ✅ Fase P0 encerrada com evidência técnica (ADR-022)
- ✅ Fase P1 definida com P1-01 Observabilidade como próximo passo
- ✅ Fluxos operacionais completos (6 tipos de operação)
- ✅ Regras vinculantes actualizadas (DT-01 a DT-05)
- ✅ Princípios de decisão documentados (evidência > docs, medir > optimizar)
- ✅ Estados formais de item padronizados (8 estados, 2 terminais)
- ✅ Documentação As-Built formalizada

**Próxima acção:** Elaborar plano detalhado para P1-01 Observabilidade.

---

*Relatório gerado em 2026-06-13. Commits: `b3ccc6f`, `766d962`.*
