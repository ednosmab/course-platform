# Plano: Tela de Conquistas (Student App)

**Data:** 2026-01-11
**Branch:** `feat/admin-cursos`
**Tipo:** FEATURE
**Foco:** Desktop-first (web)

---

## 🎯 Objectivo

Refatorar a tela de Certificados/Conquistas no student app para:
1. **Obrigatório:** Incluir `StudentHeader` em TODAS as telas do student (navegação do aluno)
2. Seguir os padrões do projecto (tipografia Montserrat, componentes `@projeto/ui`)
3. Exibir cards de certificados com proporção A4 (200x141px)
4. Criar modal de detalhes do certificado ao tocar no card
5. Corrigir o carregamento da fonte Montserrat no app mobile

> ⚠️ **Regra importante:** Todo e qualquer ecrã do student DEVE incluir `StudentHeader` para garantir a navegação consistente do aluno (Meu painel, Meus cursos, Explorar Cursos, Conquistas).

---

## 📋 Stack de Componentes

| Componente | Origem | Uso |
|---|---|---|
| `StudentHeader` | `apps/student/src/components/` | Header com navegação por tabs |
| `Card` | `@projeto/ui` | Container dos cards de certificado |
| `Text` | `@projeto/ui` | Tipografia (Montserrat via `$display`) |
| `Icon` | `@projeto/ui` | Ícones temáticos (troféu, certificado) |
| `Button` | `@projeto/ui` | Acções nos cards e modal |
| `ScrollView` | `@projeto/ui` | Scroll da página |
| `Dialog` | `tamagui` (re-exportar) | Modal de detalhes do certificado |

---

## 🖥️ Prioridade: Desktop-First

O desenvolvimento foca-se primeiro na visualização desktop (web). O `StudentHeader` deve ser renderizado corretamente em ecrãs large (>1024px) com:
- Navegação horizontal completa (4 tabs visíveis)
- Avatar + nome do utilizador no canto superior direito
- Sininho de notificações
- Layout com `maxWidth={1400}` centrado

A responsividade mobile será tratada posteriormente.

---

## 🔧 Passos de Implementação

### Step 1: Corrigir carregamento Montserrat no native
**Ficheiro:** `apps/student/app/_layout.tsx`

- Importar `useFonts` de `expo-font`
- Importar `@expo-google-fonts/montserrat`
- Adicionar hook `useFonts` antes do render
- Manter o `<link>` do Google Fonts para web

```tsx
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';

// Dentro do componente:
const [fontsLoaded] = useFonts({
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
});
```

**Verificação:** `npx expo start` → app carrega sem erros de fonte

---

### Step 2: Re-exportar Dialog do Tamagui
**Ficheiro:** `packages/ui/src/index.ts`

- Adicionar export do `Dialog` do tamagui
- Este componente será usado para o modal de detalhes

```tsx
export { Dialog } from 'tamagui';
```

**Verificação:** `pnpm run build` em `packages/ui`

---

### Step 3: Actualizar rota certificates.tsx
**Ficheiro:** `apps/student/app/(tabs)/certificates.tsx`

- Adicionar props de navegação (igual às outras rotas)
- Passar `onNavigateToDashboard`, `onNavigateToCourses`, `onNavigateToExplore`, `onLogout`

```tsx
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Certificates } from '../../src/screens/Certificates';

export default function CertificatesRoute() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Certificates
        onNavigateToDashboard={() => router.push('/')}
        onNavigateToCourses={() => router.push('/courses')}
        onNavigateToExplore={() => router.push('/explore')}
        onLogout={() => router.replace('/login')}
      />
    </SafeAreaView>
  );
}
```

**Verificação:** Rota carrega sem erros de tipos

---

### Step 4: Criar componente CertificateDetailCard
**Ficheiro:** `apps/student/src/components/CertificateDetailCard.tsx`

Componente para o conteúdo do modal de detalhes do certificado.

```tsx
type CertificateDetailCardProps = {
  certificate: CertificateWithCourse;
  onClose: () => void;
};
```

- Exibe miniatura do certificado (card estilizado)
- Mostra: título do curso, data de conclusão, código de validação
- Botões: Baixar PDF, Compartilhar, Validar
- Usa componentes `@projeto/ui` (Card, Text, Button, Icon)

---

### Step 5: Refatorar screen Certificates.tsx
**Ficheiro:** `apps/student/src/screens/Certificates.tsx`

Mudanças principais:

#### 5.1 ⚠️ ADICIONAR StudentHeader (OBRIGATÓRIO)
- Importar `StudentHeader` de `../components/StudentHeader`
- Adicionar state `userProfile` via `AuthService.getCurrentProfile()`
- Criar `handleTabAction` switch (igual às outras screens)
- Renderizar `<StudentHeader>` como PRIMEIRO filho dentro de `<YStack flex={1} bg="$background">`
- Props: `userProfile`, `onLogout`, `onTabAction={handleTabAction}`, `activeTab="certificates"`

**Padrão obrigatório (igual a Dashboard, Courses, Explore):**
```tsx
const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

useEffect(() => {
  (async () => {
    const profile = await AuthService.getCurrentProfile();
    if (profile) setUserProfile({ full_name: profile.full_name || '', email: profile.email || '' });
  })();
}, []);

const handleTabAction = (action: string) => {
  switch (action) {
    case 'dashboard':    onNavigateToDashboard(); break;
    case 'courses':      onNavigateToCourses(); break;
    case 'explore':      onNavigateToExplore(); break;
    case 'certificates': break; // já estamos aqui
  }
};

// Render:
<YStack flex={1} bg="$background">
  <StudentHeader userProfile={userProfile} onLogout={onLogout} onTabAction={handleTabAction} activeTab="certificates" />
  <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 32 }}>
    {/* conteúdo */}
  </ScrollView>
</YStack>
```

