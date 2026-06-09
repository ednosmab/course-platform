import React from 'react';
import { XStack, Text } from 'tamagui';
import { Icon } from '../Icon';

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <XStack
      gap={4}
      px={8}
      py={4}
      borderRadius={16}
      borderWidth={1}
      borderColor="$border"
      backgroundColor="$card"
      ai="center"
    >
      <Text fontSize={12} fontFamily="$display">{label}</Text>
      <XStack
        ml={4}
        p={2}
        borderRadius={4}
        cursor="pointer"
        hoverStyle={{ backgroundColor: '$secondary' }}
        onPress={onRemove}
      >
        <Icon name="X" size={12} color="$textMuted" />
      </XStack>
    </XStack>
  );
}
