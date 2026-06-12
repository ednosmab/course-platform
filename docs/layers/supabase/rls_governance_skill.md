# Governança de RLS (Row Level Security) e Segurança Supabase

## 🎯 Objetivo
Garantir o isolamento de dados de usuários e controle estrito de permissões utilizando o Row Level Security (RLS) nativo do PostgreSQL no Supabase, garantindo conformidade com a LGPD.

---

## 🔒 1. Princípios de Segurança
1. **RLS Sempre Ativo:** Toda e qualquer tabela criada no banco de dados deve habilitar RLS explicitamente via:
   ```sql
   alter table public.nome_tabela enable row level security;
   ```
2. **Nenhuma Permissão Implícita:** Por padrão, nenhuma leitura ou escrita é permitida a não ser que uma política (`policy`) a libere de forma explícita.
3. **Mapeamento de Perfis via JWT:** As permissões devem validar o ID e o papel do usuário extraídos diretamente do token JWT do Supabase utilizando `auth.uid()`.

---

## 🛡️ 2. Políticas Padrão por Perfil

### Perfis de Acesso
* **Administrador (`admin`):** Acesso completo de leitura e escrita em todas as tabelas.
* **Professor (`teacher`):** Leitura global; escrita e edição apenas em cursos de sua autoria.
* **Estudante (`student`):**
  * Leitura apenas de cursos, módulos, trilhas e aulas marcadas como `is_published = true`.
  * Escrita e leitura restrita **exclusivamente aos seus próprios registros** de `student_progress`, `enrollments` e `certificates`.

---

## 📝 3. Exemplo de Implementação de Política SQL

```sql
-- Habilitar RLS
alter table public.student_progress enable row level security;

-- Política: Alunos podem ler seu próprio progresso
create policy "Estudantes podem ler seu próprio progresso"
on public.student_progress
for select
using ( auth.uid() = user_id );

-- Política: Alunos podem atualizar seu próprio progresso
create policy "Estudantes podem atualizar seu próprio progresso"
on public.student_progress
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );
```
