import React from 'react';
import { XStack, Text } from 'tamagui';

type AvatarProps = {
  initials: string;
  size?: number;
  color?: string;
};

export function Avatar({ initials, size = 36, color }: AvatarProps) {
  return (
    <XStack
      w={size}
      h={size}
      br={size / 2}
      ai="center"
      jc="center"
      bg={color || '$secondary'}
    >
      <Text
        fontFamily="$body"
        fontSize={size * 0.35}
        fontWeight="$7"
        color="$text"
      >
        {initials}
      </Text>
    </XStack>
  );
}
