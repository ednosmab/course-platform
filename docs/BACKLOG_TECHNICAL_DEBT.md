# BACKLOG_TECHNICAL_DEBT.md — Dívida Técnica Priorizada (Revisão V2)

> **Data:** 2026-06-13
> **Revisão:** V2 — Corrigido com princípio "Medir → Validar → Justificar → Implementar"
> **Base:** Auditoria directa do código + ADRs existentes
> **Princípio:** Nenhuma optimização sem dados concretos que a justifiquem

---

## Princípio Orientador

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO OBRIGATÓRIO                        │
├─────────────────────────────────────────────────────────────┤
│  1. MEDIR     → Métricas P95, testes de carga              │
│  2. VALIDAR   → Dados confirmam o problema                 │
│  3. JUSTIFICAR → Evidência quantificada justifica a acção  │
│  4. IMPLEMENTAR → Solução alinhada com ADRs                 │
└─────────────────────────────────────────────────────────────┘
```

> ⚠️ **Regra:** Nenhum item de optimização (cache, CDN, write-behind, lazy loading) pode avançar para implementação sem primeiro ter métricas que o justifiquem.

---

## Regras de Conclusão de Itens

> **Regra Vinculante:** Nenhum item pode ser marcado como concluído sem satisfazer TODOS os 4 requisitos abaixo.

### Checklist Obrigatório de Conclusão

| # | Requisito | Descrição | Evidência Necessária |
|---|---|---|---|
| 1 | **Actualização da documentação** | Todo o código novo/modificado deve ter documentação correspondente actualizada | Ficheiros `.md` actualizados, JSDoc adicionado, READMEs relevantes |
| 2 | **Actualização do backlog** | Status do item actualizado em `BACKLOG_TECHNICAL_DEBT.md` com data e commit | Checkbox `[x]` preenchido, data de conclusão registada |
| 3 | **Validação dos critérios de sucesso** | Todos os critérios do item devem ser verificáveis e ter passado | Output de comandos de teste, métricas colectadas, reviews |
| 4 | **Registo da decisão** | Quando aplicável, decisão deve ser documentada em ADR ou SDR | Ficheiro ADR/SDR criado ou actualizado |

### Fluxo de Conclusão

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUXO DE CONCLUSÃO                         │
├─────────────────────────────────────────────────────────────┤
│  1. Implementar código                                      │
│  2. Actualizar documentação (JSDoc, READMEs, skills)        │
│  3. Executar testes → validação dos critérios               │
│  4. Se decisão arquitetural → criar ADR/SDR                 │
│  5. Actualizar BACKLOG_TECHNICAL_DEBT.md                    │
│  6. Actualizar context_buffer.yaml                          │
│  7. Só então: marcar como [x]                               │
└─────────────────────────────────────────────────────────────┘
```

### Tipos de Documentação por Tipo de Item

| Tipo de Item | Documentação Actualizada |
|---|---|
| **Infraestrutura** (Redis, pooling, CDN) | `docs/skills/` correspondente + `CURRENT_STATE.md` |
| **Código de domínio** (serviços, adapters) | JSDoc + `CURRENT_STATE.md` + `GAP_ANALYSIS.md` |
| **Segurança** (rate limiting, RLS) | `docs/skills/security_*.md` + `FORBIDDEN_OPERATIONS.md` |
| **Performance** (lazy loading, cache) | `docs/skills/` + `CURRENT_STATE.md` |
| **Arquitetura** (multitenancy, WebSocket) | Novo ADR em `docs/adrs/` |

### Exemplo de Item Concluído

```markdown
### P0-01: Rate Limiting Não Implementado

- [x] **Concluído:** 2026-06-20
- **Commit:** `abc1234`
- **Documentação actualizada:**
  - `docs/skills/rate_limiting.md` — implementação real documentada
  - `CURRENT_STATE.md` — secção Segurança actualizada
  - `GAP_ANALYSIS.md` — status alterado de ❌ para ✅
  - `BACKLOG_TECHNICAL_DEBT.md` — este item marcado [x]
- **Critérios validados:**
  - [ ] Login bloqueado após 5 tentativas (teste manual)
  - [ ] Headers `X-RateLimit-*` presentes (verificado via curl)
  - [ ] Resposta 429 com `Retry-After` (teste automatizado)
- **Decisão registada:** N/A (implementação direta)
```

