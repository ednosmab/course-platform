# ADR-012: Cross-platform file convention (.tsx vs .native.tsx)

**Status:** Accepted  
**Data:** 2026-05-23  
**Contexto:** Monorepo com apps web (Next.js) e mobile (Expo) compartilhando componentes UI

---

## Decisão

O projeto adota a convenção de arquivos do React Native para código específico por plataforma:

- **`.tsx`** — Implementação compartilhada ou padrão web
- **`.web.tsx`** — Implementação específica para web
- **`.native.tsx`** — Implementação específica para mobile (Expo)

O componente `Icon` é o caso de uso primário: `Icon.tsx` usa `lucide-react` (web) e `Icon.native.tsx` usa `lucide-react-native` (mobile).

---

## Contexto

O monorepo contém duas aplicações finais (`apps/admin` web e `apps/student` mobile) que compartilham `packages/ui` e `packages/core`. O React Native bundler (Metro) e o web bundler (Next.js/Webpack) resolvem arquivos de forma diferente. A convenção `.native.tsx` / `.web.tsx` permite que o bundler correto escolha a implementação certa sem condicionais em runtime.

**Resolução do bundler:**
- **Metro (mobile):** Prefere `.native.tsx` > `.tsx`
- **Webpack/Next.js (web):** Prefere `.web.tsx` > `.tsx`

---

## Consequências

### ✅ Positivas
- Zero condicionais de plataforma em runtime — o bundler resolve em build time
- Código compartilhado permanece em `.tsx` sem poluição de platform checks
- Clareza para o desenvolvedor: o sufixo deixa explícita a plataforma alvo
- Compatível com Metro e Webpack sem configuração adicional

### ❌ Negativas
- Duplicação de código quando a diferença entre plataformas é pequena
- Arquivos com mesmo nome base mas sufixo diferente podem causar confusão inicial
- Necessidade de manter dois arquivos sincronizados para componentes com diferenças mínimas

---

## Referências

- `packages/ui/src/components/Icon.tsx` — Implementação web (lucide-react)
- `packages/ui/src/components/Icon.native.tsx` — Implementação mobile (lucide-react-native)
- `docs/Requisitos_plataforma.md` — Requisitos cross-platform
