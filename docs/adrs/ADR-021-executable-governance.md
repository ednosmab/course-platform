# ADR-021: Governança Executável — Evolução do Framework V2

**Status:** Aceito
**Data:** 2026-06-10
**Contexto:** Framework de desenvolvimento assistido por IA baseado em documentação e governança textual
**Autor:** Edson

---

## Decisão

**Evoluir o framework de governança textual para governança executável**, reduzindo dependência de leitura, memória e disciplina manual do agente.

O modelo actual:

```text
Regra → Leitura → Memória → Execução
```

Passa a ser:

```text
Regra → Automação → Validação → Execução
```

---

## Contexto

### Problema

O framework actual possui 5 gargalos identificados:

1. **Regras reativas** — novas regras (ex: G-05) surgem somente após incidentes
2. **Excesso de dependência documental** — cadeia de referências `AGENTS.md → FORBIDDEN_OPERATIONS.md → CONTEXT_MAP.md → ADRs` aumenta custo cognitivo
3. **Governança não executável** — regras dependem de leitura, lembrança e disciplina do agente, sem garantia real de cumprimento
4. **Buffer pouco estruturado** — texto livre difícil de actualizar e validar programaticamente
5. **Feedback loop longo** — aprendizados nem sempre registados; encerramento de sessão sem validação obrigatória

### Fatores Técnicos

| Aspecto | V1 (actual) | V2 (proposto) |
|---|---|---|
| Mapa do sistema | `CONTEXT_MAP.md` (documentação) | `SYSTEM_MAP.md` (centralizado) |
| Buffer | `context_buffer.md` (markdown livre) | `context_buffer.yaml` (estruturado) |
| Regras | Texto em `FORBIDDEN_OPERATIONS.md` | Scripts de validação (`scripts/`) |
| Pré-planeamento | Inexistente | `premortem-check` (preventivo) |
| Fim de sessão | Manual | `close-session` (automatizado) |
| Feedback | Ocasional | `SESSION_REVIEW.md` (~2min) |

---

## Consequências

### Fase 1 — Context Buffer Estruturado

**Entregável:** Migrar `context_buffer.md` → `context_buffer.yaml`

Benefícios:
- Atualização automática por scripts
- Parsing simples sem ambiguidade
- Compatível com validação futura

### Fase 2 — Workflow (close-session)

**Entregável:** Script `scripts/close-session.sh` ou `close-session.ts`

Valida:
- Buffer actualizado
- Backlog actualizado
- ADR criada quando necessário
- Testes executados
- Pendências registadas
- Commit realizado

### Fase 3 — Validate Session

**Entregável:** Script `scripts/validate-session.sh` ou `validate-session.ts`

Validações:
- ADR existe quando arquitectura foi alterada
- Modelo usado corresponde ao planeado
- Task actual existe no backlog
- Integração com `opencode.json` e `governance/agents/`

### Fase 4 — System Map

**Entregável:** Substituir `CONTEXT_MAP.md` por `SYSTEM_MAP.md`

Centraliza todas as dependências documentais num único local:

```text
Planner: AGENTS.md + CONTEXT_BUFFER.yaml + ROADMAP.md
Executor: AGENTS.md + ADRs + CONTEXT_BUFFER.yaml
Reviewer: AGENTS.md + ADRs + TESTS + CONTEXT_BUFFER.yaml
```

### Fase 5 — Premortem

**Entregável:** Script `scripts/premortem-check.ts`

Executa antes de toda feature para identificar preventivamente:
- O que pode quebrar?
- ADR relacionada?
- Contexto insuficiente?
- Risco de regressão?
- Dependência externa?
- Impacto arquitectural?

### Fase 6 — Session Review

**Entregável:** Template `docs/templates/SESSION_REVIEW.md`

```yaml
success: []
failures: []
new_rules: []
debt: []
```

Tempo máximo: 2 minutos por sessão.

### Ordem de Implementação

1. Context Buffer Estruturado
2. Workflow (close-session)
3. Validate Session
4. System Map
5. Premortem
6. Session Review

### Integrações

- `validate-session` deve ler `opencode.json` (config de agents) e `governance/agents/` (contratos)
- Scripts em TypeScript para consistência com o ecossistema do monorepo
- `SYSTEM_MAP.md` substitui `CONTEXT_MAP.md` existente

---

## Referências

- `docs/FORBIDDEN_OPERATIONS.md` (especialmente G-05)
- `docs/CONTEXT_MAP.md` (a ser substituído)
- `docs/context_buffer.md` (a ser migrado)
- `governance/` (contratos de agents)
- `cognition/` (infraestrutura cognitiva)