#### 5.2 Actualizar props
```tsx
type CertificatesProps = {
  onNavigateToDashboard: () => void;
  onNavigateToCourses: () => void;
  onNavigateToExplore: () => void;
  onLogout: () => void;
};
```

#### 5.3 Layout desktop-first
- Usar `maxWidth={1400} w="100%" als="center"` para contentor centrado
- Grid de cards com `XStack gap="$4" flexWrap="wrap"`
- Cada card: `w={200} h={141}` (proporção A4)
- Hero section no topo com stats (certificados, horas, categorias)
- Filtros de categoria + pesquisa

#### 5.4 Redesenhar cards para 200x141px
- Card com proporção A4 (1:1.414)
- Dimensões: `w={200} h={141}`
- Layout interno:
  - Ícone temático (troféu/medalha) no canto superior esquerdo
  - Título do curso (2 linhas máx.)
  - Data de conclusão
  - Badge "Autenticado"
- Fundo com gradiente (manter gradients existentes)
- `overflow="hidden"` e `br="$3"` para cantos arredondados

#### 5.5 Adicionar modal de detalhes
- State: `selectedCertificate: CertificateWithCourse | null`
- Ao tocar no card: `setSelectedCertificate(cert)`
- Renderizar `<Dialog>` quando `selectedCertificate` não é null
- Conteúdo do modal: `<CertificateDetailCard>`

**Verificação:** Tela carrega com StudentHeader, cards exibem correctamente, modal abre ao tocar

---

### Step 6: Actualizar context_buffer.yaml
**Ficheiro:** `governance/context/context_buffer.yaml`

- Atualizar `current_task.status` para "in_progress" → "completed"
- Documentar decisões técnicas

---

## 📐 Especificação Visual dos Cards

```
┌─────────────────────────────┐
│ 🏆                    ✓    │  ← Ícone + badge autenticado
│                             │
│  Título do Curso            │  ← Texto bold, 2 linhas máx
│  Concluído em 11/06/2026    │  ← Data em texto muted
└─────────────────────────────┘
         200 x 141px
```

Cores:
- Fundo: gradiente (manter existente)
- Texto: `$white` sobre gradiente
- Badge: `rgba(255,255,255,0.2)` com `$white`

---

## 📐 Especificação do Modal de Detalhes

```
┌─────────────────────────────────────┐
│  ✕                                  │  ← Botão fechar
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Miniatura do Certificado]│   │  ← Card 200x141 preview
│  └─────────────────────────────┘   │
│                                     │
│  Título do Curso Completo           │
│  Concluído em 11 de Junho de 2026  │
│                                     │
│  Código de validação:               │
│  XXXX-XXXX-XXXX-XXXX              │
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ Baixar   │ │ Compart. │         │  ← Botões de acção
│  │ PDF      │ │          │         │
│  └──────────┘ └──────────┘         │
└─────────────────────────────────────┘
```

---

## ✅ Critérios de Aceitação

### StudentHeader (Obrigatório)
- [ ] `StudentHeader` renderiza no topo da tela de Conquistas
- [ ] Navegação por tabs funciona (Meu painel, Meus cursos, Explorar Cursos, Conquistas)
- [ ] Tab "Conquistas" aparece activa (underline + texto bold)
- [ ] Avatar + nome do utilizador exibidos no header
- [ ] Sininho de notificações visível
- [ ] Layout desktop: maxWidth={1400}, centrado, navegação horizontal completa

### Cards de Certificado
- [ ] Cards têm proporção A4 (200x141px)
- [ ] Grid exibe cards em wrap com gap adequado ($4)
- [ ] Cada card mostra: ícone, título, data, badge "Autenticado"
- [ ] Fundo com gradiente (cores variadas por card)

### Modal de Detalhes
- [ ] Tocar no card abre modal (Dialog)
- [ ] Modal mostra: miniatura, título completo, data, código de validação
- [ ] Botões: Baixar PDF, Compartilhar
- [ ] Botão fechar (✕) funcional

### Tipografia e Estilo
- [ ] Fonte Montserrat aplicada em todos os textos (`fontFamily="$display"`)
- [ ] Todos os componentes usam `@projeto/ui` (sem div, span, CSS)
- [ ] Nenhum `console.error` ou `throw` em português
- [ ] `pnpm run build` passa sem erros

---

## 🔗 Referências

- **StudentHeader:** `apps/student/src/components/StudentHeader.tsx`
- **Padrão de screen (com StudentHeader):** `apps/student/src/screens/StudentDashboard.tsx`
- **Padrão de screen (com StudentHeader):** `apps/student/src/screens/StudentCourses.tsx`
- **Padrão de screen (com StudentHeader):** `apps/student/src/screens/StudentExplore.tsx`
- **Certificados actuais (SEM StudentHeader):** `apps/student/src/screens/Certificates.tsx`
- **Rota certificates:** `apps/student/app/(tabs)/certificates.tsx`
- **Layout root:** `apps/student/app/_layout.tsx`
- **Tamagui config:** `packages/ui/src/tamagui.config.ts`
- **Fontes Montserrat:** `packages/ui/src/tokens/typography.ts`
- **Skill StudentHeader:** `docs/skills/student-header.md`
