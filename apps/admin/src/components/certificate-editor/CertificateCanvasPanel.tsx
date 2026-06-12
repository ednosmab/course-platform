'use client';

import React from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';
import { A4_PRESETS, A4_RATIO } from '../../context/editor-modes';

/**
 * Painel lateral do editor de certificado mostrado quando **nenhum
 * bloco está activo**. Permite ao admin escolher o tamanho do canvas
 * (preset A4 paisagem).
 *
 * Boundary rule (SDR-001): este componente vive em `certificate-editor/`
 * e NUNCA é importado por `BlockSettings.tsx`. O `CertificateEditor`
 * decide quando o renderizar (em alternativa a `BlockSettings`).
 */
export const CertificateCanvasPanel: React.FC<{
  designWidth: number;
  designHeight: number;
  onSelectPreset: (w: number, h: number) => void;
  onToggleCollapse?: () => void;
}> = ({ designWidth, designHeight, onSelectPreset, onToggleCollapse }) => (
  <YStack w={320} minWidth={320} h="100%" borderLeftWidth={1} borderLeftColor="$border" bg="$background">
    <YStack px="$5" pt="$4" pb="$3" borderBottomWidth={1} borderBottomColor="$border" flexShrink={0}>
      <XStack ai="center" jc="space-between">
        <Text fontSize={11} fontWeight="700" textTransform="uppercase" color="$textSecondary" letterSpacing={0.5}>Certificado</Text>
        {onToggleCollapse && (
          <XStack
            w={26} h={26} ai="center" jc="center"
            borderWidth={1} borderColor="$border" borderRadius="$3" bg="$background"
            cursor="pointer" role="button" tabIndex={0}
            aria-label="Recolher painel"
            onPress={onToggleCollapse}
            onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleCollapse(); } }}
            hoverStyle={{ borderColor: '$primary' }}
          >
            <Icon name="ChevronRight" size={14} />
          </XStack>
        )}
      </XStack>
    </YStack>
    <YStack p="$4" gap="$3" overflowY="auto" flex={1}>
      <Text fontSize={11} fontWeight="600">Tamanho do Canvas</Text>
      <Text fontSize={10} color="$textMuted">Dimensões em proporção A4 paisagem (297×210mm)</Text>
      <XStack flexWrap="wrap" gap="$2">
        {A4_PRESETS.map((p) => {
          const active = designWidth === p.width;
          const h = Math.round(p.width / A4_RATIO);
          return (
            <XStack
              key={p.width}
              onPress={() => onSelectPreset(p.width, h)}
              px="$3" py="$2"
              borderRadius="$3"
              borderWidth={active ? 2 : 1}
              borderColor={active ? '$primary' : '$border'}
              bg={active ? 'rgba(59,130,246,0.06)' : '$background'}
              cursor="pointer"
              hoverStyle={{ borderColor: '$primary', bg: 'rgba(59,130,246,0.03)' }}
              ai="center" gap="$2"
            >
              <Text fontSize={13} fontWeight={active ? '700' : '500'} color={active ? '$primary' : '$text'}>{p.label}</Text>
              <Text fontSize={10} color="$textMuted">{p.width}×{h}</Text>
            </XStack>
          );
        })}
      </XStack>
      <XStack ai="center" gap="$2" pt="$2" borderTopWidth={1} borderTopColor="$border">
        <Text fontSize={11} color="$textMuted">Atual:</Text>
        <Text fontSize={11} fontWeight="600">{designWidth} × {designHeight}</Text>
      </XStack>
    </YStack>
  </YStack>
);
