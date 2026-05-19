# ADR-005: Fidelidade do Preview — A Lei do CMS

**Status:** Aceito  
**Data:** 2026-05-17  
**Contexto:** Editor CMS estilo Canva (`apps/admin`)  
**Autor:** Edson

---

## Decisão

> **LEI ABSOLUTA: TUDO O QUE FOR APRESENTADO NO PREVIEW SERÁ O RESULTADO FINAL DA TELA DO USUÁRIO.**

Esta decisão é irrevogável e deve ser respeitada por qualquer desenvolvedor, ferramenta de IA ou processo automatizado que modifique o código do editor CMS.

---

## Contexto

O CMS possui dois modos de visualização para o admin:

1. **Modo Edição Desktop** — canvas livre com grade, blocos absolutamente posicionados
2. **Modo Preview / Mobile** — simula exatamente o que o aluno verá na tela do dispositivo

O Preview existe para eliminar surpresas: o admin deve ter total confiança de que o que ele vê é o que o aluno receberá.

---

## Consequências Técnicas Obrigatórias

### 1. Renderer Único
O componente `MobileCanvas` (em `EditorCanvas.tsx`) é o **único renderer** autorizado para:
- O Preview lido pelo admin (`PreviewCanvas`)
- O mobile viewport de edição (`MobileViewport`)
- A tela real do aluno (app `student`)

**Nunca criar um renderer paralelo para o preview.** Qualquer divergência entre preview e resultado final é um bug crítico.

### 2. Reflow Responsivo Real
O `MobileCanvas` usa `groupBlocksByRow` para detectar blocos na mesma linha e renderizá-los com `flex-wrap`. Isso garante que:
- Blocos lado a lado no desktop se reorganizam corretamente no mobile
- Conteúdo nunca é cortado — o scroll é ilimitado

### 3. Tipografia Responsiva
As fontes no preview usam os tamanhos `FONT_MOBILE`, não `FONT_DESKTOP`:

| Token | Desktop | Mobile |
|-------|---------|--------|
| `small` | 13px | 12px |
| `medium` | 16px | 15px |
| `large` | 24px | 19px |
| `xlarge` | 32px | 24px |

Estes valores seguem as diretrizes do **Material Design 3** e **Apple HIG**.

### 4. Scroll Ilimitado
- O frame do preview **não tem altura máxima fixa**
- O conteúdo cresce verticalmente e o admin pode scrollar para ver tudo
- O que está visível no scroll do preview = o que o aluno vê no scroll do app

### 5. Delimitadores de Viewport
- **Desktop**: card branco de `1100px` de largura
- **Mobile**: frame `390px` (iPhone 14 / Android padrão)
- Blocos fora desses limites recebem badge ⚠️ `"Fora da página"` no editor

---

## Validação

Antes de qualquer PR que modifique o editor ou o app do aluno, verificar:

- [ ] `MobileCanvas` é o mesmo componente usado no Preview e no app do aluno
- [ ] Nenhum `maxHeight` ou `overflow: hidden` sem scroll trunca conteúdo no Preview
- [ ] Fontes no Preview usam `FONT_MOBILE`, não `FONT_DESKTOP`
- [ ] O reflow via `groupBlocksByRow` está ativo no `MobileCanvas`

---

## Referências

- `apps/admin/src/components/editor/EditorCanvas.tsx` — constantes `PAGE_W`, `MOBILE_W`, funções `MobileCanvas`, `PreviewCanvas`, `MobileViewport`
- `docs/Requisitos_plataforma.md` — Requisitos originais do projeto
- `docs/context_buffer.md` — Estado atual do sistema
