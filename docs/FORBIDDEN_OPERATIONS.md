# 🚫 OPERAÇÕES PROIBIDAS — REGRAS VINCULANTES PARA IA

> Este arquivo contém **regras absolutas e vinculantes** que a IA deve seguir em TODAS as sessões.
> Violações resultam em inconsistência arquitetural e retrabalho.
> **Leitura obrigatória** no bootstrap de toda sessão (ver `docs/AGENTS.md`).

---

## 1. Violações de Camada (Boundary)

| # | Regra | Justificativa |
|---|---|---|
| F-01 | **PROIBIDO** lógica de domínio em `packages/ui` | UI é puramente visual; regras de negócio devem estar em `packages/core` |
| F-02 | **PROIBIDO** acesso direto ao Supabase no Renderer | Renderer é stateless; dados devem vir via props |
| F-03 | **PROIBIDO** imports cruzados entre apps (`admin` ← `student`) | Cada app é independente; compartilhar via `@projeto/*` |
| F-04 | **PROIBIDO** schemas Zod inline fora de `packages/types` | Schemas são contratos compartilhados; devem estar centralizados |
| F-05 | **PROIBIDO** SQL ou queries Supabase fora da camada de dados (core/apps) | Apenas `supabase/migrations/` e serviços autorizados |
| F-06 | **PROIBIDO** acoplar estado global ao Renderer | Renderer deve ser puramente funcional; estado via props |

## 2. Violações de Código e Dependências

| # | Regra | Justificativa |
|---|---|---|
| D-01 | **PROIBIDO** instalar dependências sem justificativa documentada no buffer | Evita inchaço e conflitos de versão |
| D-02 | **PROIBIDO** modificar `package.json` fora de uma sessão dedicada | Toda mudança de dependência deve ser isolada e testada |
| D-03 | **PROIBIDO** usar Tailwind, Sass, CSS inline ou `StyleSheet.create()` | Estilização exclusiva via **Tamagui** em `packages/ui`. **Exceção única:** `CertificatePrint.css` para `@page`/`@media print` (ver `token-governance.md`). |
| D-04 | **PROIBIDO** sobrescrever documentação sem merge semântico | Documentação deve ser atualizada com diff explícito |

## 3. Violações de Workflow e Git

| # | Regra | Justificativa |
|---|---|---|
| G-01 | **PROIBIDO** fazer `git commit` ou `git push` sem autorização explícita do usuário | O usuário deve testar localmente antes |
| G-02 | **PROIBIDO** fazer commit sem passar pelos 4 passos do algoritmo de gestão de contexto | Garante rastreabilidade e consistência |
| G-03 | **PROIBIDO** mesclar branches sem validação de CI | A branch `develop` deve estar sempre verde |
| G-04 | **PROIBIDO** sobrescrever `docs/history/` (registros imutáveis) | Histórico é preservado para auditoria |
| G-05 | **PROIBIDO** executar steps com modelo diferente do atribuído no plano | O executor DEVE usar exactamente o modelo indicado no step; violações causam drift técnico e quebram a rastreabilidade |

## 4. Violações de Banco de Dados

| # | Regra | Justificativa |
|---|---|---|
| DB-01 | **PROIBIDO** mutar JSONB sem validação Zod prévia | JSONB sem validação quebra a árvore de componentes |
| DB-02 | **PROIBIDO** criar migrações sem índice para as colunas de filtro RLS | RLS sem índice causa degradação em escala |
| DB-03 | **PROIBIDO** expor chaves ou secrets em código ou logs | LGPD e segurança — usar variáveis de ambiente |

## 5. Violações de Performance e Escala

| # | Regra | Justificativa |
|---|---|---|
| P-01 | **PROIBIDO** queries N+1 não resolvidas | Impacta diretamente os 10k usuários simultâneos |
| P-02 | **PROIBIDO** ausência de cache headers em endpoints GET públicos | Cada requisição extra sobrecarrega o servidor |
| P-03 | **PROIBIDO** ignorar rate limiting em operações críticas (login, creating content) | Proteção contra abuso e brute force |
| P-04 | **PROIBIDO** commits sem verificar impacto em escala | Verificar `docs/roadmaps/scalability-plan.md` |

