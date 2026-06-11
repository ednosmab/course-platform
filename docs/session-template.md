# 📋 TEMPLATE DE FIM DE SESSÃO

> Copie este template para `docs/history/YYYY-MM-DD-sessao-NN.md` no fim de cada sessão.
> Regra vinculante: DT-02 em `docs/FORBIDDEN_OPERATIONS.md`.
> **Antes de encerrar, execute:** `pnpm run close:session`

---

## 1. Identificação
- **Data:** YYYY-MM-DD
- **Sessão:** NN
- **Tipo:** `FEATURE` | `BUG` | `REFACTOR` | `DOCUMENTATION` | `PLANNING`
- **Duração estimada:** Xh

## 2. Objectivo da Sessão
[1-2 frases — o que se pretendia]

## 3. Estado do Working Tree (OBRIGATÓRIO)
- [ ] `git status` não tem ficheiros "untracked" ou "modified" não relacionados
- [ ] Se existem ficheiros não relacionados: **justificativa datada** (violaria DT-02)
- [ ] Branch: `git branch --show-current`
- [ ] Diff: `git diff --stat` (linhas adicionadas/removidas)

## 4. Tarefas Concluídas
- [x] Item 1 — commit `xxxxx` — descrição curta
- [x] Item 2 — commit `xxxxx` — descrição curta

## 5. Tarefas Paradas (com data de revisão)
- [ ] Item Y [REVISIT: YYYY-MM-DD] — motivo do adiamento, próximo passo

## 6. Dívida Técnica Identificada
| Item | Severidade | Due | Acção |

## 7. Validações Executadas
- [ ] `pnpm run validate:session` — all checks pass
- [ ] `pnpm run close:session` — checklist completo (inclui UI governance + build)
- [ ] `pnpm run test` — X/X passam
- [ ] `tsc --noEmit` — 0 erros
- [ ] `pnpm run verify:ui` — UI rules pass
- [ ] `pnpm run build:verify` — build admin + student ok
- [ ] Buffer YAML actualizado (`governance/context/context_buffer.yaml`)
- [ ] Backlog actualizado
- [ ] SESSION_REVIEW preenchido (`governance/reviews/SESSION_REVIEW.md`)

## 8. Decisões Arquitecturais (SDR/ADR)
- [Link SDR-NNN] — decisão e justificação
- [Link ADR-NNN] — decisão e justificação

## 9. Próxima Sessão
- **Primeira tarefa (P0 — obrigatório, ver WORKFLOW.md):** [item]
- **Branch:** `feat/...`
- **Pipeline de merge (Caminho C):** ver `docs/runbooks/merge-dnd-to-develop.md` se a feature estiver pronta

---

## 🚦 Quick Board (apresentar no início de cada sessão)

> ⚠️ **Obrigatório** (WORKFLOW.md regra): a IA DEVE apresentar este bloco na PRIMEIRA resposta de cada sessão, antes de qualquer acção.

```
🔴 Em curso:    [item P0 em desenvolvimento]
🟡 Parado:      [items pausados com [REVISIT: YYYY-MM-DD]]
⏭️ Próximo:     [próximo item da fila]
⏸️ P1 paralelas: [dívidas com due date próximas]
```

Fonte: `governance/context/context_buffer.yaml` → secção `current_task`.
