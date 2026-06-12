-- ==========================================
-- Controle de Acesso a Cursos (SaaS Multi-Tenant)
-- Data: 2026-06-10
-- Autor: Agente (build mode)
-- ==========================================

-- ==========================================
-- 1. TABELAS
-- ==========================================

-- Tabela 1: course_access (acesso por curso)
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

-- Tabela 2: plans (planos de acesso)
create table public.plans (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela 3: plan_courses (cursos dentro de um plano)
create table public.plan_courses (
    plan_id uuid not null references public.plans(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    order_index integer not null default 0,
    primary key (plan_id, course_id)
);

-- Tabela 4: student_plans (alunos atribuídos a planos)
create table public.student_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    plan_id uuid not null references public.plans(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    unique (user_id, plan_id)
);

-- ==========================================
-- 2. ÍNDICES
-- ==========================================

create index idx_course_access_prerequisite on public.course_access(prerequisite_course_id);
create index idx_plan_courses_course_id on public.plan_courses(course_id);
create index idx_student_plans_user_id on public.student_plans(user_id);
create index idx_student_plans_plan_id on public.student_plans(plan_id);

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

create trigger tr_course_access_updated_at
    before update on public.course_access
    for each row execute procedure public.handle_updated_at();

create trigger tr_plans_updated_at
    before update on public.plans
    for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

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

-- ==========================================
-- 5. DADOS INICIAIS (backward compatible)
-- ==========================================

-- Inserir course_access com access_mode = 'free' para todos os cursos existentes
INSERT INTO public.course_access (course_id, access_mode)
SELECT id, 'free'
FROM public.courses
ON CONFLICT (course_id) DO NOTHING;
