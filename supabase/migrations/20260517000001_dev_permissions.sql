-- ==========================================
-- Políticas RLS Permissivas para Desenvolvimento/Sandbox
-- Data: 2026-05-17
-- Autor: Antigravity
-- ==========================================

-- 1. COURSES
DROP POLICY IF EXISTS "Permitir leitura pública de cursos publicados" ON public.courses;
DROP POLICY IF EXISTS "Permitir gerenciamento por admins" ON public.courses;
DROP POLICY IF EXISTS "Permitir gerenciamento por admins e professores" ON public.courses;

CREATE POLICY "Desenvolvimento: Acesso publico total a cursos"
    ON public.courses FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. LESSONS
DROP POLICY IF EXISTS "Permitir leitura pública de aulas publicadas" ON public.lessons;
DROP POLICY IF EXISTS "Permitir tudo para professores e admins nas aulas" ON public.lessons;

CREATE POLICY "Desenvolvimento: Acesso publico total a aulas"
    ON public.lessons FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. PATHS
DROP POLICY IF EXISTS "Permitir leitura pública de trilhas publicadas" ON public.paths;
DROP POLICY IF EXISTS "Permitir tudo para admins nas trilhas" ON public.paths;

CREATE POLICY "Desenvolvimento: Acesso publico total a trilhas"
    ON public.paths FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. PATH_COURSES
DROP POLICY IF EXISTS "Permitir leitura pública de relacionamentos" ON public.path_courses;
DROP POLICY IF EXISTS "Permitir gerenciamento de relacionamentos por professores e admins" ON public.path_courses;

CREATE POLICY "Desenvolvimento: Acesso publico total a path_courses"
    ON public.path_courses FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. MODULES
DROP POLICY IF EXISTS "Permitir leitura pública de módulos" ON public.modules;
DROP POLICY IF EXISTS "Permitir tudo para professores e admins nos módulos" ON public.modules;

CREATE POLICY "Desenvolvimento: Acesso publico total a modulos"
    ON public.modules FOR ALL TO public USING (true) WITH CHECK (true);
