# ADR-010: RLS-First security — anon key exposed, all authorization in database

**Status:** Aceito
**Data:** 2026-05-23
**Contexto:** Supabase database, auth e storage

---

## Decisão

A chave anônima do Supabase (`anon key`) é pública por design. Toda autorização é aplicada através de políticas Row Level Security (RLS) no PostgreSQL. A camada de aplicação nunca toma decisões de autorização — ela confia no banco. O acesso de admin vs aluno é controlado por políticas RLS baseadas em role em cada tabela.

---

## Contexto

O Supabase utiliza duas chaves: `anon` (pública, embarcada no cliente) e `service_role` (secreta, apenas para server-side). Como o `anon key` está exposto no bundle do frontend (Next.js e Expo), qualquer segurança baseada em esconder essa chave é ilusória.

A abordagem correta para segurança em Supabase é:

1. **Nunca confiar no cliente** — toda requisição passa pelo banco
2. **Sempre validar no banco** — RLS policies são o único gatekeeper
3. **Camada de aplicação é apenas um proxy** — ela nunca decide "quem pode ver o quê"

**Exemplo de política RLS:**
```sql
CREATE POLICY "Alunos veem apenas cursos publicados"
ON courses FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'student' AND is_published = true
  OR
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## Consequências

### Positivas
- **Segurança real:** Mesmo que o `anon key` seja comprometido, o RLS protege os dados
- **DRY de autorização:** A lógica de permissão vive em um só lugar (o banco)
- **Auditável:** Policies RLS são versionadas nas migrations
- **Resistente a XSS/MITM:** Um atacante no frontend não consegue escalar privilégio

### Negativas
- **Complexidade de migração:** Mudanças de regra de negócio exigem migration SQL
- **Testing mais complexo:** Testes de autorização precisam simular JWT tokens
- **Performance:** RLS policies executam em cada row — queries complexas podem ser lentas sem índices adequados
- **Vazamento de estrutura:** Policies mal escritas podem vazar dados via erros 400/500

---

## Referências

- `supabase/migrations/` — arquivos de migration com RLS policies
- `docs/FORBIDDEN_OPERATIONS.md` — F-06: proibido desabilitar RLS
- `docs/skills/supabase_rls.md`
- `docs/skills/supabase_auth_jwt.md`
- `docs/layers/supabase/rls_governance_skill.md`
