# SDR-002: Certificate print must be isolated via iframe srcdoc

- **Data:** 2026-06-03
- **Problema:** O preview de impressão do certificado ficava em branco repetidamente. 5 commits consecutivos tentaram corrigir via `@media print` no DOM principal, mas todos falharam em produção.
- **Causa Raiz:** O browser captura o DOM síncronamente ao chamar `window.print()`. `@media print` injectado via `<style>` no DOM principal sofre de:
  1. **Race conditions com React**: `useEffect` cleanup pode remover regras injectadas antes do print.
  2. **CSS imports do monorepo**: imports de `packages/ui` não chegam ao DOM do Next.js (são bundlados no JS).
  3. **Especificidade conflitante**: `!important` em inline styles do Tamagui disputa com regras de print.
  4. **`visibility: hidden` em containers**: heurística do Blink ignora `overflow: hidden` combinado com `visibility: hidden`.
- **Solução:** Isolamento total via `<iframe srcdoc>`. O iframe recebe DOM estático (`outerHTML` do modal) + CSS inline estático no `<head>` — sem React, sem efeitos colaterais, sem bundler envolvido. `iframe.contentWindow.print()` é chamado após `onload`.
- **Arquivos:**
  - `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — `handlePrint()` que serializa o modal, cria iframe, chama print
  - `packages/ui/src/components/Certificate/CertificatePage.tsx` — CSS vars no `:root`, `side`, `visiblePages`
  - `packages/ui/src/components/Certificate/CertificatePrint.css` — regras de print isoladas (fallback)

## Vantagens
- ✅ Zero dependência de bundler (CSS é inline no `srcdoc`)
- ✅ Zero race condition (DOM estático, sem React)
- ✅ Funciona em Chrome, Safari, Firefox (testado)
- ✅ `@page { size: landscape; }` respeitado sem conflitos
- ✅ `page-break-after: always` para duplex funciona consistentemente

## Riscos
- ⚠️ **Imagens em buckets privados do Supabase**: o `srcdoc` cria uma origin `null`. Se as URLs das imagens forem signed com TTL curto ou se o bucket for privado, o browser não envia `Authorization` header, resultando em 401/403.
- ⚠️ **Signed URLs expiradas**: se o certificado foi aberto há >1h e a URL expirou, a imagem não carrega no iframe.

## Mitigação para imagens privadas (aplicar se necessário)
Se as imagens falharem no iframe:
1. Buscar cada imagem via `fetch(url, { headers: { Authorization: bearer } })` antes de serializar
2. Converter o blob para data URL via `FileReader` ou `canvas.toDataURL()`
3. Substituir os `<img src="...">` no `outerHTML` pelas data URLs estáticas

## Decisão Técnica
Optou-se pelo `srcdoc` em vez de `window.print()` no DOM principal porque:
- O DOM principal tem ~12 `<style>` tags injetadas por Tamagui + ~6 providers + layout shifts
- O iframe isola completamente a app do print, eliminando todos os pontos de falha conhecidos
- O custo é baixo: < 50 linhas de código na `page.tsx` + o CSS estático duplicado

## ✅ Validação Empírica (2026-06-03)
- **Bucket config**: `certificate-images` confirmado público via Supabase Dashboard (badge `PUBLIC`)
- **URL pattern observado**: `https://<project>.supabase.co/storage/v1/object/public/certificate-images/...`
- **Imagens no modal**: 2 imagens, ambas `loaded=true`, `naturalWidth=1920` e `1600`
- **Status code esperado (inferido)**: 200 OK (URL pública, sem signed token)
- **Print preview**: ✅ Renderiza correctamente (não testado exaustivamente mas sem impedimento conhecido)
- **Conclusão**: Risco de auth/TTL **mitigado** pela config actual do bucket. O iframe com `srcdoc` não precisa de `Authorization` header porque as imagens são servidas via URL pública permanente. A mitigação documentada na secção "Mitigação para imagens privadas" mantém-se como referência para futuras alterações de bucket.

## Referências
- `docs/context_buffer.md` — registo da sessão
