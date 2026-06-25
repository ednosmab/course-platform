# 🛠️ AGENTS.md - REGRAS DO TIME DE ENGENHARIA DE IA

## 📐 ARQUITETURA E PADRÕES DO REPOSITÓRIO (OBRIGATÓRIO)
- **Monorepo Híbrido:** Next.js (App Router), Expo (Router), Supabase e TypeScript.
- **Idioma Único:** Todo código fonte deve ser escrito em **inglês** — nomes de arquivos, variáveis, constantes, funções, componentes, props, tipos, interfaces, enums, tabelas, colunas e mensagens de commit. Nomes em português são proibidos.
- **Princípio DRY de Estilização:** É PROIBIDO usar Tailwind, Sass ou CSS inline. Toda e qualquer estilização visual deve ser feita exclusivamente via **Tamagui** no diretório `packages/ui`.
- **Propriedades Dinâmicas:** Os blocos do CMS precisam aceitar modificações dinâmicas enviadas do banco do Supabase através de propriedades (`props`) injetadas diretamente nos componentes base do Tamagui.
- **Banco de Dados:** Tabelas de dados flexíveis do CMS devem usar o tipo `JSONB` no Supabase para armazenar a árvore de componentes da aula.
- **Validação:** Todas as entradas de dados e contratos de API devem usar **Zod** para validação em tempo de execução.
- **Registros de Arquitetura (ADRs):** Toda decisão arquitetural de alto impacto está documentada na pasta `docs/adrs/`. É OBRIGATÓRIO ler e respeitar os ADRs existentes. Caso uma nova biblioteca estrutural precise ser adicionada, você deve primeiro sugerir a criação de um novo arquivo ADR para aprovação do usuário.
- **Plano de Desenvolvimento (SDP):** O cronograma detalhado de 8 semanas, o fluxo de trabalho da esteira MCP e a matriz de responsabilidades estão documentados em `docs/roadmaps/sdp.md`. É OBRIGATÓRIO ler e seguir este plano.
- **Regras Vinculantes (FORBIDDEN_OPERATIONS):** O arquivo `docs/FORBIDDEN_OPERATIONS.md` contém **regras absolutas** que a IA DEVE ler e seguir em toda sessão. Qualquer violação deve ser reportada e corrigida imediatamente. **Inclui CONFID-01** (confidencialidade comercial — proibição de mencionar nomes de alvos, parceiros ou entidades do sector-alvo em qualquer artefato versionado).
- **Configuração de Ambiente de Teste:** A flag `E2E_BYPASS_AUTH` é EXCLUSIVA do `playwright.config.ts` (sete via `webServer.env`). É TERMINANTEMENTE PROIBIDO propagá-la para `.env*`, `next.config.*`, `vercel.json`, `wrangler.toml`, `netlify.toml` ou qualquer config de deploy. O script `scripts/check-test-env-vars.sh` (integrado em `pnpm run verify` e nos workflows CI/CD) valida este contrato. Ver `docs/skills/e2e_testing.md` e regra ENV-01 em FORBIDDEN_OPERATIONS.
- **Diretrizes de Engenharia (DESDO):** O arquivo `docs/DESDO.md` consolida as regras de governança, mitigações operacionais e padrões arquiteturais (SOLID, TDD, segurança, documentação) que devem ser observados em toda geração de código ou alteração de estado no projeto.


---

## 🎨 GOVERNANÇA DO DESIGN SYSTEM (OBRIGATÓRIO)

- **Ícones:** É PROIBIDO importar diretamente de `lucide-react` ou `lucide-react-native`. Use exclusivamente `<Icon name="IconName" />` de `@projeto/ui`.
- **Estilização:** Zero `<div>`, `<span>`, `<button>`, `<p>`, `<h1-6>` nos componentes — use `YStack`, `XStack`, `Text`, `Button` de `@projeto/ui`.
- **Cores Hardcoded:** Proibido usar valores hex/rgb nos apps. Use tokens `$color` do Tamagui.
- **StyleSheet.create():** Proibido no student app. Use Tamagui stylying.
- **Verificação:** Execute `pnpm run verify:ui` para validar as regras acima.
- **Ladle:** Mantenha stories atualizadas em `packages/ui/src/**/*.stories.tsx`. Execute `pnpm --filter @projeto/ui ladle:build` para verificar.

---

## 📖 CÓDIGO DECLARATIVO E LEGÍVEL (REGRA ABSOLUTA)

