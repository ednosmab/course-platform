# Plano: feat/button-screen-linking

**Data:** 2026-06-06
**Autor do plano:** Agente 3 (build mode)
**Executor previsto:** Agente 3
**Reviewer:** Agente 3

## 🎯 Objectivo

Implementar 4 CTAs no student app que têm handlers vazios (`onPress={() => {}}`) e corrigir um bug arquitectural (lessonId forwarding). Adicionar ADR-020 para documentar a decisão de routing. Abrir 6 issues `needs-spec` no BACKLOG para decisões de produto pendentes.

## 📋 Items no scope

| # | Item | Tipo | Ficheiros | Risco |
|---|---|---|---|---|
| 1 | `Baixar PDF` (handler + service) | feat | `certificate-actions.{ts,test.ts}` | Baixo |
| 6 | ExternalLink (validação extranet) | feat | mesmo service | Baixo |
| 7 | Share icon (Share API) | feat | mesmo service | Baixo |
| A | lessonId forwarding (wrapper fix) | fix | `course/[id]/{index,play}.{tsx,test.ts}` | Muito baixo |
| - | ADR-020 routing patterns | docs | `docs/adrs/ADR-020-routing-patterns.md` | Nenhum |
| - | BACKLOG `needs-spec` issues | chore | `docs/BACKLOG.md` | Nenhum |

## 📋 Steps

### Step 1: Criar branch feat/button-screen-linking
- **Acção:** `git checkout develop && git checkout -b feat/button-screen-linking`
- **Verificação:** `git branch --show-current` → `feat/button-screen-linking`
- [ ] (preenchido pelo build)

### Step 2: Criar `certificate-actions.test.ts` (RED)
- **Ficheiro:** `apps/student/src/services/certificate-actions.test.ts` (novo)
- **Acção:** 5 testes: downloadPDF (1) URL correcta + (2) fallback; openValidation (3) URL com uuid_extranet + (4) fallback; shareCertificate (5) mensagem contém uuid
- **Verificação:** `pnpm --filter student test --run src/services/certificate-actions.test.ts` → 0/5 (RED)
- [ ] (preenchido pelo build)

### Step 3: Criar `certificate-actions.ts` (GREEN)
- **Ficheiro:** `apps/student/src/services/certificate-actions.ts` (novo)
- **Acção:** 3 funções com JSDoc, usando `Linking.openURL` e `Share.share`, lendo env vars `EXPO_PUBLIC_PDF_BASE_URL` e `EXPO_PUBLIC_EXTRANET_VALIDATION_URL`
- **Verificação:** mesmo comando → 5/5 (GREEN)
- [ ] (preenchido pelo build)

### Step 4: Actualizar `.env.example` com 2 env vars
- **Ficheiro:** `apps/student/.env.example` (modificar)
- **Acção:** Adicionar `EXPO_PUBLIC_PDF_BASE_URL=https://api.example.com` e `EXPO_PUBLIC_EXTRANET_VALIDATION_URL=https://validacao.example.com` (placeholders genéricos, CONFID-01)
- **Verificação:** `grep "EXPO_PUBLIC_PDF_BASE_URL\|EXPO_PUBLIC_EXTRANET_VALIDATION_URL" apps/student/.env.example`
- [ ] (preenchido pelo build)

### Step 5: G-01 → Commit 1 (service + test)
- **Acção:** `git add apps/student/src/services/certificate-actions.{ts,test.ts} apps/student/.env.example && git commit -m "feat(student): add certificate-actions service with PDF/share/validate"`
- **Verificação:** `git log -1 --oneline`
- [ ] (preenchido pelo build)

### Step 6: Wire actions no Certificates screen
- **Ficheiro:** `apps/student/src/screens/Certificates.tsx` (modificar)
- **Acção:** Substituir 3 `onPress={() => {}}` por chamadas ao service
- **Verificação:** `pnpm --filter student test --run` → 12/12 (7 + 5)
- [ ] (preenchido pelo build)

### Step 7: G-01 → Commit 2 (wiring)
- **Acção:** `git add apps/student/src/screens/Certificates.tsx && git commit -m "feat(student): wire certificate actions in Certificates screen"`
- **Verificação:** `git log -1 --oneline`
- [ ] (preenchido pelo build)

