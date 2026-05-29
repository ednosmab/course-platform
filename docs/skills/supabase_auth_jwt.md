# 🔑 SKILL: SUPABASE AUTH, ROLES & JWT CLAIMS

## 🎯 Objetivo
Gerenciar identidades e permissões de forma segura, utilizando o poder do JWT e metadados do usuário para evitar consultas desnecessárias ao banco.

## 🔐 Credenciais de Desenvolvimento (Admin CMS)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | `admin@admin.com` | `123456` |
| Aluno | `aluno@aluno.com` | `123456` |

### Fluxo de Login e Redirecionamento
1. Formulário `/login` autentica via `supabase.auth.signInWithPassword()`.
2. Após autenticar, busca `role` na tabela `profiles`.
3. **Redirecionamento por perfil:**
   - `role = 'admin' | 'teacher'` → dashboard `/` do admin
   - `role = 'student'` → app do aluno (`http://localhost:8081`)

### Middleware (Next.js)
- Usa `@supabase/ssr` com cookies.
- Rotas públicas: `/login`, `/api/health`, `/api/ready`, `/` (raiz).
- Usuário não autenticado em rota protegida → redirecionado para `/login?redirect=<path>`.

## 🔐 Melhores Práticas
1. **Custom Claims:** Use funções PL/pgSQL para injetar roles (ex: `admin`, `teacher`) diretamente no JWT do usuário. Isso permite que o RLS verifique permissões sem dar `JOIN` na tabela de perfis.
2. **App Metadata vs User Metadata:**
   - **App Metadata:** Para dados sensíveis que o usuário NÃO pode alterar (ex: roles, status da conta).
   - **User Metadata:** Para dados de perfil que o usuário pode editar (ex: avatar_url, display_name).
3. **Session Management:** Sempre use `auth.getSession()` no lado do cliente e valide o token no servidor via `supabase.auth.getUser()` (que faz uma chamada segura ao Supabase Auth).
4. **Auth Hooks:** Utilize Supabase Hooks para customizar o fluxo de login ou registro (ex: validar e-mail corporativo).
5. **Triggers de Perfil:** Crie automaticamente um registro na tabela `public.profiles` sempre que um novo usuário for criado no `auth.users`.

## 📂 Onde Aplicar
- `supabase/migrations/` (Triggers e Functions de Auth).
- `packages/core/auth/`.
