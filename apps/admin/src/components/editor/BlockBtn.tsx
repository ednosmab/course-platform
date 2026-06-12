'use client';

import React from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';

export interface BlockBtnProps {
  icon: string;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}

export function BlockBtn({ icon, label, collapsed, onClick }: BlockBtnProps) {
  return (
    <YStack
      onPress={onClick}
      cursor="pointer"
      role="button"
      tabIndex={0}
      aria-label={`Adicionar bloco ${label}`}
      onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      p="$2"
      ai="center"
      jc="center"
      gap="$1"
      borderRadius="$2"
      borderWidth={1} borderColor="$border"
      bg="$background"
      hoverStyle={{ y: -1, borderColor: '$primary' }}
      flexShrink={0}
      w={collapsed ? '100%' : 92}
    >
      <XStack
        w={28} h={28}
        ai="center" jc="center"
      >
        <Icon name={icon} size={14} color="$secondaryForeground" />
      </XStack>
      {!collapsed && <Text fontSize={12} fontWeight="500">{label}</Text>}
    </YStack>
  );
}
