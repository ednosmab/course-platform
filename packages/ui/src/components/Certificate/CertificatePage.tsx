import React from 'react';
import { YStack } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { useA4Scale, DESIGN_W } from './useA4Scale';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificatePageProps {
  blocks: CertificateBlock[];
  isDoubleSided?: boolean;
}

const sharedStyles: React.CSSProperties = {
  width: '85vw',
  maxWidth: DESIGN_W,
  aspectRatio: '29.7 / 21',
};

function renderCanvas(
  blocks: CertificateBlock[],
  scale: number,
  extraStyle?: React.CSSProperties,
) {
  return (
    <YStack
      id="certificate-a4-canvas"
      bg="white"
      br={Math.round(8 * scale)}
      position="relative"
      overflow="hidden"
      p={Math.round(48 * scale)}
      gap={Math.round(16 * scale)}
      style={{
        ...sharedStyles,
        boxShadow: '0 10px 35px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)',
        ...extraStyle,
      }}
    >
      {blocks.map((block) => (
        <CertificateBlockRenderer key={block.id} block={block} scale={scale} />
      ))}
    </YStack>
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
 * print mode.
 *
 * @param blocks Certificate blocks (excluding the `__meta__` block).
 * @param isDoubleSided Whether the certificate has a back side.
 */
export const CertificatePage: React.FC<CertificatePageProps> = ({
  blocks,
  isDoubleSided = false,
}) => {
  const { containerRef, a4Width, scale, ready } = useA4Scale({
    pages: isDoubleSided ? 2 : 1,
  });

  if (!ready || a4Width <= 0) {
    return (
      <div
        id="certificate-print-root"
        ref={containerRef}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <YStack style={sharedStyles} />
      </div>
    );
  }

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
