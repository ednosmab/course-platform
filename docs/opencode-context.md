# opencode — Contexto Operacional do Projeto

> Este arquivo preserva metadados semânticos que **não fazem parte do schema do opencode** (`https://opencode.ai/config.json`), mas que descrevem o contrato operacional do projeto. Está incluído em `opencode.json → instructions[]` para ser carregado em toda sessão.

---

## 1. Loading Profile

**Perfil padrão:** `lite`

O conceito de `loading_profile` é uma convenção interna deste projeto (não é campo nativo do opencode). Controla quanto contexto documental é carregado por sessão. Os perfis são interpretados pelos agents/skills do projeto, não pelo runtime do opencode.

- **`lite`** (default): carrega Camada 1 (P0 + AGENTS.md + CONTEXT_MAP.md + context_buffer.md).
- **`full`**: carrega também Camada 2 (modes específicos: P1–P3) sob demanda.

**Override:** documentado em `docs/AGENTS.md` (linhas 46 e 62). Como `opencode.json` não suporta esse campo nativamente, o override é feito explicitando o perfil em mensagens iniciais ou em `docs/session-template.md`.

---

## 2. User Profile

Perfil do usuário titular deste workspace. Usado por agents para calibrar tom, vocabulário e profundidade técnica das respostas.

| Campo | Valor |
|---|---|
| `shape` | `T-shaped` |
| `architecture_level` | `senior` |
| `code_level` | `junior-pleno` |
| `preferred_tone.architecture` | `peer` (par a par) |
| `preferred_tone.code` | `mentor` (mais explicativo, didático) |
| `preferred_tone.feedback` | `calibrado por camada, 95% no-code` |

**Notas:** Tech lead em formação. Calibrar respostas técnicas com vocabulário pleno, exemplos práticos em código, foco em visão/leadership.

---

## 3. Agent Role Mapping (contrato semântico)

Cada agent configurado em `opencode.json → agent.*` tem um **role** interno que descreve o seu contrato semântico, **independentemente** do nome do agent ou do model atribuído.

| Agent | Role | Function |
|---|---|---|
| `plan` | `planner` | Gera planos atômicos, fragmentados para o executor rápido. |
| `build` | `executor` | Executa o plano aprovado, passo a passo, sem refactors autônomos. |
| `review` | `auditor` | Audita execução vs. plano aprovado. Read-only (sem editar produção). |
| `document-loader` | `subagent` | Loader de documentos (P0→P3) antes de qualquer code change. |

**Princípio:**

> Trocar o `model` num agent **não quebra** sua função. Trocar o `role` **sim** — porque é o contrato semântico do agente. Por isso, mantenha o campo `role` em cada bloco de agent (o opencode tolera campos extras dentro de `agent.*` mesmo não estando no schema).
