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

Tipos possíveis: `FEATURE`, `BUG`, `REFACTOR`, `DOCUMENTATION`, `PLANNING`, `INVESTIGATION`

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

## Fluxo INVESTIGATION

> Utilizado quando uma hipótese arquitetural precisa ser validada antes de implementação.
> Exemplo: ADR-022 (Connection Pooling invalidado).

```text
1. HIPÓTESE
   - Identificar o que se pretende validar
   - Documentar a hipótese no buffer

2. INVESTIGAÇÃO
   - Analisar código existente
   - Executar testes de validação
   - Recolher evidências concretas

3. EVIDÊNCIA
   - Compilar resultados
   - Classificar: CONFIRMADA | INVALIDADA | INCONCLUSIVA

4. DECISÃO
   - Se CONFIRMADA → avançar para implementação (fluxo FEATURE)
   - Se INVALIDADA → registar ADR de invalidação, remover código se aplicável
   - Se INCONCLUSIVA → adiar com data [REVISIT: YYYY-MM-DD]

5. ENCERRAMENTO
   - Actualizar documentação
   - Actualizar backlog
   - Criar ADR se aplicável
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

## Protocolo de Feedback de Sessão

> O agente DEVE observar o comportamento do utilizador durante toda a sessão e gerar feedback ao detectar keywords de fim.
> Referência completa: `docs/AGENTS.md` regra #17.

### Trigger Keywords

O agente DEVE detectar automaticamente qualquer uma destas keywords e activar o protocolo de feedback:

```
"fim de sessão", "sessão fechada", "até amanhã", "feedback da sessão",
"vamos parar", "encerrar", "por hoje é só", "próxima sessão",
"feedback", "para aqui", "paremos"
```

### Observer Protocol (o que observar durante a sessão)

Durante toda a sessão, o agente DEVE observar e registar internamente:

1. **Decisões arquitecturais** — Que escolhas o utilizador fez? Porquê?
2. **Padrões de código** — Que abordagens o utilizador preferiu?
3. **Alternativas rejeitadas** — O que o utilizador descartou e porquê?
4. **Erros e correcções** — O que o utilizador errou e como resolveu?
5. **Comunicação de requisitos** — O utilizador foi claro ou ambíguo?
6. **Sequenciação** — O utilizador correctou bem a ordem das tarefas?
7. **Gestão de risco** — O utilizador considerou impactos antes de agir?

### Output Protocol (como apresentar o feedback)

Ao detectar keyword de fim de sessão:

```text
1. PARAR trabalho actual imediatamente
2. LER docs/feedback/feedback-template.md
3. GERAR feedback baseado no que observou (max 10 bullets)
4. APRESENTAR inline no chat — BLOCO ISOLADO, sem info técnica ao lado
5. SALVAR em docs/feedback/YYYY-MM-DD.md (append se ficheiro já existe)
6. SÓ DEPOIS continuar com encerramento normal (close-session)
```

### Regra de Separação (ABSOLUTA)

O feedback DEVE ser apresentado como BLOCO ÚNICO e ISOLADO, sem:
- Comandos git ao lado
- Estado do working tree
- Informação de close-session
- Qualquer outra informação técnica

**Ordem correcta:**
```
1. Feedback inline (bloco isolado)
2. [linha em branco]
3. Encerramento (close-session, commits, etc.)
```

**Ordem INCORRECTA (não fazer):**
```
❌ Feedback misturado com git status
❌ Feedback no meio do close-session
❌ Feedback como nota de rodapé
```

### Formato do Output Inline

```text
📊 Feedback da Sessão — YYYY-MM-DD

🎯 O que fizeste bem:
1. [decisão/padrão concreto com evidência]
2. ...

⚠️ O que podes melhorar:
1. [área com racional — se for código, estilo mentor]
2. ...

💡 Próxima sessão:
- [foco sugerido]
- [padrão a praticar]
```

### Privacidade

A pasta `docs/feedback/` está em `.gitignore`. O feedback é privado e não versionado.

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

/docs
├── CURRENT_STATE.md         ← Estado real implementado (As-Built)
├── GAP_ANALYSIS.md          ← Diferença entre documentação e implementação
├── BACKLOG_TECHNICAL_DEBT.md ← Acções para reduzir gaps e riscos
├── adrs/                    ← ADRs (inclui ADRs de invalidação)
└── ...

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
