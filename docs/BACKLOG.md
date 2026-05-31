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

- **BUG: Student app — LessonPlayer crash** — ✅ CORRIGIDO — Usa polling funcional (linhas 109-135) + refresh ao focar aba.
- **BUG: Student app — UUID hardcoded** — ✅ CORRIGIDO — `useMobileProgress.ts` agora usa `AuthService.getSession()` para obter o ID real do usuário.
- **BUG: Student app — TopBar HTML tags e cores hardcoded** — `StudentDashboard.tsx` linhas 642-694 usam `<ul>`, `<li>`, `<a>` com `#DEE1EB`, `#F1F2F8`. Migrar para Tamagui (`XStack`, `Button`, `Text`, `Icon`) com tokens `$border`, `$surface`.
- **BUG: Student app — Shadow presets não usados** — `packages/ui/src/tokens/shadows.ts` define `sm`, `md`, `lg`, `xl`, `cwSoft`, `cwPop` mas student app usa apenas `elevation={N}`. Activar presets nos cards.

## 🗓️ P2 — Médio Prazo

- **BUG: Zod schema — `LessonSchema.blocks` missing `heading` e `divider`** — Validação Zod falha silenciosamente ao encontrar esses blocos no banco.
- **Chore: Student app — ErrorBoundary** — Adicionar ErrorBoundary no `App.tsx` para evitar crash total em erros não tratados.
- **Chore: Student app — sanitização XSS** — `dangerouslySetInnerHTML` no `BlockRenderer` sem sanitização (violação S-01).
- **Feat: Student app — Alinhar layout com design reference** — Headers `px="$6"` (24px), main `py="$8"` (32px), hero `br="$6"` (16px), dashed borders `$borderStrong`, sidebar CourseLessons "Atividades extras", botão "Ver materiais" no hero, certificates hero stats à direita, certificates cards `aspect-[4/3]`.
- **BUG: Student app — Dashed border usa cor errada** — `Certificates.tsx` linha 243: `borderStyle="dashed" borderColor="$border"` deveria ser `$borderStrong`.
- **Feat: Admin — seção de exercícios extras** — Adicionar no admin uma seção/aba para criar e gerenciar exercícios extras por aula/curso.
- **Feat: Student app — CourseLessons: duração real das aulas** — Remover mock `Math.random()` de duração. Usar campo real do banco ou duração calculada a partir do bloco de vídeo.
- **Feat: Student app — CourseLessons: progresso por módulo** — Adicionar barra de progresso visual individual em cada módulo (ex: preenchimento proporcional às aulas concluídas).

## 🌱 P3 — Baixa Prioridade (Backlog)

- **BUG: Cursor escapa durante resize** — `document.body.style.cursor` não sobrescreve cursor de elementos filhos (text blocks, botões).
- **BUG: Aspect ratio de imagem não funciona em W/N/cantos** — fixed-corner approach falha em handles esquerdo/superior.
- **Renderização:** Extrair `removeBackground` para Web Worker para não travar UI em imagens grandes.
- **Player Mobile:** Implementar retomada inteligente de vídeo (salvar timestamp no Supabase).
- **Chore: Student app — Migrar BlockRenderer para Tamagui** — `BlockRenderer.tsx` usa `blockToHtml()` + `dangerouslySetInnerHTML`. Migrar para componentes Tamagui nativos (`TextBlockRenderer`, `VideoBlockRenderer`, etc.) de `packages/ui/src/blocks/`.
