# 💻 SKILL: INTEGRAÇÃO E MONTAGEM DE APLICAÇÕES (AGENTE 3)

## 🎯 Objetivo
Orquestrar a união entre tipos (Agente 1) e componentes UI (Agente 2) para entregar fluxos de usuário funcionais e fluidos.

## 🚀 Fluxo de Desenvolvimento (Apps)
1. **Consumo de Dados:** Use hooks customizados do Supabase (`useQuery`, `useMutation`) para gerenciar o estado do servidor.
2. **Implementação do Canvas:** No Admin, implemente a lógica de drag-and-drop ou adição de blocos garantindo que o estado local reflita exatamente o schema JSONB.
3. **Player Mobile:** No app do aluno, foque na performance de renderização da árvore de componentes, usando `React.memo` ou `FlashList` onde necessário.
4. **Offline First:** Implemente estratégias de cache (React Query/TanStack Query) para permitir que o aluno visualize conteúdos já baixados sem conexão.
5. **Validação em Runtime:** Sempre valide a resposta do Supabase com o esquema Zod correspondente antes de passar os dados para os componentes Tamagui.

## 🛠️ Ferramentas Obrigatórias
- **TanStack Query:** Para sincronização de estado.
- **Zustand:** Para estados globais simples (ex: tema, sessão local).
- **Zod:** Para garantir que a aplicação não quebre com dados inesperados.

## 📂 Onde Aplicar
- `apps/admin-web/`
- `apps/aluno-mobile/`
- `packages/core/hooks/`
