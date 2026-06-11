# WORKFLOW — Framework de Desenvolvimento Assistido por IA (V2)

> **Regra 1:** O agente nunca deve decidir qual documento abrir primeiro. O WORKFLOW determina isso.
> **Regra 2:** Todo processo começa pelo WORKFLOW. Nenhum documento operacional é executado directamente.
> **Regra 3:** O WORKFLOW é a única entrada obrigatória. Todos os demais documentos são carregados sob demanda.

---

## Início da Sessão

### Passo 1
Ler este ficheiro (`WORKFLOW.md`).

### Passo 2
Ler `context_buffer.yaml` para obter estado actual.

### Passo 2.5
Apresentar o **Quick Board** ao utilizador ANTES de qualquer resposta operacional.
O Quick Board lista: tarefa em curso, em espera, próxima, dívidas P1 com due date.
Fonte: `context_buffer.yaml` → secção `current_task`.

### Passo 3
Identificar o tipo de operação.

Tipos possíveis: `FEATURE`, `BUG`, `REFACTOR`, `DOCUMENTATION`, `PLANNING`

---

## Fluxo FEATURE

```text
1. Carregar
   - SYSTEM_MAP.md
   - ADRs relacionadas

2. Executar PREMORTEM (pnpm run premortem:check)
   - O que pode quebrar?
   - Existe ADR relacionada?
   - Existe impacto arquitectural?
   - Existe dependência externa?

3. PLANEAMENTO
   - Criar plano da feature em docs/plans/

4. IMPLEMENTAÇÃO
   - Executar tarefa conforme plano

5. VALIDAÇÃO
   - Executar validate-session

6. ACTUALIZAÇÃO
   - Actualizar context_buffer.yaml

7. ENCERRAMENTO
   - Executar close-session
   - Preencher SESSION_REVIEW (governance/reviews/SESSION_REVIEW.md)
```

---

## Fluxo BUG

```text
1. Carregar
   - Contexto relevante (ADRs, plano, detalhes do bug)

2. REPRODUÇÃO
   - Reproduzir erro / identificar causa

3. CORRECÇÃO
   - Implementar correcção

4. VALIDAÇÃO
   - Executar testes

5. ACTUALIZAÇÃO
   - Actualizar context_buffer.yaml

6. ENCERRAMENTO
   - Executar close-session
   - Preencher SESSION_REVIEW (governance/reviews/SESSION_REVIEW.md)
```

---

## Fluxo REFACTOR

```text
1. Carregar
   - ADRs relacionadas
   - SYSTEM_MAP.md

2. VERIFICAR
   - Impacto arquitectural
   - Executar premortem:check

3. EXECUTAR
   - Refactoração conforme plano

4. VALIDAR
   - Testes obrigatórios
   - Executar validate-session

5. ACTUALIZAÇÃO
   - Actualizar context_buffer.yaml

6. ENCERRAMENTO
   - Executar close-session
   - Preencher SESSION_REVIEW (governance/reviews/SESSION_REVIEW.md)
```

---

## Fluxo DOCUMENTATION

```text
1. Carregar
   - SYSTEM_MAP.md

2. EXECUTAR
   - Criar/actualizar documentação

3. VALIDAR
   - Verificar consistência com SYSTEM_MAP.md

4. ACTUALIZAÇÃO
   - Actualizar context_buffer.yaml

5. ENCERRAMENTO
   - Executar close-session
   - Preencher SESSION_REVIEW (governance/reviews/SESSION_REVIEW.md)
```

---

## Fluxo PLANNING

```text
1. Carregar
   - SYSTEM_MAP.md
   - ADRs relacionadas
   - BACKLOG.md

2. EXECUTAR PREMORTEM (pnpm run premortem:check)
   - O que pode quebrar?
   - Existe ADR relacionada?
   - Existe impacto arquitectural?
   - Existe dependência externa?

3. PLANEAMENTO
   - Criar plano em docs/plans/

4. ACTUALIZAÇÃO
   - Actualizar context_buffer.yaml
   - Actualizar BACKLOG.md

5. ENCERRAMENTO
   - Executar close-session
   - Preencher SESSION_REVIEW (governance/reviews/SESSION_REVIEW.md)
```

---

## Estrutura do Repositório

```text
/governance
├── WORKFLOW.md              ← ENTRADA ÚNICA OBRIGATÓRIA
├── SYSTEM_MAP.md            ← Mapa centralizado do sistema
├── context/
│   └── context_buffer.yaml  ← Estado da sessão (estruturado)
├── adr/                     ← ADRs (eventualmente migrado de docs/adrs/)
├── agents/                  ← Contratos de agents (existente)
├── contracts/               ← Índice de contratos (existente)
├── handoffs/                ← Protocolos de handoff (existente)
└── policies/                ← Políticas operacionais (existente)

/scripts
├── validate-session.ts      ← Validação executável
└── close-session.ts         ← Encerramento consistente

/premortem
└── PREMORTEM.md             ← Template de pré-mortem

/reviews
└── SESSION_REVIEW.md        ← Template de feedback de sessão
```

---

## Critério de Sucesso

O agente deve ser capaz de iniciar e concluir uma sessão sem depender de memória prévia, utilizando apenas:

1. `WORKFLOW.md` — fluxo a seguir
2. `context_buffer.yaml` — estado actual
3. Scripts de validação (`validate-session`, `close-session`)

Todo o restante deve ser carregado sob demanda.
