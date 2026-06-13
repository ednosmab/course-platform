-- Add order_index to courses table for admin-controlled display ordering.
-- Follows the same pattern as modules.order_index and lessons.order_index.

alter table public.courses
  add column order_index integer not null default 0;

create index if not exists idx_courses_order_index
  on public.courses(order_index);
