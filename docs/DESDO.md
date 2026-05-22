# DIRETRIZES DE ENGENHARIA DE SOFTWARE E DEFENSA OPERACIONAL
## Papel do Agente: Desenvolvedor Pleno/Sênior sob supervisão de Tech Lead & QA

Este documento consolida as regras de governança, mitigações operacionais e padrões arquiteturais que devem ser observados rigorosamente em cada interação, geração de código ou alteração de estado no projeto do CMS de Cursos.

---

## 1. FLUXO DE TRABALHO E ATOMICIDADE DO BACKLOG
* **Workflow Estrito:** Proibido pular etapas. O fluxo obrigatório para qualquer funcionalidade é: **Especificação Conceitual ➔ Alinhamento de Arquitetura ➔ Escrita da Suíte de Testes ➔ Implementação do Código ➔ Validação Local**.
* **Atomicidade do Backlog:** O agente gerencia o status do assunto no arquivo de backlog, mas **não tem autonomia** para criar subtarefas fantasmas ou alterar o escopo macro sem autorização expressa do usuário.
* **Definition of Done (DoD):** Um item só pode ter seu status alterado para `Done` (Concluído) após:
  1. Validação estrita de tipos e esquemas.
  2. Execução e passagem de 100% da suíte de testes unitários/integração (`npm test` ou equivalente).
  3. Atualização obrigatória do `context_map`.

---

## 2. MANUTENIBILIDADE, SOLID E CLEAN ARCHITECTURE
* **Inversão de Dependência (Supabase):** É terminantemente proibido injetar o cliente do Supabase (`supabase-js`) ou realizar chamadas diretas de banco dentro de componentes visuais (Next.js ou Expo). Toda comunicação com o banco deve ser abstraída em uma camada de **Repositório** ou **Serviço**.
* **Responsabilidade Única (SRP na UI):** Componentes de tela (React/React Native) devem ser puros e atômicos. Toda a lógica de gerenciamento de estado complexo ou mutações deve ser extraída para *Custom Hooks* ou isolada da camada de renderização.
* **Camada de Validação Unificada:** Todas as entradas e saídas de dados nas rotas de API do Next.js, formulários e payloads do Expo devem ser validadas estritamente utilizando **Zod**, garantindo a integridade dos dados antes de atingirem as camadas de negócio e persistência.
* **Princípio DRY na UI:** Tokens de design (cores, espaçamento, tipografia) devem ser centralizados. Componentes visuais do Design System devem ser reaproveitáveis e parametrizados via props.

---

## 3. ESTRATÉGIA DE TESTES E QUALIDADE (QA)
* **Testes Baseados em Métodos (Anti-Caixa Preta):** O agente deve, obrigatoriamente, fornecer ao usuário as **instruções de como testar** a funcionalidade entregue (cenários de teste, payloads de entrada esperados e comandos de execução).
* **Cenários de Exceção:** Suítes de teste em **Jest** não devem cobrir apenas o caminho feliz (*happy path*). É mandatório incluir testes de mutação conceituais, cenários de falha de rede, dados corrompidos bloqueados pelo Zod e violações de autenticação.
* **Resolução de Causa Raiz:** Ao ser confrontado com uma falha apontada pelo usuário, o agente está **proibido** de aplicar remendos superficiais (como `setTimeout` aleatórios ou supressão de linters). O agente deve explicar a causa raiz do problema e propor a correção arquitetural definitiva.

---

## 4. SEGURANÇA E AMBIENTE REAL (.ENV / SUPABASE)
* **Sanitização de Conteúdo Dinâmico (CMS):** Como a plataforma gera telas dinâmicas, o agente deve garantir a higienização rigorosa de qualquer dado inserido pelo usuário antes da renderização para evitar ataques de **XSS (Cross-Site Scripting)**.
* **Isolamento de Credenciais:** Nenhuma chave de API ou URL (`SUPABASE_ANON_KEY`, `SUPABASE_URL`) pode ser escrita de forma estática (*hardcoded*) no código. Todo o acesso deve ser feito estritamente via `process.env`.
* **Políticas de Row Level Security (RLS):** Ao projetar testes de integração reais que utilizam os ambientes de `.env` e `.env.local`, os testes devem prever e simular o estado de autenticação correto do usuário exigido pelas políticas de RLS do banco de dados do Supabase.
* **Mecanismos de Tear Down:** Suítes de testes que executam operações de escrita (Insert/Update/Delete) no ambiente real de desenvolvimento do Supabase devem, obrigatoriamente, limpar seus próprios rastros (usando `afterEach` ou `afterAll`), evitando a poluição de dados (*data pollution*).

---

## 5. GERENCIAMENTO DE MEMÓRIA E CONTEXTO
* **Sincronização Atômica:** Ao finalizar qualquer tarefa, o agente deve atualizar o `context_buffer` (memória curta) com a última interação e o status do backlog, e mapear os novos arquivos criados ou modificados no `context_map`.
* **Fechamento de Ciclo de Bug:** Após longas sessões de depuração, o agente deve consolidar o aprendizado gerando um micro-**SDR (Software Design Record)** em `docs/sdr/SDR-NNN.md` usando o template em `docs/sdr/SDR-TEMPLATE.md` para evitar que o erro se repita no futuro.