## 6. Violações de Segurança

| # | Regra | Justificativa |
|---|---|---|
| S-01 | **PROIBIDO** renderizar HTML de CMS sem sanitização | XSS prevention — ver `docs/skills/security_xss_prevention.md` |
| S-02 | **PROIBIDO** ignorar RLS policies ao criar tabelas | Toda tabela deve ter RLS configurado |
| S-03 | **PROIBIDO** logar dados pessoais (CPF, email, senha) | LGPD — logs devem ser anonimizados |

## 7. Violações de Configuração de Ambiente

| # | Regra | Justificativa |
|---|---|---|
| ENV-01 | **PROIBIDO** propagar flags de teste (E2E_*, MOCK_*, BYPASS_*) para `.env*`, `next.config.*`, `vercel.json`, `wrangler.toml`, `netlify.toml` ou qualquer config de deploy | Tais flags desactivam controles de segurança no edge (ex: `E2E_BYPASS_AUTH` desactiva `supabase.auth.getUser()` no middleware, expondo todas as rotas protegidas). A whitelist única é `playwright.config.ts` → `webServer.env`. Validação automatizada em `scripts/check-test-env-vars.sh` (integrado em `pnpm run verify` e nos workflows CI/CD). Documentação completa em `docs/skills/e2e_testing.md`. |

## 8. Violações de Higiene de Processo

| # | Regra | Justificativa |
|---|---|---|
| DT-01 | **PROIBIDO** manter item de backlog com status "Adiado" ou "Pausado" sem data `[REVISIT: YYYY-MM-DD]` | Itens sem data perdem-se na memória institucional; ninguém revisita o que não tem prazo |
| DT-02 | **PROIBIDO** declarar sessão como concluída com working tree contendo ficheiros modificados ou untracked não relacionados à tarefa | Edições concorrentes invisíveis são a causa #1 de conflitos silenciosos e drift técnico |
| DT-03 | **PROIBIDO** adicionar item "adiado" no BACKLOG sem registar a causa raiz do adiamento | Adiar sem diagnosticar esconde o problema real |
| DT-04 | **PROIBIDO** iniciar tarefa de prioridade inferior quando existe P0 activo, excepto com adiamento datado registado no buffer e no backlog | Respeitar a fila é pré-requisito de disciplina arquitectural |
| DT-05 | **PROIBIDO** implementar optimização de performance, cache, escalabilidade ou infraestrutura sem métricas que a justifiquem | Excepto itens P0 (risco activo). Ver princípio "Medir antes de optimizar" em AGENTS.md |

---

## 9. Violações de Confidencialidade Comercial

| # | Regra | Justificativa |
|---|---|---|
| CONFID-01 | **PROIBIDO** mencionar nomes de empresas-alvo, parceiros em negociação, entidades do sector-alvo, ou qualquer informação comercialmente sensível em código, commits, BACKLOG, ADRs, SDRs, feedback, buffer de contexto, ou qualquer artefato versionado | Expor nomes de clientes-alvo ou estratégia de go-to-market no repositório compromete negociações comerciais e viola o princípio de separação entre produto e estratégia de vendas. Esta regra aplica-se mesmo em comentários, mensagens de commit, JSDoc, e histórias de utilizador |

---

## Consequências de Violação

| Nível | Consequência |
|---|---|
| **Crítica** (F-01 a F-06, S-01 a S-03, ENV-01, CONFID-01) | Commit rejeitado + correção imediata obrigatória |
| **Alta** (D-01 a D-04, DB-01 a DB-03) | Rollback + documentação do erro no buffer |
| **Média** (G-01 a G-05, P-01 a P-04, DT-01 a DT-04) | Alerta + correção antes do próximo commit |

> ⚠️ A IA DEVE ler este arquivo **integramente** no início de toda sessão (P0 obrigatório).
> Qualquer violação detectada pela IA em código existente DEVE ser reportada ao usuário para correção.
