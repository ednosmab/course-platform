# WF-HANDOFF-planner-to-executor-v1: Protocolo de Transição

Este documento formaliza a entrega de plano de execução detalhado do Agente **Planner** para o Agente **Executor**.

---

## 📋 Metadados de Handoff
```yaml
handoff:
  source_agent: Planner
  target_agent: Executor
  timestamp: 2026-05-16T23:25:00Z

context:
  workflow_id: WF-PLN-EXE-001
  objective: Implementar novas funcionalidades com base em um plano de execução aprovado
  constraints:
    - Seguir estritamente a divisão de escopo do monorepo
    - Exigir tipagem estrita no TypeScript e validação rigorosa com Zod
    - Respeitar a ausência de comandos git automáticos

artifacts:
  - file: docs/layers/[camada]/execution_plan.md
    schema: markdown_checklist

expected_result: Implementação física do código-fonte correspondente à tarefa ativa no plano de execução da camada.

validation_rules:
  - O código gerado deve compilar com pnpm run lint
  - Testes unitários associados devem ser criados na abordagem Test-First
```

---

## ⚙️ Instruções de Consumo para o Executor
1. **Leitura Preguiçosa:** Antes de codificar, leia [docs/CONTEXT_MAP.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/CONTEXT_MAP.md) para confirmar se os arquivos a editar estão na sua camada permitida.
2. **Atualização da RAM:** Escreva suas metas imediatas no [docs/context_buffer.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/context_buffer.md) antes de criar/modificar arquivos de código.
3. **Escrita Cirúrgica:** Modifique apenas as linhas necessárias. Evite substituições massivas de arquivos preexistentes.
