-- ==========================================
-- Plataforma de Cursos EAD com CMS - Migration Inicial
-- Data: 2026-05-17
-- Autor: Antigravity (Agente 2 - Tech Lead / Database)
-- ==========================================

-- Habilitar a extensão gen_random_uuid se necessário
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABELAS E ENTIDADES
-- ==========================================

-- Tabela de Perfis de Usuário (vinculado ao auth.users)
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text not null,
    full_name text,
    role text not null default 'student' check(role in ('student', 'teacher', 'admin')),
    created_at timestamptz not null default now()
);

-- Tabela de Trilhas de Cursos
create table public.paths (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    is_published boolean not null default false,
    created_at timestamptz not null default now()
);

-- Tabela de Cursos
create table public.courses (
    id uuid primary key default gen_random_uuid(),
    author_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    thumbnail_url text,
    is_published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela Relacional Trilhas -> Cursos (Muitos para Muitos)
create table public.path_courses (
    path_id uuid references public.paths(id) on delete cascade,
    course_id uuid references public.courses(id) on delete cascade,
    order_index integer not null,
    primary key (path_id, course_id)
);

-- Tabela de Matrículas (Enrollments)
create table public.enrollments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    course_id uuid references public.courses(id) on delete cascade,
    path_id uuid references public.paths(id) on delete cascade,
    status text not null default 'active' check(status in ('active', 'expired', 'canceled')),
    expires_at timestamptz,
    created_at timestamptz not null default now(),
    -- Garantir que a matrícula seja de um curso OU de uma trilha
    constraint check_course_or_path check (
        (course_id is not null and path_id is null) or 
        (course_id is null and path_id is not null)
    )
);

-- Tabela de Módulos do Curso
create table public.modules (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    title text not null,
    order_index integer not null,
    created_at timestamptz not null default now()
);

-- Tabela de Aulas (Lessons) - CMS Core (JSONB Blocks)
create table public.lessons (
    id uuid primary key default gen_random_uuid(),
    module_id uuid not null references public.modules(id) on delete cascade,
    title text not null,
    order_index integer not null,
    blocks jsonb not null default '[]'::jsonb,
    schema_version integer not null default 1,
    is_published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela de Progresso do Aluno (Vídeo timeline, auto-resume e 85% rule)
create table public.student_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    last_played_seconds integer not null default 0,
    percentage_watched integer not null default 0 check(percentage_watched >= 0 and percentage_watched <= 100),
    completed boolean not null default false,
    completed_at timestamptz,
    updated_at timestamptz not null default now(),
    unique (user_id, lesson_id)
);

-- Tabela de Certificados (Integração oficial de validação externa)
create table public.certificates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    course_id uuid references public.courses(id) on delete cascade,
    path_id uuid references public.paths(id) on delete cascade,
    uuid_bsgi text unique not null,
    created_at timestamptz not null default now(),
    constraint check_cert_course_or_path check (
        (course_id is not null and path_id is null) or 
        (course_id is null and path_id is not null)
    )
);

-- ==========================================
-- 2. ÍNDICES DE DESEMPENHO E PERFORMANCE
-- ==========================================

-- Índices B-Tree Estruturais
create index idx_modules_course_id on public.modules(course_id);
create index idx_lessons_module_id on public.lessons(module_id);
create index idx_path_courses_course_id on public.path_courses(course_id);
create index idx_enrollments_user_id on public.enrollments(user_id);
create index idx_student_progress_user_id on public.student_progress(user_id);
create index idx_student_progress_lesson_id on public.student_progress(lesson_id);
create index idx_certificates_user_id on public.certificates(user_id);

-- Índice GIN para busca performática interna dos blocos dinâmicos JSONB do CMS
create index idx_lessons_blocks_gin on public.lessons using gin (blocks);

-- ==========================================
-- 3. TRIGGERS E FUNÇÕES DE AUTOMAÇÃO
-- ==========================================

-- Função auxiliar para automatizar data de atualização (updated_at)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Ativar trigger de atualização temporal
create trigger tr_courses_updated_at
    before update on public.courses
    for each row execute procedure public.handle_updated_at();

