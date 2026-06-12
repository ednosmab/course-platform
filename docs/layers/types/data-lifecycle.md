# Exportação de Conteúdo

## Rollback Seguro

- **Snapshots:** Antes de toda migração de schema, um snapshot do JSONB é salvo em `lesson_versions`
- **Rollback:** Restaura o snapshot anterior + versão do schema compatível
- **Tabela `lesson_versions`:** Armazena `{ lesson_id, version, blocks, created_at }` — retenção de 30 dias
- Gatilho automático: toda atualização em `lessons.blocks` cria um novo registro em `lesson_versions`

## Feature Flags

Flags em tabela `feature_flags` por organização:

| Flag | Default | Descrição |
|------|---------|-----------|
| `new_quiz_engine` | false | Motor de quiz atualizado com branching |
| `video_transcript` | false | Transcrição automática de vídeos |
| `ai_assistant` | false | Assistente IA para alunos |
| `certificate_custom` | false | Template customizado de certificado |

Flags avaliadas no backend (RPC) e cacheadas por 60s. Frontend consulta via `getEnabledFlags(orgId)`.

## Evolução de Schema

**Processo para alterar schema de bloco:**

1. Incrementar `version` no schema Zod
2. Adicionar função de migração em `migrations.ts`
3. Atualizar `defaultProps` se necessário
4. PR com migração + testes de compatibilidade reversa
5. Deploy: bloco antigo continua funcionando (migração runtime)

**Semantic versioning para schemas:**

| Tipo | Quando |
|------|--------|
| **Major** | Prop removida ou renomeada (requer migração) |
| **Minor** | Nova prop opcional adicionada |
| **Patch** | Validação mais restritiva, bugfix |