Escreva códigos extremamente declarativos, simples e fáceis de ler. Evite otimizações prematuras ou sintaxes excessivamente complexas. Prefira legibilidade à concisão. Código deve ser autoexplicativo para um desenvolvedor pleno — se precisar de um comentário para explicar o fluxo, o código provavelmente está complexo demais.

---

## 🪜 Loading Profiles (Otimização de Tokens)

O AGENTS.md é carregado via MCP em toda sessão. Para poupar tokens sem perder cobertura, aplicam-se os seguintes perfis:

| Perfil | Regras carregadas | Quando usar | Tokens aprox. |
|---|---|---|---|
| `minimal` | #1-9 (workflow + git), FORBIDDEN_OPERATIONS, DESDO | Tarefas triviais (typo, rename, comment-only) | ~3-4k |
| `lite` (default) | `minimal` + #10-11 (sessão) | Implementação de feature pequena, bug fix isolado | ~5-6k |
| `full` | `lite` + #12-14 (tríade plan/build/review) + #15 (feedback) | Refactor, migration, multi-camada, adição de nova lib | ~8-10k |

**Override:** o campo `loading_profile` em `opencode.json` força o perfil independentemente do default.

---

## 🕸️ Grafo de Dependências das Regras

As regras não são todas do mesmo nível. Existem três camadas de dependência:

```
       ┌──────────────────────────┐
       │  Camada 1: Workflow (1-11) │  ← sempre carregada
       │  (git, sessão, TDD)         │
       └────────────┬───────────────┘
                    │ activa o modo activo
                    ▼
       ┌──────────────────────────┐
       │  Camada 2: Mode (12-14)   │  ← carregada se loading_profile=full
       │  review → plan → build    │
       └────────────┬───────────────┘
                    │ fecha o ciclo
                    ▼
       ┌──────────────────────────┐
       │  Camada 3: Reflection (15)│  ← carregada só em fim-de-sessão
       │  feedback de desempenho  │
       └──────────────────────────┘
```

