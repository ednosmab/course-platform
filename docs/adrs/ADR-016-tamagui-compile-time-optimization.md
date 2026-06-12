# ADR-016: Tamagui compile-time optimization (babel plugin, zero runtime CSS-in-JS)

**Status:** Aceito  
**Data:** 2026-05-23  
**Contexto:** Pacote `packages/ui/` + apps web/mobile  
**Autor:** Edson

---

## Decisão

> **O projeto adota Tamagui com compile-time Babel plugin (`tamagui-loader`) como única camada de estilização. Todo o CSS é extraído em tempo de build, resultando em zero runtime CSS-in-JS. Tokens são centralizados em `packages/ui/src/tokens/` e configurados via `tamagui.config.ts`.**

---

## Contexto

A estilização do monorepo precisa atender a três plataformas (web Next.js, mobile Expo, e futuros targets) com uma única base de código. As opções consideradas foram:

| Abordagem | Runtime CSS-in-JS | Suporte Cross-Platform | Bundle impact |
|---|---|---|---|
| StyleSheet.create() | Zero | Nativo React Native | Pequeno |
| styled-components | Sim (runtime CSS injection) | Web only (parcial RN) | Grande (injetor incluso) |
| Tailwind CSS | Zero | Web only | Médio (gerador de classes) |
| **Tamagui compile-time** | **Zero** | **Web + RN nativo** | **Pequeno (árvore extraída)** |

Tamagui com `tamagui-loader` (Babel plugin) transforma o `styled()` e a sintaxe de estilo em arquivos CSS estáticos durante o build. Em produção, o runtime Tamagui tem ~4KB gzipado e não executa lógica de estilo.

### Como funciona

1. **Tokens centralizados** em `packages/ui/src/tokens/` (cores, tipografia, espaçamento, radii)
2. **Configuração** em `tamagui.config.ts` que consome os tokens e gera o tema e os componentes
3. **Babel plugin** (`tamagui-loader`) em `babel.config.js` de cada app:
   - Web: `next.config.js` → `withTamagui`
   - Mobile: `babel.config.js` → `tamagui-loader`
4. **Build time:** O plugin analisa o AST, extrai todos os estilos usados, gera CSS estático e remove expressões de estilo do bundle runtime
5. **Resultado:** CSS puro no bundle final, sem `CSSStyleSheet.insertRule()`, sem costura de classes em runtime

---

## Consequências

### Positivas
- **Performance:** Zero layout shift causado por CSS-in-JS runtime — Tamagui é comparável a CSS modules tradicionais
- **Cross-platform real:** Um único `styled(Text)` funciona em web e mobile sem adaptadores
- **Type-safe:** Tokens tipados garantem que `$color.primary` válido em build — erro é capturado no compilador, não no navegador
- **Tree-shaking:** O plugin elimina estilos não usados do bundle final
- **DX consistente:** Desenvolvedor escreve `styled(YStack, { padding: '$4' })` — sem aprender Tailwind classes, sem vazar CSS global

### Negativas
- **Complexidade de build:** Configurar o Babel plugin corretamente nos três ambientes (web, mobile, Ladle) é frágil
- **Debugging:** Estilo extraído vira CSS hash — inspecionar no DevTools revela classes como `._t12r4` sem mapeamento óbvio
- **Hot reload:** Rebuild after token change é mais lento que runtime CSS-in-JS puro (precisa re-executar o plugin)
- **Vendor lock-in:** Trocar de framework de UI requer reescrever toda a estilização do zero
- **Tamanho do pacote:** O runtime Tamagui (~4KB) é mínimo, mas `@tamagui/core` e dependências não são zero — diferentemente de CSS puro

### Regras Obrigatórias

1. **Proibido** qualquer estilização fora do Tamagui — sem `<div>`, `<span>`, `<p>`, `<h1>`, `<button>` nos componentes de UI
2. **Proibido** valores hex/rgb hardcoded — use `$color` tokens do tema
3. **Proibido** `StyleSheet.create()` nos apps — use `styled()`, `YStack`, `XStack`, `Text`, `Button`
4. **Obrigatório** centralizar novos tokens em `packages/ui/src/tokens/` antes de usar
5. **Obrigatório** usar `<Icon name="..." />` de `@projeto/ui` — proibido importar diretamente de `lucide-react` ou `lucide-react-native`

---

## Referências

- `packages/ui/src/tokens/*.ts` — Tokens centralizados (cores, fontsize, spacing, radii)
- `packages/ui/tamagui.config.ts` — Configuração do tema e componentes base
- `apps/admin/next.config.js` — `withTamagui` plugin
- `apps/student/babel.config.js` — `tamagui-loader` plugin
- Tamagui compile-time docs (https://tamagui.dev/docs/guides/compile-time)
- `docs/roadmaps/design-system-reforma.md` — Plano de reforma do Design System (DSv2)
- `docs/skills/tamagui_ui.md` — Skill de estilização Tamagui
- `docs/AGENTS.md` — Seção "Princípio DRY de Estilização"
