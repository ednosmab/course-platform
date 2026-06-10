# Plano: Controlo de Acesso a Cursos (SaaS Multi-Tenant)

**Data:** 2026-06-10
**Autor do plano:** Agente (plan mode)
**Executor previsto:** Agente (build mode)
**Reviewer:** Agente (review mode)

## 🎯 Objectivo

Implementar sistema de controlo de acesso a cursos no modelo SaaS:
- Admin configura modo de acesso por curso (Livre/Progressivo/Restrito)
- Sistema verifica acesso do aluno antes de permitir visualização
- Aluno vê estado de acesso na tela "Explorar Cursos"

---

## 📐 Estrutura de Dados Completa

### Tabela 1: `course_access` (acesso por curso)

```sql
create table public.course_access (
    course_id uuid primary key references public.courses(id) on delete cascade,
    access_mode text not null default 'free'
        check(access_mode in ('free', 'progressive', 'restricted')),
    prerequisite_course_id uuid references public.courses(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint check_no_self_prerequisite
        check (prerequisite_course_id != course_id),
    constraint check_progressive_requires_prerequisite
        check (
            (access_mode = 'progressive' and prerequisite_course_id is not null)
            or (access_mode != 'progressive')
        )
);
```

### Tabela 2: `plans` (planos de acesso)

