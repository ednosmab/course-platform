'use client';

import React, { useState } from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';

export const BlockPalette: React.FC = () => {
  const { addBlock } = useEditor();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <YStack
      w={collapsed ? 72 : 240}
      minWidth={collapsed ? 72 : 240}
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
          onPress={() => setCollapsed(!collapsed)}
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
        p={collapsed ? '$2' : '$3'}
        gap={collapsed ? '$2' : '$2'}
      >
        <BlockBtn icon="Type" label="Texto" collapsed={collapsed} onClick={() => addBlock('text')} />
        <BlockBtn icon="Image" label="Imagem" collapsed={collapsed} onClick={() => addBlock('image')} />
        <BlockBtn icon="Video" label="Vídeo" collapsed={collapsed} onClick={() => addBlock('video')} />
        <BlockBtn icon="HelpCircle" label="Quiz" collapsed={collapsed} onClick={() => addBlock('quiz')} />
        <BlockBtn icon="Quote" label="Citação" collapsed={collapsed} onClick={() => addBlock('quote')} />
        <BlockBtn icon="Code" label="HTML" collapsed={collapsed} onClick={() => addBlock('html')} />
      </YStack>
    </YStack>
  );
};

function BlockBtn({ icon, label, collapsed, onClick }: {
  icon: string;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <YStack
      onPress={onClick}
      cursor="pointer"
      p="$1.5"
      ai="center"
      jc="center"
      gap="$1"
      borderRadius="$2"
      borderWidth={1} borderColor="$border"
      bg="$background"
      hoverStyle={{ y: -1, borderColor: '$primary' }}
      w={collapsed ? '100%' : 'calc(50% - 4px)'}
    >
      <XStack
        w={22} h={22}
        ai="center" jc="center"
        borderRadius="$1"
        bg="$accent"
      >
        <Icon name={icon} size={11} color="$accentForeground" />
      </XStack>
      {!collapsed && <Text fontSize={11} fontWeight="500">{label}</Text>}
    </YStack>
  );
}
