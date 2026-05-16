# 🎬 SKILL: PROTOCOLO DE ANIMAÇÃO E TRANSIÇÃO (UX PREMIUM)

## 🎯 Objetivo
Garantir que a plataforma de cursos tenha uma experiência fluida, evitando mudanças bruscas de layout e guiando o olhar do aluno através de movimento intencional.

## 🏁 Princípios de Movimento
1. **Intencionalidade:** Animações devem destacar ações importantes (ex: conclusão de aula) ou guiar navegação, nunca distrair.
2. **Suavidade (Smoothing):** Mudanças de estado visual (ex: abrir um quiz) devem durar entre 150ms e 300ms.
3. **Feedback de Estado:** Use transições suaves para comunicar mudanças de conexão (Online <-> Offline) antes de alterar o conteúdo da tela.

## ⏱️ Tokens de Tempo (Tamagui)
- **Fast (150ms):** Micro-interações, hover de botões, checkboxes.
- **Normal (300ms):** Abertura de modais, transições de tela simples, expansão de menus.
- **Slow (500ms):** Feedbacks de erro críticos, animações de sucesso (congratulações).

## 🎭 Padrões de Componentes
- **Entrada de Blocos:** Ao renderizar a aula, os blocos devem aparecer com um leve `translateY` (subindo) e `opacity` (0 -> 1).
- **Skeleton Pulse:** Skeletons de carregamento devem pulsar suavemente em ciclos de 1.5s.
- **Graceful Redirect:** Ao expirar sessão, exiba um Toast por 1.5s antes de executar o `router.replace('/login')` com um fade-out.

## 📂 Onde Aplicar
- `packages/ui/`
- Transições de rotas no Next.js/Expo.
