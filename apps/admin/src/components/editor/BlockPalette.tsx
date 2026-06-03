'use client';

import React, { useState } from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { BlockBtn } from './BlockBtn';

export const BlockPalette: React.FC = () => {
  const { addBlock, allowedBlockTypes } = useEditor();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <YStack
      w={collapsed ? 72 : 240}
      minWidth={collapsed ? 72 : 240}
      h="100%"
      overflowY="auto"
      borderRightWidth={1}
      borderRightColor="$border"
      bg="$background"
      style={{ transition: 'width 0.2s ease, min-width 0.2s ease' }}
    >
      <XStack
        jc={collapsed ? 'center' : 'flex-end'}
        p={collapsed ? '$3' : '$2'}
      >
        <XStack
          w={28} h={28}
          ai="center" jc="center"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$3"
          bg="$background"
          cursor="pointer"
          role="button"
          tabIndex={0}
          aria-label={collapsed ? 'Expandir paleta' : 'Recolher paleta'}
          onPress={() => setCollapsed(!collapsed)}
          onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(!collapsed); } }}
          hoverStyle={{ borderColor: '$primary' }}
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </XStack>
      </XStack>

      {!collapsed && (
        <YStack px={24} pt="$3" pb={0}>
          <Text fontSize={12} fontWeight="600" textTransform="uppercase" letterSpacing={0.5} color="$textSecondary">
            Conteúdo
          </Text>
          <Text fontSize={12} color="$textMuted" mt="$1">
            Arraste ou clique para adicionar
          </Text>
        </YStack>
      )}

      <YStack
        flexWrap="wrap"
        flexDirection={collapsed ? 'column' : 'row'}
        jc={collapsed ? undefined : 'center'}
        p={collapsed ? '$2' : '$3'}
        gap={collapsed ? '$2' : '$2'}
      >
        {([
          ['Type', 'Texto', 'text' as const],
          ['Heading', 'Título', 'heading' as const],
          ['Image', 'Imagem', 'image' as const],
          ['Video', 'Vídeo', 'video' as const],
          ['HelpCircle', 'Quiz', 'quiz' as const],
          ['Quote', 'Citação', 'quote' as const],
          ['Minus', 'Divisor', 'divider' as const],
          ['Code', 'HTML', 'html' as const],
        ] as const)
          .filter(([, , type]) => allowedBlockTypes.has(type))
          .map(([icon, label, type]) => (
            <BlockBtn key={type} icon={icon} label={label} collapsed={collapsed} onClick={() => addBlock(type)} />
          ))}
      </YStack>
    </YStack>
  );
};
