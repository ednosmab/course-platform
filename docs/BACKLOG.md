# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Instruções:** Itens neste arquivo seguem o formato `[Priority] Layer: Descrição`.
> Prioridades: **P0** (imediato), **P1** (curto prazo), **P2** (médio prazo), **P3** (baixa prioridade).
> Status: `Backlog` | `In Progress` | `Done`

---

## 🏆 P0 — Imediato (Sprint Atual)

- *Nenhum item no momento.*

## ✅ Done

- **Feat: Student app — tela de aulas e exercícios extras** — Implementado em `CourseLessons.tsx`.
- **Feat: Student app — central de certificados** — Implementado em `Certificates.tsx`.
- **Feat: Student app — Dashboard: botões contextuais** — Botões "Iniciar aula", "Continuar aula", "Próxima aula", "Ver certificado" baseados no status real do progresso.
- **Feat: Student app — Dashboard: botão "Ver aulas"** — Botão estilizado com borda primary para navegar para lista de módulos.
- **Feat: Student app — Dashboard: remover badge redundante** — Badge "64% concluído" removido do thumbnail do card.
- **Feat: Student app — CourseLessons: botão hero contextual** — Botão muda entre "Retomar aula", "Próxima aula", "Ver certificado" baseado no status.
- **Chore: ProgressService — getProgressByLessons** — Método adicionado ao serviço para buscar progresso de múltiplas aulas.

## 📌 P1 — Curto Prazo

- **BUG: Student app — LessonPlayer crash** — `LessonService.subscribeToLesson()` chamado mas inexistente desde refactor `371640a`. Causa tela azul (crash não tratado). Implementar o método ou substituir por polling funcional.
- **BUG: Student app — UUID hardcoded** — `'student-user-uuid'` usado em `useMobileProgress.ts:59,84` em vez do ID real da sessão. Progress tracking do aluno quebrado.

## 🗓️ P2 — Médio Prazo

- **BUG: Zod schema — `LessonSchema.blocks` missing `heading` e `divider`** — Validação Zod falha silenciosamente ao encontrar esses blocos no banco.
- **Chore: Student app — ErrorBoundary** — Adicionar ErrorBoundary no `App.tsx` para evitar crash total em erros não tratados.
- **Chore: Student app — sanitização XSS** — `dangerouslySetInnerHTML` no `BlockRenderer` sem sanitização (violação S-01).
- **Feat: Student app — refinamento de layout** — Ajustar espaçamentos laterais e superior (atualmente com folgas inconsistentes). Revisar padding/margin em telas cheias e componentes (LessonPlayer, Dashboard, navegação).
- **Feat: Admin — seção de exercícios extras** — Adicionar no admin uma seção/aba para criar e gerenciar exercícios extras por aula/curso.
- **Feat: Student app — CourseLessons: layout sidebar atividades extras** — Adicionar coluna lateral no design original (quizzes, fóruns, materiais PDF, mentoria ao vivo) para提升 a hierarquia visual da tela de aulas.
- **Feat: Student app — CourseLessons: duração real das aulas** — Remover mock `Math.random()` de duração. Usar campo real do banco ou duração calculada a partir do bloco de vídeo.
- **Feat: Student app — CourseLessons: botão "Ver materiais" funcional** — Implementar ação para o botão "Ver materiais" no hero (abrir modal ou navegar para seção de materiais).
- **Feat: Student app — CourseLessons: progresso por módulo** — Adicionar barra de progresso visual individual em cada módulo (ex: preenchimento proporcional às aulas concluídas).

## 🌱 P3 — Baixa Prioridade (Backlog)

- **BUG: Cursor escapa durante resize** — `document.body.style.cursor` não sobrescreve cursor de elementos filhos (text blocks, botões).
- **BUG: Aspect ratio de imagem não funciona em W/N/cantos** — fixed-corner approach falha em handles esquerdo/superior.
- **Renderização:** Extrair `removeBackground` para Web Worker para não travar UI em imagens grandes.
- **Player Mobile:** Implementar retomada inteligente de vídeo (salvar timestamp no Supabase).