create trigger tr_lessons_updated_at
    before update on public.lessons
    for each row execute procedure public.handle_updated_at();

create trigger tr_student_progress_updated_at
    before update on public.student_progress
    for each row execute procedure public.handle_updated_at();

-- Trigger automático para criar Perfil do Aluno na criação de nova conta no Auth do Supabase
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        'student'
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger tr_on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. SEGURANÇA E GOVERNANÇA (RLS - ROW LEVEL SECURITY)
-- ==========================================

-- Função de segurança auxiliar para extrair o papel (role) do usuário
create or replace function public.get_user_role(user_id uuid)
returns text as $$
    select role from public.profiles where id = user_id;
$$ language sql security definer;

-- Ativar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.paths enable row level security;
alter table public.courses enable row level security;
alter table public.path_courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.student_progress enable row level security;
alter table public.certificates enable row level security;

-- POLÍTICAS: PROFILES
create policy "Admins possuem controle total de perfis"
    on public.profiles for all using (public.get_user_role(auth.uid()) = 'admin');

create policy "Usuários podem ler seu próprio perfil"
    on public.profiles for select using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
    on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- POLÍTICAS: PATHS (TRILHAS)
create policy "Qualquer usuário logado pode visualizar trilhas publicadas"
    on public.paths for select using (is_published = true or public.get_user_role(auth.uid()) in ('admin', 'teacher'));

create policy "Admins e professores podem criar e gerenciar trilhas"
    on public.paths for all using (public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- POLÍTICAS: COURSES (CURSOS)
create policy "Qualquer usuário logado pode visualizar cursos publicados"
    on public.courses for select using (is_published = true or public.get_user_role(auth.uid()) in ('admin', 'teacher'));

create policy "Admins possuem controle total dos cursos"
    on public.courses for all using (public.get_user_role(auth.uid()) = 'admin');

create policy "Professores podem gerenciar seus próprios cursos"
    on public.courses for all using (
        public.get_user_role(auth.uid()) = 'teacher' and (author_id = auth.uid() or author_id is null)
    );

-- POLÍTICAS: PATH_COURSES (TRILHAS <-> CURSOS)
create policy "Visualização pública de relações trilha-curso"
    on public.path_courses for select using (true);

create policy "Admins e professores gerenciam relações trilha-curso"
    on public.path_courses for all using (public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- POLÍTICAS: MODULES (MÓDULOS)
create policy "Estudantes podem visualizar módulos se o curso estiver publicado"
    on public.modules for select using (
        exists (select 1 from public.courses where id = course_id and is_published = true)
        or public.get_user_role(auth.uid()) in ('admin', 'teacher')
    );

create policy "Admins e professores gerenciam módulos"
    on public.modules for all using (public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- POLÍTICAS: LESSONS (AULAS)
create policy "Estudantes podem visualizar aulas se a aula estiver publicada"
    on public.lessons for select using (
        (is_published = true and exists (
            select 1 from public.modules m 
            join public.courses c on c.id = m.course_id 
            where m.id = module_id and c.is_published = true
        ))
        or public.get_user_role(auth.uid()) in ('admin', 'teacher')
    );

create policy "Admins e professores gerenciam aulas"
    on public.lessons for all using (public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- POLÍTICAS: ENROLLMENTS (MATRÍCULAS)
create policy "Admins controlam matrículas"
    on public.enrollments for all using (public.get_user_role(auth.uid()) = 'admin');

create policy "Estudantes podem visualizar suas próprias matrículas"
    on public.enrollments for select using (auth.uid() = user_id);

-- POLÍTICAS: STUDENT_PROGRESS (PROGRESSO)
create policy "Estudantes visualizam e gerenciam seu próprio progresso"
    on public.student_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Professores e Admins podem ler progresso dos estudantes"
    on public.student_progress for select using (public.get_user_role(auth.uid()) in ('admin', 'teacher'));

-- POLÍTICAS: CERTIFICATES (CERTIFICADOS)
create policy "Admins gerenciam certificados"
    on public.certificates for all using (public.get_user_role(auth.uid()) = 'admin');

create policy "Estudantes visualizam seus próprios certificados"
    on public.certificates for select using (auth.uid() = user_id);
