# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Instruções:** Itens neste arquivo seguem o formato `[Priority] Layer: Descrição`.
> Prioridades: **P0** (imediato), **P1** (curto prazo), **P2** (médio prazo), **P3** (baixa prioridade).
> Status: `Backlog` | `In Progress` | `Done`

---

## 🏆 P0 — Imediato (Sprint Atual)

- *Nenhum item no momento.*

## 📌 P1 — Curto Prazo

- *Nenhum item no momento.*

## 🗓️ P2 — Médio Prazo

- *Nenhum item no momento.*

## 🌱 P3 — Baixa Prioridade (Backlog)

- **Editor de Imagem:** Implementar ferramenta de **Crop** no BlockSettings (recorte com drag handles e presets de aspect ratio).
- **Editor de Imagem:** Implementar **Rotate** (90° left/right) e **Flip** (horizontal/vertical).
- **Remover Fundo:** Testar algoritmo de remoção de fundo (Edge Detection + Boundary Fill) com imagem real no Studio.
- **BUG: Cursor escapa durante resize** — `document.body.style.cursor` não sobrescreve cursor de elementos filhos (text blocks, botões).
- **BUG: Aspect ratio de imagem não funciona em W/N/cantos** — fixed-corner approach falha em handles esquerdo/superior.
- **Renderização:** Extrair `removeBackground` para Web Worker para não travar UI em imagens grandes.
- **Preview de Certificado:** Validação de fidelidade visual entre Studio e impressão (A4).
- **Player Mobile:** Implementar retomada inteligente de vídeo (salvar timestamp no Supabase).
