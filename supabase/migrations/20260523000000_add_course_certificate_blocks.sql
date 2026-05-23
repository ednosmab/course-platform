-- Adds certificate_blocks JSONB column to courses table for the CMS Studio visual certificate editor
alter table public.courses
add column if not exists certificate_blocks jsonb not null default '[]'::jsonb;
