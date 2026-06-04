'use client';

import React from 'react';
import { YStack, Text } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';

/**
 * Selector "Lado do Certificado" (frente/verso) por bloco. Aparece no
 * rodapé do painel de propriedades de qualquer bloco no editor de
 * certificado, mas só quando a Dupla Face está activa. Substitui o
 * ramo `mode === 'certificate' && certIsDoubleSided` que existia
 * dentro de `BlockSettings.tsx` (boundary rule SDR-001).
 */
export const CertificateBlockSideSelector: React.FC = () => {
  const { blocks, activeBlockId, updateBlock, certIsDoubleSided } = useEditor();
  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  if (!activeBlock || !certIsDoubleSided) return null;

  const currentSide = (activeBlock as any).styles?.side || 'front';

  return (
    <YStack
      gap="$1.5"
      pt="$3"
      mt="$3"
      borderTopWidth={1}
      borderTopColor="$border"
    >
      <Text fontSize={11} fontWeight="600">Lado do Certificado</Text>
      <Text fontSize={9} color="$textMuted" mb="$1">
        Escolha em qual lado exibir este elemento
      </Text>
      <select
        value={currentSide}
        onChange={(e) =>
          updateBlock(activeBlock.id, {
            styles: {
              ...(activeBlock as any).styles,
              side: e.target.value as 'front' | 'back',
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
        <option value="front">Frente do Certificado</option>
        <option value="back">Verso do Certificado</option>
      </select>
    </YStack>
  );
};
