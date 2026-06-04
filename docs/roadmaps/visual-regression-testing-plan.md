# Plano de Implementação — Testes de Regressão Visual

## Objetivo
Adicionar captura e comparação pixel-por-pixel para impedir quebras de UI silenciosas por atualizações de libs ou migrações de Design System.

## Premissas
- **Playwright já está instalado e funcional** (3 spec files, 2 projetos, webServer configurado)
- **Ladle já está configurado** (6 stories, provider Tamagui, build no CI)
- **Sem Storybook, Chromatic, Cypress, Percy ou Maestro** — e não faz sentido adicioná-los agora
- Projeto solo (dev), MVP ~35%

## Abordagem (Fases incrementais)

---

### Fase 1 — Screenshots nos testes E2E existentes (Playwright)
**Esforço:** Baixo (dias) | **Valor:** Alto — cobre as telas mais críticas

1. **Configurar `screenshot` no `playwright.config.ts`**
   - Adicionar `screenshot: 'only-on-failure'` no `use` global (já ajuda debug)
   - Adicionar `snapshotDir: './tests/e2e/snapshots'` para organizar baselines

2. **Adicionar `toHaveScreenshot()` nos testes existentes**
   - `admin-dashboard.spec.ts` — screenshot da listagem de cursos (estado cheio, vazio, loading)
   - `admin-cms.spec.ts` — screenshot do editor com blocos carregados
   - `2-aluno-player.spec.ts` — screenshot do player com vídeo + quiz

3. **Primeira execução para gerar baselines**
   - Rodar `pnpm exec playwright test --update-snapshots` para criar as imagens de referência
   - Commitar as baselines no repositório

4. **Critério de aceite:** Qualquer alteração no CSS dos componentes renderizados nessas telas faz o teste falhar no CI.

**Comandos:**
```bash
pnpm exec playwright test --update-snapshots  # gera baselines
pnpm run test:e2e                             # roda comparação
```

---

### Fase 2 — CI com validação visual
**Esforço:** Médio | **Valor:** Alto — automatiza a detecção

1. **Adicionar job no `.github/workflows/ci.yml`**
   - Instalar chromium (`pnpm exec playwright install chromium --with-deps`)
   - Rodar `pnpm run test:e2e`
   - Upload da `playwright-report/` como artefato

2. **Estratégia de falha no CI**
   - Baselines versionadas no repositório
   - Se diff > 0.1% (threshold configurável), falha o job
   - Desenvolvedor revisa o diff baixando o artefato HTML

3. **Opcional:** `playwright.config.ts` com `maxDiffPixelRatio: 0.01` para tolerância mínima

---

### Fase 3 — Testes visuais de componentes via Ladle
**Esforço:** Médio | **Valor:** Médio — pega quebras em componentes isolados antes do E2E

1. **Criar script `ladle-vrt.ts`** que abre cada story no Ladle e tira screenshot
   - Reaproveita o mesmo Playwright
   - Projeto separado no `playwright.config.ts` apontando para `http://localhost:61000` (porta padrão do Ladle)

2. **Snapshots por componente:**
   - `Button` — estado normal, hover, disabled, loading
   - `Card` — com conteúdo, vazio
   - `Text` — variantes de tamanho/cor
   - `Icon` — diferentes tamanhos
   - `QuoteBlock`, `TextBlock` — renderização real

3. **Adicionar script no `package.json` do `packages/ui`:**
   ```json
   "test:vrt": "ladle build && playwright test --config playwright.ladle.config.ts"
   ```

---

### Fase 4 — Manutenção e workflow
**Esforço:** Contínuo | **Valor:** Garante长久idade

1. **Regra:** Ao modificar tokens de tema (cores, spacing, fonts), rodar `--update-snapshots`
2. **Regra:** Ao adicionar novo componente ao DS, criar story + screenshot baseline
3. **Pipeline:** PR que mexe em `packages/ui/tokens/` ou `packages/ui/src/` **deve** passar pelo VRT

---

## O que NÃO será feito (agora)
| Ferramenta | Motivo |
|---|---|
| Storybook + Chromatic | Ladle já cobre preview; Chromatic é custoso e não necessário para projeto solo |
| Percy | Ferramenta paga, sem vantagem sobre Playwright nativo |
| Maestro | Só faz sentido quando o app Expo tiver testes E2E reais em device |
| Cypress | Playwright já instalado e mais adequado para VRT |
| Testes visuais no app mobile nativo (iOS/Android) | Expo Web é a prioridade; nativo fica para depois |

---

## Timeline estimada
| Fase | Duração | Dependências |
|---|---|---|
| Fase 1 (Playwright screenshots) | 2-3 dias | Nenhuma |
| Fase 2 (CI) | 1 dia | Fase 1 |
| Fase 3 (Ladle VRT) | 3-5 dias | Fase 1 |
| Fase 4 (Workflow) | Contínuo | Fases 1-3 |

**Total estimado:** ~1 semana para o mínimo viável (Fase 1 + 2).
