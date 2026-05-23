# ADR-008: Draft/Published lesson versioning via UUID mangling

**Status:** Aceito
**Data:** 2026-05-23
**Contexto:** Lesson repository (`supabase-lesson-repository.ts`)

---

## Decisão

Lições publicadas usam o UUID real. Rascunhos (drafts) usam um UUID modificado: primeiros 24 caracteres do UUID real + sufixo fixo `dddddddddddd`. Um contador de versão é incrementado a cada publicação. Isso permite edição simultânea de draft e published sem alterações no schema do banco.

---

## Contexto

O CMS precisa suportar edição de lições enquanto a versão publicada permanece no ar para os alunos. Abordagens comuns seriam:

1. **Tabela separada de versões** — complexidade de schema e joins em toda query de leitura
2. **Coluna `is_draft`** — uma única linha por lição, impossibilita edição concorrente
3. **UUID mangling** — duas linhas (draft + published) na mesma tabela, sem schema novo

Escolhemos UUID mangling por ser a abordagem mais simples e sem impacto em queries de leitura (published lições usam UUID normal, sem filtros extras).

**Formato do ID modificado:**
```
UUID real:      a1b2c3d4-e5f6-7890-abcd-ef1234567890
UUID draft:     a1b2c3d4-e5f6-7890-abcd-ef1234dddddd
                   ↑ 24 chars do UUID real ↑   sufixo
```

**Tabela `lessons`:**

| id | version | is_published | ... |
|---|---|---|---|
| a1b2c3d4-...-ef1234567890 | 3 | true | ... |
| a1b2c3d4-...-ef1234dddddd | 3 | false | ... |

---

## Consequências

### Positivas
- **Sem schema novo:** Nenhuma migration de tabela de versões
- **Leitura simples:** Queries de lições publicadas não precisam de `WHERE is_published = true`
- **Edição segura:** Admin pode salvar rascunho sem afetar o que o aluno vê
- **Rollback trivial:** Publicar versão anterior = copiar draft com UUID anterior

### Negativas
- **IDs não padronizados:** UUIDs modificados violam o formato UUID padrão
- **边际 de colisão:** Sufixo de 12 chars fixo é seguro, mas não garantido matematicamente
- **Duplicação:** Duas linhas por lição — maior uso de armazenamento
- **Acoplamento:** Lógica de mangling precisa ser replicada em qualquer consulta que busque drafts

---

## Referências

- `packages/core/src/adapters/supabase-lesson-repository.ts`
- `packages/core/src/ports/ILessonRepository.ts`
- `supabase/migrations/` — schema da tabela `lessons`
