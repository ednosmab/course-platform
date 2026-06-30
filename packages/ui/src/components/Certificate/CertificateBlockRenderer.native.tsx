import React from 'react';
import type { ImageStyle } from 'react-native';
import { Image } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { YStack, XStack, Text } from 'tamagui';
import type { CertificateBlock } from '@projeto/types';

type Props = {
  block: CertificateBlock;
  scale: number;
  fillContainer?: boolean;
  isEditor?: boolean;
  onImageDrop?: (uri: string) => void;
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

const OBJECT_FIT_MAP: Record<string, 'cover' | 'contain' | 'stretch' | 'repeat'> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'stretch',
  'scale-down': 'contain',
  none: 'repeat',
  fill: 'stretch',
};

function toRNTransform(styles?: {
  rotate?: number;
  flipH?: boolean;
  flipV?: boolean;
}): ImageStyle['transform'] | undefined {
  if (!styles) return undefined;
  const transforms: Array<{ rotate: string } | { scaleX: number } | { scaleY: number }> = [];
  if (styles.rotate) transforms.push({ rotate: `${styles.rotate}deg` });
  if (styles.flipH) transforms.push({ scaleX: -1 });
  if (styles.flipV) transforms.push({ scaleY: -1 });
  return transforms.length > 0 ? transforms : undefined;
}

export const CertificateBlockRenderer: React.FC<Props> = ({ block, scale, fillContainer, isEditor }) => {
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
          return (
            <YStack
              w="100%" h="100%"
              borderWidth={2} borderColor="$info" borderRadius="$3"
              ai="center" jc="center" gap="$2" bg="#eff6ff"
            >
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <Rect x="3" y="3" width="18" height="18" rx="2" />
                <Circle cx="8.5" cy="8.5" r="1.5" />
                <Path d="M21 15l-5-5L5 21" />
              </Svg>
              <Text fontSize={12} color="$info" fontWeight="500">Toque para adicionar imagem</Text>
            </YStack>
          );
        }
        return null;
      }

      const resizeMode = OBJECT_FIT_MAP[block.styles?.objectFit || 'contain'] || 'contain';
      const transform = toRNTransform(block.styles);

      if (block.styles?.isBackground) {
        return (
          <Image
            source={{ uri: block.url }}
            style={{
              width: '100%' as any,
              height: '100%' as any,
              resizeMode: 'cover',
              transform,
            }}
          />
        );
      }

      if (fillContainer) {
        return (
          <Image
            source={{ uri: block.url }}
            accessible={!!block.alt}
            accessibilityLabel={block.alt || undefined}
            style={{
              width: '100%' as any,
              height: '100%' as any,
              resizeMode,
              borderRadius: 6,
              transform,
            }}
          />
        );
      }

      const align = block.styles?.align || 'center';
      const layoutW = block.layouts?.desktop?.w;
      const rawWidth = block.styles?.width || (layoutW ? Math.round((layoutW / 1100) * 100) : 80);
      const rawHeight = block.styles?.height;
      const br = Math.round(4 * scale);

      const w = typeof rawWidth === 'string'
        ? parseInt(rawWidth, 10) || 80
        : rawWidth;
      const h = typeof rawHeight === 'string'
        ? parseInt(rawHeight, 10) || undefined
        : rawHeight;

      const imgWidth = Math.round(w * scale);
      const imgHeight = h ? Math.round(h * scale) : undefined;

      return (
        <XStack
          width="100%"
          jc={align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}
        >
          <Image
            source={{ uri: block.url }}
            accessible={!!block.alt}
            accessibilityLabel={block.alt || undefined}
            style={{
              width: imgWidth,
              height: imgHeight || 100,
              borderRadius: br,
              resizeMode,
              transform,
            }}
          />
        </XStack>
      );
    }

    case 'divider': {
      const thickness = block.styles?.thickness ?? 1;
      return (
        <YStack
          width={block.styles?.width || '100%'}
          borderTopWidth={thickness}
          borderTopColor="$gray4"
          height={fmtSize(1, scale)}
        />
      );
    }

    default:
      return null;
  }
};
