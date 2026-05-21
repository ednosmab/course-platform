# E2E Testing Plan — Playwright

## Objetivo
Estabelecer uma suíte de testes E2E confiável com Playwright para os fluxos críticos do CMS (Admin Web) e Portal do Aluno.

---

## Fluxos a Testar

### Admin Web (Next.js)
- [x] **Login** — admin faz login com `admin@admin.com`, redirecionado para dashboard (role `admin`/`teacher`) ✅ `admin-auth.spec.ts`
- [x] **CRUD Curso** — criar, editar, publicar, deletar curso ✅ `admin-crud.spec.ts`
- [x] **Canvas de Aula** — adicionar blocos (texto, vídeo, quiz), reordenar, salvar ✅ `admin-cms.spec.ts`
- [ ] **Gerenciamento de Usuários** — listar, editar perfil, alterar role
- [ ] **Relatórios** — navegar por relatórios financeiros e de progresso

### Aluno Mobile (Web Preview)
- [x] **Login** — aluno faz login com `aluno@aluno.com`, redirecionado para student app (`localhost:8081`) (role `student`) ✅ `admin-auth.spec.ts`
- [ ] **Catálogo** — navegar por cursos, filtrar, matricular-se
- [x] **Player de Aula** — assistir vídeo, marcar progresso ✅ `2-aluno-player.spec.ts`
- [x] **Quiz** — responder questões, ver resultado ✅ `2-aluno-player.spec.ts`
- [ ] **Certificado** — emitir e baixar certificado

---

## Configuração Técnica

```bash
# Instalação
pnpm add -D -w @playwright/test
pnpm exec playwright install chromium

# Execução
pnpm run test:e2e
```

### Estrutura
```
tests/
  e2e/
    admin/
      login.spec.ts
      courses.spec.ts
      canvas.spec.ts
    aluno/
      login.spec.ts
      catalog.spec.ts
      player.spec.ts
    setup/
      global-setup.ts
      test-user.ts
```

### Mocking de Banco
- Usar `page.route()` do Playwright para interceptar chamadas ao Supabase
- Manter banco de teste isolado com dados seed

---

## Prioridades (MVP)
1. ✅ Login/Logout (admin + aluno) — `admin-auth.spec.ts` (2 testes)
2. ✅ CRUD de curso (admin) — `admin-crud.spec.ts` (5 testes)
3. ✅ Canvas — `admin-cms.spec.ts` (1 teste)
4. ✅ Player — `2-aluno-player.spec.ts` (2 testes)
5. ✅ Quiz — `2-aluno-player.spec.ts` (testado junto do player)

## Cobertura Atual (15 testes E2E)
| Arquivo | Testes | Escopo |
|---|---|---|
| `admin-auth.spec.ts` | 2 | Login admin → dashboard, login aluno → student app |
| `admin-dashboard.spec.ts` | 5 | Listagem, filtros, loading, empty, erro |
| `admin-crud.spec.ts` | 5 | Criar curso, validação, settings, módulo/aula CRUD, excluir |
| `admin-cms.spec.ts` | 1 | Canvas editor carrega e edita bloco |
| `2-aluno-player.spec.ts` | 2 | Dashboard carrega, Quiz + YouTube |
