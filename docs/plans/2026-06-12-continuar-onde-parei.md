# Plano: Continuar de Onde Parei — Item 4 P0 needs-spec

> **Data:** 2026-06-12
> **Tipo:** FEATURE
> **Branch:** `feat/continuar-onde-parei`
> **Backlog:** P0 #4 — Semântica de "Continuar de onde parei"

---

## 1. Objectivo

Formalizar e implementar a semântica de "Continuar de onde parei" com:
- Progresso por módulo (barra visível)
- Auto-scroll para a lição actual
- Exposição da posição de vídeo no hero

---

## 2. Estado Actual (Análise)

| Componente | Estado | Lacuna |
|---|---|---|
| `ProgressService.getProgressByLessons` | Retorna `percentage_watched` | Não retorna `last_played_seconds` |
| `CourseLessons` | Calcula progresso por módulo client-side | Não usa dados do service |
| `StudentDashboard` | Mostra progresso do curso | Não mostra progresso por módulo |
| Auto-scroll | Não implementado | Módulo expande mas não faz scroll |
| Posição de vídeo | `last_played_seconds` rastreado | Não exposto ao utilizador |

---

## 3. Plano de Implementação (Steps Atómicos)

### Step 1 — Actualizar `getProgressByLessons` no repository

**Ficheiro:** `packages/core/src/adapters/supabase-progress-repository.ts`

**Mudança:** Adicionar `last_played_seconds` ao select da query `getProgressByLessons` (linha 133).

```diff
- const { data: progress } = await supabase.from('student_progress').select('lesson_id, completed, tests_completed').eq('user_id', userId).in('lesson_id', lessonIds);
+ const { data: progress } = await supabase.from('student_progress').select('lesson_id, completed, tests_completed, percentage_watched, last_played_seconds').eq('user_id', userId).in('lesson_id', lessonIds);
```

**Verificação:** `grep -n "last_played_seconds" packages/core/src/adapters/supabase-progress-repository.ts` deve retornar 2 ocorrências.

---

### Step 2 — Actualizar tipo de retorno no `IProgressRepository`

**Ficheiro:** `packages/core/src/ports/IProgressRepository.ts`

**Mudança:** Actualizar JSDoc do `getProgressByLessons` para incluir os novos campos.

```diff
   /**
    * @description Retrieves progress records for a student across a set of lessons.
-   * Returns completion status and test scores for each lesson.
+   * Returns completion status, test scores, watch percentage, and last played position for each lesson.
    * @param userId - The UUID of the student.
    * @param lessonIds - Array of lesson UUIDs to fetch progress for.
-   * @returns Array of progress records (lesson_id, completed, tests_completed).
+   * @returns Array of progress records (lesson_id, completed, tests_completed, percentage_watched, last_played_seconds).
    */
```

**Verificação:** `grep -n "percentage_watched, last_played_seconds" packages/core/src/ports/IProgressRepository.ts`

---

### Step 3 — Criar `getModuleProgress` no ProgressService

**Ficheiro:** `packages/core/src/services/progress.ts`

**Mudança:** Adicionar novo método `getModuleProgress` que calcula progresso por módulo.

```typescript
/**
 * @description Calculates completion percentage for a set of lessons belonging to a module.
 * Business rule: Module progress = (completed lessons / total lessons) * 100.
 * Used by CourseLessons to display per-module progress bars.
 * @param userId - The UUID of the student
 * @param lessonIds - Array of lesson UUIDs in the module
 * @returns Object with completed count, total count, and percentage (0-100)
 */
async getModuleProgress(userId: string, lessonIds: string[]): Promise<{ completed: number; total: number; percentage: number }> {
  const progressData = await progressRepo.getProgressByLessons(userId, lessonIds);
  const completed = progressData.filter((p: any) => p.completed).length;
  const total = lessonIds.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}
```

**Verificação:** `grep -n "getModuleProgress" packages/core/src/services/progress.ts`

---

### Step 4 — Exportar `getModuleProgress` do barrel

**Ficheiro:** `packages/core/src/index.ts`

**Mudança:** Verificar se `ProgressService` já é exportado. Se sim, nenhum passo adicional (método é acessível via `ProgressService.getModuleProgress`).

**Verificação:** `grep -n "ProgressService" packages/core/src/index.ts`

---

### Step 5 — Auto-scroll para lição actual no `CourseLessons`

**Ficheiro:** `apps/student/src/screens/CourseLessons.tsx`

**Mudança:** Adicionar `ScrollView` ref + `scrollTo` automático após dados carregados.

1. Importar `useRef` de React
2. Criar `scrollViewRef = useRef<ScrollView>(null)`
3. Após `setModules(modulesWithStatus)` e `setOpenModules(initialOpenState)`, fazer scroll para a lição actual

