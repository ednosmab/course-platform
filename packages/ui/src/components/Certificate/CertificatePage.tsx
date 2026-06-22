import React from 'react';
import type { CertificateBlock } from '@projeto/types';
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
  /**
   * Number of visible pages for scale computation. When a CSS rule hides
   * one canvas on screen (via data-preview-side), pass 1 so useA4Scale
   * computes a larger scale for the visible canvas. At print time this
   * should be the actual page count (1 or 2).
   */
  visiblePages?: number;
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
  const sortedBlocks = sortBlocks(blocks);

  return (
    <div
      className="certificate-canvas-wrapper"
      style={{
        width: DESIGN_W * scale,
        height: DESIGN_H * scale,
        position: 'relative',
        ...extraStyle,
      }}
    >
      <div
        className="certificate-a4-canvas"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DESIGN_W,
          height: DESIGN_H,
          background: 'white',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 10px 35px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {sortedBlocks.map((block: any) => {
          const isBg = !!block.styles?.isBackground;
          if (isBg) {
            return (
              <div
                key={block.id}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <CertificateBlockRenderer block={block} scale={1} fillContainer />
              </div>
            );
          }

          const layout = block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 };
          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.w,
                height: layout.h,
                zIndex: (layout.zIndex ?? 0) + 1,
                overflow: 'hidden',
                borderRadius: 6,
              }}
            >
              <CertificateBlockRenderer block={block} scale={1} fillContainer />
            </div>
          );
        })}
      </div>
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
  visiblePages,
}) => {
  const totalPages = isDoubleSided ? 2 : 1;
  const pagesForScale = visiblePages ?? totalPages;
  const { containerRef, a4Width, scale, ready } = useA4Scale({
    pages: pagesForScale,
  });

  if (!ready || a4Width <= 0) {
    return (
      <div
        id="certificate-print-root"
        ref={containerRef}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="certificate-a4-canvas" style={{ width: 0, height: 0 }} />
      </div>
    );
  }

  // All-sides mode: always render both canvases so the DOM is complete for
  // print. The `side` prop is NOT used to filter blocks here — instead, the
  // parent page applies a CSS class (`data-preview-side`) that hides the
  // non-selected canvas on screen via @media screen. At print time, both
  // canvases are visible and each gets its own A4 page via page-break-after.
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