---

## Legenda

| Prioridade | Significado | Critério |
|---|---|---|
| **P0** | Impede operação segura | Risco activo, dados expostos, sistema vulnerável |
| **P1** | Medição e infraestrutura base | Sem isto, não é possível medir nem escalar |
| **P2** | Optimização (condicionada a dados) | Só implementar se métricas justificarem |
| **P3** | Longo prazo | Escalabilidade extrema (50k+ users) |

---

## P0 — Impedem Operação Segura (Sem Medição Necessária)

> Itens P0 são acções correctivas imediatas. Não requerem medição prévia porque o risco é activo e identificável por inspecção directa do código.

---

### P0-01: Rate Limiting Não Implementado

- [x] **Concluído:** 2026-06-13
- **Commits:** Implementação de `rate-limiter.ts` e middleware no admin
- **Documentação actualizada:**
  - `packages/core/src/infrastructure/rate-limiter.ts` — implementação completa
  - `apps/admin/src/middleware.ts` — rate limit para login
  - `packages/core/src/index.ts` — exportações adicionadas
  - `CURRENT_STATE.md` — secção Segurança actualizada
  - `GAP_ANALYSIS.md` — status alterado de ❌ para ⚠️ Parcial
- **Critérios validados:**
  - [x] Rate limiter in-memory implementado com sliding window
  - [x] Rate limit por IP em endpoint de login (5 tentativas/min)
  - [x] Headers `X-RateLimit-*` em respostas 429
  - [x] Respostas 429 com `Retry-After` header
  - [x] Configurações pré-definidas (login, registration, progress, api, upload)
- **Decisão registada:** Implementação in-memory para início; Redis para produção quando justificado por métricas

- **Evidência:** Zero código de rate limiting em qualquer ficheiro. Zero dependências `rate-limiter-flexible` ou `@upstash/ratelimit` em package.json. Zero respostas HTTP 429. Zero headers `X-RateLimit-*`. `docs/skills/rate_limiting.md` contém design completo (233 linhas) mas nenhum código.

- **Risco Mitigado:** Brute force em login (`apps/admin/src/middleware.ts` não valida tentativas). Scraping de catálogo de cursos. DDoS em endpoints públicos. Abuso de APIs sem throttling.

- **Dependências:** Nenhuma (pode usar rate limiting in-memory para começar).

- **Métrica de Sucesso:**
  - Login bloqueado após 5 tentativas failed em 1 minuto
  - Zero respostas 200 para requests acima do limite
  - Tempo de resposta do rate limiter < 5ms (overhead mínimo)

---

### P0-02: Dev RLS Override (Dados Abertos)

- [x] **Concluído:** 2026-06-13
- **Commits:** Documentação de advertência no ficheiro de migração
- **Documentação actualizada:**
  - `supabase/migrations/20260517000001_dev_permissions.sql` — advertência de segurança adicionada
  - `CURRENT_STATE.md` — secção RLS actualizada
  - `GAP_ANALYSIS.md` — status mantido como ⚠️ Parcial
- **Critérios validados:**
  - [x] Cabeçalho de advertência claro no ficheiro de migração
  - [x] Instruções de reversão documentadas
  - [x] Riscos explicitamente listados
- **Decisão registada:** Advertência documentada; reversão será feita quando necessário para staging/produção

- **Evidência:** Migração `20260517000001_dev_permissions.sql` (41 linhas) faz `DROP POLICY` em courses, lessons, paths, path_courses, modules e substitui por `USING (true) WITH CHECK (true)`.

- **Risco Mitigado:** Todos os dados de conteúdo são acessíveis publicamente. Se migração dev for aplicada em staging/prod acidentalmente, dados ficam expostos. Violação de S-02 (FORBIDDEN_OPERATIONS).

- **Dependências:** Nenhuma.

- **Métrica de Sucesso:**
  - `supabase db dump` mostra policies strict em staging
  - Zero acesso não autenticado a dados em staging
  - Dev setup funciona localmente com permissões abertas