```typescript
// Após setOpenModules (linha ~96):
const currentLessonId = modulesWithStatus
  .flatMap(m => m.lessons)
  .find(l => l.status === 'current')?.id;

if (currentLessonId) {
  // Delay para garantir que o DOM renderizou
  setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 300);
}
```

4. Adicionar `ref={scrollViewRef}` ao `<ScrollView>` (linha ~245)

**Verificação:** `grep -n "scrollViewRef" apps/student/src/screens/CourseLessons.tsx` deve retornar 2+ ocorrências.

---

### Step 6 — Mostrar posição de vídeo no hero do `CourseLessons`

**Ficheiro:** `apps/student/src/screens/CourseLessons.tsx`

**Mudança:** No hero section, quando `currentLesson` tem progresso, mostrar "Você parou em X:XX".

1. Calcular `currentLessonProgress` a partir de `progressData`
2. Formatar `last_played_seconds` em `M:SS`
3. Mostrar abaixo do título da lição actual

```typescript
// Após linha ~153 (heroSubtitle):
const currentLessonProgress = progressData.find(
  p => p.lesson_id === currentLesson?.id
);
const savedPosition = currentLessonProgress?.last_played_seconds;
const formattedPosition = savedPosition != null
  ? `${Math.floor(savedPosition / 60)}:${String(Math.floor(savedPosition % 60)).padStart(2, '0')}`
  : null;
```

No template, adicionar condicional:
```tsx
{formattedPosition && (
  <Text fontSize={13} color="rgba(255,255,255,0.8)">
    Você parou em {formattedPosition}
  </Text>
)}
```

**Verificação:** `grep -n "formattedPosition" apps/student/src/screens/CourseLessons.tsx`

---

### Step 7 — Mostrar progresso por módulo no `StudentDashboard`

**Ficheiro:** `apps/student/src/screens/StudentDashboard.tsx`

**Mudança:** Na secção "Últimos cursos", para o curso activo, mostrar barra de progresso por módulo (não apenas percentagem do curso).

1. Buscar estrutura do curso activo
2. Para cada módulo, calcular progresso usando `ProgressService.getModuleProgress`
3. Mostrar mini-barras por módulo no card do curso activo

**NOTA:** Este step é opcional para MVP — pode ser adiado se o scope ficar grande. O valor principal já está nos Steps 1-6.

**Verificação:** `grep -n "moduleProgress" apps/student/src/screens/StudentDashboard.tsx`

---

### Step 8 — Actualizar testes existentes

**Ficheiro:** `packages/core/src/services/progress.test.ts` (se existir) ou criar testes mínimos

**Mudança:** Adicionar 2 testes para `getModuleProgress`:
1. Retorna 0% quando nenhuma lição está concluída
2. Retorna 100% quando todas as lições estão concluídas

**Verificação:** `pnpm run test` — todos passam

---

### Step 9 — Validação final

**Comandos:**
```bash
pnpm run test
tsc --noEmit
pnpm run lint
```

---

## 4. Salvaguardas (S1-S6)

| # | Regra |
|---|---|
| S1 | **Não fundir** este plano com outros items do backlog |
| S2 | **Não tocar** código fora de `packages/core/` e `apps/student/src/screens/` |
| S3 | **Não avançar** para Step N+1 se Step N falhar |
| S4 | **G-01 explícito** — pedir autorização antes de commitar |
| S5 | **Não duplicar** lógica de progresso — reutilizar `ProgressService` |
| S6 | **Não tocar** docs não-planeados neste plano |

---

## 5. Métricas-Alvo

| Métrica | Range | Tolerância |
|---|---|---|
| Ficheiros alterados | 4-6 | ±1 |
| Linhas adicionadas | 40-60 | ±10 |
| Linhas removidas | 2-5 | ±2 |
| Testes novos | 2 | — |
| Tempo estimado | ~1.5h | — |

---

## 6. Checklist de Validação

- [ ] `grep -n "last_played_seconds" packages/core/src/adapters/supabase-progress-repository.ts` — 2 ocorrências
- [ ] `grep -n "getModuleProgress" packages/core/src/services/progress.ts` — 1 ocorrência
- [ ] `grep -n "scrollViewRef" apps/student/src/screens/CourseLessons.tsx` — 2+ ocorrências
- [ ] `grep -n "formattedPosition" apps/student/src/screens/CourseLessons.tsx` — 2+ ocorrências
- [ ] `pnpm run test` — todos passam
- [ ] `tsc --noEmit` — 0 erros
- [ ] `pnpm run lint` — 0 erros

---

## 7. Perguntas para o User (antes de implementar)

1. **Auto-scroll:** Prefere scroll para o topo do ecrã ou para a lição visível ao centro?
2. **Posição de vídeo:** Mostrar "Você parou em X:XX" no hero ou no card da lição na lista?
3. **Progresso por módulo no Dashboard:** Implementar agora ou adiar para P1?
