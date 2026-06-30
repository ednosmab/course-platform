import React, { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { YStack, Text } from 'tamagui';
import type { CertificateBlock } from '@projeto/types';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificateMiniatureProps {
  blocks: CertificateBlock[];
  designWidth?: number;
  designHeight?: number;
  isDoubleSided?: boolean;
}

/**
 * Native (React Native) version of the certificate miniature.
 *
 * Uses `onLayout` instead of `ResizeObserver`, and renders a simplified
 * layout without absolute positioning (which is complex to replicate
 * accurately on native). The preview shows the blocks stacked vertically
 * inside a scaled container.
 */
export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  blocks,
  designWidth = 1100,
  designHeight,
  isDoubleSided = false,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const dHeight = designHeight || Math.round(designWidth / 1.414);
  const scale = containerWidth > 0 ? Math.min(1, (containerWidth - 4) / designWidth) : 0;
  const miniatureHeight = Math.round(dHeight * scale);

  const handleLayout = (e: LayoutChangeEvent) => {
    const cw = e.nativeEvent.layout.width;
    if (cw > 0 && cw !== containerWidth) {
      setContainerWidth(cw);
    }
  };

  const gap = 16;

  const frontBlocks = blocks.filter((b: any) => ((b as any).styles?.side || 'front') === 'front');
  const backBlocks = blocks.filter((b: any) => (b as any).styles?.side === 'back');

  const sortBlocks = (blockArray: CertificateBlock[]) =>
    [...blockArray].sort((a: any, b: any) => {
      const aBg = a.styles?.isBackground ? 1 : 0;
      const bBg = b.styles?.isBackground ? 1 : 0;
      if (aBg !== bBg) return aBg - bBg;
      return (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0);
    });

  const sortedFront = sortBlocks(frontBlocks);
  const sortedBack = sortBlocks(backBlocks);

  const renderPage = (sortedBlocks: CertificateBlock[], key: string) => (
    <YStack
      key={key}
      width={Math.round(designWidth * scale)}
      height={miniatureHeight}
      bg="white"
      borderRadius={isDoubleSided ? 4 : 0}
      overflow="hidden"
    >
      {sortedBlocks.map((block: any) => {
        const isBg = !!block.styles?.isBackground;
        const layout = isBg
          ? { x: 0, y: 0, w: designWidth, h: dHeight, zIndex: 0 }
          : (block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 });
        return (
          <YStack
            key={block.id}
            position="absolute"
            left={layout.x * scale}
            top={layout.y * scale}
            width={layout.w * scale}
            height={layout.h * scale}
            zIndex={(layout.zIndex ?? 0) + 1}
            overflow="hidden"
            borderRadius={isBg ? 0 : 6 * scale}
          >
            <CertificateBlockRenderer block={block} scale={scale} fillContainer />
          </YStack>
        );
      })}
    </YStack>
  );

  if (blocks.length === 0) {
    return (
      <YStack
        width="100%"
        height={120}
        bg="$background"
        borderRadius={8}
        borderWidth={1}
        borderColor="$border"
        ai="center"
        jc="center"
      >
        <Text fontSize={12} color="$textMuted">Sem blocos</Text>
      </YStack>
    );
  }

  return (
    <YStack
      width="100%"
      borderRadius={8}
      overflow="hidden"
      borderWidth={1}
      borderColor="$border"
      bg={isDoubleSided ? '#f1f5f9' : 'white'}
      ai="center"
      jc="center"
      gap={isDoubleSided ? Math.round(gap * scale) : 0}
      onLayout={handleLayout}
    >
      {renderPage(sortedFront, 'front')}
      {isDoubleSided && sortedBack.length > 0 && renderPage(sortedBack, 'back')}
    </YStack>
  );
};
