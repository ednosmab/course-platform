# Sincronização Offline

## Estratégia de Cache

- **SQLite** (expo-sqlite) como banco de dados local para progresso, módulos e mídia
- **expo-file-system** para cache de binários (imagens, thumbnails)
- Tabelas: `lesson_progress`, `cached_modules`, `cached_media`, `schema_version`
- Cache de leitura: catálogo de cursos e aulas disponíveis offline

## Resolução de Conflitos

- **Last-write-wins:** O último progresso enviado sobrescreve o anterior
- **Server timestamp:** `updated_at` do Supabase é source of truth quando disponível
- **Device fallback:** `saved_at` do dispositivo usado apenas quando servidor indisponível
- Conflitos raros (progresso é monotônico — só aumenta)

## Sincronização Bidirecional

```
syncService.syncAll(userId, lessonIds)
  ├── pushPendingProgress()
  │   ├── Lê pendências do SQLite (progressOfflineStore.getPendingSaves)
  │   ├── Para cada item: ProgressService.saveLessonState()
  │   ├── Sucesso? --> progressOfflineStore.clearPendingSave()
  │   └── Falha?   --> Item permanece na fila
  │
  └── pullServerProgress(userId, lessonIds)
      ├── Para cada aula: ProgressService.getProgressByLessons()
      ├── Sucesso? --> progressOfflineStore.saveProgressLocal()
      └── Atualiza timestamp de sincronização
```

## Auto-Sync

- Sincronização automática a cada 30 segundos (syncService.startAutoSync)
- Push de pendências ao montar LessonPlayer
- Sync manual via botão "Sincronizar" no CourseLessons
- Reconexão automática detectada por useConnectionStatus

## Download de Conteúdo

- Botão "Baixar para offline" nos módulos do CourseLessons
- contentCacheService.downloadModule() baixa estrutura + mídia
- Retry com timeout (máx 3 tentativas, 30s cada)
- Falha → registro `partial=1` no cached_modules
