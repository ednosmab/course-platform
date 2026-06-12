/**
 * CertificateDetailCard - Modal content for certificate details.
 *
 * Displays certificate preview, course info, validation code,
 * and action buttons (download PDF, share).
 */

import React from 'react';
import { YStack, XStack, Text, Button, Card, Icon } from '@projeto/ui';
import { Certificate, Course, CertificateBlock } from '@projeto/types';
import { CertificateMiniature } from '@projeto/ui';
import { printCertificate } from '../services/certificate-actions';

export interface CertificateWithCourse extends Certificate {
  course?: Course;
  gradient: string;
  category: string;
  certificate_blocks?: CertificateBlock[];
  designWidth?: number;
  designHeight?: number;
  isDoubleSided?: boolean;
}

interface CertificateDetailCardProps {
  certificate: CertificateWithCourse;
  onClose: () => void;
}

export function CertificateDetailCard({ certificate, onClose }: CertificateDetailCardProps) {
  const formattedDate = new Date(certificate.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <YStack gap="$4" p="$4">
      {/* Certificate Preview Card */}
      {certificate.certificate_blocks && certificate.certificate_blocks.length > 0 ? (
        <YStack alignSelf="center" w={200} h={141} overflow="hidden" br="$3">
          <CertificateMiniature
            blocks={certificate.certificate_blocks}
            designWidth={certificate.designWidth || 1100}
            designHeight={certificate.designHeight || 778}
            isDoubleSided={certificate.isDoubleSided || false}
          />
        </YStack>
      ) : (
        <Card
          w={200}
          h={141}
          p={0}
          overflow="hidden"
          br="$3"
          alignSelf="center"
        >
          <YStack
            flex={1}
            style={{ background: certificate.gradient }}
            p="$3"
            jc="space-between"
          >
            <XStack ai="center" jc="space-between">
              <YStack w={24} h={24} br="$2" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                <Icon name="Sparkles" size={12} color="$white" />
              </YStack>
              <YStack px="$1.5" py="$0.5" br="$2" bg="rgba(255,255,255,0.2)">
                <Text fontSize={8} fontWeight="600" color="$white" textTransform="uppercase">
                  {certificate.category}
                </Text>
              </YStack>
            </XStack>

            <YStack>
              <Text fontSize={8} color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing={1}>
                Certificado de conclusão
              </Text>
              <Text fontSize={11} fontWeight="bold" color="$white" numberOfLines={2} mt="$0.5">
                {certificate.course?.title || 'Curso'}
              </Text>
            </YStack>

            <XStack ai="center" jc="space-between">
              <Text fontSize={8} color="rgba(255,255,255,0.9)">
                {certificate.course?.author_id || 'Instrutor'}
              </Text>
              <XStack ai="center" gap="$0.5">
                <Icon name="CheckCircle" size={8} color="$white" />
                <Text fontSize={8} color="$white">Autenticado</Text>
              </XStack>
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Course Title */}
      <YStack gap="$1" alignItems="center">
        <Text variant="h3" fontWeight="bold" textAlign="center">
          {certificate.course?.title || 'Curso'}
        </Text>
        <Text fontSize={13} color="$textMuted" textAlign="center">
          Concluído em {formattedDate}
        </Text>
      </YStack>

      {/* Validation Code */}
      <YStack
        gap="$2"
        p="$3"
        bg="$secondary"
        br="$3"
        borderWidth={1}
        borderColor="$border"
      >
        <XStack ai="center" gap="$2">
          <Icon name="Shield" size={16} color="$primary" />
          <Text fontSize={12} fontWeight="600" color="$text">
            Código de validação
          </Text>
        </XStack>
        <Text
          fontSize={14}
          fontWeight="bold"
          color="$text"
          letterSpacing={2}
        >
          {certificate.uuid_extranet}
        </Text>
      </YStack>

      {/* Action Buttons */}
      <XStack gap="$3">
        <Button flex={1} onPress={() => printCertificate(
          certificate.certificate_blocks || [],
          certificate.designWidth || 1100,
          certificate.designHeight || 778,
        )}>
          <Icon name="Printer" size={16} color="$white" />
          <Text ml="$2" fontSize={13} fontWeight="600" color="$white">
            Imprimir
          </Text>
        </Button>
        <Button flex={1} variant="secondary" onPress={() => {}}>
          <Icon name="Share2" size={16} color="$text" />
          <Text ml="$2" fontSize={13} fontWeight="600" color="$text">
            Compartilhar
          </Text>
        </Button>
      </XStack>

      {/* Close Button */}
      <Button variant="ghost" onPress={onClose}>
        <Text fontSize={13} color="$textMuted">
          Fechar
        </Text>
      </Button>
    </YStack>
  );
}
