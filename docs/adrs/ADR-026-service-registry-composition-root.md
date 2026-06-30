# ADR-026: Service Registry — Composition Root para Offline-First

**Status:** Accepted
**Data:** 2026-06-29
**Relacionada:** ADR-024 (Persistência Offline-First)

---

## Decisão

Criar um **Service Registry** (`apps/student/src/services/registry.ts`) como composition root que inicializa e exporta singletons dos serviços offline-first, resolvendo o gap de wiring identificado na ADR-024.

---

## Contexto

### Problema

A ADR-024 definiu a arquitectura em camadas (Serviços → Repositórios → IDatabase), mas **nenhum ficheiro no app chama as factory functions** com as dependências reais:

```
syncService.ts        → export function createSyncService(repo, telemetry)
contentCacheService.ts → export function createContentCacheService(moduleRepo, mediaRepo, telemetry)
progressOfflineStore.ts → export function createProgressOfflineStore(repo)
```

Os screens importam como se fossem singletons:
```typescript
import { syncService } from '../services/syncService';        // ← undefined
import { contentCacheService } from '../services/contentCacheService'; // ← undefined
import { progressOfflineStore } from '../services/progressOfflineStore'; // ← undefined
```

**Resultado:** Crash em `LessonPlayer.tsx:147` — `Cannot read property 'startAutoSync' of undefined`.

### Objectivo

- Fornecer singletons dos serviços com dependências correctas
- Manter a separação de responsabilidades da ADR-024
- Não alterar a interface pública dos serviços (factory functions mantidas)
- Funcionar em native (expo-sqlite) e web (futuro)

---

## Abordagem: Service Registry

### Porque não React Context?

| Critério | Service Registry | React Context |
|---|---|---|
| Disponível fora de componentes | ✅ Sim | ❌ Só dentro da árvore |
| Re-renders | ✅ Nenhum | ❌ Em mudanças de provider |
| Complexidade | ✅ ~70 linhas | ❌ Provider + hook + types |
| Testabilidade | ✅ Mock directo do módulo | ❌ Precisa de wrapper |
| Necessário para este caso | ✅ Services chamados de screens | ❌ Services são imperativos |

### Porque não lazy singletons no próprio módulo?

Cada serviço depende de `IDatabase` (async init) e `ITelemetryProvider`. Lazy init dentro de cada módulo criaria:
- Duplicação de lógica de init
- Race conditions se múltiplos módulos iniciam ao mesmo tempo
- Impossível de testar sem mockar módulos inteiros

---

## Arquitectura

```
StudentApp
  └── initOfflineServices()  ← chamado uma vez no app startup
        ├── getDatabase(telemetry)
        ├── createTelemetry('console')
        ├── ProgressRepository(db)
        ├── ContentCacheRepository(db)
        ├── MediaCacheRepository(db)
        ├── createProgressOfflineStore(progressRepo)
        ├── createSyncService(progressRepo, telemetry)
        └── createContentCacheService(moduleRepo, mediaRepo, telemetry)
              │
              ▼
        registry.ts exports:
        ├── offlineStore  (progressOfflineStore)
        ├── syncService   (syncService)
        └── contentCache  (contentCacheService)
```

---

## Interfaces Exportadas

```typescript
// registry.ts
export const offlineStore: ReturnType<typeof createProgressOfflineStore>
export const syncService: ReturnType<typeof createSyncService>
export const contentCache: ReturnType<typeof createContentCacheService>

// Inicialização async (chamar uma vez no startup)
export async function initOfflineServices(): Promise<void>
// isInitialized() para verificar estado
export function isOfflineReady(): boolean
```

---

## Alternativas Consideradas

### 1. React Context Provider
- **Descartado:** Services são imperativos (push, sync, cache), não dados reactivos. Context adiciona overhead sem benefício.

### 2. Lazy singletons por módulo
- **Descartado:** Duplicação de init, race conditions, difícil de testar.

### 3. Container DI (TSyringe, InversifyJS)
- **Descartado:** Overkill para 3 serviços, adiciona decorators e metadata reflection.

---

## Consequências

### ✅ Positivas
- Resolve o crash imediatamente
- Mantém ADR-024 intacta (factory functions preservadas)
- Testável — mock do registry em testes de integração
- Lazy init — só consome recursos quando o utilizador abre uma aula

### ❌ Negativas
- Mais um ficheiro de wiring
- Init async requer tratamento de erro no startup
- Se o DB falhar, os services ficam indisponíveis (necessário fallback graceful)

---

## Artefactos

| Ficheiro | Acção |
|----------|-------|
| `apps/student/src/services/registry.ts` | **Criar** — composition root |
| `apps/student/src/screens/LessonPlayer.tsx` | **Modificar** — import do registry |
| `apps/student/src/screens/CourseLessons.tsx` | **Modificar** — import do registry |

---

## Referências

- ADR-024 — Arquitectura de Persistência Offline-First
- ADR-023 — Offline-First com expo-sqlite
- `apps/student/src/persistence/index.ts` — getDatabase() singleton
- `apps/student/src/telemetry/index.ts` — createTelemetry()
