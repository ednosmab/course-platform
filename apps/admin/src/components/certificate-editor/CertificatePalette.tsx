'use client';

import React from 'react';
import { YStack, Text } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { BlockBtn } from '../editor/BlockBtn';
import { CERTIFICATE_BLOCK_TYPES } from './certificate-block-types';

/**
 * @description Palette for the certificate editor. Renders buttons for the 4
 * certificate-compatible block types (text, heading, image, divider) using the
 * shared BlockBtn component. Always expanded — no collapse toggle.
 * Business rule: Only types in CERTIFICATE_BLOCK_TYPES filtered by context's
 * allowedBlockTypes are shown.
 */
export const CertificatePalette: React.FC = () => {
  const { addBlock, allowedBlockTypes } = useEditor();

  return (
    <YStack
      w={240}
      minWidth={240}
      h="100%"
      overflowY="auto"
      borderRightWidth={1}
      borderRightColor="$border"
      bg="$background"
    >
      <YStack px={24} pt="$3" pb={0}>
        <Text fontSize={12} fontWeight="600" textTransform="uppercase" letterSpacing={0.5} color="$textSecondary">
          Conteúdo
        </Text>
        <Text fontSize={12} color="$textMuted" mt="$1">
          Arraste ou clique para adicionar
        </Text>
      </YStack>

      <YStack
        flexWrap="wrap"
        flexDirection="row"
        jc="center"
        p="$3"
        gap="$2"
      >
        {CERTIFICATE_BLOCK_TYPES
          .filter(({ type }) => allowedBlockTypes.has(type))
          .map(({ icon, label, type }) => (
            <BlockBtn key={type} icon={icon} label={label} collapsed={false} onClick={() => addBlock(type)} />
          ))}
      </YStack>
    </YStack>
  );
};