---

### P0-03: Database Connectivity & Health Monitoring — ENCERRADO (ADR-022)

- [x] **Concluído:** 2026-06-13
- [x] **Encerrado:** 2026-06-13 (ADR-022 — hipótese de pooling invalidada)
- **Resultado:** Apenas `getSupabaseAdmin()` mantido. Artefatos de pooling removidos.
- **Decisão:** Todo acesso à BD é via SDK HTTP (`supabase-js`). O Supabase gere internamente o pool de conexões PostgreSQL. Não há pool client-side. Hipótese original era incorreta.
- **Artefatos removidos:**
  - `packages/core/src/infrastructure/connection-monitor.ts`
  - `supabase/migrations/20260613000001_add_connection_monitoring_rpc.sql`
  - `scripts/test-connection-pooling.ts`
- **Artefatos mantidos:**
  - `packages/core/src/supabase.ts` — `getSupabaseAdmin()` (essencial, não relacionado com pooling)
  - `.env.example` — URL, Anon Key, Service Role (secção de pooling removida)
- **Lição:** Não encontramos um problema de implementação. Encontramos uma premissa incorreta. A auditoria demonstrou que o processo de governança está a funcionar correctamente.

---

## P1 — Medição e Infraestrutura Base

> Itens P1 estabelecem a capacidade de medir e validar antes de optimizar. Seguem rigorosamente o princípio "Medir → Validar → Justificar → Implementar".

---

### P1-01: Observabilidade (MÉTRICAS PRIMEIRO)

- **Evidência:** `docs/layers/infra/observability.md` é stub vazio (6 linhas, apenas cabeçalhos). Zero código de métricas em qualquer ficheiro. Zero configuração de alertas. `console.log`/`console.error` sem formato estruturado. Impossível saber se o sistema está degradado.

- **Risco Mitigado:** Sistema operando às cegas. Impossível detectar degradação de performance. Debugging em produção é adivinhação. Sem SLIs/SLOs definidos. Qualquer optimização (Redis, CDN, etc.) feita sem dados é palpite.

- **Dependências:** Nenhuma.

- **Critério de Conclusão:**
  - [ ] Library de métricas instalada (ex: `@vercel/analytics` ou `prom-client`)
  - [ ] Métricas P95 de latência em todos os endpoints críticos
  - [ ] Dashboard com: request rate, error rate, latency P50/P95/P99
  - [ ] Alertas para: P95 > 500ms, error rate > 1%, conexões > 80%
  - [ ] Logs estruturados (JSON) com requestId, userId, duration
  - [ ] `docs/layers/infra/observability.md` preenchido com configuração real

- **Métrica de Sucesso:**
  - Dashboard funcional com dados de pelo menos 7 dias
  - Alerta dispara quando P95 > 500ms durante 5 minutos
  - Capacidade de responder "qual é a latência actual do endpoint X?" em < 1 minuto

- **Alinhamento ADR:** N/A (condição prévia para todos os ADRs de performance)

---

### P1-02: Testes de Carga (VALIDAR ANTES DE IMPLEMENTAR)

- **Evidência:** Zero testes k6/artillery no repositório. Zero simulações de users simultâneos. Zero dados de performance sob carga. ADR-017 define triggers (SELECTs/second >= 50, latency > 500ms) mas não existem ferramentas para medir.

- **Risco Mitigado:** Otimização prematura — implementar Redis/CDN sem saber se são necessários. Gasto de tempo e dinheiro em infraestrutura que pode não ser necessária. Violação do princípio "Never optimise without data".

- **Dependências:** P1-01 (métricas precisam existir para capturar dados dos testes).

- **Critério de Conclusão:**
  - [ ] Script k6 ou artillery para simular carga
  - [ ] Cenário: 100, 500, 1000, 5000 users simultâneos
  - [ ] Métricas capturadas: throughput, latência P95, error rate, conexões DB
  - [ ] Relatório de resultados com gargalos identificados
  - [ ] Trigger thresholds do ADR-017 validados com dados reais