## 6. MITIGAÇÃO DE SISTEMA "CAIXA-PRETA" (LEGIBILIDADE E AUDITABILIDADE)
* **Código Declarativo e Simples:** O agente deve priorizar a máxima legibilidade em detrimento de concisão ou otimizações prematuras. Estruturas de código excessivamente complexas, aninhamentos profundos (*nested ifs*) ou truques de sintaxe obscuros são terminantemente proibidos.
* **Documentação Didática Obrigatória (JSDoc):** Todas as funções de negócio, hooks customizados, serviços e componentes do CMS devem conter documentação descritiva clara usando o padrão JSDoc. O comentário deve detalhar explicitamente:
  1. O propósito da função no contexto do CMS de Cursos.
  2. A regra de negócio que está sendo aplicada ali.
  3. A descrição dos dados de entrada (parâmetros/props) e de saída (retorno).
* **Autoexplicação Estratégica:** Caso uma linha de raciocínio ou integração com o Supabase/Next.js exija um padrão de código menos óbvio, o agente deve incluir comentários de linha (`//`) explicando o *porquê* daquela abordagem, e não apenas o *o que* o código faz.
* **Critério de Revisão Visual:** Antes de mover qualquer tarefa para `Done` no backlog, o agente deve garantir que um desenvolvedor que não domina a sintaxe escrita consiga ler os comentários e entender perfeitamente o fluxo lógico e a intenção do arquivo.

## 7. POLÍTICA DE DOCUMENTAÇÃO, COMENTÁRIOS E GOVERNANÇA DA BRANCH MAIN
* **Uso Mandatório de JSDoc/TSDoc na Main:** Todos os arquivos, funções de negócio, hooks customizados, esquemas do Zod e componentes UI devem subir para a branch `main` devidamente documentados com blocos `/** ... */`. Essa documentação é considerada um ativo de engenharia vital para a auditabilidade do Tech Lead.
* **Comentários de Regras de Negócio e Contexto (//):** É permitido e incentivado o envio de comentários de linha (`//`) para a `main`, desde que o propósito seja explicar o *motivo arquitetural* ou a regra de negócio por trás de uma implementação específica (ex: integrações complexas com o Supabase ou ciclo de vida no Expo/Next.js).
* **Proibição Absoluta de Código Morto:** É terminantemente proibido commitar ou mesclar na `main` trechos de código legados comentados (ex: blocos de código antigos desativados). O histórico do Git deve ser o único responsável por armazenar código deletado.
* **Higienização de Dados Sensíveis:** O agente deve garantir que nenhum comentário contenha credenciais, chaves de API reais, senhas de teste ou caminhos de diretórios locais do ambiente de desenvolvimento. Toda e qualquer configuração sensível deve ser referenciada via variáveis de ambiente (`process.env`).
* **Conformidade com a Minificação de Produção:** O agente deve programar sabendo que a suite de build do Next.js e do Expo irá expurgar os comentários no artefato final de produção. Portanto, os comentários no código-fonte devem focar 100% na clareza para o desenvolvedor humano/Tech Lead que inspeciona o repositório.

## 8. MOTOR DE RENDERIZAÇÃO DINÂMICA (PAYLOADS JSON & TAMAGUI)
* **Sanitização Estrita de Esquemas (Zod):** Todo payload JSON vindo do Supabase que descreva estruturas de tela deve passar obrigatoriamente por um esquema de validação estrito do Zod antes de atingir o interpretador. O agente deve rejeitar ou expurgar automaticamente qualquer propriedade que não esteja explicitamente mapeada como um token ou componente válido do Design System.
* **Proibição de Injeção Direta de Props:** É terminantemente proibido realizar o espalhamento direto e inseguro de propriedades vindas do JSON (ex: `<XStack {...componenteDoJson} />`) sem que as propriedades tenham sido higienizadas pelo Zod. Isso previne ataques de injeção de propriedades maliciosas que possam comprometer a segurança da aplicação Web ou Mobile.
* **Governança e Fidelidade ao Tamagui:** O interpretador de JSON deve mapear os elementos puramente para componentes e tokens de design do Tamagui (ex: `size="$4"`, `color="$background"`). O agente está proibido de gerar estilos inline dinâmicos ou injetar strings de CSS puro/StyleSheet nativo fora do ecossistema do Tamagui para renderizar o JSON.
* **Resiliência e Tratamento de Fallbacks (UX do Aluno):** O motor de renderização dinâmico no Expo e Next.js deve ser blindado por barreiras de erro (*Error Boundaries*). Caso o JSON contenha um tipo de componente ou propriedade desconhecida (ex: uma funcionalidade nova criada no CMS, mas indisponível em um app móvel desatualizado do aluno), o sistema não deve quebrar (*crash*). O agente deve obrigatoriamente renderizar um componente de *Fallback* amigável (ex: avisando que o elemento requer atualização do app) mantendo o restante da página funcional.
* **Alinhamento com o Fluxo do Lovable:** O agente deve usar as especificações visuais geradas pelo Lovable para estruturar os tokens e componentes equivalentes no Tamagui, garantindo que o interpretador JSON consiga traduzir perfeitamente a semântica visual criada no ambiente Web para a interface cross-platform.

