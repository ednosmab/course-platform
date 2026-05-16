# 🛡️ SKILL: SECURITY & XSS PREVENTION

## 🎯 Objetivo
Proteger a plataforma contra injeção de código malicioso (XSS) e garantir a privacidade dos dados, especialmente crítico devido à natureza de um CMS que aceita blocos de texto formatado (HTML/Markdown).

## 🦠 Prevenção de XSS (Cross-Site Scripting) no CMS
O maior vetor de ataque do nosso projeto são os Blocos de Texto do CMS.
1. **Sanitização no Backend:** Nunca confie na entrada do cliente. Toda string que represente HTML (se usarmos Rich Text) DEVE ser higienizada no servidor (Edge Function ou trigger) usando bibliotecas robustas como `DOMPurify` ou equivalentes no Deno, antes de ir para o JSONB.
2. **Renderização Segura no Frontend:**
   - No React (Web): Se for absolutamente necessário renderizar HTML cru, use `dangerouslySetInnerHTML`, mas NUNCA faça isso sem passar o conteúdo pelo `DOMPurify` localmente também.
   - No React Native (Mobile): O componente que renderiza Markdown/HTML deve ser configurado para remover ou desativar tags `<script>`, `<iframe>` (exceto de origens confiáveis como YouTube) e `on*` events (ex: `onclick`, `onload`).

## 🔐 Privacidade de Dados Sensíveis
- **Sem PII Injetável:** Nenhuma Informação Pessoalmente Identificável (PII), como e-mail ou CPF, deve ser passada via query string na URL.
- **Log Masking:** Garanta que a configuração do logger estruturado mascare chaves, tokens e dados sensíveis antes de enviar para o console ou Sentry.

## 📂 Onde Aplicar
- `packages/types/` (Ao validar schemas Zod com refinamentos de sanitização).
- `packages/renderer/` (Ao renderizar os blocos na tela).
