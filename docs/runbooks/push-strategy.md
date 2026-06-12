# 🚦 Push Strategy — Política de Push para Origin

> **Status (2026-06-04):** Push para `origin` **BLOQUEADO** por decisão do usuário.
> Critério de desbloqueio: **A DEFINIR** (adiado — ver entrada P0 no `docs/BACKLOG.md`).

## 1. Contexto

O `opencode.json` corrigido em `d7ffae9` ainda não foi propagado para `origin`. Sessões paralelas podem
continuar a falhar a apresentar o Quick Board (regra 11 do AGENTS.md) até que o push seja feito.

Trabalho permanece **local** em `feat/cert-editor-isolation` (HEAD `d7ffae9`).

## 2. Critério de Desbloqueio (TBD)

O critério objectivo que define "MVP concluído" ainda não foi definido. Candidatos a considerar quando
for decidido:

| Critério | Significado | Como validar |
|---|---|---|
| P0 vazio | Nenhum item vermelho em `BACKLOG.md` | `grep -c "In Progress" docs/BACKLOG.md` = 0 |
| Build verde | `pnpm run build` passa | Comando |
| Testes 100% | `pnpm run test` 0 falhas | Comando |
| Lint 0 erros | `pnpm run lint` limpo | Comando |
| Dívidas P1 resolvidas | Sem "Backlog" em P1 crítico | `grep "🟠" docs/BACKLOG.md` = 0 |

**Decisão do usuário (2026-06-04):** "Definir mais tarde".

## 3. Workaround para Sessões Paralelas (M3)

Enquanto o push não é feito, sessões paralelas (clones separados) podem ter o `opencode.json`
desatualizado, fazendo com que a regra 11 do AGENTS.md não seja injectada no system prompt.

**Workaround manual** (executar no clone da sessão paralela):

```bash
# A partir da raiz do clone, puxar os ficheiros de governança da branch local
git checkout feat/cert-editor-isolation -- \
  opencode.json \
  docs/AGENTS.md \
  docs/context_buffer.md \
  docs/session-template.md

# Validar que a IA vê o Quick Board
# 1. Iniciar nova sessão
# 2. Dizer "oi" e verificar se a resposta contém o bloco Quick Board
```

**Limitação:** O workaround só funciona se ambas as sessões partilham o mesmo `.git` (mesma máquina,
mesma worktree). Para máquinas diferentes, é necessário `git push` ou cópia manual.

## 4. Comando de Push Final (quando desbloqueado)

```bash
# Pré-condições
git status                          # working tree limpo
git log origin/feat/cert-editor-isolation..HEAD --oneline   # lista de commits a pushar
git fetch origin                    # sincronizar refs remotas

# Push (com proteção contra force-push acidental)
git push origin feat/cert-editor-isolation --force-with-lease

# Validação pós-push
git fetch origin
git log origin/feat/cert-editor-isolation -1 --oneline  # confirmar
```

> ⚠️ Regra **G-01** do `AGENTS.md`: `git push` requer autorização EXPLÍCITA do usuário. Nunca executar
> sem confirmação.

## 5. Rollback Pós-Push

Se algo correr mal após o push:

```bash
# Reverter o último push (cuidado: reescreve histórico)
git push origin feat/cert-editor-isolation --force-with-lease

# OU criar commit de reversão (mais seguro)
git revert <sha-do-commit>
git push origin feat/cert-editor-isolation
```

## 6. Referências

- `docs/AGENTS.md` regra 1 (G-01): proibição de commit/push sem autorização
- `docs/AGENTS.md` regra 9: prioridade de entrada de sessão (P0)
- `docs/AGENTS.md` regra 10: invariante de fim de sessão
- `docs/AGENTS.md` regra 11: Quick Board de Aviso
- `docs/context_buffer.md`: linha "Push para origin BLOQUEADO"
- `docs/BACKLOG.md` P0: entrada "Definir critério de push"
- `docs/runbooks/merge-dnd-to-develop.md`: Caminho C (merge feature → develop)
