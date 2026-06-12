# 🗓️ POLÍTICA DE DATAÇÃO DE DÍVIDA TÉCNICA

> Regras vinculantes: DT-01 a DT-04 em `docs/FORBIDDEN_OPERATIONS.md`.

## Princípio
**Dívida técnica conhecida e não datada é a falha mais cara do projecto.** O custo não é o trabalho extra — é a **invisibilidade** do que está por fazer e porquê.

## Regras Operacionais

### 1. Todo item adiado tem data de revisão
Todo item do `docs/BACKLOG.md` que muda para `Paused` ou adquire status "Adiado" DEVE incluir `[REVISIT: YYYY-MM-DD]` visível no próprio item. Sem data = violação DT-01.

### 2. Prazos por prioridade
| Prioridade | SLA de resolução | Prazo máximo `[REVISIT]` se adiado |
|---|---|---|
| P0 | ≤ 7 dias | ≤ 14 dias |
| P1 | ≤ 30 dias | ≤ 60 dias |
| P2 | ≤ 90 dias | ≤ 180 dias |
| P3 | Sem SLA | Revisão anual |

Adiamentos que excedem o prazo `[REVISIT]` configuram violação DT-04 e devem ser escalados.

### 3. Working tree limpo é invariante
Working tree limpo = zero ficheiros modificados + zero untracked não relacionados à tarefa em curso. Excepção documentada com `[REVISIT]` referenciado no buffer. Violação = DT-02.

### 4. Causa raiz obrigatória em todo adiamento
Todo adiamento deve registar no `docs/BACKLOG.md`:
- **Porquê** foi adiado (não apenas "sem tempo")
- **Quem** assume a responsabilidade de revisitar
- **Condição de reactivação** (ex: "quando P0 X for resolvido")

Violação = DT-03.

### 5. Auditoria automática
No primeiro tool call de cada sessão, a IA DEVE verificar no `docs/BACKLOG.md`:
- Itens com `[REVISIT]` vencido
- Itens sem data (violação DT-01)
- Working tree com drift > 7 dias

Os resultados DEVEM ser reportados no buffer antes de qualquer código ser modificado.
