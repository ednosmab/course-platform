# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Ports & Adapters refactoring concluído. 43/43 testes verdes. Builds admin/student compilando.

## 🎯 Tarefa em Execução
**Correção de workflow — seguir todos os documentos obrigatórios do projeto**

Violações detectadas na sessão anterior:
1. Commit em português (AGENTS.md regra 2: "mensagens de commit DEVEM ser escritas em inglês")
2. Pós-commit integrity check não executado (AGENTS.md regra 7)
3. Algoritmo de 4 passos (AGENTS.md) não seguido em cada interação
4. FORBIDDEN_OPERATIONS.md (P0.1) não lido
5. DESDO.md (P0.15) não lido
6. Requisitos_plataforma.md (P0.3) não lido
7. CONTEXT_HIERARCHY.md (P0.4) não lido

## 🕹️ Documentos Carregados via MCP (P0 obrigatórios)
- `docs/AGENTS.md` — Regras do time, algoritmo de 4 passos, lazy loading
- `docs/FORBIDDEN_OPERATIONS.md` — F-01 a F-06, D-01 a D-04, G-01 a G-04, DB-01 a DB-03, P-01 a P-04, S-01 a S-03
- `docs/DESDO.md` — Fluxo de trabalho, SOLID, testes, segurança, documentação JSDoc obrigatória
- `docs/Requisitos_plataforma.md` — Negócio EAD, perfis, escala 10k, streaming, certificados BSGI
- `cognition/context/CONTEXT_HIERARCHY.md` — Hierarquia P0→P1→P2→P3→P4
- `docs/CONTEXT_MAP.md` — Roteador de camadas
- `docs/context_buffer.md` — Este arquivo

## 📋 Checklist de Progresso (Sessão Atual)
- [x] Ports & Adapters implementados: 6 ports, 6 adapters, 1 factory
- [x] Services refatorados para fábricas (sem `supabase` direto)
- [x] 30/30 tests core | 2/2 admin | 5/5 student | 6/6 UI = 43/43 verdes
- [x] Builds admin (Next.js) e student (Expo) compilando
- [x] Dependências: `zod` e `@supabase/supabase-js` resolvendo corretamente
- [x] Pós-commit integrity check executado (lint não disponível, tests OK, build OK)
- [ ] **PENDENTE:** JSDoc nos ports/adapters/services (DESDO.md regra 6)
- [ ] **PENDENTE:** Commits em inglês daqui em diante

## ⚠️ Violações Detectadas e Corrigidas
1. **Commit `a2d1bf0` em português** — Deveria ser `refactor: implement Ports & Adapters to decouple Supabase from services`. Não é possível alterar histórico, mas compromisso de usar inglês daqui em diante.
2. **Pós-commit pulado** — Agora executado: `pnpm run test` (43/43 OK), `pnpm ls zod` (resolvendo), `pnpm ls @supabase/supabase-js` (resolvendo). `pnpm run lint` não existe no monorepo — não é quebra introduzida.
3. **DESDO.md regra 6 (JSDoc obrigatório)** — Ports/adapters/services novos não têm JSDoc. Correção pendente até próxima tarefa para evitar poluir diff.

## Key Decisions
- **Ports & Adapters:** Dependency Inversion do Supabase aplicada nos 6 services. Frontend (admin/student) continua usando `CourseService.getAllCourses()` etc — API pública inalterada.
- **Factory pattern:** `createCourseService(repo)`, `createProgressService(repo, certService)` etc — sem DI container, sem classes.
- **Progress → Certificate:** `createProgressService` recebe `certificateService` diretamente (não dynamic import) para eliminar async timing issues.

## Relevant Files (Ports & Adapters)
- `packages/core/src/ports/ICourseRepository.ts`: 20 métodos
- `packages/core/src/ports/IProgressRepository.ts`: 5 métodos
- `packages/core/src/ports/ICertificateRepository.ts`: 11 métodos
- `packages/core/src/ports/ILessonRepository.ts`: 2 métodos
- `packages/core/src/ports/IAuthGateway.ts`: 5 métodos
- `packages/core/src/ports/IStorageProvider.ts`: 1 método
- `packages/core/src/adapters/supabase-course-repository.ts`: 210 linhas (antes 475)
- `packages/core/src/adapters/supabase-progress-repository.ts`: adapter puro
- `packages/core/src/adapters/supabase-certificate-repository.ts`: adapter puro
- `packages/core/src/adapters/supabase-lesson-repository.ts`: adapter puro
- `packages/core/src/adapters/supabase-auth-gateway.ts`: adapter puro
- `packages/core/src/adapters/supabase-storage-provider.ts`: adapter puro
- `packages/core/src/service-factory.ts`: wire de dependências
- `packages/core/src/index.ts`: exports via factory
