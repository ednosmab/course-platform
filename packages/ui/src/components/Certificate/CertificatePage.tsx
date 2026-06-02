import React from 'react';
import { YStack } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { useA4Scale, DESIGN_W, DESIGN_H } from './useA4Scale';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificatePageProps {
  blocks: CertificateBlock[];
  isDoubleSided?: boolean;
  /**
   * Which side to render. Defaults to 'all' (renders front + back when
   * `isDoubleSided` is true). Set to 'front' or 'back' to render a single
   * side at full scale (used by the configuracoes preview modal toggle).
   */
  side?: 'front' | 'back' | 'all';
}

/**
 * Sort blocks so background blocks render first (bottom of the visual
 * stack) and the rest are ordered by their `layouts.desktop.zIndex`.
 * Identical to `CertificateMiniature` so the modal preview matches the
 * side-panel miniature at any scale.
 */
function sortBlocks(blockArray: CertificateBlock[]): CertificateBlock[] {
  return [...blockArray].sort((a: any, b: any) => {
    const aBg = a.styles?.isBackground ? 1 : 0;
    const bBg = b.styles?.isBackground ? 1 : 0;
    if (aBg !== bBg) return aBg - bBg;
    return (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0);
  });
}

function renderCanvas(
  blocks: CertificateBlock[],
  scale: number,
  extraStyle?: React.CSSProperties,
) {
  const canvasW = scale * DESIGN_W;
  const canvasH = scale * DESIGN_H;
  const sortedBlocks = sortBlocks(blocks);

  return (
    <div
      id="certificate-a4-canvas"
      style={{
        position: 'relative',
        width: canvasW,
        height: canvasH,
        background: 'white',
        borderRadius: Math.round(8 * scale),
        overflow: 'hidden',
        boxShadow: '0 10px 35px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)',
        ...extraStyle,
      }}
    >
      {sortedBlocks.map((block: any) => {
        const isBg = !!block.styles?.isBackground;
        const layout = isBg
          ? { x: 0, y: 0, w: DESIGN_W, h: DESIGN_H, zIndex: 0 }
          : (block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 });
        return (
          <div
            key={block.id}
            style={{
              position: 'absolute',
              left: layout.x * scale,
              top: layout.y * scale,
              width: layout.w * scale,
              height: layout.h * scale,
              zIndex: (layout.zIndex ?? 0) + 1,
              overflow: 'hidden',
              borderRadius: isBg ? 0 : 6 * scale,
            }}
          >
            <CertificateBlockRenderer block={block} scale={scale} fillContainer />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Printable A4 certificate page.
 *
 * Single-side: renders one A4 canvas.
 * Double-side: renders the front canvas followed by the back canvas, with
 * a `page-break-after: always` on the front so the browser emits a separate
 * physical page for the back during `window.print()`. CSS rules in
 * CertificatePrint.css hide everything outside `#certificate-print-root` in
 * print mode and force the canvas to 297mm × 210mm (A4 landscape).
 *
 * Blocks are positioned absolutely based on `layouts.desktop.{x, y, w, h}`
 * so the canvas in the preview modal matches `CertificateMiniature`
 * (just larger). The A4 design is landscape (29.7 × 21).
 *
 * @param blocks Certificate blocks (excluding the `__meta__` block).
 * @param isDoubleSided Whether the certificate has a back side.
 */
export const CertificatePage: React.FC<CertificatePageProps> = ({
  blocks,
  isDoubleSided = false,
  side = 'all',
}) => {
  const { containerRef, a4Width, scale, ready } = useA4Scale({
    pages: side === 'all' ? (isDoubleSided ? 2 : 1) : 1,
  });

  if (!ready || a4Width <= 0) {
    return (
      <div
        id="certificate-print-root"
        ref={containerRef}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div id="certificate-a4-canvas" style={{ width: 0, height: 0 }} />
      </div>
    );
  }

  // Single-side mode (toggle no modal): filtra antes e ignora isDoubleSided
  if (side !== 'all') {
    const sideBlocks = blocks.filter((b) => ((b as any).styles?.side || 'front') === side);
    return (
      <div
        id="certificate-print-root"
        ref={containerRef}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden', background: 'var(--bg)' }}
      >
        {renderCanvas(sideBlocks, scale)}
      </div>
    );
  }

  // All-sides mode (impressão / preview sem toggle)
  const frontBlocks = isDoubleSided
    ? blocks.filter((b) => (b as any).styles?.side !== 'back')
    : blocks;
  const backBlocks = isDoubleSided
    ? blocks.filter((b) => (b as any).styles?.side === 'back')
    : [];

  return (
    <div
      id="certificate-print-root"
      ref={containerRef}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden', background: 'var(--bg)' }}
    >
      {/* Front */}
      {renderCanvas(
        frontBlocks,
        scale,
        isDoubleSided ? { pageBreakAfter: 'always', breakAfter: 'page' } : undefined,
      )}

      {/* Back (only if duplex and there is content) */}
      {isDoubleSided && backBlocks.length > 0 && (
        <div style={{ marginTop: 48 }}>
          {renderCanvas(backBlocks, scale)}
        </div>
      )}
    </div>
  );
};
