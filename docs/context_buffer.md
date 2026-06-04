# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
**Sessão de governança — regras de higiene de processo implementadas.**
Documentos alterados: `AGENTS.md` (regras 9+10 + PASSO 4), `FORBIDDEN_OPERATIONS.md` (secção 8, DT-01..DT-04), `BACKLOG.md` (refactor completo), `session-template.md` (NOVO), `debt-policy.md` (NOVO). Reorganização: 5A.4 marcado como PRIORIDADE MÁXIMA; 5A.1-5A.3 movidos para sprint à parte com `[REVISIT: 2026-06-25]`.

## 🎯 Tarefa em Execução
**P0 activo no BACKLOG:** Fase 5A — Isolamento do editor de certificado.
**Próxima acção (5A.4 — PRIORIDADE MÁXIMA):** Fix do bug crítico `EditorCanvas.tsx:1282`. EditorCanvas renderiza bloco de certificado com `BlockContent` (lesson renderer) em vez de `CertificateBlockRenderer`. Acção: remover as 13 branches `isCertMode` em `EditorCanvas.tsx` (~2h).
**Sub-itens 5A.1-5A.3 rebaixados** para sprint à parte [REVISIT: 2026-06-25] — refactor de palette/canvas/editor não é pré-requisito técnico do fix da linha 1282.

## 🛠️ Alterações desta sessão
- `docs/AGENTS.md`: + regra 9 (prioridade de entrada P0), + regra 10 (invariante de fim de sessão), PASSO 4 actualizado
- `docs/FORBIDDEN_OPERATIONS.md`: + secção 8 (DT-01..DT-04), consequência Média actualizada
- `docs/BACKLOG.md`: refactor completo — SLA por prio, severidade, owner, due, formato tabela P1/P2/P3, adiados com `[REVISIT]`. **Reorganizado:** 5A.4 marcado como PRIORIDADE MÁXIMA; 5A.1-5A.3 movidos para sprint à parte com `[REVISIT: 2026-06-25]`
- `docs/session-template.md`: NOVO — template de fim de sessão (9 secções)
- `docs/debt-policy.md`: NOVO — política de datação de dívida (5 regras operacionais + auditoria)
- `docs/context_buffer.md`: podado de 258 → ~20 linhas (RAM activa conforme regra DT-02)

## ✅ Validação
Documentos markdown — sem alterações de código. `tsc`/`test`/`build` inalterados.

## 📌 Próximos Passos
- **Iniciar 5A.4 (PRIORIDADE MÁXIMA)** — branch `feat/cert-editor-isolation`. Remover 13 branches `isCertMode` em `EditorCanvas.tsx` (~2h)
- Após 5A.4, seguir para 5A.5 (EditorContext testes mínimos, 3 testes, ~45min)
- Sprint à parte [REVISIT: 2026-06-25]: 5A.1 → 5A.2 → 5A.3 (refactor de palette/canvas/editor)
- Executar ritual de fim de sessão conforme AGENTS.md regra 10 e `session-template.md`