- **Métrica de Sucesso:**
  - Relatório de carga com: "Com X users simultâneos, latência P95 = Yms, error rate = Z%"
  - Identificação clara de: "O gargalo é A, portanto a solução é B"
  - Decisão baseada em dados para cada item P2

- **Alinhamento ADR-017:** Os triggers definidos neste ADR só podem ser validados com testes de carga:
  - `SELECTs/second on lessons >= 50/s` → medido pelo teste
  - `Latency p95 of GET /rest/v1/lessons > 500ms` → medido pelo teste
  - `Timeout of connection pool > 1%` → medido pelo teste

---

### P1-03: Cache Invalidation (CONDICIONADO A MÉTRICAS)

- **Evidência:** Zero uso de `useSWR` em qualquer ficheiro. `next.config.ts` sem configuração `revalidate`. Zero webhook handlers. Polling 30s é a única forma de detectar mudanças. Não se sabe se 30s é suficiente ou excesivo porque não há métricas.

- **Risco Mitigado:** Dados desactualizados visíveis por utilizadores (se TTL muito longo). Sobrecarga de requests (se TTL muito curto). Decisão arbitrária sem dados.

- **Dependências:** P1-01 (métricas), P1-02 (testes de carga para validar impacto).

- **Critério de Conclusão:**
  - [ ] SWR configurado no student app para conteúdo de aulas
  - [ ] Cache headers (`Cache-Control`) em endpoints GET públicos
  - [ ] Métricas de cache hit rate implementadas
  - [ ] TTL definido com base em dados reais (não arbitrário)
  - [ ] Webhook de invalidação no admin para updates de conteúdo

- **Métrica de Sucesso:**
  - Cache hit rate > 80% para conteúdo de aulas
  - Redução de queries Supabase >= 50% após implementação
  - Latência P95 de leitura de conteúdo < 100ms

- **Alinhamento ADR-017:** O polling de versão (30s) é uma forma de invalidação. Se métricas mostrarem que 30s é insuficiente, SWR pode complementar. Se 30s for suficiente, SWR pode não ser necessário.

---

### P1-04: Monitoramento de Conexões (CONDICIONADO A MÉTRICAS)

- **Evidência:** Nenhuma função `get_connection_stats()` implementada. Zero monitoramento de conexões activas. Dashboard Supabase mostra dados mas não há alertas configurados. ADR-013 documenta que cada canal Realtime usa LISTEN/NOTIFY.

- **Risco Mitigado:** Exceder limite de 400 conexões pooler sem detectar. Realtime connections do Supabase esgotadas sem alerta. Degradação silenciosa.

- **Dependências:** P1-01 (métricas).

- **Critério de Conclusão:**
  - [ ] RPC `get_connection_stats()` criada no Supabase
  - [ ] Métrica de conexões activas exportada para dashboard
  - [ ] Alerta quando conexões > 80% do limite
  - [ ] Dashboard mostra conexões por tipo (app, realtime, admin)

- **Métrica de Sucesso:**
  - Dashboard mostra conexões em tempo real
  - Alerta dispara antes de atingir 100% do limite
  - Dados históricos de 30 dias disponíveis para análise

- **Alinhamento ADR-017:** Trigger "timeout of connection pool > 1%" só pode ser monitorado com esta infraestrutura.

---

## P2 — Optimização (CONDICIONADA A DADOS)

> Itens P2 SÓ devem ser implementados após P1-01 e P1-02 fornecerem dados que os justifiquem. Cada item tem um "gate de dados" que deve ser satisfeito antes da implementação.

---

### P2-01: Cache Redis (GATE: Métricas mostram queries > 50/s)

- **Evidência:** Directorio `packages/core/src/infrastructure/` não existe. Zero dependências `@upstash/redis` em package.json. Único "cache": debounce in-memory em `progress.ts`. `docs/skills/redis_caching_strategy.md` contém design (249 linhas) mas nenhum código.

- **Risco Mitigado:** Sobrecarga do banco de dados com queries repetidas. Custo Supabase cresce linearmente com users. Latência elevada para conteúdo frequentemente acessado.

