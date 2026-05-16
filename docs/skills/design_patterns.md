# 🧩 SKILL: DESIGN PATTERNS APLICADOS

## 🎯 Objetivo
Utilizar soluções comprovadas para problemas recorrentes, padronizando a comunicação entre componentes e serviços.

## 🛠️ Padrões Recomendados
1. **Strategy:** Para diferentes provedores de vídeo ou métodos de pagamento.
2. **Factory:** Para a criação dinâmica de blocos do CMS baseados no tipo do JSONB.
3. **Observer (Event Bus):** Para comunicação desacoplada entre partes do sistema (ex: disparar analytics quando uma aula é concluída).
4. **Adapter:** Para integrar bibliotecas externas ou APIs legadas sem poluir o domínio.
5. **Decorator:** Para adicionar responsabilidades extras a objetos (ex: logging, cache) sem modificar sua estrutura original.
6. **Compound Components:** No React/Tamagui, para criar componentes complexos e flexíveis (ex: `Select.Item`, `Select.Trigger`).

## 📂 Onde Aplicar
- `packages/renderer/` (Factory/Strategy para blocos).
- `packages/core/services/`.
