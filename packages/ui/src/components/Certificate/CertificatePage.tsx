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

export const CertificatePage: React.FC<CertificatePageProps> = ({
  blocks,
  isDoubleSided = false,
}) => {
  const { containerRef, a4Width, scale, ready } = useA4Scale();

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

  const frontBlocks = isDoubleSided ? blocks.filter((b) => (b as any).styles?.side !== 'back') : blocks;
  const backBlocks = isDoubleSided ? blocks.filter((b) => (b as any).styles?.side === 'back') : [];

  return (
    <div
      id="certificate-print-root"
      ref={containerRef}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden', background: 'var(--bg)' }}
    >
      {/* Frente */}
      {renderCanvas(frontBlocks, scale, isDoubleSided ? { pageBreakAfter: 'always', breakAfter: 'page' } : undefined)}

      {/* Verso (apenas se dupla face e existir conteúdo) */}
      {isDoubleSided && backBlocks.length > 0 && (
        <div style={{ marginTop: 48, '@media print': { marginTop: 0 } } as any}>
          {renderCanvas(backBlocks, scale)}
        </div>
      )}
    </div>
  );
};