**Cadeia operacional:**
1. **Review** (#12) valida que um plano anterior foi executado conforme spec.
2. **Plan** (#13) gera o plano atómico que o **Build** (#14) vai executar.
3. **Build** (#14) executa o plano literal e atalha o ciclo em direção ao próximo Review.

**Regras com dependência implícita:**
- #14 (build) pressupõe que #13 (plan) já foi cumprido — não executar build sem plan aprovado.
- #13 (plan) pressupõe que #12 (review) já fechou o ciclo anterior — não planear sem antes auditar o que ficou pendente.
- #15 (feedback) é o único disparado por sinal externo (keywords de fim-de-sessão), não por estado do código.

---

## 🛑 REGRAS CRUCIAIS DE WORKFLOW E GIT (LEI ABSOLUTA)

1. **NUNCA FAÇA COMMIT SEM PERMISSÃO:** É ESTREITAMENTE PROIBIDO executar comandos de `git commit` ou `git push` de forma automatizada. Você deve SEMPRE solicitar que o usuário teste as alterações localmente primeiro. Apenas após a confirmação visual e autorização explícita do usuário você poderá avançar ou sugerir o commit.
2. **COMMITS CURTOS EM INGLÊS:** Quando um commit for autorizado, a mensagem de commit gerada ou sugerida DEVE ser escrita em inglês. Ela deve ser altamente concisa, resumida e seguir rigorosamente a especificação do Conventional Commits (ex: `feat: add text block schema`, `chore: update database rules`). Evite explicações longas ou genéricas no título do commit.
3. **BOOTSTRAP E SETUP PROATIVO:** Ao receber guias de início rápido (Quick Starts) ou iniciar a fase estrutural (Semanas 1-8), o agente DEVE sempre validar e instalar dependências (pnpm), limpar cache se necessário, testar a instalação e criar fisicamente a estrutura de pastas base do monorepo (scaffolding) seguindo o padrão: `apps/admin`, `apps/student`, `packages/types`, `packages/ui`, `supabase/migrations` antes de começar a codificar, explicando a ação ao usuário. Não pule esta etapa, mesmo que não seja solicitada explicitamente.
4. **REFINAMENTO CONTÍNUO (LEAN FLOW):** Ao identificar código repetido, desorganizado, mal nomeado ou que viola as regras de arquitetura (DRY, KISS, SOLID), você TEM A OBRIGAÇÃO de executar refatoração imediatamente. Documente o processo e as melhorias realizadas no `governance/context/context_buffer.yaml` na seção `technical_debt` antes de solicitar feedback do usuário.
5. **TDD ESTRITO — TEST-FIRST (RED-GREEN-REFACTOR):** Você DEVE seguir o ciclo TDD estrito. Primeiro escreva o teste (RED), depois a implementação mínima (GREEN), depois refatore (REFACTOR). Só após GREEN você pode enviar o código. Consulte `docs/skills/tdd_workflow.md` para o protocolo completo. Execute `pnpm run test` a cada ciclo e documente o resultado no buffer.
6. **VALIDAÇÃO DE SEGURANÇA (SECURITY BY DEFAULT):** Antes de implementar qualquer funcionalidade que envolva dados do usuário (inputs, uploads, formulários) ou renderização de HTML gerado por CMS, você DEVE verificar o `docs/skills/security_xss_prevention.md`. Aplique as defesas necessárias (sanitização, escape ou uso de componentes seguros) automaticamente e documente a validação no buffer.
7. **POSTURA DE ENGENHARIA SÊNIOR (SKILL OBRIGATÓRIO):** Em TODA sessão que envolva escrita ou modificação de código, a skill `docs/skills/senior-engineer.md` DEVE estar activa. Esta skill define a postura operacional: ler antes de escrever, alteração mínima válida, verificar após cada step, nunca pular verificação, nunca modificar ficheiros fora do escopo. Consulte a skill para o protocolo completo de execução.
8. **TDD ESTRITO — TEST-FIRST (SKILL OBRIGATÓRIO):** Em TODA sessão que envolva escrita de testes ou implementação de funcionalidades com cobertura, a skill `docs/skills/tdd-agent.md` DEVE estar activa. Esta skill define o ciclo Red-Green-Refactor: escrever o teste que falha (RED), implementar o mínimo para passar (GREEN), refatorar sem mudar comportamento (REFACTOR). Consulte a skill para o protocolo completo, anatomia de testes, e regras de mocks.
9. **TESTE DE INTEGRIDADE POST-COMMIT (POST-MORTEM):** Após realizar qualquer commit (e apenas após ser autorizado pelo usuário), você DEVE executar imediatamente um diagnóstico completo do sistema para garantir que a alteração não quebrou outras partes do projeto. Você DEVE utilizar as seguintes ferramentas e comandos na ordem exata:

   a. **Detecção de Erros de Compilação:** Execute `pnpm run lint` para verificar erros de sintaxe e TypeScript. Verifique também os erros de validação do Zod reportados pelo compilador.

   b. **Detecção de Erros de Importação:** Execute `pnpm ls zod` e `pnpm ls @supabase/supabase-js` para garantir que as dependências core continuam sendo resolvidas corretamente pelo pnpm.

   c. **Teste de Integridade do Monorepo:** Execute `pnpm run test:e2e` para garantir que os fluxos críticos de UI continuam funcionando. Documente qualquer falha encontrada na secção `blockers` do `governance/context/context_buffer.yaml`, incluindo o stack trace completo.
   d. **Correção Automática de Erros Críticos:** Se qualquer um dos comandos acima falhar, você DEVE executar as correções sugeridas pelo próprio terminal e repetir os testes até que todos passem, documentando cada tentativa no buffer, antes de prosseguir para a próxima tarefa.
10. **CHECKLIST DE AMBIENTE PRÉ-DEPLOY:** Antes de commitar qualquer alteração em configs de deploy, secrets ou env vars, execute `bash scripts/check-test-env-vars.sh` e confirme que passa. Qualquer flag de teste (E2E_*, MOCK_*, BYPASS_*) tem de estar contida em `playwright.config.ts` e em mais nenhum outro lado. Ver regra ENV-01 em FORBIDDEN_OPERATIONS.

11. **PRIORIDADE DE ENTRADA DE SESSÃO:** Ao iniciar qualquer nova sessão, a PRIMEIRA tarefa a ser atacada é o item P0 activo no `docs/BACKLOG.md`. Itens P1/P2 só podem ser iniciados após (a) concluir o P0, ou (b) registar adiamento datado (ver DT-01 em FORBIDDEN_OPERATIONS). A IA NÃO DEVE iniciar tarefa de prioridade inferior sem antes mostrar a justificação de adiamento.

12. **INVARIANTE DE FIM DE SESSÃO:** Nenhuma sessão pode ser declarada "concluída" sem antes executar o ritual de fim de sessão: `pnpm run close:session` (verifica working tree, buffer, testes, UI governance e build), buffer podado (≤ 50 linhas activas), backlog actualizado, testes verdes (`tsc --noEmit`, `pnpm run test`, `pnpm run build`). Ver template detalhado em `docs/session-template.md` e política DT-02 em FORBIDDEN_OPERATIONS.
13. **QUICK BOARD DE AVISO (LEMBRETES PERMANENTES):** Ao iniciar QUALQUER sessão, a IA DEVE apresentar ao usuário o **Quick Board** do `governance/context/context_buffer.yaml` antes da primeira resposta operacional. O Quick Board lista: tarefa em curso, parado, próximo, dívidas P1 com due date. Este lembrete NÃO substitui a leitura completa dos P0 — é apenas um aviso de contexto. A omissão do Quick Board na primeira resposta é violação desta regra.

14. **VALIDAÇÃO DE PLANO EM MODO REVIEW:** Quando o agente opera em modo `review` (definido em `opencode.json` no agent `review`), DEVE SEMPRE validar que o trabalho executado corresponde ao plano aprovado pelo usuário. Protocolo obrigatório:
   a. **Tabela de conformidade:** Listar cada step do plano (1, 2, 3, ...) com estado (✅/⚠️/❌) e evidência objetiva (diff, linha, contagem, output de comando).
   b. **Métricas vs. plano:** Comparar números declarados (linhas removidas, testes adicionados, ficheiros tocados) com números reais via `git diff --stat`, `wc -l`, `pnpm test`.
   c. **Desvios explícitos:** Sinalizar qualquer step não executado, item perdido na poda, decisão tomada sem autorização (especialmente G-01).
   d. **Planos arquivados:** Se o plano está em `docs/plans/YYYY-MM-DD-<task>.md`, comparar os checkboxes preenchidos pelo build contra o `git diff` real e a sequência de commits.
   e. **Acções de follow-up:** Listar itens pendentes, reversões possíveis, próximos passos. **Output é vinculante** — bloqueia avanço se não for entregue.

15. **PLANO FRAGMENTADO EM MODO PLAN:** Quando o agente opera em modo `plan` (definido em `opencode.json` no agent `plan`), DEVE SEMPRE produzir planos atómicos e fragmentados, optimizados para o executor `deepseek-v4-flash-free` (modelo rápido, propenso a esquecimento). Protocolo obrigatório:
   a. **Steps atómicos:** Cada step = 1 acção primária (1 Edit, 1 sed, 1 write) + 1 verificação explícita (grep, wc, cat). Nunca batchar múltiplas acções num único step.
   b. **Texto exacto:** Usar `oldString`/`newString` literais (não paráfrases) com hashes, paths, e valores numéricos. Incluir `grep` de verificação após cada step.
   c. **Salvaguardas S1..S6:** Listar apólices anti-esquecimento (não fundir, não tocar código não-p laneado, não avançar com falha, G-01 explícito, não duplicar, não tocar docs não-p laneado).
   d. **Pontos de pausa G-01:** Marcar `**PARAR e pedir autorização**` antes de qualquer `git commit` ou operação irreversível. Comandos seguintes ficam em standby.
   e. **Path canónico:** Planos com ≥ 5 steps ou ≥ 2 ficheiros afectados são arquivados em `docs/plans/YYYY-MM-DD-<slug>.md` usando o template em `docs/plans/TEMPLATE.md`. O ficheiro contém checkboxes que o build vai preenchendo.
   f. **Métricas-alvo:** Declarar ranges (ex: "target 38-48 linhas, tolerância ±5"). Output pós-execução tem de bater o range; se bater, OK; se não, **reportar desvio**.

16. **EXECUÇÃO LITERAL EM MODO BUILD:** Quando o agente opera em modo `build` (definido em `opencode.json` no agent `build`, executado por `deepseek-v4-flash-free`), DEVE executar o plano aprovado de forma **literal e atómica**, sem decisões autónomas. Protocolo obrigatório:
   a. **Sem improviso:** NÃO refactorar, NÃO adicionar JSDoc, NÃO renomear, NÃO corrigir bugs adjacentes, NÃO adicionar testes extra. Executa APENAS o que o `oldString`/`newString` do step diz.
   b. **Detecção de desvio:** Antes de cada Edit/sed, confirma: "este step está dentro do que planeei?" Se o step exigir uma mudança não-p laneada, **PARA** e reporta ao utilizador. Nunca inventar conteúdo.
   c. **Excepções mínimas permitidas:** (1) Ajustes triviais para o build passar (import em falta, tipo errado, formato de path) — desde que sejam < 5 linhas e não alterem semântica. (2) Registar achados fora-do-plano no `governance/context/context_buffer.yaml` secção `technical_debt` para revisão posterior.
   d. **Comunicação com Plan/Review:** Se o plano está em `docs/plans/YYYY-MM-DD-<task>.md`, o build actualiza checkboxes conforme avança. O review compara diff real vs. template (ver regra #12).
    e. **Em caso de dúvida:** PARAR. O deepseek é rápido mas esquece passos. Melhor interromper e perguntar do que improvisar e criar drift técnico.
    f. **Respeitar modelo do step:** O executor DEVE usar exactamente o modelo indicado no campo `[Modelo]` de cada step do plano. Violações configuram G-05 em FORBIDDEN_OPERATIONS.md.

17. **FEEDBACK DE DESEMPENHO POR SESSÃO (TECH LEAD EM FORMAÇÃO):** Para developers com conhecimento arquitectural sênior mas código júnior/pleno, em desenvolvimento como tech lead, ao sinal de "fim de sessão" (keywords: "vamos parar", "sessão fechada", "até amanhã", "feedback da sessão"), o agente DEVE:
    a. **Detectar** o sinal de fim automaticamente.
    b. **Calibrar tom** ao perfil T-shaped: vocabulário pleno em arquitectura, vocabulário explicado brevemente em código, foco principal em visão/leadership.
    c. **Gerar feedback estruturado** em `docs/feedback/YYYY-MM-DD.md` (1 ficheiro por dia, múltiplas sessões). Cada sessão é uma secção "### Sessão N (HH:MM)". Múltiplas sessões no mesmo dia são acrescentadas ao ficheiro existente (append) com sumário do dia no fim.
    d. **Estilo correctivo em código:** crítica + exemplo + racional (modo mentor, não condescendente). Raro: 95% do feedback é no-code.
    e. **Apresentar imediatamente** ao utilizador (resumo inline curto, máximo 10 bullets).
    f. **No fim do MVP** (trigger: utilizador diz "MVP concluído"), agregar todos os ficheiros de feedback em `docs/feedback/MVP-aggregated.md` com análise de evolução longitudinal.
      g. **Ficheiro privado** por defeito (em `.gitignore`).
    i. **Compromisso de commit separado:** O feedback é privado e não versionado. Usar `git commit --allow-empty -m "docs(feedback): YYYY-MM-DD"` APÓS o(s) commit(s) de trabalho, para rastreabilidade sem expôr conteúdo.

    **Exemplos concretos de feedback:**

    ```text
    📊 Feedback da Sessão — 2026-06-24

    🎯 O que fizeste bem:
    1. Boa decisão ao usar pendingLayoutRef em vez de state durante drag — evita re-renders desnecessários
    2. Identificaste correctamente a causa do "Maximum update depth exceeded" — sabes onde procurar
    3. Sequenciaste bem as correcções (primeiro tick, depois onMouseMove) — abordagem metódica

    ⚠️ O que podes melhorar:
    1. Poderias ter testado o auto-scroll antes de commitar — tiveste de fazer 3 commits para chegar ao resultado
    2. A abordagem de direct DOM mutation é poderosa mas arriscada — considera adicionar safeguards no futuro

    💡 Próxima sessão:
    - Foco no canvas expand durante drag (PENDENTE-DRAG-CANVAS-EXPAND)
    - Testar tudo antes de commitar (TDD estrito)
    ```

18. **EVIDÊNCIA ACIMA DA DOCUMENTAÇÃO (REGRA ABSOLUTA):** Quando existir conflito entre documentação, implementação e comportamento real do sistema, a decisão deve ser baseada em evidências verificáveis. A documentação deve representar a realidade, não substituí-la. Fluxo obrigatório: Documentação → Implementação → Runtime → Evidências → Actualização documental. Exemplo: ADR-022 — documentação dizia "pooling necessário", código mostrava "SDK HTTP only", evidência confirmou "pooling inexistente".

19. **MEDIR ANTES DE OPTIMIZAR (REGRA ABSOLUTA):** Nenhuma optimização de performance, cache, escalabilidade ou infraestrutura pode avançar para implementação sem primeiro ter métricas que a justifiquem. Excepção: Itens P0 (risco activo e identificável por inspecção directa). Gates de decisão devem ser definidos por métricas, evidências ou critérios explícitos — valores numéricos específicos ficam no backlog e ADRs, não na governança principal.

20. **ESTADOS DE ITEM DO BACKLOG (OBRIGATÓRIO):** Cada item do backlog deve estar num dos estados formais:

| Estado | Significado | Transição |
|---|---|---|
| `planeado` | Item definido, ainda não iniciado | → em investigação / em implementação |
| `em investigação` | Hipótese a ser validada | → em implementação / encerrado |
| `em implementação` | Código a ser escrito | → em validação |
| `em validação` | Testes e revisão | → concluído / em implementação |
| `concluído` | Implementação completa e validada | Terminal |
| `encerrado` | Hipótese invalidada ou acção obsoleta | Terminal |
| `pausado` | Bloqueio externo | → em investigação / em implementação |
| `adiado` | Decisão de não avançar agora | Requer [REVISIT: YYYY-MM-DD] |

**Concluído** e **Encerrado** são estados terminais independentes. Concluído = implementação bem-sucedida. Encerrado = hipótese invalidada ou acção desnecessária.

21. **CHECKLIST DE CONCLUSÃO DE ITEM (OBRIGATÓRIO):** Nenhum item pode ser marcado como [x] sem satisfazer TODOS os 4 requisitos:
   1. **Actualização da documentação** — Ficheiros `.md` actualizados, JSDoc adicionado
   2. **Actualização do backlog** — Status actualizado com data e commit
   3. **Validação dos critérios** — Todos os critérios verificáveis e passaram
   4. **Registo da decisão** — ADR/SDR criado quando aplicável

Fluxo: Implementar → Documentar → Testar → Decidir → Actualizar → Só então marcar [x]

22. **BLOCOS INTERACTIVOS — SAVE PATTERN (OBRIGATÓRIO):** Ao criar ou modificar componentes de bloco no CMS, verificar se o bloco é interactivo (guarda estado do utilizador). Se sim: (a) adicionar `interactive: z.literal(true).optional()` + `stateSchema` ao Zod schema em `packages/types/src/`, (b) o componente UI DEVE implementar `InteractiveBlockProps<TState>` com `defaultState`/`onStateChange`, (c) registar o branch de renderização no `SharedBlockRenderer`. Consulte `docs/skills/block-extensibility.md` para o protocolo completo.

---

## 🧬 MODELO PREFERIDO
- **Modelo:** `minimax-m3-free` (ID: `opencode/minimax-m3-free`)
- **Status:** Modelo que melhor atendeu o projeto. Deve ser usado em todas as sessões.

---

## 🌿 POLÍTICA DE BRANCHES E PIPELINE DE MERGE (OBRIGATÓRIO)

### Branches Canónicas
- **`main`** — código de produção. Synced com `origin/main`. Recebe apenas merges de `develop` via release.
- **`develop`** — integração contínua. **Toda** branch de feature deve mergear aqui. Deve estar sempre verde (testes 100%, build funcional).
- **`feat/<escopo>`** — branches de feature/refactor. Criadas a partir de `develop`, mergeadas de volta a `develop` via `--no-ff` quando o escopo está completo.
- **`fix/<escopo>`** — branches de correção pontual. Mesmo fluxo das `feat/*`.

### Branches de Refactor de Longa Duração
Branches de refactor estrutural (ex: `feat/dsv2-reform`) podem viver semanas/meses e absorver múltiplos itens do BACKLOG. A política é:

1. **Nome da branch deve referenciar o roadmap** (ex: `feat/dsv2-reform` → `docs/roadmaps/design-system-reforma.md`).
2. **A branch de refactor deve ser recriada quando necessário** — não preservar branches órfãs com 0 commits únicos vs `develop` (risco zero de perda, ver regra DT-02).
3. **Se o refactor for pausado, registrar data `[REVISIT: YYYY-MM-DD]`** no BACKLOG e atualizar o status da branch no `governance/context/context_buffer.yaml` (regra DT-01).
4. **Antes de recriar, listar no buffer** os commits do branch antigo e confirmar via `git log <branch> --not develop` se algum é único.

### Pipeline de Merge de Feature → Develop (Caminho C)
Quando uma branch de feature (`feat/X`) está pronta para integrar `develop`, seguir **rigorosamente** o runbook em `docs/runbooks/merge-dnd-to-develop.md`. Resumo dos passos:

1. **Pré-condições:** working tree limpo, testes verdes, `governance/context/context_buffer.yaml` actualizado.
2. **CI da branch:** `pnpm run test` + `pnpm run lint` + `pnpm run build` (se aplicável).
3. **Sincronizar `feat/X` com `develop`:** `git fetch && git checkout feat/X && git merge --no-ff develop` (resolve conflitos antecipadamente).
4. **Merge para `develop`:** `git checkout develop && git merge --no-ff feat/X -m "merge: <descrição concisa>"`.
5. **Pós-merge:** rodar suite completa de CI em `develop`, atualizar `context_buffer.md`, deletar branch local com `git branch -d feat/X` (apenas se sem remote).
6. **Rollback:** se CI pós-merge falhar, `git revert -m 1 <merge-sha>` em `develop`, documentar incidente.

> 📖 **Referência completa:** `docs/runbooks/merge-dnd-to-develop.md` — runbook validado em 2026-06-04 com merge real de `feat/dnd-e2e-coverage` → `develop`.

### Branch Estratégica de Refactor — `feat/dsv2-reform`
- **Estado (2026-06-04):** Branch original deletada. Conteúdo já em `develop` (commits 8c26b04, 5c2446d, ab9c441, bf24316, 288c90c).
- **Decisão:** Recriar a branch `feat/dsv2-reform` quando iniciar a próxima fase de refactor do Design System v2. **Não criar branch nova** com nome similar — usar a convenção `feat/dsv2-reform`.
- **Roadmap de referência:** `docs/roadmaps/design-system-reforma.md` (6 fases, 38 tarefas). Token governance em `docs/layers/ui/token-governance.md`.
- **Comando de recriação (quando aplicável):**
  ```bash
  git checkout develop
  git checkout -b feat/dsv2-reform
  # confirmar com: git log --oneline | head -1
  ```
- **Bloqueio:** Só recriar quando houver item P0/P1 de refactor DSv2 no BACKLOG. Não criar preemptivamente.

> ⚠️ **Convenção:** Todas as refatorações de Design System (DSv2) — tokens, componentes, migração de apps para `@projeto/ui` — DEVEM ser feitas em `feat/dsv2-reform`, nunca em branches ad-hoc. Isso preserva a história de refactor e facilita rollbacks.

## 🤖 AGENTE ÚNICO — ARQUITETO SÊNIOR FULL-STACK

Em reconhecimento ao desempenho excepcional, os 3 papéis foram consolidados em um único agente com autonomia total sobre todo o monorepo.

- **Postura:** Opera como arquiteto sênior full-stack — antecipa problemas de arquitetura, escalabilidade e manutenibilidade antes de codificar. Toma decisões técnicas que evitam retrabalho e garantem qualidade de produção.
- **Escopo:** Atua em **todas as pastas** do monorepo — `packages/types/`, `packages/ui/`, `packages/core/`, `apps/admin-web/`, `apps/aluno-mobile/`, `supabase/migrations/`, `docs/`.
- **Responsabilidades:**
  - Define contratos de dados, esquemas Zod e regras de negócio (`packages/types/`)
  - Projeta banco de dados, migrations SQL, políticas RLS (`supabase/migrations/`)
  - Configura Tamagui, tokens, componentes base e blocos do CMS (`packages/ui/`)
  - Monta telas, fluxos, hooks, conecta dados nos apps (`apps/admin-web/`, `apps/aluno-mobile/`)
  - Documenta decisões, planos e governança (`docs/`)
- **Regra:** Sempre que identificar código frágil, ausência de tratamento de erro, falta de tipos ou violação de boas práticas, DEVE refatorar imediatamente.

### 📋 GESTÃO DE STATUS DO BACKLOG (OBRIGATÓRIO)
- Ao iniciar a implementação de qualquer item no `docs/BACKLOG.md`, marque-o como `em andamento`.
- Ao concluir, substitua `[ ]` por `[x]`.
- Se precisar pausar (bloqueio externo, dependência, decisão pendente), registre o motivo e marque como `pausado`.

### ⏳ Diretriz de Leitura Preguiçosa Otimizada (Lazy Loading)
- Você está PROIBIDO de realizar buscas globais (globbing) ou ler múltiplos arquivos da pasta `docs/` ou `governance/` de forma simultânea no início do chat.
- A primeira leitura obrigatória é `governance/WORKFLOW.md` — ele determina o fluxo da sessão.
- Sempre que o usuário solicitar uma tarefa, analise o escopo e use o arquivo `governance/SYSTEM_MAP.md` para identificar os caminhos exatos dos arquivos de plano e skill necessários.
- Use a ferramenta MCP para ler exclusivamente os arquivos mapeados para a tarefa atual e ignore as demais pastas de documentação.
- Leia `governance/context/context_buffer.yaml` ao iniciar cada nova tarefa para obter o estado actual (exceto durante fluxos de refatoração ou correção de bugs).

## 🤖 ALGORITMO OBRIGATÓRIO DE GESTÃO DE CONTEXTO (WORKFLOW ATIVO)

> ⚠️ **REGRRA ABSOLUTA:** Toda task de implementação, refatoração ou correção DEVE começar pelo carregamento dos documentos. Nenhuma linha de código pode ser escrita antes da leitura completa dos P0 + P2 da camada.

Sempre que o usuário enviar uma nova mensagem ou comando, você DEVE executar rigorosamente os 4 passos abaixo na ordem exata, usando suas ferramentas MCP. O skill `document-loader` (ativado automaticamente) contém o checklist completo, e o subagent `document-loader` pode ser usado via `task` para leitura em lote.

### 🔄 PASSO 1: DIAGNÓSTICO E LEITURA PREGUIÇOSA (LAZY LOADING)
- **Leia `governance/WORKFLOW.md` primeiro** — ele define o fluxo da sessão com base no tipo de operação (FEATURE/BUG/REFACTOR/DOCUMENTATION/PLANNING).
- Use o MCP para ler `governance/SYSTEM_MAP.md` e localize a pasta da camada da tarefa.
- Use o MCP para ler `governance/context/context_buffer.yaml` para extrair o estado da última execução.
- **Leia TODOS os P0 obrigatórios** (já injetados como system prompt pelo `opencode.json`): AGENTS.md, FORBIDDEN_OPERATIONS.md, DESDO.md, Requisitos_plataforma.md, CONTEXT_HIERARCHY.md
- Use o MCP para ler a Skill e o Plano de Execução específicos da camada afetada (P2).
- **Registre no buffer quais documentos foram lidos** na seção `## 🕹️ Documentos Carregados via MCP`.

### 📝 PASSO 2: ATUALIZAÇÃO DA MEMÓRIA RAM (BEFORE-CODE)
- Antes de modificar qualquer código fonte, atualize o `governance/context/context_buffer.yaml`.
- Atualize o campo `current_task.status` com o objetivo imediato do turno.
- Atualize os `model_assignments` conforme o plano activo.

### 💻 PASSO 3: EXECUÇÃO CIRÚRGICA
- Escreva ou altere o código estritamente dentro da pasta permitida ao seu Agente.
- Se o usuário reportar erros de terminal (TypeScript/Lint/Zod), pare imediatamente.
- Escreva o erro detalhado na seção `## ⚠️ Impedimentos & Logs de Erro Recentes` do buffer.
- Tente a correção apenas após documentar o erro no buffer.

### 🧹 PASSO 4: CONSOLIDAÇÃO E PURGA (AFTER-CODE)
- Assim que o código compilar com sucesso, marque `[x]` na tarefa correspondente do plano.
- Execute `pnpm run validate:session` para verificar integridade do estado.
- Limpe a seção de `imported-tools` do buffer inserindo: "*Nenhum erro ativo.*"
- Execute o ritual de fim de sessão conforme regra #12: `pnpm run close:session`, buffer podado (≤ 50 linhas activas), backlog actualizado, testes verdes.
- Termine sua resposta exibindo o estado atual resumido do buffer e o consumo estimado da sessão.

### 📜 Protocolo de Registro Histórico de Longo Prazo
1. **Imutabilidade:** Os arquivos dentro de `docs/history/` são registros históricos. Você está PROIBIDO de alterar arquivos de sessões passadas.
2. **Geração de Saída:** Quando o usuário solicitar o encerramento ou resumo de uma sessão para transição de chat, sintetize os pontos em um formato denso contendo: Data, Objetivos Alcançados, Decisões Técnicas de Arquitetura e Estado do Repositório.
3. **Leitura Sob Demanda:** Você só deve ler a pasta `docs/history/` se o usuário solicitar explicitamente uma retrospectiva sobre o motivo de uma decisão tomada em sessões anteriores.
