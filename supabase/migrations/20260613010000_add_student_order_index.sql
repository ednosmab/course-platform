-- Add student_order_index to courses table for admin-controlled student-facing display ordering.
-- Separated from order_index (admin management) to allow independent ordering.

alter table public.courses
  add column student_order_index integer not null default 0;

create index if not exists idx_courses_student_order_index
  on public.courses(student_order_index);
