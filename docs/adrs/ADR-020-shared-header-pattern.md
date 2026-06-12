# ADR-020: Padrão de Header Compartilhado (Admin + Student)

**Status:** Aceito
**Data:** 2026-06-10
**Contexto:** Monorepo híbrido (Next.js + Expo), Design System compartilhado (Tamagui)
**Autor:** Edson (com assistência IA)

---

## Decisão

**Padrão visual compartilhado entre Admin e Student Headers, com divergências arquitecturais documentadas.**

O AdminHeader foi refactorado para alinhar ao padrão do StudentHeader:
- Substituir HTML `<ul>/<a>` por componentes Tamagui (`YStack`, `XStack`)
- Substituir hex hardcoded por tokens (`$border`, `$background`, `$secondary`)
- Props idênticas (`userProfile`, `onLogout`)
- Logout flow idêntico (`AuthService.logout()` → callback)
- Click-outside com SSR guard

---

## Contexto

### Problema

O AdminHeader e StudentHeader foram desenvolvidos independentemente, resultando em:

1. **Violações D-03:** AdminHeader usava HTML `<ul>/<a>` com CSS inline e hex hardcoded (`#DEE1EB`, `#FFFFFF`, `#F7F8FC`)
2. **Sem contrato:** Não havia definição do que é compartilhável vs divergente
3. **Duplicação:** Lógica de avatar, menu dropdown, e logout duplicada

### Fatores Técnicos

| App | Framework | Routing | BrandMark |
|---|---|---|---|
| Admin | Next.js App Router | `useRouter`/`usePathname` | Local (`next/image` + `priority`) |
| Student | Expo Router | Callbacks `onTabAction` | Shared (`@projeto/ui` + `expo-asset`) |

---

## Contrato Compartilhado (14 padrões idênticos)

### Props Interface

| Prop | Tipo | Descrição |
|---|---|---|
| `userProfile` | `{ full_name: string; email: string } \| null` | Dados do perfil do usuário |
| `onLogout` | `() => void` | Callback chamado após `AuthService.logout()` |

### Cálculo de Iniciais

```typescript
const initials = userProfile?.full_name
  ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  : '--';
```

### User Menu Trigger

| Elemento | Especificação |
|---|---|
| Container | `YStack ref={menuRef} position="relative"` |
| Trigger | `XStack ai="center" gap={8} px={10} py={6} borderRadius={6} borderWidth={1} borderColor="$border" backgroundColor="$background" cursor="pointer" hoverStyle={{ backgroundColor: '$secondary' }} pressStyle={{ scale: 0.97 }}` |
| Avatar | `XStack w={24} h={24} br={4} bg="$accent" ai="center" jc="center"` |
| Iniciais | `Text fontSize={11} fontWeight="600" color="$accentForeground"` |
| Nome | `Text fontSize={14} color="$text" $sm={{ display: 'none' }}` |
| Chevron | `Icon name="ChevronDown" size={14} color="$textMuted"` |

### User Menu Dropdown

| Elemento | Especificação |
|---|---|
| Container | `YStack position="absolute" top="100%" right={0} marginTop={4} bg="$popover" borderWidth={1} borderColor="$border" br="$3" p="$2" minWidth={180} zIndex={999}` |
| Logout | `XStack ai="center" gap="$2" px="$3" py="$2" br="$2" cursor="pointer" hoverStyle={{ bg: '$surface' }} pressStyle={{ bg: '$surface', opacity: 0.9 }}` |
| Ícone | `Icon name="LogOut" size={16} color="$textMuted"` |
| Texto | `Text fontSize={14} color="$danger">Sair</Text>` |

### Logout Flow

```typescript
const handleLogout = async () => {
  try {
    await AuthService.logout();
  } catch {
    // proceed even if signOut fails
  }
  onLogout();
};
```

### Click-Outside Detection

