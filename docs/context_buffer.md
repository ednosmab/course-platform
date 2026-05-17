# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
CONSOLIDACAO_INFRA_E_TESTES

## 🎯 Tarefa Recente Concluída
- Resolução de bugs críticos de UX e UI no CMS (salvamento invisível, falta de responsividade) e no Portal do Aluno (Vídeos YouTube quebrando, gabarito vazado no Quiz).
- Implementação de uma Bateria de Testes E2E (Playwright) para blindar o fluxo híbrido (Admin Web e Aluno Mobile/Web) via Mocking total do Supabase sem poluir o ambiente em nuvem.

## 🕹️ Camada Ativa e Documentos Relevantes
- Camadas: Testing (E2E), CMS Editor (Admin Web), Portal do Aluno (App Mobile/Web)
- `tests/e2e/1-admin-cms.spec.ts`
- `tests/e2e/2-aluno-player.spec.ts`
- `playwright.config.ts`

## ✅ Resumo de Decisões e Entregas (Critérios de Aceite Atingidos)
- [x] O fluxo de salvamento do CMS utiliza `.upsert()` no Supabase em vez de `.update()` para lidar com aulas que acabaram de ser criadas na interface sem recarregar, evitando falhas "PGRST116".
- [x] O editor de Quiz no Admin Web foi aprimorado (`textarea` para a pergunta, tipografia e alinhamentos modulares injetados no esquema Zod).
- [x] O Quiz no Aluno Web implementa a UX de "Tentar Novamente": opções incorretas não entregam mais o gabarito. O aluno é obrigado a refazer se errar.
- [x] O Player do Aluno possui motor de renderização híbrida inteligente: Se a URL possui "youtube", injeta um `iframe`, se for um link direto de CDN (.mp4), renderiza com `expo-av`.
- [x] A Bateria de testes E2E do Playwright intercepta as rotas de API com `page.route` e entrega mocks validados pelo Zod (com base no header `Accept`), blindando a plataforma localmente (tempo de execução: <4s).

## ⚠️ Impedimentos & Logs de Erro Recentes
- *Nenhum erro ativo. Todos os testes E2E Playwright foram aprovados nas emulações Desktop Chrome (3000) e Mobile Chrome (8081).*

## Próxima Task
- Aguardando direcionamento do usuário. Sistema 100% blindado contra regressões nos fluxos validados. Próximo passo sugerido seria adicionar E2E para Auth (Autenticação) ou finalizar polimento do layout geral do CMS.
