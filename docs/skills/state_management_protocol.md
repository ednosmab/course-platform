# 🧠 SKILL: STATE MANAGEMENT PROTOCOL

## 🎯 Objetivo
Evitar a "sopa de estado global". Definir fronteiras claras entre o que é estado do servidor (cache de banco de dados) e o que é estado do cliente (UI efêmera).

## ⚖️ A Regra de Ouro: Server State vs Client State

### 1. Server State (TanStack Query)
**O que é:** Dados que residem no servidor (Supabase) e você precisa exibir na tela (ex: Lista de cursos, perfil do usuário, módulos da aula).
**Ferramenta:** `useQuery` e `useMutation` (TanStack Query).
**Regras:**
- NUNCA copie dados do React Query para o Zustand ou para `useState` (isso cria uma fonte de verdade duplicada e bugs de sincronização).
- Acesse os dados diretamente pelo hook do Query em qualquer componente que precisar. O React Query fará o deduplication automático.
- Use a skill de *Optimistic UI* nas mutations para resposta imediata.

### 2. Client State Global (Zustand)
**O que é:** Estado de interface que afeta múltiplas áreas do app, mas não é persistido no servidor (ex: Tema Dark/Light, Sidebar aberta/fechada, Rascunho atual do CMS não salvo).
**Ferramenta:** Zustand.
**Regras:**
- Crie stores pequenos e focados (ex: `useSidebarStore`, `useThemeStore`) em vez de um gigante `useAppStore`.
- Evite aninhamentos profundos no Zustand.

### 3. Client State Local (React useState)
**O que é:** Estado efêmero que só importa para um componente específico (ex: Modal aberto, texto digitado em um input antes do submit).
**Ferramenta:** `useState`, `useReducer`.
**Regras:**
- Mantenha o estado o mais próximo possível de onde ele é usado. Se apenas o componente X e seu filho usam, passe via props, não jogue no Zustand.

## 📂 Onde Aplicar
- `packages/core/stores/` (Zustand).
- `packages/core/hooks/` (React Query custom hooks).
