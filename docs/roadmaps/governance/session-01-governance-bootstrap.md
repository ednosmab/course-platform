# 🏛️ PROMPT DE EXECUÇÃO DE GOVERNANÇA INTEGRADO (SESSÃO 01)

Você deve agir como o Engenheiro de Infraestrutura e Governança do projeto. Sua tarefa é implementar em lote (*Batch Execution*) a estrutura completa de arquivos, as travas de contexto e as configurações ambientais descritas abaixo. 

Esta sessão é **EXCLUSIVAMENTE** focada em **INFRAESTRUTURA DE CONTEXTO, ORGANIZAÇÃO DOCUMENTAL E PROTEÇÃO ARQUITETURAL**. É terminantemente **PROIBIDO**:
* Implementar qualquer linha de código funcional ou lógico.
* Criar componentes de UI ou lógicas de aplicação.
* Criar esquemas Zod reais de produção.
* Instalar ou modificar qualquer dependência de software (Proibido modificar `package.json`).
* Sobrescrever documentações existentes sem um merge semântico prévio.
* Realizar auto-refactors ou alterações fora do escopo da TASK-00.

Use suas ferramentas de sistema de arquivos (MCP) e terminal para executar de forma autônoma.

---

## 🔒 BOUNDARY ENFORCEMENT (DIRETRIZ DE FRONTEIRA)

Respeite rigorosamente as responsabilidades de isolamento de cada camada do monorepo:
* `packages/ui` ➔ Apenas design system, primitivos atômicos e tokens puros.
* `packages/types` ➔ Fonte única da verdade (*Source of Truth*) dos contratos de dados e esquemas.
* `packages/core` ➔ Camada de domínio, regras de negócio isoladas, casos de uso e serviços.
* `packages/renderer` ➔ Motor agnóstico encarregado da renderização dinâmica do CMS.
* `apps/*` ➔ Orquestração e composição das experiências de consumo finais.

---

## 🛠️ TASK-00: EXPANSÃO DO CONTEXT MAP & CRIAÇÃO DE DIRETÓRIOS

Atualize o arquivo `docs/CONTEXT_MAP.md` e crie fisicamente no disco os seguintes diretórios e arquivos markdown modulares, adicionando o conteúdo interno obrigatório:

### 📂 1. CAMADA CORE & DOMÍNIO
* [ ] `docs/layers/core/domain-logic.md`
```markdown
# Camada de Domínio Compartilhada

## Estrutura de packages/core
## Regras de Negócio Isoladas da Interface
## Serviços Compartilhados
## Policies
## Use Cases
## Adapters
```
* [ ] `docs/layers/core/event-architecture.md`
```markdown
# Arquitetura de Eventos

## Event Bus
## Command Pattern
## Sistema de Action Logs
## Undo/Redo Estrutural
## Autosave
```
* [ ] `docs/layers/core/offline-strategy.md`
```markdown
# Sincronização Offline

## Estratégia de Cache
## Resolução de Conflitos
## Fila Offline
## Optimistic Updates
```

### 📂 2. CAMADA RENDERER & CMS
* [ ] `docs/layers/renderer/engine-spec.md`
```markdown
# Render Engine Independente

## Registry de Componentes
## Dynamic Imports
## Lazy Loading
## Plugins
## Marketplace Futuro
```
* [ ] `docs/layers/types/jsonb-governance.md`
```markdown
# Versionamento JSONB

## Runtime Migration
## Schemas .strict()
## Compatibilidade entre versões
## Source of Truth via Zod
```
* [ ] `docs/layers/types/data-lifecycle.md`
```markdown
# Exportação de Conteúdo

## Rollback Seguro
## Feature Flags
## Evolução de Schema
```

### 📂 3. CAMADA SEGURANÇA & OBSERVABILIDADE
* [ ] `docs/layers/supabase/security-policies.md`
```markdown
# Estratégia de Segurança

## RLS
## Roles
## Ownership
## Multi-tenant
## Auditoria
```
* [ ] `docs/layers/infra/observability.md`
```markdown
# Telemetria

## Logs Estruturados
## Tracing
## Métricas
## Histórico de Alterações
```
* [ ] `docs/layers/infra/future-automation.md`
```markdown
# Automação Futura

## Lint arquitetural
## Scanner de imports
## Boundary validation
## Detector de acoplamento
## Verificação automática de schemas
## Conventional Commits
```

### 📂 4. CAMADA UI
* [ ] `docs/layers/ui/token-governance.md`
```markdown
# Governança de Tokens

## Responsividade
## Separação UI/Domínio
## Proteção do Design System contra crescimento monótono
```

---

## 🔐 TASK-00.1 A TASK-00.4: POLÍTICAS DE BLINDAGEM ARQUITETURAL

Crie e popule os arquivos de controle técnico e conceitual de fronteiras exatamente como descritos abaixo:

### 1. Criar o arquivo `docs/FORBIDDEN_OPERATIONS.md`
```markdown
# 🚫 OPERAÇÕES PROIBIDAS

* PROIBIDO lógica de domínio em packages/ui.
* PROIBIDO acesso direto ao Supabase no Renderer.
* PROIBIDO imports cruzados entre apps.
* PROIBIDO schemas inline fora de packages/types.
* PROIBIDO mutar JSONB sem validação.
* PROIBIDO acoplar estado global ao Renderer.
* PROIBIDO SQL fora da camada apropriada.
* PROIBIDO instalar dependências sem justificativa.
* PROIBIDO modificar package.json fora da sessão.
* PROIBIDO sobrescrever documentação sem merge semântico.
* PROIBIDO criar código funcional durante TASK-00.
* PROIBIDO auto-refactors fora do escopo.
```

