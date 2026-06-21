# ADR-023: Offline-First com expo-sqlite

**Status:** Accepted
**Data:** 2026-06-20
**Supersedes:** ADR-011 (Offline outbox pattern — AsyncStorage + flush síncrono)

---

## Decisão

O app mobile do aluno adopta **expo-sqlite** (API async `openDatabaseAsync`) como cache offline unificado para:
- `lesson_progress` — progresso do aluno (posição de vídeo, block states, quiz scores)
- `cached_modules` — conteúdo de módulos baixados para acesso offline
- `cached_media` — metadados de imagens baixadas

Para binários de mídia (imagens), utiliza-se **expo-file-system** com cache em diretório de applicação.

A API async foi escolhida porque:
1. Serialização de writes garantida pela fila interna do `openDatabaseAsync`
2. Compatível com React Suspense e streaming
3. Sem blocking na UI thread
4. Necessário para writes concorrentes (save manual do aluno + push de sync automático)

Esta ADR **supersede** a ADR-011, que definia o padrão outbox com AsyncStorage. O AsyncStorage é substituído porque:
- Limite de 6MB no Android
- Sem capacidade de queries (só key-value)
- Sem suporte a indexes
- Não cobre cache de conteúdo/mídia

---

## Contexto

Alunos em áreas com conectividade intermitente precisam:
1. **Acessar aulas offline** — baixar módulos do curso para uso sem rede
2. **Salvar progresso offline** — posição de vídeo, respostas de quiz, estados de blocos interactivos
3. **Sincronizar automaticamente** — quando a rede retorna, enviar progresso pendente e receber actualizações

O sistema actual (ADR-011) usava AsyncStorage para um outbox simples de progresso de vídeo. localForage foi adicionado posteriormente como tentativa de melhorar o cache, mas é uma biblioteca **browser-only** (IndexedDB wrapper) que não funciona em React Native sem shims frágeis.

**Fluxo proposto:**
```
Aluno baixa módulo → conteúdo salvo em SQLite + imagens em file-system
Aluno assiste aula → progresso salvo em SQLite (local)
Sync automático 30s → push pendentes + pull do servidor
Reconexão → syncAll completo
```

---

## Alternativas Consideradas

### 1. Estender AsyncStorage para guardar JSON de módulos
- **Descartado:** Limite 6MB no Android, sem queries SQL, sem índices, performance degrada com muitos dados

### 2. WatermelonDB
- **Descartado:** Requer dev build (não funciona no Expo Go), complexidade excessiva para o caso de uso actual, ORM com learning curve elevada

### 3. Realm (MongoDB)
- **Descartado:** Deprecated pelo MongoDB, bundle size grande (~2MB), API verbose

### 4. op-sqlite
- **Descartado:** Wrapper nativo mais pesado, expo-sqlite já vem no Expo SDK 54, manutenção dupla desnecessária

### 5. Dexie.js (IndexedDB)
- **Descartado:** Só funciona em browser, não tem driver nativo para React Native

### 6. localForage (decisão actual)
- **Descartado:** Biblioteca browser-only, última actualização Agosto 2021, não tem suporte React Native

---

## Consequências

### ✅ Positivas
- Cache completo: conteúdo + progresso + mídia num único backend (SQLite)
- Queries SQL completas (ex: "buscar aulas com progresso pendente")
- Funciona no Expo Go (SDK 54+)
- Sync bidireccional com Supabase via syncService
- Performance: writes serializados via API async, reads rápidos com WAL mode
- Rollback natural: se expo-sqlite falhar, AsyncStorage ainda existe como fallback

### ❌ Negativas
- Aumento de bundle size: ~200-300KB (expo-sqlite + sql.js WASM no web)
- Necessidade de fallback web: `Platform.OS === 'web'` em todos os services
- Ponto de não retorno: remoção de localForage e AsyncStorage outbox
- Impacto nos testes existentes que cobrem o outbox antigo
- Migration de dados: sem dados existentes para migrar (novo cache)

---

## Referências

### Ficheiros novos (a criar)
- `apps/student/src/services/offlineDb.ts` — Schema e inicialização do SQLite
- `apps/student/src/services/progressOfflineStore.ts` — Cache de progresso (substitui progressLocalStore)
- `apps/student/src/services/contentCacheService.ts` — Cache de conteúdo de módulos
- `apps/student/src/services/mediaCacheService.ts` — Cache de mídia (imagens)
- `apps/student/src/services/syncService.ts` — Sync engine bidireccional
- `apps/student/src/hooks/useCachedImage.ts` — Hook para imagens offline
- `apps/student/src/hooks/useConnectionStatus.ts` — Hook de estado de conexão

### Ficheiros existentes (referência)
- `docs/adrs/ADR-011-offline-outbox-pattern.md` — ADR histórica (agora Superseded)
- `apps/student/src/services/progressLocalStore.ts` — Implementação localForage (a remover)
- `apps/student/src/hooks/useMobileProgress.ts` — Outbox AsyncStorage (a remover)
- `docs/skills/offline_first.md` — Estratégia offline do projecto
- `docs/layers/core/offline-strategy.md` — Estratégia de sincronização
