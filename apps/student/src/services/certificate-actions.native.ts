import { openURL } from 'expo-linking';
import { Share } from 'react-native';
import * as Print from 'expo-print';
import type { CertificateBlock } from '@projeto/types';

/**
 * @description Native (React Native) version of printCertificate.
 * Uses `expo-print` to generate a PDF and open the native print dialog.
 *
 * @param {CertificateBlock[]} blocks - The certificate template blocks
 * @param {number} designWidth - The certificate design width in pixels
 * @param {number} designHeight - The certificate design height in pixels
 * @returns {Promise<void>}
 */
export async function printCertificate(
  blocks: CertificateBlock[]): Promise<void> {
  const designWidth = 1100;
  const designHeight = 778;
  const printScale = 1122.5 / designWidth;

  const frontBlocks = blocks.filter((b: any) => (b as any).styles?.side !== 'back');
  const backBlocks = blocks.filter((b: any) => (b as any).styles?.side === 'back');
  const hasBack = backBlocks.length > 0;

  const renderBlocksHTML = (blockArray: CertificateBlock[]): string => {
    return blockArray
      .filter((b: any) => b.type !== '__meta__')
      .map((block: any) => {
        const layout = block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 };
        const baseStyle = `position:absolute;left:${layout.x}px;top:${layout.y}px;width:${layout.w}px;height:${layout.h}px;z-index:${(layout.zIndex || 0) + 1};overflow:hidden;`;

        if (block.type === 'text') {
          const fontSize = block.styles?.fontSize === 'xlarge' ? 28
            : block.styles?.fontSize === 'large' ? 22
            : block.styles?.fontSize === 'small' ? 12 : 16;
          return `<div style="${baseStyle}font-size:${fontSize}px;color:${block.styles?.color || '#1a1a1a'};font-family:${block.styles?.fontFamily || 'sans-serif'};text-align:${block.styles?.align || 'left'};white-space:pre-wrap;">${block.content || ''}</div>`;
        }

        if (block.type === 'heading') {
          const fontSize = block.level === 1 ? 36 : block.level === 3 ? 18 : 24;
          return `<div style="${baseStyle}font-size:${fontSize}px;font-weight:bold;color:${block.styles?.color || '#1a1a1a'};font-family:${block.styles?.fontFamily || 'sans-serif'};text-align:${block.styles?.align || 'left'};white-space:pre-wrap;">${block.content || ''}</div>`;
        }

        if (block.type === 'image') {
          const isBg = block.styles?.isBackground;
          const objectFit = block.styles?.objectFit || 'contain';
          const imgStyle = isBg
            ? 'width:100%;height:100%;object-fit:cover;'
            : `width:100%;height:100%;object-fit:${objectFit};border-radius:${block.styles?.borderRadius || 0};`;
          const containerStyle = isBg
            ? `${baseStyle}left:0;top:0;width:100%;height:100%;`
            : baseStyle;
          return `<div style="${containerStyle}"><img src="${block.url || ''}" alt="${block.alt || ''}" style="${imgStyle}" /></div>`;
        }

        if (block.type === 'divider') {
          return `<div style="${baseStyle}border-top:${block.styles?.thickness || 1}px ${block.styles?.style || 'solid'} ${block.styles?.color || '#e0e0e0'};width:${block.styles?.width || '100'};"></div>`;
        }

        return '';
      })
      .join('');
  };

  const buildPageHTML = (pageBlocks: string, isLast: boolean) => `
    <div style="width:297mm;height:210mm;position:relative;overflow:hidden;page-break-inside:avoid;${!isLast ? 'page-break-after:always;' : ''}">
      <div style="position:absolute;left:0;top:0;width:${designWidth}px;height:${designHeight}px;transform:scale(${printScale});transform-origin:top left;">
        ${pageBlocks}
      </div>
    </div>
  `;

  const frontHTML = renderBlocksHTML(frontBlocks);
  const backHTML = hasBack ? renderBlocksHTML(backBlocks) : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 landscape; margin: 0; }
    html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body * { visibility: hidden !important; }
    #certificate-print-root, #certificate-print-root * { visibility: visible !important; }
    #certificate-print-root { position: static !important; display: block !important; background: white !important; width: 297mm !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
  </style>
</head>
<body>
  <div id="certificate-print-root">
    ${buildPageHTML(frontHTML, !hasBack)}
    ${hasBack ? buildPageHTML(backHTML, true) : ''}
  </div>
</body>
</html>`;

  await Print.printAsync({
    html,
    landscape: true,
  });
}

/**
 * @description Opens the official extranet validation page for a certificate.
 */
export async function openCertificateValidation(uuidExtranet: string): Promise<void> {
  const baseUrl = process.env.EXPO_PUBLIC_EXTRANET_VALIDATION_URL;
  if (!baseUrl) return;
  await openURL(`${baseUrl}/${uuidExtranet}`);
}

/**
 * @description Shares the certificate via the OS-native share sheet.
 */
export async function shareCertificate(uuidExtranet: string, courseTitle?: string): Promise<void> {
  const prefix = courseTitle ? `Concluí o curso "${courseTitle}"` : 'Concluí um curso';
  await Share.share({
    message: `${prefix}! Código de validação: ${uuidExtranet}`,
    title: 'Meu certificado',
  });
}
