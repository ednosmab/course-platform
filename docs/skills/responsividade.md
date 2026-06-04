# 📱 SKILL: RESPONSIVIDADE CROSS-PLATFORM

## 🎯 Objetivo
Entregar uma interface que se adapta perfeitamente a diferentes tamanhos de tela (Mobile, Tablet, Desktop) com um único código-base.

## 📏 Regras de Adaptabilidade
1. **Breakpoints Tamagui:** Use os breakpoints padrão (`sm`, `md`, `lg`) consistentemente em todos os componentes.
2. **Layouts Flexíveis:** Prefira `flex: 1` e `flexWrap: wrap` em vez de larguras fixas em pixels.
3. **Imagens Responsivas:** Utilize propriedades de `objectFit` e garanta que as mídias não quebrem o layout em telas pequenas.
4. **Interações Específicas:** 
   - **Touch:** Elementos de toque devem ter áreas mínimas de 44px.
   - **Mouse:** Adicione feedbacks de cursor e hovers apenas para dispositivos que suportam ponteiro.
5. **Adaptação de Conteúdo:** Oculte ou mova elementos secundários em telas pequenas para manter o foco no conteúdo principal da aula.

## 🖥️ Viewports do Editor CMS (Admin)

### Modo Edição Desktop (Canvas Livre)
- **Delimitador de Página:** Card branco centralizado com `PAGE_W = 1100px`.
- **Centralização:** Usar `margin: 0 auto` — proibido `alignItems: 'center'` no container pai, que causa perda do lado esquerdo em notebooks com tela menor que 1100px.
- Se a janela for menor que 1100px, o card encosta na borda esquerda (`x = 0`) permitindo scroll horizontal normal.

### Modo Mobile e Preview (Reflow Responsivo)
- **Delimitador de Viewport:** Largura padrão simulada de `MOBILE_W = 390px`.
- **Reflow Proporcional:** `groupBlocksByRow` agrupa blocos na mesma linha horizontal (colisão de Y) e distribui no mobile com `flex-wrap` e larguras flexíveis proporcionais às originais do desktop.
- **Scroll Vertical:** Preview **não possui `max-height`** — conteúdo se estende naturalmente com scroll ilimitado, igual à tela real do dispositivo.

## 📂 Onde Aplicar
- `packages/ui/`
- Componentes de layout em `apps/`.
