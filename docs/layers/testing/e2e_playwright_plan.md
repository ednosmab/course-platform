# E2E Testing Plan — Playwright

## Objetivo
Estabelecer uma suíte de testes E2E confiável com Playwright para os fluxos críticos do CMS (Admin Web) e Portal do Aluno.

---

## Fluxos a Testar

### Admin Web (Next.js)
- [ ] **Login** — admin faz login, redirecionado para dashboard
- [ ] **CRUD Curso** — criar, editar, publicar, deletar curso
- [ ] **Canvas de Aula** — adicionar blocos (texto, vídeo, quiz), reordenar, salvar
- [ ] **Gerenciamento de Usuários** — listar, editar perfil, alterar role
- [ ] **Relatórios** — navegar por relatórios financeiros e de progresso

### Aluno Mobile (Web Preview)
- [ ] **Login** — aluno faz login, redirecionado para catálogo
- [ ] **Catálogo** — navegar por cursos, filtrar, matricular-se
- [ ] **Player de Aula** — assistir vídeo, marcar progresso
- [ ] **Quiz** — responder questões, ver resultado
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
1. Login/Logout (admin + aluno)
2. CRUD de curso (admin)
3. Canvas — adicionar bloco e salvar
4. Player — assistir aula e progresso
5. Quiz — responder e ver resultado
