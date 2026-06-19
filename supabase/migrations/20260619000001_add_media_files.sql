-- ==========================================
-- Tabela de Arquivos de Mídia (Biblioteca)
-- Data: 2026-06-19
-- ==========================================

-- Tabela de Metadados de Mídia
create table public.media_files (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    type text not null check (type in ('image', 'video', 'document')),
    mime_type text not null,
    size_bytes bigint not null,
    url text not null,
    bucket text not null default 'media',
    path text not null,
    uploader_id uuid references public.profiles(id) on delete set null,
    course_id uuid references public.courses(id) on delete set null,
    created_at timestamptz not null default now()
);

-- Índices para performance
create index idx_media_files_type on public.media_files(type);
create index idx_media_files_uploader_id on public.media_files(uploader_id);
create index idx_media_files_course_id on public.media_files(course_id);
create index idx_media_files_created_at on public.media_files(created_at desc);

-- Ativar RLS
alter table public.media_files enable row level security;

-- POLÍTICAS: MEDIA_FILES
create policy "Admins possuem controle total de mídias"
    on public.media_files for all using (public.get_user_role(auth.uid()) = 'admin');

create policy "Professores podem gerenciar suas próprias mídias"
    on public.media_files for all using (
        public.get_user_role(auth.uid()) = 'teacher' and uploader_id = auth.uid()
    );

create policy "Qualquer usuário logado pode visualizar mídias"
    on public.media_files for select using (true);
