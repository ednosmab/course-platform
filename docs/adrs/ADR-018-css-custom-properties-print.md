# ADR-018: CSS Custom Properties para Print — Estado Síncrono para window.print()

**Status:** Aceito
**Data:** 2026-05-29
**Contexto:** Preview e impressão de certificado na Config Page (`apps/admin/src/app/configuracoes/[courseId]/page.tsx`)
**Autor:** Edson

---

## Decisão

**Substituir estado React (`useState` + `useEffect` + `beforeprint`) por CSS Custom Properties (`--cert-print-scale`, `--cert-design-width`, `--cert-design-height`) lidas via `@media print` com `transform: scale(var(--cert-print-scale))` para garantir fidelidade síncrona na impressão.**

É proibido usar estado React para controlar escala ou visibilidade durante o fluxo de `window.print()`, pois o navegador captura o DOM síncronamente antes do re-render assíncrono do React.

---

## Contexto

O modal de preview do certificado exibia o canvas em tamanho real (ex: 1100×778px) e usava `transform: scale(previewScale)` via CSS-in-JS do React para caber na tela, onde `previewScale` era derivado de `ResizeObserver` + `useState`.

Para impressão, a abordagem inicial foi:

1. Um `useEffect` registrava `beforeprint`/`afterprint` listeners
2. `beforeprint` setava `setPrinting(true)` — um estado React
3. O componente lia `printing` e calculava `effectiveScale = A4_PRINT_W / certDesignWidth`
4. O `transform: scale(effectiveScale)` era aplicado via style inline React
5. `window.print()` era chamado

### O Problema

`window.print()` é **bloqueante e síncrono** no navegador. Quando disparado:

```
beforeprint → setPrinting(true) → React agenda re-render (microtask assíncrona)
                                 → window.print() executa (SÍNCRONO)
                                 → DOM capturado AINDA COM escala de preview antiga (~0.3)
```

O navegador capturava o **DOM atual** (com a escala pequena de preview) porque o re-render do React ainda não havia ocorrido. Resultado: certificado impresso minúsculo e deslocado para o canto superior esquerdo.

### Tentativas Anteriores (Rejeitadas)

- **Force `scale=1` via `printing` state**: Mesmo problema — o estado não estava atualizado no DOM no momento da captura.
- **Manipular DOM via ref no `beforeprint`**: Funcionava com `useRef` + `el.style.transform = '...'`, mas quebrava a previsibilidade declarativa do React e poderia ser sobrescrito por re-renders posteriores.
- **Aumentar área do modal + esconder via `visibility: hidden`**: Resolvia parcialmente mas gerava quebras de página por elementos invisíveis manterem espaço no layout.

---

## Solução Adotada

### CSS Custom Properties + `@media print`

Em vez de calcular a escala de impressão via estado React e esperar re-render, os valores são **setados como variáveis CSS no JSX** (`style={{ '--cert-print-scale': 1123 / certDesignWidth } as React.CSSProperties}`). Essas variáveis existem no DOM **desde o momento da montagem**, antes de qualquer `window.print()`.

No `@media print`, o CSS nativo lê as variáveis:

```css
@media print {
  @page { size: A4 landscape; margin: 0; }
  
  body > *:not(#certificate-modal-overlay) { display: none !important; }
  
  #certificate-modal-overlay {
    position: static !important;
    background: white !important;
    display: block !important;
  }
  
  .certificate-a4-canvas {
    position: absolute;
    left: 0; top: 0;
    width: var(--cert-design-width);
    height: var(--cert-design-height);
    transform: scale(var(--cert-print-scale));
    transform-origin: top left;
  }
}
```

### Layout duplo (tela vs impressão)

Foram criados dois conjuntos de DOM:

- **`.cert-screen-wrapper`** — exibido na tela, com `transform: scale(previewScale)` via React
- **`.cert-print-only`** — oculto na tela (`display: none`), visível apenas na impressão, com `transform: scale(var(--cert-print-scale))` via CSS puro

Para certificados duplex (frente e verso), são renderizados dois `.cert-print-only` (front/back), cada um com `page-break-after: always`, gerando 2 páginas exatas.

### Fluxo final

```
[JSX monta] → style inline define --cert-design-width/height/print-scale no DOM
              ↓
[Usuário clica Print] → window.print() dispara
              ↓
Navegador consulta @media print → lê var(--cert-print-scale) → aplica scale nativo
              ↓
Resultado: certificado 297×210mm preenchendo 100% da folha A4 paisagem
           SEM depender de estado React, SEM race condition
```

---

## Consequências

### Positivas

- **Zero race condition** — CSS Custom Properties são resolvidas no momento da renderização da página, não em um ciclo assíncrono
- **Remoção do estado `printing`** — menos complexidade, menos re-renders, menos bugs
- **Previsível** — mesmo CSS que funciona no preview funciona no print, porque as variáveis já estão no DOM
- **Suporte a duplex nativo** — múltiplos canvases ocultos são ativados pelo `@media print` sem intervenção React
- **Manutenção declarativa** — o React define os *valores* (dados de domínio), o CSS aplica as *transformações visuais* — cada um na sua responsabilidade

### Negativas

- **Leve duplicação de DOM** — o layout de impressão é um bloco `div` separado do layout de tela, o que aumenta marginalmente o HTML renderizado
- **Variáveis CSS via cast de tipo** — necessário `as React.CSSProperties` para passar custom properties no TypeScript (não suportadas nativamente pelos tipos React)
- **Exceção à regra D-03 (CSS inline)** — o `@media print` é injetado via `useEffect` por ser a única forma de garantir escopo correto para impressão sem poluir o resto do app (conforme previsto pela exceção em `token-governance.md`)

### Riscos Mitigados

- **Navegadores legados**: CSS Custom Properties são suportadas em todos os navegadores modernos (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 79+). Navegadores muito antigos (IE11) não são suportados pela arquitetura do projeto (Next.js + Expo).
- **Sobrescrita de variáveis**: Garantido pelo uso de `var(--cert-print-scale)` específico por contexto, sem colisão com outras variáveis globais.

---

## Referências

- [MDN: CSS Custom Properties (CSS Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN: window.print()](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)
- [MDN: @media print](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#print)
- Arquivo de implementação: `apps/admin/src/app/configuracoes/[courseId]/page.tsx`
