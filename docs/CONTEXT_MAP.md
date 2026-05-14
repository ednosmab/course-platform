# 🗺️ MAPA DE CONTEXTO - INFRAESTRUTURA DE EDUCAÇÃO COM CMS

Você deve consultar os arquivos abaixo via MCP *apenas quando* o usuário solicitar tarefas relacionadas ao escopo descrito. Não leia todos os arquivos de uma vez.

## 💾 1. Camada de Contratos de Dados (Packages/Types)
- **Escopo:** Mudanças nas tipagens TypeScript, esquemas de validação Zod, estruturas JSONB dos blocos e payloads de API.
- **Arquivos para ler se acionado:** 
  - `docs/layers/types/execution_plan.md`
  - `docs/layers/types/zod_strict_validation_skill.md`

## 🎨 2. Design System e Componentes Visuais (Packages/UI)
- **Escopo:** Configuração de tokens Tamagui, temas, componentes atômicos do Canvas (Texto, Vídeo, Quiz) e compilação Cross-Platform.
- **Arquivos para ler se acionado:**
  - `docs/layers/ui/execution_plan.md`
  - `docs/layers/ui/tamagui_tokenization_skill.md`

## 🛡️ 3. Persistência, Banco de Dados e Segurança (Supabase)
- **Escopo:** Migrations do PostgreSQL, tabelas de aulas, colunas JSONB, políticas RLS e Storage de mídias.
- **Arquivos para ler se acionado:**
  - `docs/layers/supabase/database_schema_plan.md`
  - `docs/layers/supabase/rls_governance_skill.md`

## 🌐 4. Aplicações Finais (Apps Admin-Web & Aluno-Mobile)
- **Escopo:** Telas do construtor visual (estilo Canva), hooks de consumo, sincronização de dados e roteamento no Next.js / Expo.
- **Arquivos para ler se acionado:**
  - `docs/layers/apps/admin_canvas_plan.md`
  - `docs/layers/apps/mobile_player_plan.md`