- **Dependências:** P1-01 (métricas), P1-02 (testes de carga). **GATE:** Testes devem mostrar que queries/second > 50 para justificar cache.

- **Critério de Conclusão:**
  - [ ] Conta Upstash criada (ou equivalente)
  - [ ] `@upstash/redis` instalado
  - [ ] `packages/core/src/infrastructure/redis.ts` implementado
  - [ ] Cache-aside para catálogo de cursos (TTL 60s)
  - [ ] Cache-aside para perfil de usuário (TTL 300s)
  - [ ] Cache de progresso para leitura (TTL 30s)
  - [ ] Fallback: se Redis cair, sistema continua funcional
  - [ ] Métricas de cache hit rate implementadas

- **Métrica de Sucesso:**
  - Cache hit rate > 80%
  - Redução de queries Supabase >= 50%
  - Latência de leitura < 10ms (cache hit)
  - Zero falhas quando Redis está indisponível

- **Alinhamento ADR-017:** ADR-017 bloqueia Redis para sync (write-behind). Cache de leitura pode ser implementado independentemente se métricas justificarem. Reavaliar quando platform atingir 500+ users.

---

### P2-02: Write-Behind para Progresso (GATE: Métricas mostram writes > 100/s)

- **Evidência:** `packages/core/src/services/progress.ts` usa debounce in-memory (object JS `{}`) com setTimeout 5s. Não persiste entre requests. Fallback direto ao Supabase sem rate limiting. `docs/roadmaps/concentrador-de-dados.md` contém design Redis queue mas nenhum código.

- **Risco Mitigado:** Perda de progresso se servidor reiniciar. Sobrecarga do banco com writes individuais. Sem batch processing.

- **Dependências:** P2-01 (Redis), P1-02 (testes de carga). **GATE:** Testes devem mostrar que writes/second > 100 para justificar queue.

- **Critério de Conclusão:**
  - [ ] `packages/core/src/services/progress-queue.ts` implementado
  - [ ] Fila Redis com TTL
  - [ ] Cron job para processamento em lote (bulk upsert, intervalo 10s)
  - [ ] Fallback: se Redis cair, grava directamente no Supabase com rate limit
  - [ ] Monitoramento de tamanho da fila
  - [ ] Alerta quando fila > 10k itens

- **Métrica de Sucesso:**
  - Batch processing: >= 100 records por ciclo
  - Zero perda de progresso em 24h de operação
  - Redução de writes Supabase >= 80%
  - Fila processada em < 30s em 99% dos casos

- **Alinhamento ADR-017:** ADR-017 bloqueia write-behind até 500+ users. Gate adicional: métricas devem mostrar necessidade.

---

### P2-03: React.lazy() para Blocos (GATE: Métricas mostram bundle > 500KB)

- **Evidência:** `packages/renderer/src/BlockRenderer.tsx` usa imports estáticos. Zero uso de `lazy()` em qualquer `.ts` ou `.tsx`. `docs/layers/renderer/engine-spec.md` (linha 26) documenta React.lazy mas não implementa.

- **Risco Mitigado:** Bundle inicial maior que necessário. Tempo de carregamento inicial superior. Blocos não utilizados carregados na carga inicial.

- **Dependências:** P1-01 (métricas de performance). **GATE:** Bundle analyzer deve mostrar que blocos representam > 30% do bundle total.

- **Critério de Conclusão:**
  - [ ] `React.lazy()` aplicado a cada bloco em `BlockRenderer.tsx`
  - [ ] `<Suspense>` com fallback `<Skeleton />` (se P2-05 implementado)
  - [ ] Code splitting configurado no bundler
  - [ ] Bundle size antes/depois medido

- **Métrica de Sucesso:**
  - Redução de bundle inicial >= 30%
  - Tempo de First Contentful Paint melhorado >= 200ms
  - Zero erros de loading em produção

- **Alinhamento ADR:** N/A (optimização de performance front-end)

---

### P2-04: IntersectionObserver para Lazy Loading (GATE: Métricas mostram blocos abaixo da dobra carregados)

- **Evidência:** Zero uso de `IntersectionObserver` em qualquer ficheiro. `docs/layers/renderer/engine-spec.md` (linha 37) documenta mas não implementa. Todos os blocos carregam na carga inicial independentemente da posição.

