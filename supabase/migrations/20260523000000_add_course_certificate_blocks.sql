-- Adiciona a coluna certificate_blocks na tabela courses para suporte ao editor visual do CMS Studio
alter table public.courses
add column certificate_blocks jsonb not null default '[]'::jsonb;
