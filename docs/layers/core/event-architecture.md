# Arquitetura de Eventos

## Event Bus

Sistema de eventos internos (não expostos via API) para comunicação entre módulos do core:

```typescript
type CoreEvent =
  | { type: 'lesson:completed'; userId: string; lessonId: string }
  | { type: 'course:completed'; userId: string; courseId: string }
  | { type: 'progress:synced'; userId: string; pending: number }
  | { type: 'save:error'; entity: string; error: Error }
```

Implementação via `EventEmitter` simples sem dependências externas. Subscribers registrados em `packages/core/src/index.ts` durante bootstrap.

## Command Pattern

Operações de escrita seguem Command pattern para permitir undo/redo:

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}
```

Exemplos:
- `ReorderModuleCommand(courseId, moduleId, newIndex)`
- `SaveBlockCommand(lessonId, blockId, props)`
- `DeleteLessonCommand(lessonId)`

## Sistema de Action Logs

Toda operação crítica (criar/editar/excluir curso, módulo, aula) registra log em `audit_logs`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | Quem executou |
| `action` | text | `course.create`, `lesson.delete`, etc |
| `entity_id` | UUID | ID do recurso afetado |
| `metadata` | JSONB | Payload adicional (ex: `{ "old_order": 2, "new_order": 1 }`) |
| `created_at` | timestamptz | Quando ocorreu |

## Undo/Redo Estrutural

Estado gerenciado via `useReducer` + history stack de snapshots completos:

- Snapshots são tirados antes de cada mutação
- Stack limitada a 50 entradas para evitar consumo excessivo de memória
- Undo restaura snapshot anterior; Redo avança para próximo
- Operações de save bem-sucedidas não são desfeitas

## Autosave

State machine:

```
idle --[1.5s debounce]--> saving --[supabase ok]--> saved --[nova edição]--> idle
                             |
                             +--[erro]--> error --[retry 3x]--> saving
                                           |
                                           +--[falha final]--> idle (dados preservados localmente)
```

- Debounce de 1.5s após última edição
- Notificação toast em caso de erro (não perde dados)
- Retry automático com 3 tentativas