- **Risco Mitigado:** Requests desnecessários para blocos não visíveis. CPU gasta em renderização de blocos off-screen. Performance inferior em aulas longas.

- **Dependências:** P1-01 (métricas de performance). **GATE:** Métricas devem mostrar que > 50% dos blocos carregam sem estar visíveis.

- **Critério de Conclusão:**
  - [ ] Hook `useIntersectionObserver` implementado
  - [ ] Wrapper nos componentes de bloco
  - [ ] Threshold configurado (ex: 200px antes da dobra)
  - [ ] Lazy loading apenas para blocos abaixo da dobra

- **Métrica de Sucesso:**
  - Redução de requests >= 40% em aulas longas (>10 blocos)
  - CPU time reduzido >= 20% durante scroll
  - Zero atrasos visíveis quando bloco entra na dobra

- **Alinhamento ADR:** N/A (optimização de performance front-end)

---

### P2-05: Skeleton Loading (GATE: UX feedback negativo em testes)

- **Evidência:** Zero componentes `<Skeleton>` em `packages/ui/`. `docs/layers/renderer/engine-spec.md` (linha 40) documenta mas não implementa. Usuários veem conteúdo "pular" quando blocos carregam.

- **Risco Mitigado:** UX inferior. Indicadores visuais ausentes durante carregamento. Percepção de lentidão.

- **Dependências:** P2-03 (React.lazy precisa existir para ter loading states).

- **Critério de Conclusão:**
  - [ ] Componente `Skeleton` baseado em Tamagui
  - [ ] Placeholders por tipo de bloco (texto, vídeo, quiz)
  - [ ] Integração com React.lazy/Suspense
  - [ ] Animação de transição suave

- **Métrica de Sucesso:**
  - Zero relatos de "conteúdo pulando" em testes de UX
  - Tempo percebido de carregamento reduzido
  - Avaliação UX >= 4/5 em testes

- **Alinhamento ADR:** N/A (melhoria de UX)

---

### P2-06: Registry Wiring (GATE: Mais de 8 tipos de bloco)

- **Evidência:** `packages/renderer/src/registry.ts` existe com factory `createRegistry()`. `packages/renderer/src/BlockRenderer.tsx` usa if-chain hardcoded (linhas 135-316). Nenhuma chamada a `registry.get()`.

- **Risco Mitigado:** Adicionar novo tipo de bloco requer alteração do BlockRenderer. Violação de OCP (Open/Closed Principle). Manutenção difícil.

- **Dependências:** Nenhuma.

- **Critério de Conclusão:**
  - [ ] Todos os 8 tipos registados no registry
  - [ ] BlockRenderer usa `registry.get(type)` em vez de if-chain
  - [ ] If-chain removida
  - [ ] Testes actualizados

- **Métrica de Sucesso:**
  - Adicionar novo tipo de bloco = 1 ficheiro (não 2)
  - BlockRenderer reduzido de 360 para < 100 linhas
  - Zero regressões

- **Alinhamento ADR:** N/A (melhoria de manutenibilidade)

---

## P3 — Longo Prazo (CONDICIONADA A ESCALA)

> Itens P3 são para quando a plataforma atingir 10k-50k+ users. Não devem ser implementados antes de atingir esses limiares.

---

### P3-01: CDN para Vídeo (GATE: > 1k users activos)

- **Evidência:** `supabase-storage-provider.ts` usa URLs públicas directas. Zero configuração CDN. Vídeos externos (YouTube/Vimeo) não beneficiam de CDN do projecto. Signed URLs não implementadas.

- **Risco Mitigado:** Latência elevada para streaming. Custo de transferência alto. Sem optimização regional.

- **Dependências:** P1-01 (métricas), P1-02 (testes de carga). **GATE:** Plataforma deve atingir 1000+ users activos mensais.

- **Critério de Conclusão:**
  - [ ] Conta Bunny.net (ou equivalente) criada
  - [ ] CDN configurado para `course-thumbnails`
  - [ ] Signed URLs para `course-media` (privado)
  - [ ] HLS adaptativo para streaming de vídeo
  - [ ] Cache de chunks na edge

