# 📡 SKILL: ESTRATÉGIA OFFLINE-FIRST

## 🎯 Objetivo
Garantir que a plataforma seja resiliente a falhas de conexão e permita o consumo de conteúdos (especialmente no mobile) sem internet.

## 🛠️ Pilares da Estratégia
1. **SQLite Local (expo-sqlite):** Banco de dados SQLite para armazenar progresso de aulas, módulos cacheados e metadados de mídia. Consultas SQL completas, suporte a concorrência, funciona em ambientes mobile e web.
2. **Cache de Mídia (expo-file-system):** Sistema de download e cache de imagens e binários para acesso offline. Retry com timeout, controle de versão, limpeza automática.
3. **Sincronização Bidirecional (syncService):** Push de pendências locais para Supabase + pull de dados do servidor. Sincronização automática a cada 30 segundos quando online.
4. **Estado de Conexão (useConnectionStatus):** Monitoramento em tempo real do estado da rede. Badge "Offline" no StudentHeader, auto-sync ao reconectar.
5. **Download de Conteúdo (contentCacheService):** Botão "Baixar para offline" nos módulos. Download completo da estrutura do módulo + mídia associada.

## 📂 Onde Aplicar
- `apps/student/src/services/offlineDb.ts` — Schema e funções SQLite
- `apps/student/src/services/progressOfflineStore.ts` — Cache de progresso local
- `apps/student/src/services/mediaCacheService.ts` — Cache de mídia
- `apps/student/src/services/contentCacheService.ts` — Download de módulos
- `apps/student/src/services/syncService.ts` — Sincronização bidirecional
- `apps/student/src/hooks/useConnectionStatus.ts` — Monitor de conectividade
- `apps/student/src/hooks/useCachedImage.ts` — Resolução de imagens offline

## 🔒 Regras
- **Plataforma:** expo-sqlite funciona em Expo Go (SDK 54+). localForage (IndexedDB) é web-only e foi removido.
- **Concorrência:** expo-sqlite async API serializa writes automaticamente.
- **Fallback Web:** Todas as funções offline são no-op no web (Platform.OS === 'web').
- **Conflict Resolution:** Last-write-wins. Server `updated_at` é source of truth quando disponível.
- **Retry:** Máximo 3 tentativas, timeout de 30s. Falha → registro `partial=1` no cache.
