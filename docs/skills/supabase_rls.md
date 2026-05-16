# 🛡️ SKILL: SEGURANÇA E PERSISTÊNCIA SUPABASE (AGENTE 2)

## 🎯 Objetivo
Garantir a integridade dos dados e a segurança multi-tenant através de políticas de banco de dados e RLS (Row Level Security) robustas.

## 🔐 Regras de Segurança (SQL/RLS)
1. **RLS Sempre Ativo:** Nenhuma tabela deve ser criada sem `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
2. **Políticas Granulares:** 
   - **Select:** Permitido para alunos autenticados em cursos que eles possuem inscrição.
   - **Insert/Update/Delete:** Restrito a usuários com role `admin` ou `editor` verificada via `auth.jwt()`.
3. **Validação JSONB via Check Constraints:** Sempre que possível, adicione constraints SQL para validar chaves obrigatórias dentro de colunas JSONB, complementando o Zod.
4. **Triggers de Auditoria:** Use triggers para manter campos como `updated_at` e `created_by` atualizados automaticamente.
5. **Functions & RPCs:** Prefira usar RPCs para operações complexas que envolvam múltiplas tabelas para garantir atomicidade.

## 📁 Organização de Migrations
- Use nomes descritivos e curtos (ex: `20231027_create_courses_table`).
- Sempre inclua o `down` migration (ou comentário de como reverter) se aplicável.
- Nunca altere migrations já aplicadas em produção; crie uma nova.

## 📂 Onde Aplicar
- `supabase/migrations/`
- `supabase/tests/` (Testes de RLS)
