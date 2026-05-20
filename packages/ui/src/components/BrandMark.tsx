import React from 'react';
import { XStack, Text } from 'tamagui';
import { Icon } from './Icon';

type BrandMarkProps = {
  small?: boolean;
  onPress?: () => void;
};

export function BrandMark({ small = false, onPress }: BrandMarkProps) {
  return (
    <XStack ai="center" gap="$2" cursor={onPress ? 'pointer' : undefined} onPress={onPress}>
      <XStack
        w={32}
        h={32}
        br="$3"
        ai="center"
        jc="center"
        bg="#5B8DEF"
        style={{
          background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)',
        }}
      >
        <Icon name="Sparkles" size={16} color="white" />
      </XStack>
      {!small && (
        <Text fontFamily="$display" fontSize={18} fontWeight="$7" letterSpacing={-0.5}>
          Mosaico<Text color="$primary">.</Text>
        </Text>
      )}
    </XStack>
  );
}
