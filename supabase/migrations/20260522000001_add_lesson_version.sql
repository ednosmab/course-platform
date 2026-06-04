-- Versão editorial: incrementada a cada publish para polling eficiente
alter table public.lessons
  add column if not exists version integer not null default 1;

create index if not exists idx_lessons_version
  on public.lessons(id, version);
