# ADR-020: Encaminhar `lessonId` como search param, não como dynamic segment

**Status:** Aceito
**Data:** 2026-06-06
**Contexto:** App Expo Router (student) — rota `/course/[id]/play` deve abrir a lição clicada
**Autor:** Edson (com assistência IA)

---

## Contexto e Problema

O `CourseLessons` chama `onSelectLesson(lesson.id)` ao clicar numa lição. O wrapper de rota `app/course/[id]/index.tsx` (linha 31) estava a chamar `router.push(\`/course/${courseId}/play\`)` sem encaminhar o `lessonId`. Consequência: ao chegar em `play.tsx`, o `LessonPlayer` caía no fallback `lessons[0]`, ignorando a lição clicada.

Precisávamos decidir **como transmitir o `lessonId` da rota de listagem para a rota do player**, dentro das restrições do Expo Router.

## Alternativas Consideradas

### A. Search param (`?lessonId=...`)
- **Prós:** Mínimo de ficheiros tocados (2 wrappers); visível em URLs (debug-friendly); compatível com deep linking nativo do Expo Router; não cria nova rota no file-system.
- **Contras:** Search params não são fortemente tipados (Expo Router permite `<Tab>.Screen initialParams` mas não impõe); typo em `?lessonId=` passaria silenciosamente.

### B. Dynamic segment adicional (`/course/[id]/play/[lessonId]`)
- **Prós:** Fortemente tipado pelo Expo Router (`useLocalSearchParams<{ lessonId: string }>()`); URL canónica por lição (favorável para SEO se web e bookmarks).
- **Contras:** Cria nova entrada no file-system (`app/course/[id]/play/[lessonId].tsx`); quebra links partilhados antigos; routers de deep link precisam de ser actualizados.

### C. Estado global (Zustand/Context) para "selected lesson"
- **Prós:** Componente screen agnóstico da URL.
- **Contras:** Acopla UI a estado; não sobrevive a refresh; quebra deep linking; não escala para múltiplas tabs.

## Decisão

Adoptamos **Alternativa A: search param `?lessonId=...`**.

## Consequências

### Positivas
- Mudança cirúrgica: 2 ficheiros tocados (1 rota wrapper + 1 type narrowing no outro wrapper).
- Compatibilidade retroactiva mantida: `play.tsx` aceita `lessonId` ausente e cai no fallback `lessons[0]`.
- Wrapper `play.tsx` faz `typeof lessonId === 'string'` narrowing (linha 15) para tratar `string | string[] | undefined` retornado por `useLocalSearchParams`.
- `LessonPlayer` recebe nova prop opcional `lessonId?: string | null`; usa como `useState<string | null>(lessonId ?? null)` para initial state.

### Negativas / Riscos
- **Sem teste unitário do wrapper:** Vitest `include: ['src/**/*.test.{ts,tsx}']` exclui `app/`, e `useLocalSearchParams` do Expo Router é difícil de mockar sem o runtime. Mitigação: type-check do TypeScript garante contrato; verificação manual em Expo Go antes de merge.
- **Tipagem fraca:** `useLocalSearchParams<{ lessonId?: string | string[] }>()` permite `undefined` e `string[]`. Mitigação: narrowing no wrapper (linha 15).
- **Não versionado:** Mudar a estrutura da URL futuramente (ex: A → B) é trivial, mas URLs antigas em cache/bookmarks podem quebrar.

## Próximos Passos

1. ✅ Fix em `app/course/[id]/index.tsx` (linha 31): `onSelectLesson={(lessonId) => router.push(\`/course/${courseId}/play?lessonId=${lessonId}\`)}`.
2. ✅ Fix em `app/course/[id]/play.tsx`: ler `lessonId` dos search params, narrowing, passar para `LessonPlayer`.
3. ✅ `LessonPlayer`: aceitar `lessonId?: string | null`, usar como initial state.
4. ⏸️ (P1) Quando o player for Web (não só mobile), considerar migração para Alternativa B (dynamic segment) para SEO.

## Referências

- `apps/student/app/course/[id]/index.tsx:31`
- `apps/student/app/course/[id]/play.tsx:15`
- `apps/student/src/screens/LessonPlayer.tsx:8-17`
- `docs/audits/2026-06-06-button-screen-linking.md` (auditoria de fluxos)
- ADR-005 (preview-fidelity-law) — princípio de fidelidade entre preview e produção
