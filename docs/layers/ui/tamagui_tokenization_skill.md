# Skill: Tokenização e Governança Tamagui

## 🎯 Objetivo
Padronizar a tokenização de cores, espaçamentos, tipografia e tamanhos no monorepo, garantindo responsividade adaptativa automática e compilação híbrida perfeita (Expo Mobile + Next.js Web).

---

## 🎨 1. Mapeamento Estrito de Cores e Temas
Para garantir uma interface de nível premium e visualmente deslumbrante (Wow Aesthetic):
1. **Harmonia HSL:** As cores primárias devem ser configuradas usando valores HSL ou hexadecimais elegantes (ex: Indigo profundo para o tom primário, cinzas de baixa saturação para fundos escuros, eliminando cinzas puros).
2. **Tokens Bloqueados (Locked Colors):**
   * `$primary`: Indigo Premium (`#4F46E5` / `hsl(243, 75%, 59%)`)
   * `$secondary`: Violeta Vibrante (`#7C3AED` / `hsl(258, 88%, 66%)`)
   * `$background`: Slate Profundo (`#0F172A` / `hsl(222, 47%, 11%)`)
   * `$surface`: Slate Escuro (`#1E293B` / `hsl(215, 27%, 17%)`)
   * `$text`: Off-White Puro (`#F8FAFC` / `hsl(210, 40%, 98%)`)

---

## 📐 2. Espaçamento Proporcional (base 4px)
Para evitar tamanhos arbitrários e desorganização visual, todo espaçamento, padding, margin e gap deve mapear estritamente nossa grade proporcional:
* `$1`: `4px`
* `$2`: `8px`
* `$3`: `12px`
* `$4`: `16px` (Padrão de respiro visual)
* `$5`: `20px`
* `$6`: `24px`
* `$8`: `32px`
* `$12`: `48px`
* `$16`: `64px`

---

## 🖥️ 3. Responsividade e Breakpoints do Design System
O Tamagui resolve a responsividade nativa usando ganchos de breakpoint estáticos:
* `xs`: width < 660px (Dispositivos móveis na vertical)
* `sm`: width < 800px (Móvel na horizontal / Tablets pequenos)
* `md`: width < 1024px (Tablets na horizontal)
* `lg`: width < 1280px (Laptops)
* `xl`: width < 1560px (Desktops de alta resolução)

**Padrão de escrita responsiva no Tamagui:**
```tsx
<Stack 
  padding="$4" 
  $gtSm={{ padding: '$6', flexDirection: 'row' }} 
  $gtLg={{ padding: '$8' }}
/>
```
---

## 📱 4. Regras de Otimização Cross-Platform (Web vs. Native)
* **Sem dependências exclusivas da Web:** Nunca importe `div`, `span`, `h1` ou qualquer elemento HTML dentro de componentes de `packages/ui`. Use sempre os wrappers abstratos do Tamagui (`Stack`, `XStack`, `YStack`, `Text`, `Heading`).
* **Estilos Dinâmicos:** Se propriedades dinâmicas forem alteradas do banco (Supabase blocks), utilize condicionais baseadas em propriedades inline do Tamagui para garantir a compilação nativa ultra veloz.
