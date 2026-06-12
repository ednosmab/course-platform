# WF-HANDOFF-executor-to-reviewer-v1: Protocolo de Transição

Este documento formaliza a entrega do código-fonte concluído do Agente **Executor** para o Agente **Reviewer** auditar e validar a qualidade física do código.

---

## 📋 Metadados de Handoff
```yaml
handoff:
  source_agent: Executor
  target_agent: Reviewer
  timestamp: 2026-05-16T23:25:00Z

context:
  workflow_id: WF-EXE-REV-001
  objective: Auditar a qualidade física, linting e testes do código gerado pelo Executor
  constraints:
    - O Reviewer não pode realizar nenhuma alteração de lógica de código de produção
    - O Reviewer deve reportar erros e quebras de testes diretamente no context_buffer.md

artifacts:
  - file: apps/ | packages/ | supabase/
    schema: code_files

expected_result: Relatório de testes concluído com sucesso e código livre de lints/erros de validação TypeScript/Zod.

validation_rules:
  - Compilação limpa ao rodar pnpm run lint
  - Execução total sem erros da suíte de testes locais via pnpm run test
  - Verificação de políticas de prevenção a XSS e segurança de RLS
```

---

## ⚙️ Instruções de Consumo para o Reviewer
1. **Verificação Estática:** Execute `pnpm run lint` na raiz para encontrar erros de sintaxe ou de limites arquiteturais.
2. **Execução de Testes:** Execute os testes unitários da camada e registre a taxa de cobertura (coverage).
3. **Auditoria de Segurança:** Verifique se as novas tabelas possuem RLS habilitado e se inputs dinâmicos do CMS possuem sanitização adequada de XSS.
4. **Resumo no Buffer:** Atualize o buffer registrando o sucesso da validação ou os logs de erros encontrados.