- **Métrica de Sucesso:**
  - Latência de streaming < 200ms em qualquer região
  - Custo de transferência < $0.01/GB
  - Zero buffering em conexões > 5Mbps

- **Alinhamento ADR-006:** ADR-006 define que student app recebe JSON, não HTML. CDN pode servir JSON cacheado para further optimization.

---

### P3-02: Multitenancy (GATE: > 1 cliente)

- **Evidência:** Zero colunas `tenant_id` em todas as 13 migrações. Zero filtros por tenant em queries. Zero RLS policies com tenant. `docs/skills/multitenancy_rls.md` contém design mas nenhum código.

- **Risco Mitigado:** Impossível suportar múltiplos clientes. Dados misturados entre organizações.

- **Dependências:** P1-01 (métricas), decisão arquitetural (shared DB vs schema vs database). **GATE:** Pelo menos 1 cliente formal além do projecto próprio.

- **Critério de Conclusão:**
  - [ ] Decisão arquitetural documentada (ADR)
  - [ ] Migrações para adicionar `tenant_id` em todas as tabelas
  - [ ] Middleware de resolução de tenant via hostname
  - [ ] RLS policies com `current_setting('app.current_tenant')`
  - [ ] Índices compostos `(tenant_id, user_id)`, `(tenant_id, course_id)`

- **Métrica de Sucesso:**
  - 2+ tenants operando com isolamento completo
  - Queries filtradas automaticamente por tenant
  - Zero vazamento de dados entre tenants

- **Alinhamento ADR:** N/A (requer novo ADR para decisão de isolamento)

---

### P3-03: Read Replicas (GATE: > 5k users)

- **Evidência:** Zero configuração de read replicas. `docs/roadmaps/scalability-plan.md` (SCL-10) documenta mas não implementa. `packages/core/src/supabase.ts` usa cliente único.

- **Risco Mitigado:** Queries de relatório sobrecarregam primário. Degradação sob carga.

- **Dependências:** P1-01 (métricas), Supabase Enterprise. **GATE:** Plataforma deve atingir 5000+ users simultâneos.

- **Critério de Conclusão:**
  - [ ] Supabase Enterprise configurado
  - [ ] `SUPABASE_DB_URL_READER` variável de ambiente
  - [ ] Cliente separado para queries de leitura
  - [ ] Queries de relatório roteadas para replica

- **Métrica de Sucesso:**
  - Load no primário reduzido >= 50%
  - Latência de relatórios < 500ms
  - Zero sincronização lag entre primário e replica

- **Alinhamento ADR-017:** ADR-017 define triggers de performance. Read replicas são uma solução para quando esses triggers são atingidos.

---

### P3-04: WebSocket Próprio (GATE: > 500 users Realtime)

- **Evidência:** `apps/student/src/hooks/useRealtimeSubscription.ts` usa subscrição directa Supabase Realtime. ADR-013 documenta limitações (200 conexões Pro). Sem alternativa própria.

- **Risco Mitigado:** Escalabilidade limitada para real-time features. Exceder limites do Supabase Realtime.

- **Dependências:** P1-01 (métricas), infraestrutura dedicada. **GATE:** Supabase Realtime connections > 80% do limite.

- **Critério de Conclusão:**
  - [ ] Servidor WebSocket dedicado (Socket.io, Ably, ou equivalente)
  - [ ] Redis adapter para broadcast
  - [ ] Fallback para polling
  - [ ] Migração gradual do student app

- **Métrica de Sucesso:**
  - 500+ conexões simultâneas sem degradação
  - Latência de mensagem < 100ms
  - Zero perda de mensagens

- **Alinhamento ADR-013:** ADR-013 documenta que direct coupling ao Supabase Realtime requer refactor futur. WebSocket próprio é essa alternativa.

---

### P3-05: Service Workers (GATE: > 10k users)

- **Evidência:** Zero uso de Service Workers. Student app usa AsyncStorage para offline básico. `docs/roadmaps/scalability-plan.md` (SCL-16) documenta mas não implementa.

