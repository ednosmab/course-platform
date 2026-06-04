-- ==========================================
-- Adiciona suporte a TESTE blocks no progresso do aluno
-- Data: 2026-05-22
-- ==========================================

alter table public.student_progress
  add column if not exists tests_completed jsonb not null default '{}'::jsonb;
