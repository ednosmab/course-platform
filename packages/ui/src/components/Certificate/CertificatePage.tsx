import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Icon } from '../Icon';
import { CertificateBlock } from '@projeto/types';
import { useA4Scale, DESIGN_W } from './useA4Scale';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface Signature {
  name: string;
  title: string;
}

export interface CertificatePageProps {
  studentName: string;
  courseName: string;
  workloadHours: number;
  completionDate: string;
  serialNumber: string;
  signatures: Signature[];
  blocks: CertificateBlock[];
  logoUrl?: string;
  platformName?: string;
  accentColor?: string;
  title?: string;
  subtitle?: string;
  bodyPrefix?: string;
  bodySuffix?: string;
  sealText?: string;
  cardBg?: string;
}

function fmtSize(px: number, scale: number): number {
  return Math.round(px * scale);
}

export const CertificatePage: React.FC<CertificatePageProps> = ({
  studentName,
  courseName,
  workloadHours,
  completionDate,
  serialNumber,
  signatures,
  blocks,
  logoUrl,
  platformName,
  accentColor = '$warning',
  title = 'CERTIFICADO DE CONCLUSÃO',
  subtitle = 'Certificamos com distinção acadêmica que o(a) aluno(a)',
  bodyPrefix = 'concluiu com aproveitamento e êxito todos os módulos teóricos e práticos do curso',
  bodySuffix = ', totalizando uma carga horária curricular de',
  sealText = 'Aprovado pelo Conselho',
  cardBg = '$cwCard',
}) => {
  const { containerRef, pageWidth, pageHeight, scale, ready } = useA4Scale();

  if (!ready || pageWidth <= 0) {
    return <div ref={containerRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />;
  }

  const s = scale;
  const gold = accentColor;
  const hoursLabel = workloadHours === 1 ? 'hora acadêmica' : 'horas acadêmicas';

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden', background: 'var(--bg)' }} id="certificate-page">
      <YStack
        id="certificate-a4-canvas"
        w={pageWidth}
        h={pageHeight}
        bg={cardBg}
        br={fmtSize(8, s)}
        position="relative"
        overflow="hidden"
        style={{
          boxShadow: '0 10px 35px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Double border frame */}
        <YStack
          position="absolute"
          inset={fmtSize(26, s)}
          borderWidth={1}
          borderColor={gold}
          pointerEvents="none"
        >
          <YStack
            position="absolute"
            inset={fmtSize(5, s)}
            borderWidth={2}
            borderColor={gold}
            opacity={0.4}
          />
        </YStack>

        {/* Decorative corners */}
        <YStack
          position="absolute"
          w={fmtSize(126, s)}
          h={fmtSize(126, s)}
          top={fmtSize(16, s)}
          left={fmtSize(16, s)}
          borderWidth={4}
          borderColor={gold}
          borderRightWidth={0}
          borderBottomWidth={0}
          pointerEvents="none"
        />
        <YStack
          position="absolute"
          w={fmtSize(126, s)}
          h={fmtSize(126, s)}
          bottom={fmtSize(16, s)}
          right={fmtSize(16, s)}
          borderWidth={4}
          borderColor={gold}
          borderLeftWidth={0}
          borderTopWidth={0}
          pointerEvents="none"
        />

        {/* Certificate body */}
        <YStack
          flex={1}
          px={fmtSize(68, s)}
          py={fmtSize(58, s)}
          jc="space-between"
          position="relative"
          zIndex={10}
        >
          {/* Header: logo + serial */}
          <XStack jc="space-between" ai="center" borderBottomWidth={1} borderBottomColor="$gray2" pb={fmtSize(16, s)}>
            <XStack ai="center" gap={fmtSize(8, s)}>
              {logoUrl ? (
                <img src={logoUrl} alt="" style={{ width: fmtSize(24, s), height: fmtSize(24, s), objectFit: 'contain' }} />
              ) : (
                <Icon name="Award" size={fmtSize(24, s)} color={gold} />
              )}
              <Text fontSize={fmtSize(14, s)} fontWeight="700" letterSpacing={2} color="$color">
                {platformName || 'PLATAFORMA DE ENSINO'}
              </Text>
            </XStack>
            <Text fontSize={fmtSize(12, s)} color="$gray5" fontWeight="600">
              VALIDAÇÃO: {serialNumber}
            </Text>
          </XStack>

          {/* Content */}
          <YStack flex={1} ai="center" jc="center" gap={fmtSize(16, s)}>
            <Text
              fontSize={fmtSize(40, s)}
              fontWeight="700"
              fontFamily="$heading"
              letterSpacing={1}
              color="$color"
              textAlign="center"
            >
              {title}
            </Text>

            <Text
              fontSize={fmtSize(18, s)}
              fontStyle="italic"
              fontFamily="$heading"
              color="$gray5"
              textAlign="center"
            >
              {subtitle}
            </Text>

            <Text
              fontSize={fmtSize(34, s)}
              fontWeight="700"
              color="$color"
              textAlign="center"
              borderBottomWidth={2}
              borderBottomColor={gold}
              pb={fmtSize(4, s)}
              px={fmtSize(24, s)}
            >
              {studentName}
            </Text>

            <Text
              fontSize={fmtSize(14, s)}
              color="$gray5"
              textAlign="center"
              maxWidth="85%"
              lineHeight={fmtSize(22, s)}
            >
              {bodyPrefix}{' '}
              <Text fontWeight="600" color="$color">{courseName}</Text>
              {bodySuffix}{' '}
              <Text fontWeight="600" color="$color">{workloadHours} {hoursLabel}</Text>.
            </Text>

            {/* Certificate blocks from CMS */}
            {blocks.length > 0 && (
              <YStack width="100%" ai="center" gap={fmtSize(12, s)} mt={fmtSize(8, s)}>
                {blocks.map((block) => (
                  <CertificateBlockRenderer key={block.id} block={block} scale={s} />
                ))}
              </YStack>
            )}
          </YStack>

          {/* Footer: signatures + completion date */}
          <YStack gap={fmtSize(8, s)}>
            {completionDate && (
              <Text fontSize={fmtSize(11, s)} color="$gray5" textAlign="center">
                Concluído em: {completionDate}
              </Text>
            )}
            <XStack jc="space-around" ai="flex-end">
              {signatures.length >= 2 ? (
                <>
                  <SignatureColumn signature={signatures[0]} scale={s} />
                  <SealColumn scale={s} accentColor={gold} sealText={sealText} />
                  <SignatureColumn signature={signatures[1]} scale={s} />
                </>
              ) : signatures.length === 1 ? (
                <>
                  <SignatureColumn signature={signatures[0]} scale={s} />
                  <SealColumn scale={s} accentColor={gold} sealText={sealText} />
                  <YStack flex={1} />
                </>
              ) : (
                <SealColumn scale={s} accentColor={gold} sealText={sealText} />
              )}
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </div>
  );
};

function SignatureColumn({ signature, scale }: { signature: Signature; scale: number }) {
  return (
    <YStack ai="center" flex={1}>
      <YStack width="90%" height={1} bg="$gray5" opacity={0.6} mb={fmtSize(12, scale)} />
      <Text fontSize={fmtSize(14, scale)} fontWeight="600" color="$color">
        {signature.name}
      </Text>
      <Text fontSize={fmtSize(12, scale)} color="$gray5" mt={fmtSize(2, scale)}>
        {signature.title}
      </Text>
    </YStack>
  );
}

function SealColumn({ scale, accentColor, sealText }: { scale: number; accentColor: string; sealText: string }) {
  return (
    <YStack ai="center" jc="center" flex={1} gap={fmtSize(4, scale)}>
      <Icon name="Award" size={fmtSize(36, scale)} color={accentColor} />
      <Text fontSize={fmtSize(10, scale)} textTransform="uppercase" letterSpacing={1} fontWeight="700" color="$gray5" textAlign="center">
        {sealText}
      </Text>
    </YStack>
  );
}
