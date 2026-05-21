import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Avatar } from './Avatar';

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Avatar — Default</Text>
    <XStack gap="$3">
      <Avatar initials="JD" />
      <Avatar initials="AB" color="$primary" />
      <Avatar initials="MK" size={48} />
    </XStack>
  </YStack>
);

export const CustomSizes = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Avatar — Custom Sizes</Text>
    <XStack gap="$3" ai="center">
      <Avatar initials="SM" size={24} />
      <Avatar initials="MD" size={36} />
      <Avatar initials="LG" size={48} />
      <Avatar initials="XL" size={64} />
    </XStack>
  </YStack>
);
