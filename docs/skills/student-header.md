# 🎨 SKILL: STUDENT HEADER — Padrão de Cabeçalho Compartilhado

## 🎯 Objetivo
Implementar o cabeçalho do app student seguindo o padrão visual e comportamental definido no ADR-020.

## 📐 Referência
- **ADR-020:** `docs/adrs/ADR-020-shared-header-pattern.md`
- **Componente:** `apps/student/src/components/StudentHeader.tsx`

## 🧱 Estrutura

### Props Interface
```typescript
interface StudentHeaderProps {
  userProfile: { full_name: string; email: string } | null;
  onLogout: () => void;
  onTabAction: (action: string) => void;
  activeTab: string;
}
```

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ [BrandMark]  [Tab] [Tab] [Tab] [Tab]    🔔  [Avatar ▼] │
│              ← nav items →              bell  user menu │
└─────────────────────────────────────────────────────────┘
```

### Dimensões
| Elemento | Valor |
|---|---|
| Root height | `64px` |
| Root padding | `px={24}` |
| Root border | `borderBottomWidth={1} borderBottomColor="$border"` |
| Root bg | `bg="$background"` |
| Nav gap | `gap={32}` |
| Nav items gap | `gap={4}` |
| Nav item padding | `px={12} py={6}` |
| Avatar size | `w={24} h={24} br={4}` |
| Dropdown minWidth | `180px` |

## 📝 Padrões Compartilhados (14)

### 1. Props
| Prop | Tipo | Descrição |
|---|---|---|
| `userProfile` | `{ full_name: string; email: string } \| null` | Dados do perfil |
| `onLogout` | `() => void` | Callback pós-logout |

### 2. Cálculo de Iniciais
```typescript
const initials = userProfile?.full_name
  ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  : '--';
```

### 3. Logout Flow
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

### 4. Click-Outside Detection
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

### 5. User Menu Trigger
```tsx
<XStack
  ai="center" gap={8} px={10} py={6}
  borderRadius={6} borderWidth={1} borderColor="$border"
  backgroundColor="$background" cursor="pointer"
  hoverStyle={{ backgroundColor: '$secondary' }}
  pressStyle={{ scale: 0.97 }}
  onPress={() => setShowUserMenu(!showUserMenu)}
>
  <XStack w={24} h={24} br={4} bg="$accent" ai="center" jc="center">
    <Text fontSize={11} fontWeight="600" color="$accentForeground">{initials}</Text>
  </XStack>
  <Text fontSize={14} color="$text" $sm={{ display: 'none' }}>{firstName}</Text>
  <Icon name="ChevronDown" size={14} color="$textMuted" />
</XStack>
```

### 6. User Menu Dropdown
```tsx
<YStack
  position="absolute" top="100%" right={0} marginTop={4}
  bg="$popover" borderWidth={1} borderColor="$border"
  br="$3" p="$2" minWidth={180} zIndex={999}
>
  <XStack
    ai="center" gap="$2" px="$3" py="$2" br="$2"
    cursor="pointer"
    hoverStyle={{ bg: '$surface' }}
    pressStyle={{ bg: '$surface', opacity: 0.9 }}
    onPress={handleLogout}
  >
    <Icon name="LogOut" size={16} color="$textMuted" />
    <Text fontSize={14} color="$danger">Sair</Text>
  </XStack>
</YStack>
```

### 7. Active Indicator
```tsx
{isActive && (
  <XStack
    position="absolute" bottom={0} left={12} right={12}
    height={2} bg="$primary" borderRadius={1}
  />
)}
```

## ⚠️ Especificidades do Student

| Aspecto | Student | Admin |
|---|---|---|
| BrandMark | `@projeto/ui` (shared) | `./brand-mark` (local, next/image) |
| Routing | `onTabAction` callback | `useRouter`/`usePathname` |
| Nav config | `NAV_TABS[].action` | `NAV_ITEMS[]` string |
| Mobile menu | `ScrollView horizontal` | (none) |
| `useMedia` | Sim | Não |
| Display name | `firstName` (primeiro nome) | `displayName` (nome completo) |

## 📂 Ficheiros Relacionados
- `apps/student/src/components/StudentHeader.tsx`
- `apps/student/src/screens/StudentDashboard.tsx`
- `apps/student/src/screens/StudentCourses.tsx`
- `packages/ui/src/components/BrandMark.tsx`
- `docs/adrs/ADR-020-shared-header-pattern.md`

## ✅ Checklist de Implementação
- [ ] Props `userProfile` e `onLogout` definidas
- [ ] Cálculo de iniciais com fallback `'--'`
- [ ] Logout flow: `AuthService.logout()` → `onLogout()`
- [ ] SSR guard no click-outside
- [ ] Menu do usuário com tokens Tamagui (zero hex, zero HTML)
- [ ] Active indicator: 2px `$primary` underline
- [ ] `$sm={{ display: 'none' }}` no nav e no nome
- [ ] Bell icon com red dot badge
- [ ] `pnpm run verify:ui` passa
