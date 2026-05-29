import React, { useRef, useState, useEffect } from 'react';
import { YStack, Text } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificateMiniatureProps {
  blocks: CertificateBlock[];
  designWidth?: number;
  designHeight?: number;
}

export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  blocks,
  designWidth = 1100,
  designHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const dHeight = designHeight || Math.round(designWidth / 1.414);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      if (cw <= 0) return;
      setScale(Math.min(1, (cw - 4) / designWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  if (blocks.length === 0) {
    return (
      <YStack
        width="100%"
        height={120}
        bg="$background"
        borderRadius={8}
        borderWidth={1}
        borderColor="$border"
        borderStyle="dashed"
        ai="center"
        jc="center"
      >
        <Text fontSize={12} color="$textMuted">Sem blocos</Text>
      </YStack>
    );
  }

  const miniatureHeight = Math.round(dHeight * scale);
  const sorted = [...blocks].sort(
    (a: any, b: any) => (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0),
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxHeight: 200,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        background: 'white',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: Math.round(designWidth * scale),
          height: miniatureHeight,
          margin: '0 auto',
        }}
      >
        {sorted.map((block: any) => {
          const layout = block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 };
          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: layout.x * scale,
                top: layout.y * scale,
                width: layout.w * scale,
                height: layout.h * scale,
                zIndex: layout.zIndex + 1,
                overflow: 'hidden',
              }}
            >
              <CertificateBlockRenderer block={block} scale={scale} fillContainer />
            </div>
          );
        })}
      </div>
    </div>
  );
};
