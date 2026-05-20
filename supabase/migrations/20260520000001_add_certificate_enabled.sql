-- ==========================================
-- Adiciona suporte a certificados nos cursos
-- Data: 2026-05-20
-- ==========================================

alter table public.courses
  add column if not exists certificate_enabled boolean not null default false;
