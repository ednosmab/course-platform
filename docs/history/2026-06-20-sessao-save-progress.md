# 📋 SESSION REVIEW — 2026-06-20

## 1. Identificação
- **Data:** 2026-06-20
- **Sessão:** SAVE-PROGRESS + OFFLINE-FIRST
- **Tipo:** FEATURE
- **Duração estimada:** ~4h

## 2. Objectivo da Sessão
Implementar o sistema de save de progresso da aula do aluno (video + quiz + blocos interactivos) com arquitetura offline-first usando expo-sqlite, substituindo a solução anterior baseada em localForage.

## 3. Estado do Working Tree (OBRIGATÓRIO)
- [x] `git status` não tem ficheiros "untracked" ou "modified" não relacionados
- [x] Branch: `develop`
- [x] Diff: `git diff --stat` — 44 ficheiros, 1927+/370-

## 4. Tarefas Concluídas
- [x] ADR-023 criada (supersede ADR-011) — commit `2e3136d`
- [x] expo-sqlite + expo-file-system instalados
- [x] offlineDb.ts — schema SQLite + funções (dynamic import)
- [x] progressOfflineStore.ts — cache de progresso local
- [x] mediaCacheService.ts — cache de mídia
- [x] contentCacheService.ts — download de módulos
- [x] syncService.ts — sincronização bidirecional
- [x] useCachedImage.ts — resolução de imagens offline
- [x] useConnectionStatus.ts — monitor de conexão
- [x] ImageWithCache.tsx — componente imagem offline
- [x] LessonPlayer actualizado — usa progressOfflineStore + sync
- [x] CourseLessons actualizado — sync + botão download
- [x] StudentHeader — badge offline
- [x] BlockRenderer — ImageWithCache para imagens
- [x] localForage removido
- [x] useMobileProgress removido
- [x] Documentação actualizada (offline_first.md, offline-strategy.md, block-extensibility.md)
- [x] BACKLOG.md — P0-01 marcado como Done
- [x] context_buffer.yaml actualizado
- [x] .opencode/plans adicionado ao .gitignore

## 5. Tarefas Paradas (com data de revisão)
- [ ] TEST-OFFLINE-001: Testar feature offline-first no Expo Go — necessário testar em device/emulador real

## 6. Dívida Técnica Identificada
| Item | Severidade | Due | Acção |
|---|---|---|---|
| Concorrência multi-dispositivo | 🟡 Médio | 2026-08-01 | Version check + merge inteligente |
| Erro rollup em testes | 🟡 Médio | Backlog | Upgrade Vitest 2.x ou configurar external |

## 7. Validações Executadas
- [x] `pnpm run close:session` — all checks pass
- [x] `pnpm run verify:ui` — UI rules pass
- [x] `pnpm --filter student run build:web` — student build OK
- [x] `pnpm run test` — 6/6 testes student passam (2 falhas pré-existentes: rollup bug)
- [ ] `tsc --noEmit` — não executado (erro pré-existente TS 5.9.3)
- [x] Buffer YAML actualizado (`governance/context/context_buffer.yaml`)
- [x] Backlog actualizado (P0-01 Done)

## 8. Decisões Arquitecturais (ADR/SDR)
- [ADR-023] expo-sqlite over localForage — localForage é web-only, expo-sqlite funciona em ambos os platforms
- [ADR-023] Supersedes ADR-011 — AsyncStorage outbox apenas cobria progresso, não conteúdo/mídia
- [ADR-023] SQLite para progresso + conteúdo, expo-file-system para binários de mídia

## 9. Próxima Sessão
- **Primeira tarefa:** TEST-OFFLINE-001 — testar feature offline-first no Expo Go
- **Branch:** `develop`
- **Commits:** `2e3136d`, `9dbb631`, `fafb139`
