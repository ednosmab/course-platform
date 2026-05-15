# 📋 PLANO DE EXECUÇÃO: CAMADA DE CONTRATOS E COMPONENTES DE DADOS

## 🎯 Objetivo Geral
Modelar a tipagem e os esquemas de validação em tempo de execução para os blocos dinâmicos da árvore JSONB do CMS.

## 📌 Linha de Produção Estrita
- [x] **TASK-01:** Configurar `packages/types/package.json` adicionando `zod` se ausente.
- [ ] **TASK-02:** Criar esquema Zod e tipo TS para Bloco de Texto (HTML) em `packages/types/src/text.ts`.
- [ ] **TASK-03:** Criar esquema Zod e tipo TS para Bloco de Vídeo em `packages/types/src/video.ts`.
- [ ] **TASK-04:** Criar esquema Zod e tipo TS para Bloco de Quiz em `packages/types/src/quiz.ts`.
- [ ] **TASK-05:** Criar união discriminada (Union Schema) e ponto de entrada central em `packages/types/index.ts`.