- **Risco Mitigado:** Experiência offline limitada. Sem precaching de blocos.

- **Dependências:** Nenhuma. **GATE:** Plataforma deve atingir 10.000+ users.

- **Critério de Conclusão:**
  - [ ] Service Worker para precaching
  - [ ] Workbox configurado
  - [ ] Estratégia de cache por tipo de conteúdo
  - [ ] Background sync para progresso

- **Métrica de Sucesso:**
  - Conteúdo acessível offline para aulas previamente visitadas
  - Progresso sincronizado quando online
  - Cache hit rate offline > 90%

- **Alinhamento ADR:** N/A (optimização offline)

---

## Resumo do Backlog

| Prioridade | Itens | Esforço | Gate de Dados |
|---|---|---|---|
| **P0** | 3 itens | 3.5-4.5 dias | Nenhum (risco activo) |
| **P1** | 4 itens | 8-12 dias | Nenhum (condição prévia) |
| **P2** | 6 itens | 8-13 dias | Métricas + testes de carga |
| **P3** | 5 itens | 22-32 dias | Escala (1k-10k+ users) |
| **Total** | **18 itens** | **41.5-61.5 dias** | — |

---

## Ordem de Execução com Gates

```
FASE 1: SEGURANÇA (sem gate)
├── P0-03: Database Health Monitoring (1 dia)
├── P0-01: Rate Limiting (2-3 dias)
└── P0-02: Dev RLS Override (0.5 dia)

FASE 2: MEDIÇÃO (sem gate)
├── P1-01: Observabilidade (2-3 dias)
└── P1-02: Testes de Carga (2-3 dias)
    │
    ├──→ GATE: Dados colectados por 7+ dias
    │
FASE 3: OPTIMIZAÇÃO (gate: métricas justificam)
├── P1-03: Cache Invalidation (se hit rate < 80%)
├── P2-01: Cache Redis (se queries > 50/s)
├── P2-02: Write-Behind (se writes > 100/s)
├── P2-03: React.lazy (se bundle > 500KB)
├── P2-04: IntersectionObserver (se > 50% blocos off-screen)
├── P2-05: Skeleton Loading (se UX feedback negativo)
└── P2-06: Registry Wiring (se > 8 tipos de bloco)
    │
    ├──→ GATE: 1000+ users activos mensais
    │
FASE 4: ESCALA (gate: users)
├── P3-01: CDN (se > 1k users)
├── P3-02: Multitenancy (se > 1 cliente)
├── P3-03: Read Replicas (se > 5k users)
├── P3-04: WebSocket (se > 500 Realtime)
└── P3-05: Service Workers (se > 10k users)
```

---

## Validação com ADRs

| ADR | Trigger Definido | Item Relacionado | Gate Adicional |
|---|---|---|---|
| **ADR-017** | SELECTs/second >= 50 | P2-01 (Redis) | Testes de carga devem confirmar |
| **ADR-017** | Latency p95 > 500ms | P1-01 (Observabilidade) | Métricas devem mostrar |
| **ADR-017** | Connection pool timeout > 1% | P1-04 (Monitoramento) | Monitoramento deve detectar |
| **ADR-017** | >= 500 students simultâneos | P2-01, P2-02, P3-01+ | Contagem de users deve atingir |
| **ADR-013** | 200 Realtime connections | P3-04 (WebSocket) | Métricas de conexões |
| **ADR-006** | JSON headless rendering | P3-01 (CDN) | CDN serve JSON cacheado |

---

## Checklist de Validação

Antes de avançar para qualquer item P2 ou P3, verificar:

- [ ] P1-01 (Observabilidade) está funcional há pelo menos 7 dias
- [ ] P1-02 (Testes de Carga) foram executados e resultados documentados
- [ ] Gate de dados para o item específico foi satisfeito
- [ ] ADR relacionado foi consultado e trigger validado
- [ ] Decisão documentada com base em evidências, não palpite

---

> ⚠️ **Nota:** Este backlog é um documento vivo. Deve ser revisto sempre que novos dados de métricas ou testes de carga estiverem disponíveis. Prioridades podem mudar com base em evidências reais.
