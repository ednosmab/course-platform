# ADR-022: Remoção de Connection Pooling Code

## Status

Aprovado

## Contexto

O P0-03 foi originalmente criado como "Connection Pooling Não Configurado", assumindo que a plataforma necessitava de configuração explícita de PgBouncer (porta 6543) para suportar crescimento futuro e evitar saturação de conexões com o banco de dados.

## Investigação

Foi executada uma análise completa da arquitectura de acesso a dados da plataforma.

### Evidências colectadas

- Zero ocorrências de `pg`, `Pool`, `Client`, `Prisma`, `Knex` ou qualquer outro cliente PostgreSQL direto
- Todos os acessos ao banco utilizam exclusivamente `supabase-js` (SDK HTTP)
- Foram identificadas aproximadamente 85 operações de banco realizadas via SDK HTTP
- O Supabase gere internamente o pool de conexões PostgreSQL
- O projeto não possui responsabilidade nem controle sobre o PgBouncer interno do Supabase
- Nenhuma aplicação consome os artefatos criados para monitoramento de pooling
- A migration de monitoramento não foi executada no ambiente remoto
- O script de validação não possui consumidores e valida uma premissa que não se aplica

### Teste de validação

```
✅ Environment Variables       — Configuradas
✅ Supabase Client Creation    — Funcional
✅ Database Connection          — Funcional (1 row retornada)
❌ Connection Pool RPC         — SKIPPED (falta SERVICE_ROLE_KEY)
✅ Pooler URL Configuration    — "URL is using standard connection (not pooler)"
```

## Conclusão

A hipótese original foi invalidada.

A plataforma não utiliza conexões PostgreSQL diretas. Consequentemente:

- Não existe pool client-side para gerenciar
- Não existe benefício operacional em configurar PgBouncer manualmente
- As métricas coletadas por `pg_stat_activity` representam o ambiente interno do Supabase e não algo que a aplicação possa controlar ou otimizar

A dívida técnica originalmente identificada como "Connection Pooling Não Configurado" não existe na arquitectura actual.

## Decisão

Remover os seguintes artefatos:

1. `packages/core/src/infrastructure/connection-monitor.ts`
2. `supabase/migrations/20260613000001_add_connection_monitoring_rpc.sql`
3. `scripts/test-connection-pooling.ts`
4. Secção "CONNECTION POOLING" de `.env.example`
5. Exports de connection-monitor em `packages/core/src/index.ts`

Manter:

- `packages/core/src/supabase.ts` — `getSupabaseAdmin()` é essencial para operações server-side e não possui relação com pooling

Actualizar documentação:

- `docs/CURRENT_STATE.md`
- `docs/GAP_ANALYSIS.md`
- `docs/BACKLOG_TECHNICAL_DEBT.md`
- `docs/skills/connection_pooling.md`
- `governance/context/context_buffer.yaml`

## Lição Arquitetural

Não encontramos um problema de implementação. Encontramos uma premissa incorreta.

A auditoria demonstrou que o processo de governança está a funcionar correctamente, pois foi capaz de:

1. Questionar uma hipótese
2. Produzir evidências
3. Invalidar a hipótese
4. Corrigir backlog, documentação e arquitetura
5. Eliminar complexidade desnecessária

## Artefatos Impactados

| Artefato | Acção |
|---|---|
| `connection-monitor.ts` | Removido |
| Migration RPC | Removida |
| `test-connection-pooling.ts` | Removido |
| `.env.example` | Refactorizado (secção pooling removida) |
| `index.ts` | Refactorizado (exports removidos) |
| `supabase.ts` | Mantido (getSupabaseAdmin) |
| 5 ficheiros de documentação | Actualizados |
