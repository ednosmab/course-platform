'use client';

import React, { useCallback, useState } from 'react';
import { YStack, XStack, Text, Icon, CertificateBlockRenderer } from '@projeto/ui';
import type { AnyBlock } from '@projeto/types';

const DEFAULT_DESIGN_W = 1100;
const A4_RATIO = 1.414;

/**
 * @description Canvas for the certificate editor. Renders certificate blocks
 * using CertificateBlockRenderer (never BlockContent). Supports zoom, side
 * filtering (front/back), and duplex awareness. No viewport toggles, inline
 * editing, marquee selection, or drag/resize — those are lesson-only features.
 * Business rule: Only blocks matching activeSide are rendered when isDoubleSided
 * is true. Background blocks render at full canvas size.
 */
export const CertificateCanvas: React.FC<{
  blocks: AnyBlock[];
  designWidth?: number;
  designHeight?: number;
  activeSide?: 'front' | 'back';
  isDoubleSided?: boolean;
}> = ({
  blocks,
  designWidth = DEFAULT_DESIGN_W,
  designHeight = Math.round(DEFAULT_DESIGN_W / A4_RATIO),
  activeSide = 'front',
  isDoubleSided = false,
}) => {
  const [zoom, setZoom] = useState(1);

  const filteredBlocks = isDoubleSided
    ? blocks.filter((b) => activeSide === 'front'
      ? (b as any).styles?.side !== 'back'
      : (b as any).styles?.side === 'back')
    : blocks;

  const sortedBlocks = [...filteredBlocks].sort(
    (a, b) => (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0),
  );

  const zoomLabel = `${Math.round(zoom * 100)}%`;
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.25, z - 0.1));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.25, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    }
  }, []);

  return (
    <YStack flex={1} bg="$background" onWheel={handleWheel}>
      <XStack
        ai="center" jc="center" gap="$2" p="$2"
        borderBottomWidth={1} borderBottomColor="$border"
        bg="$background" flexShrink={0}
      >
        <XStack
          w={28} h={26} ai="center" jc="center" cursor="pointer"
          borderWidth={1} borderColor="$border" borderRadius="$2"
          hoverStyle={{ bg: '$secondary' }}
          onPress={zoomOut}
        >
          <Icon name="ZoomOut" size={14} />
        </XStack>
        <Text fontSize={12} w={44} textAlign="center" userSelect="none">{zoomLabel}</Text>
        <XStack
          w={28} h={26} ai="center" jc="center" cursor="pointer"
          borderWidth={1} borderColor="$border" borderRadius="$2"
          hoverStyle={{ bg: '$secondary' }}
          onPress={zoomIn}
        >
          <Icon name="ZoomIn" size={14} />
        </XStack>
        {zoom !== 1 && (
          <XStack
            w={28} h={26} ai="center" jc="center" cursor="pointer" ml="$1"
            borderWidth={1} borderColor="$border" borderRadius="$2"
            hoverStyle={{ bg: '$secondary' }}
            onPress={() => setZoom(1)}
          >
            <Icon name="RotateCcw" size={14} />
          </XStack>
        )}
        <Text fontSize={10} color="$textMuted" ml="$2">Ctrl + scroll para zoom</Text>
      </XStack>

      <YStack flex={1} ai="center" bg="$background" style={{ overflow: 'auto' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0 }}>
          <div
            style={{
              position: 'relative',
              width: designWidth,
              height: designHeight,
              background: 'white',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 10px 35px rgba(0,0,0,0.12)',
            }}
          >
            {sortedBlocks.map((block) => {
              const isBg = !!(block as any).styles?.isBackground;
              const layout = block.layouts?.desktop || { x: 0, y: 0, w: 200, h: 100, zIndex: 0 };
              if (isBg) {
                return (
                  <div
                    key={block.id}
                    style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                  >
                    <CertificateBlockRenderer block={block as any} scale={1} fillContainer />
                  </div>
                );
              }
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
                  }}
                >
                  <CertificateBlockRenderer block={block as any} scale={1} fillContainer />
                </div>
              );
            })}
          </div>
        </div>
      </YStack>
    </YStack>
  );
};
