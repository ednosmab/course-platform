# Plano: useMobileProgress — expor isReady + cobrir guard `!userId`

**Data:** 2026-06-05
**Autor do plano:** Agente 3 (build mode)
**Executor previsto:** Agente 3
**Reviewer:** Agente 3

## 🎯 Objectivo

Eliminar a race condition estrutural no hook `useMobileProgress` expondo um signal `isReady` (true após o `useEffect` async de auth completar) e adicionar 2 testes que cobrem o guard `if (!userId) return` nos paths `saveProgressMobile` e `syncPending`.

## 📋 Steps

### Step 1: Adicionar state `isReady` no hook
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.ts`
- **Acção:** Adicionar `const [isReady, setIsReady] = useState(false);` depois do state `userId` (linha 15)
- **Verificação:** `grep -n "isReady" apps/student/src/hooks/useMobileProgress.ts` deve retornar 3 matches (state, setter call, return)
- [x] (preenchido pelo build — 84b4707)

### Step 2: Chamar `setIsReady(true)` no fim de `loadUser`
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.ts`
- **Acção:** Adicionar `setIsReady(true);` no fim do `loadUser` (depois do `if (session?.id)`)
- **Verificação:** `grep -A 6 "const loadUser" apps/student/src/hooks/useMobileProgress.ts` deve mostrar o `setIsReady(true);` na última linha
- [x] (preenchido pelo build — 84b4707)

### Step 3: Expor `isReady` no return
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.ts`
- **Acção:** Adicionar `isReady,` no return object
- **Verificação:** `grep -A 8 "return {" apps/student/src/hooks/useMobileProgress.ts` deve incluir `isReady,`
- [x] (preenchido pelo build — 84b4707)

### Step 4: Refactor test "should call ProgressService when online"
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.test.ts`
- **Acção:** Substituir `await act(async () => { await Promise.resolve(); })` por `await waitFor(() => { expect(result.current.isReady).toBe(true); })`
- **Verificação:** `pnpm --filter student test --run` → 5/5 (mesma contagem, novo signal usado)
- [x] (preenchido pelo build — 84b4707)

### Step 5: Adicionar teste "should skip saveProgressMobile when not authenticated"
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.test.ts`
- **Acção:** Adicionar `it(...)` no fim do `describe` com `mockGetSession.mockResolvedValue(null)` + asserts `not.toHaveBeenCalled`
- **Verificação:** `pnpm --filter student test --run` → 6/6
- [x] (preenchido pelo build — student 7/7)

### Step 6: Adicionar teste "should skip syncPending when not authenticated"
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.test.ts`
- **Acção:** Adicionar `it(...)` no fim do `describe` com mock pendente em AsyncStorage + asserts `not.toHaveBeenCalled`
- **Verificação:** `pnpm --filter student test --run` → 7/7
- [x] (preenchido pelo build — student 7/7)

### Step 7: Validar suite completa
- **Ficheiro:** N/A
- **Acção:** Correr `pnpm --filter "@projeto/*" test --run && pnpm --filter admin test --run && pnpm --filter core test --run && pnpm --filter student test --run`
- **Verificação:** 211/211 (admin 88 + core 46 + renderer 13 + student 7 + ui 57)
- [x] (preenchido pelo build — 211/211 ✅)

### Step 8: Type-check
- **Ficheiro:** N/A
- **Acção:** `pnpm --filter student exec tsc --noEmit`
- **Verificação:** 0 erros
- [ ] (preenchido pelo build — **BLOQUEADO por bug pré-existente TS 5.9.3**; reproduzido com working tree stashed, sem relação com este refactor)

### Step 9: G-01 → Commit 1 (refactor + 1 test refactor)
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.{ts,test.ts}`
- **Acção:** `git add -A && git commit -m "refactor(student): expose isReady from useMobileProgress"`
- **Verificação:** `git log -1 --oneline` → novo commit
- [ ] (preenchido pelo build)

### Step 10: G-01 → Commit 2 (2 novos tests)
- **Ficheiro:** `apps/student/src/hooks/useMobileProgress.test.ts`
- **Acção:** `git add apps/student/src/hooks/useMobileProgress.test.ts && git commit -m "test(student): cover !userId guard in useMobileProgress"`
- **Verificação:** `git log -1 --oneline` → novo commit
- [ ] (preenchido pelo build)

### Step 11: Actualizar buffer
- **Ficheiro:** `docs/context_buffer.md`
- **Acção:** Adicionar entry em "## 🛠️ Refatorações Aplicadas" (regra 4 AGENTS.md)
- **Verificação:** `grep -A 3 "Refatorações Aplicadas" docs/context_buffer.md` deve incluir nova entrada
- [ ] (preenchido pelo build)

## 🛡️ Salvaguardas S1..S6

- **S1 (não fundir):** Steps 1-3 atómicos; posso parar entre 3 e 4.
- **S2 (não tocar não-planeado):** Não tocar `LessonPlayer.tsx`, `AuthService`, `ProgressService`.
- **S3 (não avançar com falha):** Step 7 tem de dar 211/211 antes de Step 9.
- **S4 (G-01 explícito):** 2 G-01 (Steps 9 e 10).
- **S5 (não duplicar):** Edit in-place, sem ficheiros novos excepto este plano.
- **S6 (não tocar docs não-planeados):** Não tocar BACKLOG, FORBIDDEN_OPERATIONS, ADRs (utilizador decidiu: sem ADR).

## 📊 Métricas-alvo

| Métrica | Antes | Depois | Tolerância |
|---|---|---|---|
| `useMobileProgress.ts` linhas | 124 | 126 | ±2 |
| `useMobileProgress.test.ts` linhas | 100 | ~175 | ±15 |
| Student tests | 5/5 | 7/7 | exacto |
| Total tests | 209/209 | 211/211 | exacto |
| Type errors | 0 | 0 | exacto |

## ⚠️ Pontos de pausa G-01

- **G-01 #1** (Step 9): Antes do primeiro commit (refactor source + 1 test refactor). Após autorização, commitar e seguir.
- **G-01 #2** (Step 10): Antes do segundo commit (2 novos tests). Após autorização, commitar e seguir.
