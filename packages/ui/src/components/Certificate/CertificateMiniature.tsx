import React, { useState } from 'react';
import { YStack, Text, Image } from 'tamagui';
import { CertificateBlock } from '@projeto/types';

export interface CertificateMiniatureProps {
  blocks: CertificateBlock[];
  certificateUrl?: string | null;
}

export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  blocks,
  certificateUrl,
}) => {
  const [imgError, setImgError] = useState(false);

  if (certificateUrl && !imgError) {
    return (
      <YStack
        width="100%"
        height={180}
        borderRadius={8}
        overflow="hidden"
        borderWidth={1}
        borderColor="$border"
      >
        <Image
          source={{ uri: certificateUrl }}
          width="100%"
          height={180}
          objectFit="cover"
          onError={() => setImgError(true)}
        />
      </YStack>
    );
  }

  return (
    <YStack
      width="100%"
      height={180}
      bg="$background"
      borderRadius={8}
      borderWidth={1}
      borderColor="$border"
      borderStyle="dashed"
      overflow="hidden"
      ai="center"
      jc="center"
      px={12}
      gap={4}
    >
      {blocks.length === 0 ? (
        <Text fontSize={12} color="$textMuted">Nenhum bloco adicionado</Text>
      ) : (
        <YStack width="100%" ai="center" gap={6}>
          {blocks.slice(0, 3).map((block) => (
            <YStack
              key={block.id}
              width="90%"
              height={block.type === 'divider' ? 2 : 24}
              bg={block.type === 'divider' ? '$border' : '$backgroundPress'}
              borderRadius={4}
              ai="center"
              jc="center"
            >
              {block.type !== 'divider' && (
                <Text fontSize={8} color="$textMuted" numberOfLines={1}>
                  {block.type === 'text'
                    ? (block.props?.content as string)?.slice(0, 40) || 'Texto'
                    : block.type === 'heading'
                      ? (block.props?.content as string)?.slice(0, 40) || 'Título'
                      : block.type === 'image'
                        ? '🖼️ Imagem'
                        : block.type}
                </Text>
              )}
            </YStack>
          ))}
          {blocks.length > 3 && (
            <Text fontSize={9} color="$textMuted">+{blocks.length - 3} blocos</Text>
          )}
        </YStack>
      )}
    </YStack>
  );
};