# Manutenção Zero-Downtime

## Estratégia para Próximo.js (Admin)

Next.js App Router já suporta zero-downtime nativamente com **LTS (Long-Term Support)**:

1. **Build:** `next build` gera arquivos estáticos + server bundle
2. **Deploy:** Novo processo inicia antes do antigo ser desligado
3. **Graceful shutdown:** Antigo server aguarda requests em andamento finalizarem
4. **Health check:** Load balancer (ou proxy) só roteia tráfego após `/health` responder 200

```bash
# Script de deploy rolling
next build &&
pm2 start ecosystem.config.js --update-env &&
pm2 reload all --wait-ready --kill-timeout 5000
```

## Estratégia para Expo Web (Student)

1. **Static export** via `expo export:web`
2. Deploy para CDN (ex: Cloudflare Pages, Vercel) com **instantâneo** (sem overlap)
3. CDN serve versão antiga até nova propagar

## Database Migrations (Supabase)

```bash
# 1. Aplicar migration não-destrutiva (add column, new index)
supabase db push --no-seed

# 2. Deploy novo código que usa a migration

# 3. Remover colunas antigas APÓS código antigo não estar mais rodando
supabase db push --version 2
```

### Regras
- `ALTER TABLE ADD COLUMN` é seguro (não bloqueia)
- `DROP COLUMN` exige confirmação manual
- `CREATE INDEX CONCURRENTLY` não bloqueia escritas
- Migrações destrutivas agendadas para janela de baixa atividade

## Rollback

- **Código:** Deploy da versão anterior via git revert + novo deploy
- **DB:** Migração reversa (`supabase db pull` + diff manual)
- **Backup:** Restore point criado antes de cada migration destrutiva
