import React, { useMemo, useState, useCallback } from 'react';
import { YStack, color } from '@projeto/ui';
import type { AnyBlock } from '@projeto/types';
import { getBlockLayout, calcPageHeight, getDesignWidth } from '@projeto/core';
import { BlockRenderer as SharedBlockRenderer } from '@projeto/renderer';
import { useCachedImage } from '../hooks/useCachedImage';

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
  savedStates?: Record<string, any>;
  onBlockStateChange?: (blockId: string, state: any) => void;
}

/**
 * Wrapper component that resolves a single image URL to a cached local path.
 * Uses useCachedImage hook to handle the resolution.
 */
const OfflineImageBlock: React.FC<{
  block: AnyBlock;
  isMobile: boolean;
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition: number;
  savedStates?: Record<string, any>;
  onBlockStateChange?: (blockId: string, state: any) => void;
}> = ({ block, isMobile, onVideoProgress, savedPosition, savedStates, onBlockStateChange }) => {
  const imageUrl = block.type === 'image' ? (block as any).url : undefined;
  const { localPath } = useCachedImage(imageUrl);

  const imageResolver = useCallback(
    async (url: string) => {
      if (localPath) return localPath;
      return url;
    },
    [localPath]
  );

  return (
    <SharedBlockRenderer
      block={block}
      isMobile={isMobile}
      onVideoProgress={onVideoProgress}
      savedPosition={savedPosition}
      savedStates={savedStates}
      onBlockStateChange={onBlockStateChange}
      imageResolver={imageResolver}
    />
  );
};

/**
 * Student app block renderer that uses the shared BlockRenderer component.
 * This ensures visual fidelity with the admin preview (ADR-005).
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0, savedStates, onBlockStateChange }) => {
  const [containerWidth, setContainerWidth] = useState(860);

  // Design width: breakpoint reference (860 desktop, 720 tablet, 380 mobile)
  const designWidth = useMemo(() => getDesignWidth(containerWidth), [containerWidth]);
  const pageH = useMemo(() => calcPageHeight(blocks, containerWidth), [blocks, containerWidth]);

  // Scale down only when container is narrower than design width; never scale up
  const scale = useMemo(() => {
    return Math.min(1, containerWidth / designWidth);
  }, [containerWidth, designWidth]);

  const isMobile = useMemo(() => containerWidth <= 480, [containerWidth]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent?.layout?.width;
    if (w) {
      setContainerWidth(w);
    }
  };

  if (!blocks.length) return null;

  return (
    <YStack
      width="100%"
      onLayout={onLayout}
      overflow="hidden"
      height={pageH * scale}
      position="relative"
      bg="$background"
    >
      {/* Left-aligned, white background — matches the editor PreviewCanvas exactly */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: designWidth,
          height: pageH,
          backgroundColor: color.cwBackground,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
          overflow: 'visible',
        }}
      >
        {blocks.map(block => {
          const l = getBlockLayout(block, containerWidth);

          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: l.x,
                top: l.y,
                width: l.w,
                height: l.h,
                zIndex: l.zIndex + 1,
                overflow: 'hidden',
              }}
            >
              {block.type === 'image' ? (
                <OfflineImageBlock
                  block={block}
                  isMobile={isMobile}
                  onVideoProgress={onVideoProgress}
                  savedPosition={savedPosition}
                  savedStates={savedStates}
                  onBlockStateChange={onBlockStateChange}
                />
              ) : (
                <SharedBlockRenderer
                  block={block}
                  isMobile={isMobile}
                  onVideoProgress={onVideoProgress}
                  savedPosition={savedPosition}
                  savedStates={savedStates}
                  onBlockStateChange={onBlockStateChange}
                />
              )}
            </div>
          );
        })}
      </div>
    </YStack>
  );
};
