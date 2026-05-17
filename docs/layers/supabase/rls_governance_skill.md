# Skill: Governança de RLS (Row-Level Security) e Segurança Supabase

## 🎯 Objetivo
Garantir o isolamento absoluto de dados dos alunos e professores, protegendo as tabelas do monorepo contra acessos não autorizados por meio da aplicação rigorosa de políticas RLS no PostgreSQL.

---

## 🔒 Princípios de Segurança (LEI ABSOLUTA)
1. **RLS Habilitado por Padrão:** Toda nova tabela criada em migrações SQL do Supabase DEVE ter a cláusula `alter table ... enable row level security;` declarada logo após sua criação.
2. **Nenhuma Operação Sem Política:** Por padrão, tabelas com RLS habilitado sem políticas associadas bloqueiam todas as leituras e gravações. É obrigatório criar políticas explícitas para cada perfil de usuário.
3. **Escrita Restrita a Administradores:** Alunos nunca gravam ou atualizam cursos, módulos ou aulas. Suas ações de escrita estão restritas a registrar progresso (`student_progress`).
4. **Isolamento de Alunos:** Um aluno NUNCA pode ler o progresso ou dados de outro aluno. A verificação do JWT do usuário (`auth.uid()`) é obrigatória.

---

## 📝 Blueprint de Políticas RLS por Tabela

### 1. Políticas da Tabela: `public.courses`
* **Leitura para Alunos e Visitantes:** Permitida para qualquer usuário autenticado se o curso estiver publicado.
  ```sql
  create policy "Permitir leitura de cursos publicados" on public.courses
    for select using (is_published = true);
  ```
* **Escrita para Administradores:** Administradores têm controle total (insert, update, delete).
  ```sql
  create policy "Admins têm controle total sobre cursos" on public.courses
    for all using (auth.jwt() ->> 'role' = 'service_role' or (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
  ```

### 2. Políticas da Tabela: `public.modules`
* **Leitura:** Vinculada à publicação do curso correspondente.
  ```sql
  create policy "Permitir leitura de módulos vinculados a cursos publicados" on public.modules
    for select using (
      exists (
        select 1 from public.courses 
        where courses.id = modules.course_id and courses.is_published = true
      )
    );
  ```
* **Escrita:** Exclusiva para administradores.

### 3. Políticas da Tabela: `public.lessons` (CMS Core)
* **Leitura para Alunos:** Alunos leem apenas aulas publicadas e pertencentes a módulos de cursos publicados.
  ```sql
  create policy "Alunos leem apenas aulas publicadas" on public.lessons
    for select using (
      is_published = true and 
      exists (
        select 1 from public.modules
        join public.courses on courses.id = modules.course_id
        where modules.id = lessons.module_id and courses.is_published = true
      )
    );
  ```
* **Escrita para Admins:** Controle total para permitir a operação do construtor visual.

### 4. Políticas da Tabela: `public.student_progress`
* **Leitura:** O aluno pode ver apenas seu próprio progresso de conclusão.
  ```sql
  create policy "Alunos consultam seu próprio progresso" on public.student_progress
    for select using (auth.uid() = user_id);
  ```
* **Inserção/Escrita:** O aluno só pode registrar progresso em seu próprio nome.
  ```sql
  create policy "Alunos criam seu próprio progresso" on public.student_progress
    for insert with check (auth.uid() = user_id);
  ```
* **Atualização:** O aluno só pode atualizar seu próprio progresso.
  ```sql
  create policy "Alunos atualizam seu próprio progresso" on public.student_progress
    for update using (auth.uid() = user_id);
  ```

---

## 🪣 Governança de Storage (Políticas de Bucket)

### 1. Bucket: `course-media` (Privado)
* **Leitura:** Apenas alunos ativos inscritos no curso podem visualizar a mídia via signed URL gerado dinamicamente pelas Edge Functions.
* **Escrita:** Restrita a administradores.

### 2. Bucket: `course-thumbnails` (Público)
* **Leitura:** Permitida para qualquer usuário (anônimo ou autenticado) para permitir renderização imediata do feed de cursos.
* **Escrita:** Apenas administradores autenticados podem fazer upload de novas capas de cursos.
