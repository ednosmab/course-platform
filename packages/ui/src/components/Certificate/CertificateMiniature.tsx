import React from 'react';
import { YStack, Text } from 'tamagui';
import { CertificateBlock } from '@projeto/types';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificateMiniatureProps {
  blocks: CertificateBlock[];
}

export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  blocks,
}) => {
  if (blocks.length === 0) {
    return (
      <YStack
        width="100%"
        height={120}
        bg="$background"
        borderRadius={8}
        borderWidth={1}
        borderColor="$border"
        borderStyle="dashed"
        ai="center"
        jc="center"
      >
        <Text fontSize={12} color="$textMuted">Sem blocos</Text>
      </YStack>
    );
  }

  return (
    <YStack
      width="100%"
      maxHeight={200}
      borderRadius={8}
      overflow="hidden"
      borderWidth={1}
      borderColor="$border"
      bg="white"
    >
      <YStack p={12} gap={8}>
        {blocks.map((block) => (
          <CertificateBlockRenderer key={block.id} block={block} scale={1} />
        ))}
      </YStack>
    </YStack>
  );
};
