import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Icon } from './Icon';

export const CommonIcons = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Icon — Common Icons</Text>
    <XStack gap="$3" flexWrap="wrap">
      <Icon name="Trash2" size={24} />
      <Icon name="Plus" size={24} />
      <Icon name="CheckCircle" size={24} color="#10b981" />
      <Icon name="AlertCircle" size={24} color="#ef4444" />
      <Icon name="HelpCircle" size={24} color="#6366f1" />
      <Icon name="Eye" size={24} />
      <Icon name="EyeOff" size={24} />
      <Icon name="Undo2" size={24} />
      <Icon name="Redo2" size={24} />
    </XStack>
  </YStack>
);

export const Sizes = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Icon — Size Variants</Text>
    <XStack ai="center" gap="$3">
      <Icon name="Star" size={12} />
      <Icon name="Star" size={16} />
      <Icon name="Star" size={24} />
      <Icon name="Star" size={32} />
      <Icon name="Star" size={48} />
    </XStack>
  </YStack>
);

export const UnknownIcon = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Icon — Unknown Name (no render)</Text>
    <Icon name="NonExistentIcon" size={24} />
    <Text variant="caption">(should render nothing)</Text>
  </YStack>
);
