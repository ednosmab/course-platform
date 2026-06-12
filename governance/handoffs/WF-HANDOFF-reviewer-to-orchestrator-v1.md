# WF-HANDOFF-reviewer-to-orchestrator-v1: Protocolo de Transição

Este documento formaliza a entrega do relatório final de qualidade do Agente **Reviewer** para o Agente **Orchestrator** consolidar a sessão e solicitar homologação/aprovação de commits ao usuário (Edson).

---

## 📋 Metadados de Handoff
```yaml
handoff:
  source_agent: Reviewer
  target_agent: Orchestrator
  timestamp: 2026-05-16T23:25:00Z

context:
  workflow_id: WF-REV-ORC-001
  objective: Entregar a chancela de qualidade da suíte de testes e linting para fechamento de sessão
  constraints:
    - O Orquestrador não deve homologar código que possua impedimentos de qualidade listados
    - O Orquestrador deve formatar e arquivar o resumo da sessão na pasta history/

artifacts:
  - file: docs/context_buffer.md
    schema: metadata_markdown

expected_result: Memória RAM limpa de erros (status `Nenhum erro ativo`) e transição do status do buffer para pronto para aprovação.

validation_rules:
  - Certificar que todos os testes passaram com sucesso
  - Mapear os arquivos alterados e seus respectivos commits recomendados no padrão Conventional Commits
```

---

## ⚙️ Instruções de Consumo para o Orquestrador
1. **Verificação de Impedimentos:** Leia o campo `## ⚠️ Impedimentos & Logs de Erro Recentes` no [docs/context_buffer.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/context_buffer.md). Se contiver erros, devolva o fluxo ao Executor.
2. **Registro Histórico:** Escreva a entrada da sessão correspondente na pasta [docs/history/](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/history/) seguindo o template do plano.
3. **Consolidação do Status:** Atualize o `context_buffer.md` para o status `AGUARDANDO_APROVACAO_USUARIO`.
4. **Notificação ao Usuário:** Apresente o resumo denso do progresso e solicite a homologação e o comando de commit manual.
