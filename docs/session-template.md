# 📋 TEMPLATE DE FIM DE SESSÃO

> Copie este template para `docs/history/YYYY-MM-DD-sessao-NN.md` no fim de cada sessão.
> Regra vinculante: DT-02 em `docs/FORBIDDEN_OPERATIONS.md`.

## 1. Identificação
- **Data:** YYYY-MM-DD
- **Sessão:** NN
- **Modo:** `implementação` | `bug-fix` | `refactor` | `revisão` | `planeamento`
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
- [ ] `pnpm run lint` — 0 erros
- [ ] `pnpm run test` — X/X passam
- [ ] `pnpm run build` — OK
- [ ] `tsc --noEmit` — 0 erros
- [ ] Buffer podado (≤ 50 linhas activas)
- [ ] Backlog actualizado

## 8. Decisões Arquitecturais (SDR/ADR)
- [Link SDR-NNN] — decisão e justificação
- [Link ADR-NNN] — decisão e justificação

## 9. Próxima Sessão
- **Primeira tarefa (P0 — obrigatório, ver AGENTS.md regra 9):** [item]
- **Branch:** `feat/...`
- **Pipeline de merge (Caminho C):** ver `docs/runbooks/merge-dnd-to-develop.md` se a feature estiver pronta
