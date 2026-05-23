import React from 'react';
import { YStack, XStack, Text, Image } from 'tamagui';
import { CertificateBlock } from '@projeto/types';

type Props = {
  block: CertificateBlock;
  scale: number;
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

export const CertificateBlockRenderer: React.FC<Props> = ({ block, scale }) => {
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
      const align = block.styles?.align || 'center';
      return (
        <XStack
          width="100%"
          jc={align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}
        >
          <Image
            source={{ uri: block.url }}
            width={block.styles?.width || '80%'}
            height={block.styles?.height || undefined}
            style={{ aspectRatio: 16 / 9, borderRadius: 4 * scale, objectFit: 'contain' }}
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
