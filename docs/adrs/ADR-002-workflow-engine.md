# ADR-002: Workflow Engine do Runtime Multiagente

## Status
Aprovado

## Data
2026-05-16

## Contexto
O monorepo da infraestrutura de educação com CMS exige a operação coordenada de múltiplos agentes especializados com funções bem definidas (Agente 1 - Product Manager/Types, Agente 2 - Tech Lead/UI/Database, Agente 3 - Fullstack Developer/Apps). 
Sem um motor determinístico de transições e orquestração, as interações entre os agentes correm o risco de se tornarem caóticas, com loops infinitos de feedback, perda de contexto e duplicação de responsabilidades.
Precisamos padronizar como esses agentes cooperam, trocam artefatos de entrega (handoffs) e validam as restrições arquiteturais.

## Decisão
Adotaremos um motor de workflow multiagente cíclico e determinístico orientado a estados, operando sob o controle de um **Orquestrador Central**. O fluxo de trabalho segue um pipeline rígido com transições de estados assíncronas documentadas formalmente em arquivos físicos de handoff:

```
[Orquestrador] ──(Disparo)──> [Planner]
                                   │
                           (planner-to-executor.md)
                                   ▼
[Reviewer] <──(executor-to-reviewer.md)── [Executor]
    │
(reviewer-to-orchestrator.md)
    ▼
[Orquestrador] ──(Validação Final)──> Usuário (Edson)
```

### Regras do Motor:
1. **Unicidade de Agente Ativo:** Apenas um agente está no estado `EM_EXECUCAO` por turno. O acoplamento implícito ou concorrência descontrolada no File System é proibida.
2. **Entregas Físicas (Handoffs):** Toda transição entre agentes requer a escrita física de um arquivo markdown que segue um esquema estrito, localizado no diretório `/governance/handoffs/`.
3. **Auditoria Determinística:** O Orquestrador registrará cada transição, timestamp e checksum de artefatos gerados em `/audit/handoffs/`.
4. **Failsafe Escalável:** Se um agente falhar em compilar o código ou gerar erros de tipagem/Zod, o estado é interrompido, o erro é catalogado em `docs/context_buffer.md` na seção `⚠️ Impedimentos` e o controle é retornado ao Orquestrador para análise ou escalonamento humano.

## Consequências
* **Positivas:**
  * Eliminamos interações cruzadas caóticas e perda de contexto.
  * Criamos rastreabilidade total de todas as decisões tomadas por IA.
  * O código-fonte só é alterado após validações rigorosas dos contratos de dados Zod e tipagem TypeScript.
* **Negativas:**
  * Introduz uma pequena sobrecarga no tempo de ciclo de desenvolvimento devido à necessidade de geração e auditoria dos arquivos de handoff física.
