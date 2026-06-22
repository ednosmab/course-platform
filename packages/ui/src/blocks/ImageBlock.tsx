import React from 'react';
import { YStack } from 'tamagui';
import { Image } from 'react-native';
import type { ImageBlock } from '@projeto/types';

type Props = {
  block: ImageBlock;
};

export const ImageBlockRenderer: React.FC<Props> = ({ block }) => {
  if (!block.url) return null;

  const align = block.styles?.align || 'center';
  const borderRadius = block.styles?.borderRadius ? parseInt(block.styles.borderRadius) : 8;

  return (
    <YStack
      width="100%"
      ai={align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}
      my="$3"
    >
      <Image
        source={{ uri: block.url }}
        accessibilityLabel={block.alt || 'Image'}
        style={{
          width: '100%',
          height: undefined,
          aspectRatio: 16 / 9,
          borderRadius,
        }}
        resizeMode="contain"
      />
    </YStack>
  );
};
