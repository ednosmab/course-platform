# ADR-017: Version-Based Sync — Trava contra Refatoração Prematura

**Status:** Aceito  
**Data:** 2026-05-22  
**Contexto:** CMS → Student lesson content sync  
**Autor:** Edson

---

## Decisão

**É PROIBIDO refatorar o mecanismo de sincronização de conteúdo (version + polling 30s + on-focus + Realtime) para o padrão concentrador descrito em `docs/roadmaps/concentrador-de-dados.md` ou qualquer outro (WebSocket próprio, Server-Sent Events, CDN push) enquanto a plataforma não atingir ≥500 alunos simultâneos.**

Esta trava permanece ativa até que métricas reais de produção comprovem a necessidade.

---

## Contexto

O MVP precisa de sincronização CMS → aluno com latência aceitável e zero infraestrutura adicional. Quatro mecanismos foram implementados em camadas:

1. **Realtime subscription** (push instantâneo, 0 req — depende de ativação manual no Dashboard)
2. **On-focus refresh** (1 req ao voltar pra aba do aluno)
3. **Polling 30s com version check** (SELECT version, 1 int — busca blocks só se mudou)
4. **`publishLesson` incrementa version** (race condition evitada por `content_version` gerado no client)

Este design sustenta centenas de alunos simultâneos sem degradação. A próxima etapa documentada no `plano_de_arquitetura_concentrador_de_dados.md` (Next.js + Redis como buffer de escrita + broadcast centralizado) atenderia 10k+, mas introduce:

- Dependência externa (Redis / Upstash)
- API routes dedicadas (`/api/progress`, `/api/progress/process-queue`)
- Cron job externo (QStash, Cron-Job.org)
- Complexidade operacional para deploy e monitoramento

---

## Consequências

### Obrigatórias
- Nenhuma task da família `CDC-*` no backlog pode ser iniciada sem autorização explícita.
- Nenhuma dependência (Redis, Upstash) pode ser adicionada para fins de sync de conteúdo.
- O `version` column + polling atual devem ser mantidos como única solução de sync até o gatilho ser atingido.

### Gatilho para Revisão
A trava pode ser quebrada quando **pelo menos um** dos critérios for atingido:

| Métrica | Gatilho | Fonte |
|---|---|---|
| Alunos simultâneos | ≥500 | Supabase analytics ou logs do PostgREST |
| SELECTs `/second` na tabela `lessons` (p95) | ≥50/s | `pg_stat_statements` |
| Latência p95 de `GET /rest/v1/lessons` | >500ms | Supabase logs |
| Timeout de connection pool | >1% das requisições | Supabase error logs |

### Penalidade
Qualquer PR que refatore o sync para concentrador sem atingir o gatilho será rejeitado em code review, independente da qualidade técnica da implementação.

---

## Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Concentrador Next.js + Redis (CDC-01 a CDC-04) | Complexidade operacional sem benefício no MVP |
| WebSocket próprio (Socket.io + Redis adapter) | Infraestrutura dedicada, manutenção contínua |
| Server-Sent Events | Menos suporte mobile que WebSocket |
| Polling direto ao Supabase sem version | 12 req/min/aluno vs 2 req/min com version |
| CDN push + HTML estático pré-renderizado | Requer pipeline de build, inviável sem CDN |

---

## Referências

- `apps/student/src/screens/LessonPlayer.tsx:160-230` — Realtime + polling + on-focus
- `apps/admin/src/context/EditorContext.tsx:452-460` — `publishLesson` com version increment
- `supabase/migrations/20260522000001_add_lesson_version.sql` — coluna `version`
- `docs/roadmaps/scalability-plan.md` — SCL tasks
- `docs/roadmaps/concentrador-de-dados.md` — Plano de concentrador (bloqueado por este ADR)
- `docs/BACKLOG.md` — CDC-01 a CDC-04
