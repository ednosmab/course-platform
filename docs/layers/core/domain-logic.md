# Camada de Domínio Compartilhada

## Estrutura de packages/core

```
packages/core/src/
  index.ts              # Re-exports públicos
  supabase.ts           # Cliente Supabase singleton
  services/
    auth.ts             # Autenticação e permissões
    course.ts           # CRUD de cursos, módulos, aulas
    progress.ts         # Progresso do aluno (85% rule)
```

## Regras de Negócio Isoladas da Interface

Toda regra de negócio vive em `packages/core`, nunca nos apps. Exemplos:

- **Regra de conclusão:** Aula marcada concluída apenas se >= 85% do vídeo assistido (`progress.ts:15-20`)
- **Cálculo de progresso:** Percentual do curso baseado em aulas concluídas / total de aulas
- **Ordenação:** Módulos e aulas ordenados por `order_index ASC` no banco
- **Permissões:** Verificadas via RLS no Supabase + JWT custom claims

## Serviços Compartilhados

| Serviço | Responsabilidade | App exposto |
|---------|-----------------|-------------|
| `AuthService` | Login, registro, sessão JWT, refresh token | admin, student |
| `CourseService` | CRUD cursos, módulos, aulas, blocos JSONB | admin (CRUD), student (leitura) |
| `ProgressService` | Salvar progresso, calcular conclusão, fila offline | student |

## Policies

- **Retry policy:** Backoff exponencial (1s, 2s, 4s, 8s, max 30s) para falhas de rede
- **Save policy:** Debounce de 1.5s no auto-save + state machine (idle -> saving -> saved -> error)
- **Cache policy:** Cache-aside com TTL de 30s para progresso, 300s para perfil

## Use Cases

- `enrollStudentInCourse` — Matricula aluno, cria registro inicial de progresso
- `completeLesson` — Verifica 85%, atualiza progresso, dispara certificado se curso completo
- `reorderModules` — Swap `order_index` entre dois módulos no banco

## Adapters

- **SupabaseAdapter:** Wrapper sobre `@supabase/supabase-js` para operações CRUD
- **StorageAdapter:** Upload/download de mídias via Supabase Storage com URLs assinadas
- **CacheAdapter:** Interface para Redis (cache distribuído) ou AsyncStorage (offline mobile)