```sql
create table public.plans (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

### Tabela 3: `plan_courses` (cursos dentro de um plano)

```sql
create table public.plan_courses (
    plan_id uuid not null references public.plans(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    order_index integer not null default 0,
    primary key (plan_id, course_id)
);
```

### Tabela 4: `student_plans` (alunos atribuídos a planos)

```sql
create table public.student_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    plan_id uuid not null references public.plans(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    unique (user_id, plan_id)
);
```

### Índices

```sql
create index idx_course_access_prerequisite on public.course_access(prerequisite_course_id);
create index idx_plan_courses_course_id on public.plan_courses(course_id);
create index idx_student_plans_user_id on public.student_plans(user_id);
create index idx_student_plans_plan_id on public.student_plans(plan_id);
```

### RLS Policies

```sql
-- course_access
alter table public.course_access enable row level security;
create policy "Admins gerenciam acesso dos cursos"
    on public.course_access for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "Qualquer usuário logado pode ler acesso dos cursos"
    on public.course_access for select using (true);

-- plans
alter table public.plans enable row level security;
create policy "Admins gerenciam planos"
    on public.plans for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "Qualquer usuário logado pode ler planos ativos"
    on public.plans for select using (is_active = true or public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- plan_courses
alter table public.plan_courses enable row level security;
create policy "Admins gerenciam cursos dos planos"
    on public.plan_courses for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "Qualquer usuário logado pode ler cursos dos planos"
    on public.plan_courses for select using (true);

-- student_plans
alter table public.student_plans enable row level security;
create policy "Admins gerenciam atribuições de planos"
    on public.student_plans for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "Estudantes visualizam seus próprios planos"
    on public.student_plans for select using (auth.uid() = user_id);
```

---

## 📋 Steps

### Step 1: Migration SQL — Criar tabelas
- **Ficheiro:** `supabase/migrations/20260610000001_add_course_access_control.sql`
- **Acção:** Criar 4 tabelas (`course_access`, `plans`, `plan_courses`, `student_plans`), 4 índices, 8 RLS policies, trigger `handle_updated_at` para `course_access` e `plans`
- **Verificação:** `ls supabase/migrations/20260610000001_add_course_access_control.sql` → existe
- [ ]

### Step 2: Tipos Zod — Adicionar schemas
- **Ficheiro:** `packages/types/src/database.ts`
- **Acção:** Adicionar `CourseAccessSchema`, `PlanSchema`, `PlanCourseSchema`, `StudentPlanSchema` + types correspondentes
- **Verificação:** `grep "CourseAccessSchema" packages/types/src/database.ts` → presente
- [ ]

### Step 3: Tipos — Exportar novos types
- **Ficheiro:** `packages/types/src/index.ts`
- **Acção:** Adicionar exports dos 4 novos schemas e types
- **Verificação:** `grep "CourseAccess" packages/types/src/index.ts` → presente
- [ ]

### Step 4: Interface ICourseRepository — Adicionar métodos de acesso
- **Ficheiro:** `packages/core/src/ports/ICourseRepository.ts`
- **Acção:** Adicionar 5 métodos:
  - `getCourseAccess(courseId: string): Promise<CourseAccess | null>`
  - `updateCourseAccess(courseId: string, data: { access_mode: string; prerequisite_course_id: string | null }): Promise<void>`
  - `getStudentCourseAccess(studentId: string, courseId: string): Promise<{ hasAccess: boolean; reason: string }>`
  - `getPublishedCoursesForStudent(studentId: string): Promise<Course[]>`
  - `detectPrerequisiteCycle(courseId: string, prerequisiteId: string): Promise<boolean>`
- **Verificação:** `grep "getCourseAccess" packages/core/src/ports/ICourseRepository.ts` → presente
- [ ]

### Step 5: CourseService — Adicionar métodos de acesso
- **Ficheiro:** `packages/core/src/services/course.ts`
- **Acção:** Adicionar 5 métodos delegando para o repo:
  - `getCourseAccess(courseId)` → `repo.getCourseAccess(courseId)`
  - `updateCourseAccess(courseId, data)` → `repo.updateCourseAccess(courseId, data)`
  - `getStudentCourseAccess(studentId, courseId)` → `repo.getStudentCourseAccess(studentId, courseId)`
  - `getPublishedCoursesForStudent(studentId)` → `repo.getPublishedCoursesForStudent(studentId)`
  - `detectPrerequisiteCycle(courseId, prerequisiteId)` → `repo.detectPrerequisiteCycle(courseId, prerequisiteId)`
- **Verificação:** `grep "getCourseAccess" packages/core/src/services/course.ts` → presente
- [ ]

### Step 6: Implementação Supabase — ICourseRepository
- **Ficheiro:** `packages/core/src/repositories/supabase-course-repository.ts`
- **Acção:** Implementar os 5 métodos usando queries Supabase:
  - `getCourseAccess`: SELECT da tabela `course_access`
  - `updateCourseAccess`: UPSERT na tabela `course_access`
  - `getStudentCourseAccess`: Query complexa que verifica: (1) student_plans → plan_courses → course_access, (2) se progressivo, verifica student_progress do pré-requisito
  - `getPublishedCoursesForStudent`: JOIN courses + course_access + student_plans
  - `detectPrerequisiteCycle`: DFS no grafo de pré-requisitos (máx 10 níveis)
- **Verificação:** `grep "getCourseAccess" packages/core/src/repositories/supabase-course-repository.ts` → presente
- [ ]

### Step 7: Migration data — Dados iniciais
- **Ficheiro:** `supabase/migrations/20260610000001_add_course_access_control.sql` (mesmo ficheiro do Step 1)
- **Acção:** Inserir `course_access` com `access_mode = 'free'` para todos os cursos existentes (backward compatible)
- **Verificação:** `grep "INSERT INTO public.course_access" supabase/migrations/20260610000001_add_course_access_control.sql` → presente
- [ ]

### Step 8: Admin UI — Seção "Controlo de Acesso" na config do curso
- **Ficheiro:** `apps/admin/src/app/configuracoes/[courseId]/page.tsx`
- **Acção:** Inserir nova seção entre Thumbnail (linha 660) e Status de Publicação (linha 662):
  - Estado: `accessMode` ('free' | 'progressive' | 'restricted'), `prerequisiteCourseId` (string)
  - Carregar estado actual via `CourseService.getCourseAccess(courseId)` no `fetchData`
  - UI: 3 botões (Livre/Progressivo/Restrito) + dropdown de pré-requisito (condicional)
  - Validação: impedir seleção de pré-requisito que gere ciclo
  - Salvar: incluir no payload de `saveCourseSettings`
- **Verificação:** `grep "accessMode" apps/admin/src/app/configuracoes/[courseId]/page.tsx` → presente
- [ ]

### Step 9: Admin UI — Validação de ciclo de pré-requisito
- **Ficheiro:** `apps/admin/src/app/configuracoes/[courseId]/page.tsx`
- **Acção:** Ao selecionar pré-requisito no dropdown, chamar `CourseService.detectPrerequisiteCycle(courseId, selectedId)` e mostrar erro se ciclo detectado
- **Verificação:** `grep "detectPrerequisiteCycle" apps/admin/src/app/configuracoes/[courseId]/page.tsx` → presente
- [ ]

### Step 10: Student UI — Actualizar StudentExplore para mostrar acesso
- **Ficheiro:** `apps/student/src/screens/StudentExplore.tsx` (será criada antes como task simples)
- **Acção:** Adicionar lógica de acesso ao card:
  - Livre: badge "Disponível" (verde)
  - Progressivo + pré-requisito concluído: badge "Disponível" (verde)
  - Progressivo + pré-requisito NÃO concluído: badge "Bloqueado" (cinza) + "Complete {curso} primeiro"
  - Restrito + não atribuído: curso não aparece na listagem
  - Restrito + atribuído: badge "Acesso especial" (azul)
- **Verificação:** `grep "hasAccess" apps/student/src/screens/StudentExplore.tsx` → presente
- [ ]

### Step 11: Student UI — Filtros por estado de acesso
- **Ficheiro:** `apps/student/src/screens/StudentExplore.tsx`
- **Acção:** Actualizar FilterBar com opções:
  - Todos (padrão)
  - Disponíveis (acesso livre ou desbloqueado)
  - Bloqueados (progressivo com pré-requisito pendente)
  - Em destaque (novos ou populares)
- **Verificação:** `grep "Bloqueados" apps/student/src/screens/StudentExplore.tsx` → presente
- [ ]

### Step 12: Testes unitários — Service
- **Ficheiro:** `packages/core/src/services/course.test.ts`
- **Acção:** Adicionar testes para:
  - `getCourseAccess` retorna null quando não configurado
  - `getCourseAccess` retorna modo quando configurado
  - `updateCourseAccess` salva correctamente
  - `detectPrerequisiteCycle` detecta ciclo A→B→A
  - `detectPrerequisiteCycle` permite A→B (sem ciclo)
- **Verificação:** `pnpm --filter core test --run` → testes passam
- [ ]

### Step 13: Testes unitários — Types
- **Ficheiro:** `packages/types/src/database.test.ts` (ou criar se não existir)
- **Acção:** Validar schemas Zod: CourseAccessSchema, PlanSchema, PlanCourseSchema, StudentPlanSchema
- **Verificação:** `pnpm --filter types test --run` → testes passam
- [ ]

### Step 14: Documentar workflow admin
- **Ficheiro:** `docs/workflows/workflow_adm.md`
- **Acção:** Adicionar seção "🛡️ 11. Controlo de Acesso a Cursos" com: onde configurar (acima do toggle de publicação), modos (Livre/Progressivo/Restrito), fluxo, regras de pré-requisito
- **Verificação:** `grep "Controlo de Acesso" docs/workflows/workflow_adm.md` → presente
- [ ]

### Step 15: Actualizar BACKLOG.md
- **Ficheiro:** `docs/BACKLOG.md`
- **Acção:** Marcar item P2 "Controlo de Acesso" como `[x]` (implementado) e adicionar referência ao plano e commits
- **Verificação:** `grep "Controlo de Acesso" docs/BACKLOG.md` → item presente com referência
- [ ]

---

## 🛡️ Salvaguardas S1..S6

- **S1 (não fundir):** Steps 1-15 atómicos; posso parar entre qualquer step
- **S2 (não tocar não-planeado):** Não tocar em `enrollments`, `certificates`, `student_progress`, nem em rotas existentes além do especificado
- **S3 (não avançar com falha):** Steps 12-13 (testes) têm de passar antes dos Steps 14-15 (docs)
- **S4 (G-01 explícito):** Step 15 requer G-01 antes de commit (documentação)
- **S5 (não duplicar):** Reutilizar `CourseService` e `ICourseRepository` existentes — não criar novos serviços
- **S6 (não tocar docs não-planeados):** Não tocar FORBIDDEN_OPERATIONS, ADRs, SDRs, AGENTS.md

---

## 📊 Métricas-alvo

| Métrica | Antes | Depois | Tolerância |
|---|---|---|---|
| Tabelas no schema | 9 | 13 | exacto |
| Types Zod | 9 | 13 | exacto |
| Métodos ICourseRepository | 16 | 21 | exacto |
| Métodos CourseService | 17 | 22 | exacto |
| Testes core | 46 | ~56 | ±5 |
| Arquivos criados | 0 | 1 (migration) | exacto |
| Arquivos editados | 0 | 7 | exacto |

---

## ⚠️ Pontos de pausa G-01

- **G-01 #1** (Step 15): Antes de commitar a actualização do BACKLOG. Após autorização, commitar e seguir.
