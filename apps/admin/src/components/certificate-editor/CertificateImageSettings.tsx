'use client';

import React from 'react';
import { YStack, XStack, Text } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import type { ImageBlock } from '@projeto/types';

/**
 * Image block settings that are exclusive to the certificate editor.
 *
 * Boundary rule (SDR-001): the lesson editor's `BlockSettings.tsx` must
 * NOT carry `mode === 'certificate'` branches. The certificate-only
 * controls (background-image flag, default `objectFit: 'cover'`) live
 * here and are rendered by `CertificateEditor` alongside the standard
 * `BlockSettings` panel.
 */
export const CertificateImageSettings: React.FC = () => {
  const { blocks, activeBlockId, updateBlock } = useEditor();
  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  if (!activeBlock || activeBlock.type !== 'image') return null;
  const imageBlock = activeBlock as ImageBlock;

  return (
    <YStack
      gap="$2"
      pt="$2"
      mt="$2"
      borderTopWidth={1}
      borderTopColor="$border"
    >
      <XStack ai="center" jc="space-between">
        <Text fontSize={11} fontWeight="600">Imagem de Fundo</Text>
        <input
          type="checkbox"
          checked={!!imageBlock.styles?.isBackground}
          onChange={(e) => {
            const isBg = e.target.checked;
            updateBlock(imageBlock.id, {
              styles: {
                ...imageBlock.styles,
                isBackground: isBg,
                objectFit: isBg
                  ? 'cover'
                  : (imageBlock.styles?.objectFit || 'contain'),
              },
            });
          }}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      </XStack>

      <YStack mt="$1">
        <Text fontSize={11} fontWeight="500">Ajuste de Imagem (Fit)</Text>
        <select
          value={imageBlock.styles?.objectFit || 'cover'}
          onChange={(e) =>
            updateBlock(imageBlock.id, {
              styles: {
                ...imageBlock.styles,
                objectFit: e.target.value as 'cover' | 'contain' | 'fill',
              },
            })
          }
          style={{
            height: 34,
            borderRadius: '6px',
            border: '1px solid var(--border-light)',
            padding: '0 8px',
            fontSize: 12,
            outline: 'none',
            background: 'white',
            width: '100%',
          }}
        >
          <option value="cover">Cortar para Caber (Cover)</option>
          <option value="contain">Conter Proporção (Contain)</option>
          <option value="fill">Preencher/Esticar (Fill)</option>
        </select>
      </YStack>
    </YStack>
  );
};
