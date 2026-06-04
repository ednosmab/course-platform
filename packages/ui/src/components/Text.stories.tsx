import React from 'react';
import { YStack, Text as TamaguiText } from 'tamagui';
import { Text } from './Text';

export const Variants = () => (
  <YStack gap="$3" p="$4">
    <Text variant="h1">Heading 1</Text>
    <Text variant="h2">Heading 2</Text>
    <Text variant="h3">Heading 3</Text>
    <Text variant="body">Body text with regular weight and comfortable line height for reading.</Text>
    <Text variant="caption">Caption text — smaller and muted</Text>
    <Text variant="meta">META LABEL</Text>
  </YStack>
);

export const CustomColors = () => (
  <YStack gap="$3" p="$4">
    <TamaguiText variant="meta">Text — Color Tokens</TamaguiText>
    <Text color="$primary">Primary color text</Text>
    <Text color="$success">Success color text</Text>
    <Text color="$warning">Warning color text</Text>
    <Text color="$danger">Danger color text</Text>
    <Text color="$textMuted">Muted text color</Text>
  </YStack>
);
