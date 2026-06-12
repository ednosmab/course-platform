# ADR-013: Supabase Realtime subscriptions direct from student app (without API layer)

**Status:** Accepted  
**Data:** 2026-05-23  
**Contexto:** Student app precisa de sincronização ao vivo de progresso e notificações

---

## Decisão

O app do aluno se inscreve nos canais **Supabase Realtime** diretamente, sem passar por uma camada de API intermediária (WebSocket própria ou BFF). Os canais são escopados exclusivamente aos dados do usuário autenticado. A conexão Realtime é estabelecida assim que o usuário faz login e encerrada no logout.

---

## Contexto

O Supabase Realtime oferece WebSocket nativo sobre PostgreSQL LISTEN/NOTIFY. Para o caso de uso do student app — sincronização de progresso entre dispositivos e notificações de curso — uma camada adicional de WebSocket traria complexidade desnecessária. A conexão direta reduz latência e elimina um ponto de falha na arquitetura.

**Canais utilizados:**
- `progress:{userId}` — Atualizações de progresso em tempo real
- `certificates:{userId}` — Notificação de certificado emitido
- `enrollments:{userId}` — Mudanças na matrícula do aluno

---

## Consequências

### ✅ Positivas
- Menor latência: dados vão direto do banco para o cliente
- Zero infraestrutura adicional de WebSocket — mantido pelo Supabase
- Escopo seguro por `userId` — aluno só recebe os próprios dados
- Reconexão automática gerenciada pelo cliente Supabase
- Simplicidade operacional: menos serviços para monitorar

### ❌ Negativas
- Acoplamento direto ao Supabase Realtime — migração futura exigiria refatoração
- Consumo de recursos do banco (cada canal ativo usa LISTEN/NOTIFY no PostgreSQL)
- Limits do plano Supabase: número máximo de conexões Realtime concorrentes
- Sem middleware de transformação — dados chegam como estão no banco

---

## Referências

- `apps/student/src/hooks/useRealtimeSubscription.ts` — Hook de inscrição
- `docs/skills/supabase_realtime.md` — Documentação de Realtime
- `docs/Requisitos_plataforma.md` — Requisitos de sincronização
