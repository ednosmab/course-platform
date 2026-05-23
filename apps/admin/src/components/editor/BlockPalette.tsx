'use client';

import React, { useState } from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';

const CERTIFICATE_BLOCK_TYPES = new Set(['text', 'heading', 'image', 'divider']);

export const BlockPalette: React.FC = () => {
  const { addBlock, mode } = useEditor();
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
          .filter(([, , type]) => mode !== 'certificate' || CERTIFICATE_BLOCK_TYPES.has(type))
          .map(([icon, label, type]) => (
            <BlockBtn key={type} icon={icon} label={label} collapsed={collapsed} onClick={() => addBlock(type)} />
          ))}
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
