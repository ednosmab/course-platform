# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ENCERRADA — Student (`apps/student`) com tela em branco no Expo Web. Bloqueio: Metro não resolve `react` do pnpm `.pnpm` store.

## 🎯 Últimas Conquistas
- **Renomeação:** `admin-web→admin`, `aluno-mobile→student` (diretórios + package names + docs)
- **TamaguiProvider:** Envolvendo App.tsx (3 branches: error/loading/main)
- **native.ts shim:** `packages/ui/native.ts` para Metro resolver `@projeto/ui/native`
- **metro.config.js:** Criado com `watchFolders` + `unstable_enablePackageExports`
- **babel.config.js:** Criado com `babel-preset-expo` (plugin tamagui removido por má configuração)
- **packages/ui:** Removido `"type": "module"` que conflitava com Metro
- **EditorHeader fix:** Text nodes em `<Button>` wrappeado em `<Text>` + layout flex no header
- **Admin build:** ✅ `pnpm --filter admin build` passa limpo

## 🕹️ Estado Atual do Projeto
- **Branch atual:** `feat/dsv2-reform`
- **Impedimento crítico:** Student app branco — Metro não resolve `react` do pnpm virtual store (`.pnpm/expo@...`)
- **Tentativas:** TamaguiProvider, native.ts shim, babel.config.js, metro.config.js (watchFolders + nodeModulesPaths + unstable_enablePackageExports), rnx-kit resolver instalado mas não ativado no config

## ⚠️ Impedimentos & Logs de Erro Recentes
- **Erro:** `Unable to resolve "react" from "node_modules/.pnpm/expo@.../expo/src/hooks/useEvent.ts"` — Metro não segue symlinks do pnpm dentro do virtual store
- **Hipótese:** `watchFolders` não inclui `.pnpm` store, ou resolutor padrão do Metro 0.85 não segue symlinks além do project root
- **Próximo passo sugerido:** Adicionar `@rnx-kit/metro-resolver-symlinks` ao `resolveRequest` no metro.config.js, ou usar `node-linker=hoisted` no `.npmrc`

## 🎬 Sessão Atual (19/05/2026)
- **Assuntos tratados:** Fix tela branca student (TamaguiProvider, native.ts, babel, metro.config), rename apps, EditorHeader flex layout
- **Arquivos alterados:** EditorHeader.tsx, App.tsx, BlockRenderer.tsx, metro.config.js, babel.config.js, native.ts, package.json (admin, student, ui), pnpm-lock.yaml, globals.css, layout.tsx, providers.tsx, + dezenas de docs
- **Próxima sessão:** Resolver Student blank screen → Metro + pnpm resolution
- **Consumo da sessão:** 100% (encerrada)

## 📋 Checklist de Progresso
- [x] DSv2 Reform - Fase 0 (TASK-08 a TASK-14) — Token modular + governança
- [x] Plano de Escalabilidade — `docs/roadmaps/scalability-plan.md`
- [x] Estratégia de Testes — `docs/layers/testing/`
- [x] FORBIDDEN_OPERATIONS expandido + vinculante no AGENTS.md
- [x] **Fase 1:** Migrar `admin` para `@projeto/ui` (TASK-15 a TASK-18)
- [x] **Fase 2:** Migrar `student` para `@projeto/ui` (TASK-19 a TASK-23)
- [x] **Fase 3:** Blocos CMS em `@projeto/ui` (TASK-24 a TASK-31)
- [x] Regra de nomenclatura: inglês obrigatório
- [x] Fix build admin + coreservices
- [x] Rename: `admin-web→admin`, `aluno-mobile→student`
- [ ] **BLOQUEADO:** Student tela branca — Metro + pnpm resolution
- [ ] **Fase 4+:** Ícones, Storybook, Governança final
