# GOV-POLICY-operational-rules-v1: Regras Operacionais de Governança

## 🎯 1. Objetivo
Esta política regula o comportamento e as restrições cognitivas de todos os agentes inteligentes integrados ao servidor MCP filesystem do monorepo, visando garantir estabilidade técnica, segurança de dados e conformidade metodológica absoluta.

---

## 🚫 2. Proibições Absolutas (Forbidden Boundaries)
Qualquer violação das regras abaixo resultará em rejeição imediata do código pelo Reviewer ou interrupção do pipeline pelo Orquestrador:
1. **Nenhum Git Commit Autônomo:** É estritamente proibido realizar operações de `git commit` ou `git push` automáticas por agentes de IA. Toda alteração de código deve ser validada visual e localmente pelo usuário (Edson) e apenas submetida com autorização manual expressa por texto.
2. **Nenhuma Modificação de Histórico:** A pasta `docs/history/` é considerada uma trilha de auditoria imutável (ROM). Nenhum agente pode deletar ou modificar os logs de sessões passadas.
3. **Nenhum Estilo Fora do Tamagui:** É terminantemente proibido usar Tailwind CSS, Sass, CSS inline ou styled-components comuns na camada visual. Toda estilização deve usar os tokens e primitivos Tamagui configurados em `packages/ui`.
4. **Nenhum Input Sem Zod:** É proibida a criação de endpoints de API, payloads de mensagens Supabase ou blocos flexíveis de CMS que não passem por validação estrita (`.strict()`) do Zod no runtime.

---

## 📜 3. Metodologia de Commits
Quando autorizados, os commits sugeridos pelo Orquestrador devem respeitar rigorosamente a especificação do **Conventional Commits**:
* **Língua obrigatória:** Inglês.
* **Prefixo de Tipo:**
  * `feat: ...` (para novas funcionalidades de produção)
  * `fix: ...` (para correções de bugs)
  * `docs: ...` (para alterações exclusivas de documentação)
  * `chore: ...` (para tarefas de infraestrutura, builds ou dependências)
* **Concisão:** Títulos curtos e diretos ao ponto (ex: `feat: add student progress table`).

---

## 🔁 4. Fluxo de Tratamento de Erros e Impedimentos
Se qualquer comando de compilação (`pnpm run lint`) ou suíte de testes (`pnpm run test`) falhar durante a execução:
1. **Parada Imediata:** O Executor deve suspender as escritas cirúrgicas de imediato.
2. **Registro de Log:** O erro exato com stack trace completo deve ser escrito na seção `## ⚠️ Impedimentos & Logs de Erro Recentes` de [docs/context_buffer.md](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/docs/context_buffer.md).
3. **Correção:** A tentativa de correção só deve ser iniciada após a devida documentação e categorização do erro na memória RAM do buffer.
