# ADR-024: Arquitectura de Persistência Offline-First

**Status:** Accepted
**Data:** 2026-06-27
**Supersedes:** ADR-023 (parcialmente — mantém expo-sqlite, adiciona camadas de abstracção)

---

## Decisão

O app mobile do aluno adopta uma arquitectura em camadas para persistência local, com separação clara entre serviços de negócio, repositórios e infraestrutura de armazenamento.

As decisões fundamentais são:

1. **Repository Pattern obrigatório** — Todo acesso aos dados ocorre exclusivamente através de repositórios especializados.
2. **IDatabase simplificada** — Interface mínima de infraestrutura, sem conceitos de ORM.
3. **TelemetryProvider interface** — Observabilidade desacoplada de implementações concretas.
4. **Migrações atómicas** — Versionadas e executadas dentro de transacções.
5. **Plataforma confinada à infraestrutura** — Zero `Platform.OS` nos serviços.

---

## Contexto

### Problema
- Serviços continham SQL raw + guards `Platform.OS === 'web'` (26 ocorrências em 4 ficheiros)
- Telemetria = 19 `console.error` dispersos, sem agregação nem reporting
- Sem repositórios: serviços interagem directamente com a camada de persistência
- Interface de base de dados expunha conceitos de ORM (ITable, WhereClause)

### Objectivo
Criar uma arquitectura que:
- Isole a lógica de negócio da infraestrutura de persistência
- Permita trocar SQLite por Dexie (IndexedDB) sem mudar serviços
- Forneça observabilidade estruturada substituível
- Garanta migrações seguras e transaccionais

---

## Fluxo Arquitectural

```
Serviços de aplicação
→ Repositórios
→ Interface IDatabase
→ Implementação SQLite ou Dexie
```

```
Serviços
→ Interface ITelemetryProvider
→ ConsoleTelemetry / SentryTelemetry / NoopTelemetry
```

---

## Interfaces

### IDatabase
```typescript
export interface IDatabase {
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>
  getOne<T>(sql: string, params?: unknown[]): Promise<T | null>
  getAll<T>(sql: string, params?: unknown[]): Promise<T[]>
  exec(sql: string): Promise<void>
  transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T>
  close(): Promise<void>
}
```

### ITelemetryProvider
```typescript
export interface ITelemetryProvider {
  event(type: TelemetryEventType, data?: Record<string, unknown>): void
  error(error: Error, context?: Record<string, unknown>): void
  metric(name: string, value: number, tags?: Record<string, string>): void
}
```

### Repositórios
| Repositório | Tabela | Métodos |
|-------------|--------|---------|
| `ILessonProgressRepository` | `lesson_progress` | `upsert`, `getByUserAndLesson`, `getUnsynced`, `markSynced`, `clearAll` |
| `IModuleCacheRepository` | `cached_modules` | `upsert`, `upsertPartial`, `getById`, `getLessons`, `exists`, `deleteById`, `listByCourse` |
| `IMediaCacheRepository` | `cached_media` | `getByUrl`, `upsert`, `deleteByUrl`, `getAllPaths`, `clearAll` |

---

## Alternativas Consideradas

### 1. Manter SQL nos serviços
- **Descartado:** Viola separação de responsabilidades, torna impossível trocar backend

### 2. ORM completo (TypeORM, Prisma)
- **Descartado:** Overhead desnecessário, complexidade para mobile, bundle size grande

### 3. ITable/WhereClause (ORM-like)
- **Descartado:** Expõe conceitos de persistência aos serviços, cria acoplamento indevido

---

## Consequências

### ✅ Positivas
- Serviços completamente desacoplados da infraestrutura
- Fácil troca de SQLite por Dexie na FASE 2
- Observabilidade estruturada e substituível
- Migrações seguras com rollback automático
- Testabilidade — todos os componentes podem ser testados com mocks

### ❌ Negativas
- Mais ficheiros (interfaces, implementações, factories)
- Curva de aprendizagem equipa novo
- Overhead de abstracção para operações simples

---

## Artefatos Criados

| Ficheiro | Descrição |
|----------|-----------|
| `persistence/types.ts` | Interface IDatabase |
| `persistence/migrationRunner.ts` | Executor de migrações atómicas |
| `persistence/migrations/001_initial.ts` | Schema DDL das 4 tabelas |
| `persistence/sqlite/SQLiteDatabase.ts` | Implementação SQLite de IDatabase |
| `persistence/repos/types.ts` | Interfaces dos repositórios |
| `persistence/repos/ProgressRepository.ts` | Repositório de progresso |
| `persistence/repos/ContentCacheRepository.ts` | Repositório de cache de módulos |
| `persistence/repos/MediaCacheRepository.ts` | Repositório de cache de mídia |
| `telemetry/types.ts` | Interface ITelemetryProvider |
| `telemetry/console/ConsoleTelemetry.ts` | Implementação console |
| `telemetry/noop/NoopTelemetry.ts` | Implementação silenciosa |

---

## Referências

### ADRs Relacionadas
- ADR-023 — Offline-First com expo-sqlite (mantém tecnologia, adiciona camadas)
- ADR-011 — Offline outbox pattern (Superseded pela ADR-023)

### Documentação
- `docs/skills/offline_first.md` — Estratégia offline do projecto
- `docs/layers/core/offline-strategy.md` — Estratégia de sincronização
