# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Instruções:** Itens neste arquivo seguem o formato `[Priority] Layer: Descrição`.
> Prioridades: **P0** (imediato), **P1** (curto prazo), **P2** (médio prazo), **P3** (baixa prioridade).
> Status: `Backlog` | `In Progress` | `Done`

---

## 🏆 P0 — Imediato (Sprint Atual)

- *Nenhum item no momento.*

## 📌 P1 — Curto Prazo

- **BUG: Student app — LessonPlayer crash** — `LessonService.subscribeToLesson()` chamado mas inexistente desde refactor `371640a`. Causa tela azul (crash não tratado). Implementar o método ou substituir por polling funcional.
- **BUG: Student app — UUID hardcoded** — `'student-user-uuid'` usado em `useMobileProgress.ts:59,84` em vez do ID real da sessão. Progress tracking do aluno quebrado.

## 🗓️ P2 — Médio Prazo

- **BUG: Zod schema — `LessonSchema.blocks` missing `heading` e `divider`** — Validação Zod falha silenciosamente ao encontrar esses blocos no banco.
- **Chore: Student app — ErrorBoundary** — Adicionar ErrorBoundary no `App.tsx` para evitar crash total em erros não tratados.
- **Chore: Student app — sanitização XSS** — `dangerouslySetInnerHTML` no `BlockRenderer` sem sanitização (violação S-01).
- **Feat: Student app — refinamento de layout** — Melhorar layout geral do student (responsividade, espaçamentos, navegação).
- **Feat: Student app — tela de aulas e exercícios extras** — Criar tela para visualizar aulas e exercícios complementares no student.
- **Feat: Student app — central de certificados** — Criar tela que liste todos os certificados obtidos em todos os cursos concluídos.
- **Feat: Admin — seção de exercícios extras** — Adicionar no admin uma seção/aba para criar e gerenciar exercícios extras por aula/curso.

## 🌱 P3 — Baixa Prioridade (Backlog)

- **BUG: Cursor escapa durante resize** — `document.body.style.cursor` não sobrescreve cursor de elementos filhos (text blocks, botões).
- **BUG: Aspect ratio de imagem não funciona em W/N/cantos** — fixed-corner approach falha em handles esquerdo/superior.
- **Renderização:** Extrair `removeBackground` para Web Worker para não travar UI em imagens grandes.
- **Player Mobile:** Implementar retomada inteligente de vídeo (salvar timestamp no Supabase).
