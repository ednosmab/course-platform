# ADR-011: Offline outbox pattern — AsyncStorage + flush síncrono

**Status:** Superseded by ADR-023  
**Data:** 2026-05-23  
**Contexto:** Student mobile app (Expo) precisa funcionar offline durante o consumo de aulas

---

## Decisão

O app mobile do aluno adota o padrão **offline outbox**. Progressos de aula (tempo assistido) são gravados primeiramente no `AsyncStorage` local e depois sincronizados (flushed) com o Supabase quando houver conectividade. O outbox armazena entradas pendentes com `lessonId`, `progressSec`, `durationSec` e `updatedAt`.

---

## Contexto

Alunos em áreas com conectividade intermitente precisam ter sua evolução salva localmente e sincronizada automaticamente quando a rede for restabelecida. O padrão outbox garante zero perda de progresso mesmo em cenários de queda abrupta de conexão.

**Fluxo:**
1. Usuário assiste aula → progresso é salvo no `AsyncStorage` como `pending_outbox[]`
2. Um background job ou gatilho de conectividade tenta sincronizar entradas pendentes
3. Sucesso → entrada removida do outbox local
4. Falha → entrada permanece para próxima tentativa

---

## Consequências

### ✅ Positivas
- Resiliência total a falhas de rede — progresso nunca é perdido
- UX consistente: aluno não percebe problemas de conectividade
- Sincronização eventual sem lógica complexa de conflict resolution
- Fácil de testar: outbox é uma lista JSON no AsyncStorage

### ❌ Negativas
- Latência entre o progresso real e o refletido no backend
- Possibilidade de duplicatas se o flush falhar após gravar no servidor mas antes de remover do outbox (idempotência necessária no backend)
- Consumo de AsyncStorage cresce com o número de entradas pendentes

---

## Referências

- `apps/student/src/services/outbox.ts` — Implementação do outbox local
- `apps/student/src/services/sync.ts` — Job de sincronização
- `docs/skills/offline_first.md` — Estratégia offline do projeto
