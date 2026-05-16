# 📡 SKILL: ESTRATÉGIA OFFLINE-FIRST

## 🎯 Objetivo
Garantir que a plataforma seja resiliente a falhas de conexão e permita o consumo de conteúdos (especialmente no mobile) sem internet.

## 🛠️ Pilares da Estratégia
1. **Cache Local (TanStack Query):** Use `staleTime` e `gcTime` agressivos para manter dados de cursos e aulas disponíveis localmente.
2. **Persistência de Estado:** Utilize plugins de persistência (ex: `AsyncStorage` no mobile) para salvar o cache do Query Client entre sessões.
3. **Sincronização em Background:** Mudanças feitas offline (ex: marcar aula como concluída) devem ser enfileiradas e sincronizadas assim que a conexão retornar.
4. **Download de Mídia:** Para vídeos, implemente suporte a download via `Expo FileSystem` ou APIs nativas, salvando metadados no banco local.
5. **UI de Estado de Conexão:** Informe claramente ao usuário quando ele está offline e quais conteúdos estão disponíveis.

## 📂 Onde Aplicar
- `apps/aluno-mobile/`
- `packages/core/hooks/`
- Estratégias de Service Workers no Web.