```typescript
useEffect(() => {
  if (typeof document === 'undefined') return; // SSR guard
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !(menuRef.current as any).contains?.(e.target as Node)) {
      setShowUserMenu(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Root XStack

| Prop | Valor |
|---|---|
| `position` | `"sticky" top={0} zIndex={40}` (admin apenas) |
| `style` | `{ backdropFilter: 'blur(12px)' }` (admin apenas) |
| `borderBottomWidth` | `1` |
| `borderBottomColor` | `"$border"` |
| `bg` | `"$background"` |
| `px` | `24` |
| `height` | `64` |
| `ai` | `"center"` |
| `jc` | `"space-between"` |

### Nav Items

| Prop | Valor |
|---|---|
| Container | `XStack ai="center" gap={4} $sm={{ display: 'none' }}` |
| Item | `XStack px={12} py={6} borderRadius={6} cursor="pointer" hoverStyle={{ backgroundColor: '$secondary' }} position="relative"` |
| Texto inativo | `Text fontSize={14} color="$textMuted" fontWeight="400"` |
| Texto ativo | `Text fontSize={14} color="$text" fontWeight="600"` |
| Indicator | `XStack position="absolute" bottom={0} left={12} right={12} height={2} bg="$primary" borderRadius={1}` |

### Bell Icon

| Elemento | Especificação |
|---|---|
| Container | `XStack position="relative" p={8} borderRadius={6} cursor="pointer"` |
| Ícone | `Icon name="Bell" size={16} color="$textMuted"` |
| Badge | `XStack position="absolute" right={6} top={6} w={6} h={6} borderRadius={3} bg="$primary"` |

---

## Divergências Arquitecturais (7)

### 1. Directive: `'use client'`

| AdminHeader | StudentHeader |
|---|---|
| `'use client'` | (none) |

**Razão:** Next.js App Router usa Server Components por padrão. Quando um componente precisa de `useState`, `useEffect`, ou eventos do DOM, precisa da diretiva `'use client'`. Expo não tem este conceito — todos os componentes são client-side.

---

### 2. Routing: `useRouter`/`usePathname` vs callbacks

| AdminHeader | StudentHeader |
|---|---|
| `useRouter`/`usePathname` (next/navigation) | `onTabAction` callback prop |
| `router.push('/cursos')` | `onTabAction('courses')` |

**Razão:** O admin é uma SPA web com rotas HTTP reais. O student é um app mobile com file-based routing + hooks internos diferentes.

---

### 3. Sticky/Blur (admin apenas)

| AdminHeader | StudentHeader |
|---|---|
| `position="sticky" top={0} zIndex={40}` | (none) |
| `style={{ backdropFilter: 'blur(12px)' }}` | (none) |

**Razão:** O admin é desktop-first — o usuário navega listas longas de cursos, precisa do header sempre visível. O student é mobile-first — o conteúdo geralmente preenche a tela inteira (video player, dashboard).

---

### 4. BrandMark: Local vs Shared

| AdminHeader | StudentHeader |
|---|---|
| `import { BrandMark } from './brand-mark'` | `import { BrandMark } from '@projeto/ui'` |
| `next/image` + `priority` | `expo-asset` pipeline |

**Razão:** O admin usa `next/image` com `priority` para optimização de LCP (Largest Contentful Paint). O BrandMark de `@projeto/ui` usa `expo-asset`, que não funciona com `next/image`.

**Trade-off:** Duplicação de código (brand-mark.tsx) vs performance (LCP optimization).

---

### 5. Nav Shape: String vs Object

| AdminHeader | StudentHeader |
|---|---|
| `NAV_ITEMS = ['Painel', 'Cursos', ...]` | `NAV_TABS = [{ label, action }]` |
| `isActive(label)` com pathname | `isActive = tab.action === activeTab` |

**Razão:** O admin usa pathname para detectar rota ativa (`pathname.startsWith('/cursos')`). O student usa `activeTab` como prop porque o Expo Router não expõe pathname da mesma forma.

---

### 6. Responsive: `$sm` sem `useMedia`

| AdminHeader | StudentHeader |
|---|---|
| `$sm={{ display: 'none' }}` (CSS only) | `$sm` + `useMedia` + `ScrollView` mobile |

**Razão:** O admin é desktop-only — `$sm` do Tamagui funciona via CSS media queries, sem precisar de JavaScript. O student precisa de `useMedia` porque tem um `ScrollView` horizontal para mobile.

---

### 7. Display Name: Full vs First

| AdminHeader | StudentHeader |
|---|---|
| `displayName` (nome completo) | `firstName` (primeiro nome) |

**Razão:** Decisão de UI — o admin tem mais espaço horizontal (desktop) e mostra mais informação. O student é mobile-first e economiza espaço.

---

## Consequências

### Positivas

- **Correção D-03:** Violações de HTML inline e hex hardcoded eliminadas
- **Contrato claro:** 14 padrões idênticos documentados para futuros headers
- **Base para skills:** ADR serve como referência para `student-header.md` e `admin-header.md`
- **Consistência visual:** Ambos os headers agora são visualmente idênticos

### Negativas

- **Manutenção síncrona:** Alterações no padrão devem ser feitas em ambos os apps
- **Duplicação de BrandMark:** `brand-mark.tsx` (admin) vs `BrandMark.tsx` (shared) — mas justificada por LCP

---

## Validação

Antes de qualquer PR que modifique os Headers, verificar:

- [ ] AdminHeader e StudentHeader usam o mesmo padrão visual
- [ ] Todos os 14 padrões idênticos estão implementados
- [ ] Todas as 7 divergências estão documentadas neste ADR
- [ ] Skills `student-header.md` e `admin-header.md` referenciam este ADR
- [ ] `pnpm run verify:ui` passa em ambos os apps
- [ ] `pnpm run test` passa (92/92 admin)

---

## Alternativas Consideradas

### Componente único compartilhado em `@projeto/ui`

- **Prós:** DRY total, uma única fonte de verdade
- **Contras:** Acoplaria Next.js ao Expo; impossível usar `useRouter`/`usePathname` no shared component
- **Decisão:** Rejeitado

### Manter headers independentes

- **Prós:** Flexibilidade total, sem acoplamento
- **Contras:** Duplicação de código, inconsistência visual, violações D-03
- **Decisão:** Rejeitado

### **Padrão visual + divergências documentadas**

- **Prós:** Equilíbrio DRY/flexibilidade, contrato claro
- **Contras:** Requer documentação (este ADR)
- **Decisão:** **Adotado**

---

## Referências

- `apps/admin/src/components/AdminHeader.tsx` — versão refactorada
- `apps/student/src/components/StudentHeader.tsx` — padrão de referência
- `apps/admin/src/components/brand-mark.tsx` — BrandMark local (LCP)
- `packages/ui/src/components/BrandMark.tsx` — BrandMark compartilhado
- `apps/admin/src/app/page.tsx` — consumer Dashboard
- `apps/admin/src/app/cursos/page.tsx` — consumer Cursos
- `AGENTS.md` regra D-03 — proibição de CSS inline e hex hardcoded
- `FORBIDDEN_OPERATIONS.md` secção 2 — Violações de Código
