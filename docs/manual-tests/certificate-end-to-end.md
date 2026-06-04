# 🧪 Teste Manual — Fluxo Completo de Certificado

> Procedimento de validação manual end-to-end para a feature **Certificado do Curso**.
> Complementa o workflow de uso descrito em [`docs/workflows/workflow_adm.md`](../workflows/workflow_adm.md) — esse explica **como funciona**, este explica **como validar**.

---

## 🎯 Objectivo

Garantir que o caminho crítico **curso → módulo → aula → emitir certificado → personalizar → preview → impressão** funciona integralmente em ambiente real, sem recurso a automação.

---

## ✅ Pré-requisitos

| # | Item | Como verificar |
|---|---|---|
| 1 | Servidor admin a correr | `cd apps/admin && pnpm dev` → http://localhost:3000 |
| 2 | Login de admin válido | `admin@admin.com` / `123456` (ver `workflow_adm.md` §1) |
| 3 | Supabase acessível | Storage bucket `certificate-images` configurado como **público** (Dashboard → Storage → badge `PUBLIC`) |
| 4 | Curso de teste disponível | Pode usar um novo ou reusar um já existente |
| 5 | Imagem de teste disponível | JPEG/PNG/WebP < 5MB no desktop |

---

## 🟢 Cenário Principal (Happy Path)

**Execução realizada em 2026-06-03** — curso "Teste 2", validação bem-sucedida em todos os passos.

| # | Passo | Resultado Esperado |
|---|---|---|
| 1 | Criar curso "Teste X" | Curso aparece em `/cursos` |
| 2 | Adicionar módulo ao curso | Módulo visível na estrutura |
| 3 | Adicionar aula ao módulo | Aula visível no módulo |
| 4 | Abrir Configurações do curso → activar **"Emitir certificado"** | Toggle fica activo e mostra a miniatura + botão "Personalizar no Studio" |
| 5 | Clicar em **"Personalizar no Studio"** | Abre a rota dedicada `/studio/[courseId]/certificate` (header partilhado, sem "Award icon") |
| 6 | Inserir bloco de **Imagem** (palette à esquerda) | Bloco aparece no canvas com placeholder tracejado "Arraste uma imagem aqui" |
| 7 | **Arrastar** o ficheiro de imagem do desktop para dentro do placeholder | Imagem é carregada para o Supabase Storage e substituí o placeholder |
| 8 | Clicar em **Salvar** | Persistência confirmada (verificável via reload F5) |
| 9 | Voltar à página de Configurações | Duas miniaturas (frente e verso) aparecem abaixo do toggle "Emitir certificado" |
| 10 | Abrir o **modal de preview** (clicar na miniatura) | Modal ocupa 95vw/92vh, mostra a frente (ou verso) em tamanho de design real |
| 11 | **Toggle Frente/Verso** dentro do modal | Alterna entre as duas faces sem fechar o modal |
| 12 | Clicar no **botão de impressão** | Diálogo nativo do browser abre com o certificado em A4 paisagem, 100% da folha (2 páginas no duplex) |

---

## 🔴 Cenários de Borda

### Validação de entrada no upload

| Acção | Esperado |
|---|---|
| Arrasta PDF em vez de imagem | Alert: "Formato não suportado. Use JPEG, PNG ou WebP." |
| Arrasta imagem de 6MB ou maior | Alert: "Arquivo muito grande. Máximo: 5MB." |
| Cria bloco de imagem, **não** clica nele, arrasta para o placeholder | Nenhuma acção (precisa de bloco activo) |
| Adiciona imagem, faz F5, volta ao editor | Imagem persiste (URL público do Supabase) |

### Duplex (frente e verso)

| Acção | Esperado |
|---|---|
| Activa "Dupla Face" sem atribuir blocos ao verso | Toggle "Frente/Verso" no canvas não aparece (não há blocos do verso) |
| Atribui um bloco ao "verso" | Toggle aparece no canvas; clique alterna a face visível |
| Preview do duplex | Modal mostra ambas as faces, toggle alterna a vista |
| Impressão do duplex | 2 páginas A4, ordem frente → verso |

### Persistência e isolamento

| Acção | Esperado |
|---|---|
| Edita o certificado, volta sem salvar | Alterações não persistidas |
| Salva, recarrega, abre de novo | Tudo restaurado |
| Abre o lesson editor (rota `/studio/[courseId]`) | Configurações de certificado **não aparecem** (boundary SDR-001) |
| Outra aba/edição concorrente no mesmo curso | Última gravação ganha (sem lock optimista nesta fase) |

---

## ♻️ Regressões a Verificar

Após cada teste manual, confirmar que estas áreas **continuam a funcionar**:

- [ ] Lesson editor abre normalmente em `/studio/[courseId]`
- [ ] Marquee no cert editor: clicar no padding cinzento e arrastar selecciona múltiplos blocos
- [ ] Drag-to-move de blocos continua responsivo
- [ ] Header do cert editor tem botão "Salvar" (não o cabeçalho pequeno antigo com Award icon)
- [ ] Paleta mostra apenas blocos válidos para certificado (sem quiz, vídeo, etc.)
- [ ] Console do browser sem erros vermelhos
- [ ] Network tab: requests de upload para `certificate-images` retornam 200

---

## 🤖 Validação Automatizada Complementar

Para regressões não cobertas pelo teste manual:

```bash
# Testes do admin (vitest)
cd apps/admin && pnpm vitest run

# Testes do UI partilhado (CertificateBlockRenderer, CertificatePage, etc.)
cd packages/ui && pnpm vitest run

# Type-check
cd apps/admin && ./node_modules/.bin/tsc --noEmit

# Build de produção
cd apps/admin && pnpm build
```

Estado actual esperado (2026-06-03): **59/59 admin + 46/46 ui** + tsc 0 erros.

---

## 🪪 Histórico de Execuções

| Data | Executor | Curso | Resultado | Notas |
|---|---|---|---|---|
| 2026-06-03 | Edson (admin) | Teste 2 | ✅ Pass — 12/12 passos | Validou drop de imagem, preview com toggle, impressão A4 duplex |

> Adicionar novas entradas em cada execução manual para rastreabilidade.
> Manter formato: `Data | Executor | Curso | ✅/❌ | Notas`.

---

## 📎 Referências

- [`docs/workflows/workflow_adm.md`](../workflows/workflow_adm.md) §6 — Workflow de uso do certificado
- [`docs/sdr/SDR-001-certificate-editor-isolation.md`](../sdr/SDR-001-certificate-editor-isolation.md) — Boundary rule (cert editor vs lesson editor)
- [`docs/sdr/SDR-002-iframe-print-isolation.md`](../sdr/SDR-002-iframe-print-isolation.md) — Decisão arquitectural da impressão via iframe srcdoc
- [`docs/BACKLOG.md`](../BACKLOG.md) — Item P1 #52 (drag-and-drop) — **em curso** até validação automatizada completa
