# 📋 Sessão — Governança: Regras de Higiene de Processo

**Modo:** planeamento + governança
**Data:** 2026-06-03

## Objectivo
Implementar regras de higiene de processo no AGENTS.md, FORBIDDEN_OPERATIONS.md e BACKLOG.md, com base em avaliação de desempenho do orquestrador.

## Alterações
- `docs/AGENTS.md`: + regra 9 (prioridade de entrada P0), + regra 10 (invariante de fim de sessão), PASSO 4 actualizado com ritual de fim de sessão
- `docs/FORBIDDEN_OPERATIONS.md`: + secção 8 (DT-01 a DT-04), consequência Média actualizada
- `docs/BACKLOG.md`: refactor completo — SLA por prioridade, severidade, owner, due, formato tabela P1/P2/P3, adiados com `[REVISIT]`
- `docs/session-template.md`: NOVO — template de fim de sessão (9 secções)
- `docs/debt-policy.md`: NOVO — política de datação de dívida (5 regras operacionais + auditoria)
- `docs/context_buffer.md`: podado de 258 → 16 linhas (RAM activa)

## Conteúdo descartado do buffer (pré-poda)
O buffer anterior continha registos detalhados de:
- Revisão exaustiva Fase 5A (inventário de branches `isCertMode`)
- Sessão de build fix (BrandMark + react-native + expo-asset)
- Sessão de interface de impressão (iframe srcdoc)
- Sessão de UX bug fixes (header, marquee, side toggle, overlay)
- Sessão de drag-and-drop de imagem (cert + lesson)
- Commit 3/3 (refactor helper uploadCertificateImageToBlock)
- Validações e decisões arquitecturais detalhadas

Os commits associados a estas sessões estão preservados no git:
- `0dd269b`, `127bfc1`, `59b9098`, `12e145f`, `13b7da3`, `77e790e`, `729a1c6`, `e41d643`, `8c26b04`, `c921da5`

## Próximos passos
Iniciar Fase 5A.1 (CertificatePalette) — branch `feat/cert-editor-isolation`.
