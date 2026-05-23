# ADR-015: Gap arquitetural — TanStack Query/Zustand prescritos mas não implementados

**Status:** Aceito  
**Data:** 2026-05-23  
**Contexto:** Pacote `packages/core/` services + React context  
**Autor:** Edson

---

## Decisão

> **O projeto ADIA formalmente a adoção de TanStack Query (server state) e Zustand (client state) para depois do MVP. React Context + useReducer + chamadas diretas aos services continuam sendo a abordagem padrão até que métricas objetivas demonstrem que a falta dessas bibliotecas causa degradação mensurável.**

---

## Contexto

A arquitetura original previa duas bibliotecas de gerenciamento de estado:

| Biblioteca | Função |
|---|---|
| **TanStack Query** | Cache, loading/error states, refetch, deduplicação de chamadas ao Supabase |
| **Zustand** | Estado global do editor (blocos, seleção, undo/redo) sem prop drilling |

Na prática, o projeto utiliza:

1. **React Context + useReducer** no `EditorContext` (`apps/admin/src/context/EditorContext.tsx`) — estado de blocos, seleção, undo/redo
2. **Serviços diretos** (`CourseService`, `LessonService` etc.) com fetch em `useEffect` ou handlers de evento — sem camada de cache
3. **Prop drilling** em vários componentes — sem store global

O gap existe e é reconhecido. Esta ADR documenta a decisão consciente de **não introduzir as bibliotecas agora**.

### Por que não agora?

- **TanStack Query:** Os services já encapsulam toda a lógica de dados. Adicionar TanStack Query agora seria substituir `useEffect → service()` por `useQuery()`, o que é refatoração mecânica sem benefício imediato. O ganho real (cache, deduplicação, refetch automático) só aparece com múltiplas queries concorrentes e refetch em intervalo — cenário que o MVP ainda não tem.
- **Zustand:** O `EditorContext` com `useReducer` funciona e tem menos de 300 linhas. Substituir por Zustand agora adicionaria uma dependência a mais sem resolver nenhum problema concreto. Se o contexto crescer além de 500 linhas, a troca deve ser reavaliada.

---

## Consequências

### Positivas
- **Menos dependências:** Nenhuma lib extra = menor bundle, menos breaking changes futuras
- **Menos abstração:** `useEffect → service()` é fácil de debugar e não esconde fluxos
- **Flexibilidade de migração futura:** Quando o TanStack Query entrar, ele encapsulará os services existentes — não há refatoração destrutiva

### Negativas
- **Sem cache automático:** Duas requisições concorrentes para a mesma rota disparam duas chamadas ao Supabase
- **Sem loading states padronizados:** Cada componente gerencia seu próprio `isLoading` — propenso a inconsistência
- **Sem refetch automático:** Se uma mutação invalida dados em outra tela, o dev precisa manualmente forçar o refetch
- **Prop drilling não resolvido:** Componentes profundamente aninhados no editor recebem props via cadeias longas

### Gatilhos para Reavaliação

A decisão deve ser revista quando **pelo menos um** dos critérios for atingido:

| Gatilho | Critério |
|---|---|
| Queries simultâneas | ≥3 queries no mesmo componente que poderiam ser deduplicadas |
| `EditorContext` | ultrapassar 500 linhas |
| Prop drilling | ultrapassar 5 níveis de profundidade |
| Loading boilerplate | 3+ componentes com gerenciamento próprio de `isLoading`/`error` |

---

## Referências

- `apps/admin/src/context/EditorContext.tsx` — useReducer atual
- `packages/core/src/services/*.ts` — services consumidos diretamente
- `docs/Requisitos_plataforma.md` — stack original
- TanStack Query docs (https://tanstack.com/query) — avaliação pendente
- Zustand docs (https://github.com/pmndrs/zustand) — avaliação pendente