### 2. Injetar Ordem Obrigatória de Leitura no topo de `docs/CONTEXT_MAP.md`
```markdown
# 📖 ORDEM OBRIGATÓRIA DE LEITURA

* P0 → docs/AGENTS.md
* P1 → docs/context_buffer.md
* P2 → layer específica da task
* P3 → arquivos correlatos
* P4 → docs/history/
```

### 3. Criar o arquivo `docs/ARCHITECTURE_DECISION_CHECKLIST.md`
```markdown
# 📋 CHECKLIST DE DECISÃO ARQUITETURAL

- [ ] Isso gera acoplamento oculto?
- [ ] Isso viola boundaries?
- [ ] Isso pertence ao domínio?
- [ ] Isso deveria ser compartilhado?
- [ ] Isso quebra isolamento?
- [ ] Isso exige versionamento?
- [ ] Isso impacta offline?
- [ ] Isso afeta múltiplos apps?
- [ ] Isso exige lazy loading?
```

### 4. Criar o arquivo `docs/ARCHITECTURAL_SEVERITY.md`
```markdown
# 🚨 NÍVEIS DE SEVERIDADE

* BLOCKER
* CRITICAL
* WARNING
* INFO
```

---

## 🧠 TASK-00.5 E TASK-00.6: ENGENHARIA DE CONTEXTO E AUTOMAÇÃO MCP

Sincronize as restrições arquiteturais diretamente com o ambiente de execução da IA.

### 1. Atualizar o Servidor MCP em `opencode.json`
Atualize o bloco de ambiente do servidor injetando as seguintes diretrizes estritas na chave correspondente:
```json
{
  "mcpServers": {
    "filesystem": {
      "env": {
        "AI_OPERATIONAL_RULES": "1. PROIBIDO lógica de domínio em packages/ui. 2. Todo schema Zod deve possuir version and .strict(). 3. Conventional Commits obrigatórios. 4. Respeitar teto de 50%-55% do contexto. 5. Proteger boundaries definidos no AGENTS.md. 6. Proibido imports cruzados entre apps. 7. Proibido instalar dependências sem justificativa. 8. Proibido modificar package.json fora da task atual. 9. Proibido sobrescrever documentação sem merge semântico. 10. Proibido criar código funcional durante TASK-00."
      }
    }
  }
}
```

### 2. Resetar o Estado da RAM em `docs/context_buffer.md`
Substitua integralmente o conteúdo do arquivo volátil pelo bloco abaixo:
```markdown
# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
AGUARDANDO_CONEXAO_DE_INFRA_DA_AUDITORIA

## Tarefa Atual
- Provisionamento das gavetas arquiteturais
- Atualização do CONTEXT_MAP
- Atualização do MCP
- Blindagem anti-acoplamento

## Critérios de Aceitação
- Arquivos criados
- CONTEXT_MAP atualizado
- MCP atualizado
- Git limpo após commit

## Próxima Task
TASK-01:
Validar conformidade dos schemas Zod.
```

---

## 🔍 REVISÃO ESTRUTURAL OBRIGATÓRIA (PRÉ-COMMIT)

Antes de disparar o commit de encerramento, valide rigorosamente os seguintes pontos:
* **Validar árvore criada**: Certifique-se de que cada caminho mapeado em `docs/layers/` existe fisicamente.
* **Validar boundaries**: Garanta que as regras de isolamento técnico de pacotes não foram violadas.
* **Validar ausência de código funcional**: Certifique-se de que nenhuma lógica de negócio ou código executável foi gerado.
* **Validar ausência de dependências novas**: Confirme que nenhum arquivo `package.json` ou de manifesto de pacotes foi alterado.
* **Validar consistência documental**: Certifique-se de que os títulos e subtítulos batem exatamente com as especificações exigidas.

---

## ❌ FAIL FAST

Interrompa o processamento imediatamente se:
* Os caminhos físicos (*paths*) apresentarem qualquer sinal de inconsistência ou malformação.
* Arquivos críticos de controle listados neste plano falharem durante a escrita.
* As fronteiras técnicos-arquiteturais (*boundaries*) exibirem qualquer ambiguidade de governança.
* O estado de contexto geral do chat estiver inconsistente.
* Ocorrer qualquer tentativa de alterar arquivos de dependência ou introduzir códigos funcionais.

---

## 🛑 SESSION EXIT CRITERIA & TASK-00.7: GIT FLOW

A sessão só será encerrada com sucesso após o cumprimento cumulativo dos critérios abaixo:
1. `git status` retornado 100% limpo e livre de modificações espúrias.
2. Nenhuma nova dependência de software instalada ou injetada no repositório.
3. Nenhum código funcional ou lógico criado.
4. Todos os arquivos de documentação provisionados e indexados com sucesso.

Cumpridos todos os requisitos, execute os comandos de sincronização via terminal do projeto:

```bash
git add docs/CONTEXT_MAP.md docs/context_buffer.md opencode.json docs/layers/ docs/FORBIDDEN_OPERATIONS.md docs/ARCHITECTURE_DECISION_CHECKLIST.md docs/ARCHITECTURAL_SEVERITY.md

git commit -m "chore(governance): inject audit infrastructure and mcp constraints"
```

Aviso de conclusão: Informe o usuário explicitamente assim que o commit for efetuado com sucesso absoluto e a árvore de trabalho do Git estiver limpa.
