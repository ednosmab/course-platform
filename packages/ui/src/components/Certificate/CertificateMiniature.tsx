import React, { useRef, useState, useEffect } from 'react';
import { YStack, Text } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificateMiniatureProps {
  blocks: CertificateBlock[];
  designWidth?: number;
  designHeight?: number;
  isDoubleSided?: boolean;
}

export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  blocks,
  designWidth = 1100,
  designHeight,
  isDoubleSided = false,
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
  const gap = 16;
  const containerAspect = isDoubleSided 
    ? `${designWidth} / ${(dHeight * 2) + gap}`
    : `${designWidth} / ${dHeight}`;

  const frontBlocks = blocks.filter(b => ((b as any).styles?.side || 'front') === 'front');
  const backBlocks = blocks.filter(b => (b as any).styles?.side === 'back');

  const sortBlocks = (blockArray: any[]) => [...blockArray].sort((a: any, b: any) => {
    const aBg = a.styles?.isBackground ? 1 : 0;
    const bBg = b.styles?.isBackground ? 1 : 0;
    if (aBg !== bBg) return aBg - bBg;
    return (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0);
  });

  const sortedFront = sortBlocks(frontBlocks);
  const sortedBack = sortBlocks(backBlocks);

  const renderPage = (sortedBlocks: any[]) => (
    <div
      style={{
        position: 'relative',
        width: Math.round(designWidth * scale),
        height: miniatureHeight,
        background: 'white',
        boxShadow: isDoubleSided ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        borderRadius: isDoubleSided ? 4 : 0,
        overflow: 'hidden',
      }}
    >
      {sortedBlocks.map((block: any) => {
        const isBg = !!block.styles?.isBackground;
        const layout = isBg 
          ? { x: 0, y: 0, w: designWidth, h: dHeight, zIndex: 0 }
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
              zIndex: layout.zIndex + 1,
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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        aspectRatio: containerAspect,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        background: isDoubleSided ? '#f1f5f9' : 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isDoubleSided ? Math.round(gap * scale) : 0,
      }}
    >
      {renderPage(sortedFront)}
      {isDoubleSided && renderPage(sortedBack)}
    </div>
  );
};
