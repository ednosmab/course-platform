'use client';

import React from 'react';
import { YStack, XStack, Text } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { A4_PRESETS, A4_RATIO } from '../../context/editor-modes';

/**
 * Secção "Tamanho do Certificado + Dupla Face" que aparece no topo da
 * tab "Propriedades" do editor de certificado. Substitui o ramo
 * `mode === 'certificate'` que existia dentro de `BlockSettings.tsx`
 * (boundary rule SDR-001).
 */
export const CertificateCertSettings: React.FC = () => {
  const {
    certDesignWidth,
    setCertDesignSize,
    certIsDoubleSided,
    setCertIsDoubleSided,
  } = useEditor();

  return (
    <YStack
      pb="$3"
      mb="$3"
      borderBottomWidth={1}
      borderBottomColor="$border"
      gap="$3"
    >
      <YStack gap="$1.5">
        <Text fontSize={11} fontWeight="600">Tamanho do Certificado</Text>
        <XStack flexWrap="wrap" gap="$2">
          {A4_PRESETS.map((p) => {
            const active = certDesignWidth === p.width;
            const h = Math.round(p.width / A4_RATIO);
            return (
              <XStack
                key={p.width}
                onPress={() => setCertDesignSize(p.width, h)}
                px="$2" py="$1"
                borderRadius="$2"
                borderWidth={active ? 2 : 1}
                borderColor={active ? '$primary' : '$border'}
                bg={active ? 'rgba(59,130,246,0.06)' : '$background'}
                cursor="pointer"
                hoverStyle={{ borderColor: '$primary' }}
                ai="center" gap="$1"
              >
                <Text fontSize={11} fontWeight={active ? '700' : '500'} color={active ? '$primary' : '$text'}>{p.label}</Text>
                <Text fontSize={9} color="$textMuted">{p.width}×{h}</Text>
              </XStack>
            );
          })}
        </XStack>
      </YStack>

      <XStack
        ai="center"
        jc="space-between"
        pt="$2"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <YStack gap={2}>
          <Text fontSize={11} fontWeight="600">Frente e Verso (Dupla Face)</Text>
          <Text fontSize={9} color="$textMuted">Habilita uma segunda página no verso</Text>
        </YStack>
        <input
          type="checkbox"
          checked={certIsDoubleSided}
          onChange={(e) => setCertIsDoubleSided(e.target.checked)}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      </XStack>
    </YStack>
  );
};
