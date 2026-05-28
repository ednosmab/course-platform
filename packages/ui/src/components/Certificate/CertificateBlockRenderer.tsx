import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { CertificateBlock } from '@projeto/types';

type Props = {
  block: CertificateBlock;
  scale: number;
  fillContainer?: boolean;
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

export const CertificateBlockRenderer: React.FC<Props> = ({ block, scale, fillContainer }) => {
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
      if (!block.url) return null;

      if (fillContainer) {
        return (
          <img
            src={block.url}
            alt={block.alt || ''}
            style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt || ''}
            style={{ width: w, height: h, borderRadius: br, objectFit: 'contain' }}
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
