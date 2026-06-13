-- ==========================================
-- Performance Indexes — SCL-01
-- Índices compostos para consultas frequentes
-- Data: 2026-05-21
-- ==========================================

-- Dashboard admin: listar cursos por autor
create index if not exists idx_courses_author_id
  on public.courses(author_id);

-- Matrículas: buscar cursos de um usuário
create index if not exists idx_enrollments_user_course
  on public.enrollments(user_id, course_id);

-- Módulos: ordenação dentro de um curso
create index if not exists idx_modules_course_order
  on public.modules(course_id, order_index);

-- Aulas: ordenação dentro de um módulo (já existe idx_lessons_module_id, mas sem order_index)
create index if not exists idx_lessons_module_order
  on public.lessons(module_id, order_index);

-- Certificados: busca por usuário + curso
create index if not exists idx_certificates_user_course
  on public.certificates(user_id, course_id);

-- Progresso: consulta de aulas concluídas por lição (partial index)
create index if not exists idx_progress_lesson_completed
  on public.student_progress(lesson_id) where completed = true;
