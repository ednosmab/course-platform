import { openURL } from 'expo-linking';
import { Share } from 'react-native';
import type { CertificateBlock } from '@projeto/types';

/**
 * @description Prints the certificate via an isolated iframe, matching the admin's
 * print approach (see apps/admin configuracoes/[courseId]/page.tsx).
 *
 * Business rule: uses an iframe to avoid race conditions with @media print rules
 * in the main DOM. The certificate is rendered at A4 landscape dimensions.
 *
 * @param {CertificateBlock[]} blocks - The certificate template blocks
 * @param {number} designWidth - The certificate design width in pixels
 * @param {number} designHeight - The certificate design height in pixels
 * @returns {void}
 */
export function printCertificate(
  blocks: CertificateBlock[],
  designWidth: number = 1100,
  designHeight: number = 778,
): void {
  if (typeof document === 'undefined') return;

  const printScale = 1122.5 / designWidth;

  const blocksJson = JSON.stringify(blocks);

  const printStyles = `
    <style>
      @page { size: A4 landscape; margin: 0; }
      html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body * { visibility: hidden !important; }
      #certificate-print-root,
      #certificate-print-root * { visibility: visible !important; }
      #certificate-print-root { position: static !important; display: block !important; background: white !important; width: 297mm !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
      #certificate-print-root > div { width: 297mm !important; height: 210mm !important; position: relative !important; overflow: hidden !important; display: block !important; margin: 0 !important; page-break-inside: avoid !important; }
      .certificate-a4-canvas { position: absolute !important; left: 0 !important; top: 0 !important; width: ${designWidth}px !important; height: ${designHeight}px !important; transform: scale(${printScale}) !important; transform-origin: top left !important; box-shadow: none !important; max-width: none !important; max-height: none !important; border-radius: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    </style>
  `;

  const srcdoc = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${printStyles}
      </head>
      <body>
        <div id="certificate-print-root"></div>
        <script>
          var blocks = ${blocksJson};
          var root = document.getElementById('certificate-print-root');
          var container = document.createElement('div');
          container.className = 'certificate-a4-canvas';
          root.appendChild(container);

          blocks.forEach(function(block) {
            if (block.type === '__meta__') return;
            var el = document.createElement('div');
            var layout = (block.layouts && block.layouts.desktop) || { x: 0, y: 0, w: 200, h: 100 };
            el.style.position = 'absolute';
            el.style.left = layout.x + 'px';
            el.style.top = layout.y + 'px';
            el.style.width = layout.w + 'px';
            el.style.height = layout.h + 'px';
            el.style.zIndex = (layout.zIndex || 0) + 1;
            el.style.overflow = 'hidden';

            if (block.type === 'text') {
              el.style.fontSize = block.styles && block.styles.fontSize === 'xlarge' ? '28px' :
                                 block.styles && block.styles.fontSize === 'large' ? '22px' :
                                 block.styles && block.styles.fontSize === 'small' ? '12px' : '16px';
              el.style.color = (block.styles && block.styles.color) || '#1a1a1a';
              el.style.fontFamily = (block.styles && block.styles.fontFamily) || 'sans-serif';
              el.style.textAlign = (block.styles && block.styles.align) || 'left';
              el.style.whiteSpace = 'pre-wrap';
              el.textContent = block.content || '';
            } else if (block.type === 'heading') {
              var fontSize = block.level === 1 ? '36px' : block.level === 3 ? '18px' : '24px';
              el.style.fontSize = fontSize;
              el.style.fontWeight = 'bold';
              el.style.color = (block.styles && block.styles.color) || '#1a1a1a';
              el.style.fontFamily = (block.styles && block.styles.fontFamily) || 'sans-serif';
              el.style.textAlign = (block.styles && block.styles.align) || 'left';
              el.style.whiteSpace = 'pre-wrap';
              el.textContent = block.content || '';
            } else if (block.type === 'image') {
              var img = document.createElement('img');
              img.src = block.url || '';
              img.alt = block.alt || '';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = (block.styles && block.styles.objectFit) || 'contain';
              img.style.borderRadius = (block.styles && block.styles.borderRadius) || '0';
              if (block.styles && block.styles.isBackground) {
                el.style.width = '100%';
                el.style.height = '100%';
                el.style.left = '0';
                el.style.top = '0';
                img.style.objectFit = 'cover';
              }
              el.appendChild(img);
            } else if (block.type === 'divider') {
              el.style.borderTop = ((block.styles && block.styles.thickness) || 1) + 'px ' +
                                   ((block.styles && block.styles.style) || 'solid') + ' ' +
                                   ((block.styles && block.styles.color) || '#e0e0e0');
              el.style.width = (block.styles && block.styles.width) || '100%';
            }

            container.appendChild(el);
          });
        </script>
      </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.srcdoc = srcdoc;

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print failed:', e);
    } finally {
      setTimeout(() => iframe.remove(), 1000);
    }
  };

  document.body.appendChild(iframe);
}

/**
 * @description Opens the official extranet validation page for a certificate.
 *
 * Business rule: external systems (per Requisitos §1) verify certificates via a
 * dedicated URL keyed by the certificate's public `uuid_extranet`. The host is
 * configured via `EXPO_PUBLIC_EXTRANET_VALIDATION_URL` (no real partner name in code
 * — see `FORBIDDEN_OPERATIONS.md` secção 9 CONFID-01).
 *
 * @param {string} uuidExtranet - The certificate's public validation code (e.g. `EXTR-…`).
 * @returns {Promise<void>} Resolves when the URL is handed off to the OS.
 */
export async function openCertificateValidation(uuidExtranet: string): Promise<void> {
  const baseUrl = process.env.EXPO_PUBLIC_EXTRANET_VALIDATION_URL;
  if (!baseUrl) {
    return;
  }
  await openURL(`${baseUrl}/${uuidExtranet}`);
}

/**
 * @description Shares the certificate via the OS-native share sheet.
 *
 * Business rule: the share message must include the public `uuid_extranet` so the
 * recipient can independently verify the certificate via the validation endpoint.
 *
 * @param {string} uuidExtranet - The certificate's public validation code.
 * @param {string} [courseTitle] - Optional human-readable course title for the message.
 * @returns {Promise<void>} Resolves when the share sheet closes.
 */
export async function shareCertificate(uuidExtranet: string, courseTitle?: string): Promise<void> {
  const prefix = courseTitle ? `Concluí o curso "${courseTitle}"` : 'Concluí um curso';
  await Share.share({
    message: `${prefix}! Código de validação: ${uuidExtranet}`,
    title: 'Meu certificado',
  });
}