### Step 8: Corrigir lessonId forwarding
- **Ficheiros:** `apps/student/app/course/[id]/index.tsx` (1 linha) + `apps/student/app/course/[id]/play.tsx` (extract search param)
- **Acção:** Forward `lessonId` como search param; wrapper de `play.tsx` lê e passa ao `LessonPlayer`
- **Verificação:** grep confirma search param no push + leitura no wrapper
- [ ] (preenchido pelo build)

### Step 9: Criar `play.test.ts` (2 testes)
- **Ficheiro:** `apps/student/app/course/[id]/play.test.ts` (novo)
- **Acção:** 2 testes: (1) search param `lessonId` é extraído e passado ao LessonPlayer, (2) fallback para `lessons[0]` se ausente
- **Verificação:** `pnpm --filter student test --run src/app/course/\[id\]/play.test.ts` → 2/2
- [ ] (preenchido pelo build)

### Step 10: G-01 → Commit 3 (lessonId fix)
- **Acção:** `git add apps/student/app/course/\[id\]/ && git commit -m "fix(student): forward lessonId from CourseLessons to LessonPlayer"`
- **Verificação:** `git log -1 --oneline`
- [ ] (preenchido pelo build)

### Step 11: Criar ADR-020
- **Ficheiro:** `docs/adrs/ADR-020-routing-patterns.md` (novo)
- **Acção:** Documentar decisão: lessonId como **search param** (vs path segment). Formato consistente com ADR-019
- **Verificação:** `wc -l docs/adrs/ADR-020-routing-patterns.md` → ~90 linhas
- [ ] (preenchido pelo build)

### Step 12: G-01 → Commit 4 (ADR)
- **Acção:** `git add docs/adrs/ADR-020-routing-patterns.md && git commit -m "docs(adr): add ADR-020 routing patterns (search param for sub-resources)"`
- **Verificação:** `git log -1 --oneline`
- [ ] (preenchido pelo build)

### Step 13: Adicionar 6 BACKLOG issues P0/P1
- **Ficheiro:** `docs/BACKLOG.md` (modificar)
- **Acção:** Adicionar 5 issues P0 com `needs-spec` (#2, #3, #4, #9, #10, #11) + 2 issues P1 (#5, #12)
- **Verificação:** `grep -c "needs-spec" docs/BACKLOG.md` → 5+
- [ ] (preenchido pelo build)

### Step 14: G-01 → Commit 5 (BACKLOG)
- **Acção:** `git add docs/BACKLOG.md && git commit -m "chore(backlog): add 7 needs-spec issues from button audit"`
- **Verificação:** `git log -1 --oneline`
- [ ] (preenchido pelo build)

### Step 15: Validação final + buffer update
- **Acção:** Suite completa (admin + core + renderer + student + ui) + verify:ui + buffer update
- **Verificação:** 216/216 tests ✅ + verify:ui 5/5 ✅ + buffer ≤ 50
- [ ] (preenchido pelo build)

## 🛡️ Salvaguardas S1..S6

- **S1 (não fundir):** Cada step atómico; Commits 1-5 são independentes
- **S2 (não tocar não-planeado):** Não tocar `LessonPlayer.tsx` (já recebe `lessonId`); não tocar packages/ui (fora de scope F-01)
- **S3 (não avançar com falha):** Steps 2-3 (TDD RED→GREEN) têm de dar 5/5 antes de Step 5
- **S4 (G-01 explícito):** 5 G-01 (Steps 5, 7, 10, 12, 14)
- **S5 (não duplicar):** Sem ficheiros novos fora da lista
- **S6 (não tocar docs não-planeados):** Não tocar ADR-019 nem FORBIDDEN_OPERATIONS

## 📊 Métricas-alvo

| Métrica | Antes | Depois | Tolerância |
|---|---|---|---|
| `student.test.ts` files | 2 | 4 | exacto |
| Student tests | 7 | 14 | +5 service + 2 wrapper |
| Total tests | 211 | 216 | exacto |
| `.env.example` entries | n/a | +2 | exacto |
| BACKLOG issues `needs-spec` | 0 | 5 | exacto |
| Working tree | clean | clean | exacto |
| Buffer | 52 | ≤50 | -2 |

## ⚠️ Pontos de pausa G-01

- **G-01 #1** (Step 5): Após service + test criados
- **G-01 #2** (Step 7): Após wiring em Certificates
- **G-01 #3** (Step 10): Após fix lessonId + 2 testes
- **G-01 #4** (Step 12): Após ADR-020
- **G-01 #5** (Step 14): Após BACKLOG issues
