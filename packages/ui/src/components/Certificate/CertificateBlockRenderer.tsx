import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import type { CertificateBlock } from '@projeto/types';

type Props = {
  block: CertificateBlock;
  scale: number;
  fillContainer?: boolean;
  isEditor?: boolean;
  onImageDrop?: (file: File) => void;
};

function fmtSize(px: number, scale: number): number {
  return Math.round(px * scale);
}

const FONT_SIZE: Record<string, number> = {
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
};

export const CertificateBlockRenderer: React.FC<Props> = ({ block, scale, fillContainer, isEditor, onImageDrop }) => {
  switch (block.type) {
    case 'heading': {
      const lvl = block.level || 2;
      const headingSize = lvl === 1 ? 32 : lvl === 2 ? 26 : 20;
      return (
        <Text
          fontSize={fmtSize(headingSize, scale)}
          fontWeight="700"
          fontFamily="$heading"
          textAlign={block.styles?.align || 'center'}
          color="$color"
          width={block.styles?.width || '100%'}
        >
          {block.content}
        </Text>
      );
    }

    case 'text': {
      const fs = FONT_SIZE[block.styles?.fontSize || 'medium'];
      return (
        <Text
          fontSize={fmtSize(fs, scale)}
          textAlign={block.styles?.align || 'center'}
          color="$color"
          width={block.styles?.width || '100%'}
          lineHeight={fmtSize(fs * 1.6, scale)}
        >
          {block.content}
        </Text>
      );
    }

    case 'image': {
      if (!block.url) {
        if (isEditor) {
          const dropHandlers = onImageDrop
            ? {
                onDrop: (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) onImageDrop(file);
                },
                onDragOver: (e: React.DragEvent) => e.preventDefault(),
              }
            : {};
          return (
            <YStack
              w="100%" h="100%"
              borderWidth={2} borderColor="$info" borderRadius="$3" borderStyle="dashed"
              ai="center" jc="center" gap="$2" bg="#eff6ff"
              {...dropHandlers}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <Text fontSize={12} color="$info" fontWeight="500">Arraste uma imagem aqui</Text>
              <Text fontSize={11}>ou cole a URL no painel →</Text>
            </YStack>
          );
        }
        console.warn('[CertificateBlockRenderer] Image block has no URL:', block);
        return null;
      }

      const imgTransform = [
        block.styles?.rotate ? `rotate(${block.styles.rotate}deg)` : '',
        block.styles?.flipH ? `scaleX(-1)` : '',
        block.styles?.flipV ? `scaleY(-1)` : '',
      ].filter(Boolean).join(' ');

      if (block.styles?.isBackground) {
        return (
          <img
            src={block.url}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: block.styles?.objectFit || 'cover',
              display: 'block',
              transform: imgTransform,
            }}
          />
        );
      }

      if (fillContainer) {
        return (
          <img
            src={block.url}
            alt={block.alt || ''}
            style={{ width: '100%', height: '100%', objectFit: (block.styles?.objectFit || 'fill') as any, borderRadius: '6px', display: 'block', transform: imgTransform }}
          />
        );
      }

      const align = block.styles?.align || 'center';
      const layoutW = block.layouts?.desktop?.w;
      const rawWidth = block.styles?.width || (layoutW ? `${Math.round((layoutW / 1100) * 100)}%` : '80%');
      const rawHeight = block.styles?.height;
      const br = Math.round(4 * scale);

      const scaleDim = (val: string | undefined, fallback: string): string => {
        if (!val) return fallback;
        const px = val.match(/^(\d+(?:\.\d+)?)px$/);
        if (px) return `${fmtSize(Number(px[1]), scale)}px`;
        return val;
      };

      const w = scaleDim(rawWidth, '80%');
      const h = scaleDim(rawHeight, 'auto');

      return (
        <XStack
          width="100%"
          jc={align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}
        >
          <img
            src={block.url}
            alt={block.alt || ''}
            style={{ width: w, height: h, borderRadius: br, objectFit: (block.styles?.objectFit || 'contain') as any, transform: imgTransform }}
          />
        </XStack>
      );
    }

    case 'divider': {
      const thickness = block.styles?.thickness ?? 1;
      const style = block.styles?.style || 'solid';
      return (
        <YStack
          width={block.styles?.width || '100%'}
          borderTopWidth={thickness}
          borderTopColor="$gray4"
          style={style !== 'solid' ? { borderTopStyle: style } : undefined}
          height={fmtSize(1, scale)}
        />
      );
    }

    default:
      return null;
  }
};
