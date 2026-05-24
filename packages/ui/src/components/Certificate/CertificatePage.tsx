import React from 'react';
import { YStack } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { useA4Scale, DESIGN_W } from './useA4Scale';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificatePageProps {
  blocks: CertificateBlock[];
}

const sharedStyles: React.CSSProperties = {
  width: '85vw',
  maxWidth: DESIGN_W,
  aspectRatio: '29.7 / 21',
};

export const CertificatePage: React.FC<CertificatePageProps> = ({
  blocks,
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

  return (
    <div
      id="certificate-print-root"
      ref={containerRef}
      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden', background: 'var(--bg)' }}
    >
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
        }}
      >
        {blocks.map((block) => (
          <CertificateBlockRenderer key={block.id} block={block} scale={scale} />
        ))}
      </YStack>
    </div>
  );
};
