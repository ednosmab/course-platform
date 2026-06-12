# 🔀 Runbook: Merge `feat/dnd-e2e-coverage` → `develop` (Caminho C)

> **Objectivo:** Integrar as alterações da branch `feat/dnd-e2e-coverage` no `develop`,
> depois avançar `feat/cert-editor-isolation` para acompanhar, e iniciar 5A.4.
>
> **Contexto:** Decisão de sessão de 2026-06-03 — Caminho C alinhado com SDR-001 (Fase 5A).
> O `stash@{0}` (WIP de brand mark refactor) foi eliminado — conteúdo já commitado em `07c86d5`.

---

## 1. Pré-condições (antes de começar)

| # | Condição | Como verificar |
|---|---|---|
| P1 | Working tree limpo | `git status` → `nothing to commit, working tree clean` |
| P2 | Branch correcta | `git branch --show-current` → `feat/dnd-e2e-coverage` |
| P3 | CI verde | `pnpm run lint && pnpm run test && pnpm run build` — 0 erros |
| P4 | develop local sincronizado | `git fetch origin && git log develop..origin/develop --oneline` → vazio |
| P5 | Stash limpo | `git stash list` → apenas `stash@{1}` (feat/dsv2-reform), não relacionado |

**Critério de abortagem:** Se P1, P3 ou P4 falharem, **NÃO executar o merge**. Voltar para o tech lead.

---

## 2. Sequência de comandos (executar em ordem)

### Passo A — Merge `feat/dnd-e2e-coverage` → `develop`

```bash
git checkout develop
git merge --no-ff feat/dnd-e2e-coverage -m "merge: bring DnD E2E coverage and cert-editor prep into develop"
```

**Validação pós-passo A:**
- `git log --oneline -3` → confirma o merge commit
- `pnpm run test` → sem regressão
- `pnpm run build` → compila

**Rollback (só se não foi `git push`):** `git reset --hard ORIG_HEAD`

### Passo B — Fast-forward `feat/cert-editor-isolation`

```bash
git checkout feat/cert-editor-isolation
git merge --ff-only develop
```

**Validação pós-passo B:**
- `git log -1 --oneline` → confirma que `feat/cert-editor-isolation` está no mesmo commit que develop
- `git diff feat/cert-editor-isolation develop --stat` → vazio

### Passo C — Iniciar 5A.4

```bash
# continuar em feat/cert-editor-isolation
# criar primeiro teste TDD (RED) para o bug do EditorCanvas.tsx:1282
```

---

## 3. Pós-merge (validação final)

- [ ] `git status` → `nothing to commit, working tree clean`
- [ ] `pnpm run lint` → 0 erros
- [ ] `pnpm run test` → todos passam
- [ ] `pnpm run build` → compila
- [ ] `git log --oneline --graph` — topologia correcta

---

## 4. Topologia esperada (pós-merge)

```
main
  └── develop
        └── feat/cert-editor-isolation  ← ff de develop
              └── [5A.4 commits futuros]
```

---

## 5. Rollback (antes de `git push`)

```bash
# desfazer merge no develop
git checkout develop
git reset --hard ORIG_HEAD

# desfazer ff em cert-iso (forçar para o commit anterior)
git checkout feat/cert-editor-isolation
git reset --hard a069bff   # commit anterior ao merge
```
