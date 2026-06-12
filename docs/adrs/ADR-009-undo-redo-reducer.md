# ADR-009: Undo/Redo via useReducer + history stack from full state snapshots

**Status:** Aceito
**Data:** 2026-05-23
**Contexto:** EditorContext no CMS admin

---

## Decisão

O `EditorContext` do CMS admin usa `useReducer` com uma pilha de histórico. Cada mutação de estado empurra um snapshot completo do objeto de estado. As operações de undo/redo percorrem essa pilha. Não há diff/patch granular — snapshots completos garantem simplicidade e corretude.

---

## Contexto

O editor estilo Canva permite que admins movam, editem e reordenem blocos de conteúdo. A funcionalidade undo/redo é essencial para a experiência do usuário.

Duas abordagens foram consideradas:

1. **Diff/patch granular** (`immer` patches, `diff` libraries) — eficiente em memória, mas complexo de implementar e propenso a bugs de estado inconsistente
2. **Full snapshot stack** — cada ação empurra o estado inteiro para um array; undo/redo é `pointer++` ou `pointer--`

Escolhemos snapshots completos porque:
- O estado do editor é pequeno (< 100KB por snapshot)
- A complexidade de implementação é mínima
- A corretude é garantida (não há reconstrução de estado via patches)

```typescript
interface EditorState {
  blocks: Block[];
  selectedId: string | null;
  history: Block[][];
  historyIndex: number;
}

type EditorAction =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MUTATE'; blocks: Block[] };
```

---

## Consequências

### Positivas
- **Corretude garantida:** Cada snapshot é um estado válido — sem patches corrompidos
- **Implementação simples:** < 50 linhas de reducer, sem dependências externas
- **Debuggável:** Snapshots podem ser inspecionados no DevTools
- **Serializável:** Estado pode ser salvo no `localStorage` para recovery

### Negativas
- **Consumo de memória:** Cada snapshot duplica o array de blocos (mitigado pelo estado pequeno)
- **Sem granularidade:** Não é possível desfazer apenas a última propriedade alterada
- **Performance:** Para estados muito grandes (> 1MB), snapshots frequentes podem causar jank
- **Limite prático:** Necessário implementar teto de 50-100 snapshots para evitar vazamento

---

## Referências

- `apps/admin/src/contexts/EditorContext.tsx`
- `apps/admin/src/reducers/editorReducer.ts`
- `docs/Requisitos_plataforma.md` — Requisitos do editor visual
