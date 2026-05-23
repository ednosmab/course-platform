import React, { useRef, useState, useEffect } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Icon } from '../Icon';
import { CertificateBlock } from '@projeto/types';
import { DESIGN_W } from './useA4Scale';
import { CertificateBlockRenderer } from './CertificateBlockRenderer';

export interface CertificateMiniatureProps {
  studentName?: string;
  courseName?: string;
  blocks: CertificateBlock[];
  serialNumber?: string;
  platformName?: string;
}

const DESIGN_H = DESIGN_W * (21 / 29.7);

export const CertificateMiniature: React.FC<CertificateMiniatureProps> = ({
  studentName,
  courseName,
  blocks,
  serialNumber: serialNum,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const ch = entry.contentRect.height;
      if (cw <= 0 || ch <= 0) return;
      const s = Math.min(cw / DESIGN_W, ch / DESIGN_H, 0.35);
      setScale(s);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (scale <= 0) {
    return <div ref={wrapperRef} style={{ width: '100%', height: 180 }} />;
  }

  const wrapperW = DESIGN_W * scale;
  const wrapperH = DESIGN_H * scale;
  const gold = '$warning';
  const s = 1;

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: 180, overflow: 'hidden', borderRadius: 8 }}>
      <div style={{ width: wrapperW, height: wrapperH, overflow: 'hidden', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
        <YStack w={DESIGN_W} h={DESIGN_H} bg="$cwCard" position="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <YStack position="absolute" inset={26} borderWidth={1} borderColor={gold} pointerEvents="none">
            <YStack position="absolute" inset={5} borderWidth={2} borderColor={gold} opacity={0.4} />
          </YStack>

          <YStack position="absolute" w={126} h={126} top={16} left={16} borderWidth={4} borderColor={gold} borderRightWidth={0} borderBottomWidth={0} pointerEvents="none" />
          <YStack position="absolute" w={126} h={126} bottom={16} right={16} borderWidth={4} borderColor={gold} borderLeftWidth={0} borderTopWidth={0} pointerEvents="none" />

          <YStack flex={1} px={68} py={58} jc="space-between" position="relative" zIndex={10}>
            <XStack jc="space-between" ai="center" borderBottomWidth={1} borderBottomColor="$gray2" pb={16}>
              <XStack ai="center" gap={8}>
                <Icon name="Award" size={24} color={gold} />
                <Text fontSize={14} fontWeight="700" letterSpacing={2} color="$color">
                  PLATAFORMA DE ENSINO
                </Text>
              </XStack>
              <Text fontSize={12} color="$gray5" fontWeight="600">
                {serialNum ? `VALIDAÇÃO: ${serialNum}` : ''}
              </Text>
            </XStack>

            <YStack flex={1} ai="center" jc="center" gap={16}>
              <Text fontSize={40} fontWeight="700" fontFamily="$heading" letterSpacing={1} color="$color" textAlign="center">
                CERTIFICADO DE CONCLUSÃO
              </Text>
              <Text fontSize={18} fontStyle="italic" fontFamily="$heading" color="$gray5" textAlign="center">
                Certificamos com distinção acadêmica que o(a) aluno(a)
              </Text>
              <Text fontSize={34} fontWeight="700" color="$color" textAlign="center" borderBottomWidth={2} borderBottomColor={gold} pb={4} px={24}>
                {studentName || 'NOME DO ALUNO'}
              </Text>
              {courseName && (
                <Text fontSize={14} color="$gray5" textAlign="center" maxWidth="85%" lineHeight={22}>
                  concluiu com aproveitamento e êxito todos os módulos do curso{' '}
                  <Text fontWeight="600" color="$color">{courseName}</Text>.
                </Text>
              )}
              {blocks.length > 0 && (
                <YStack width="100%" ai="center" gap={12} mt={8}>
                  {blocks.slice(0, 3).map((block) => (
                    <CertificateBlockRenderer key={block.id} block={block} scale={1} />
                  ))}
                  {blocks.length > 3 && (
                    <Text fontSize={11} color="$gray4">+{blocks.length - 3} blocos</Text>
                  )}
                </YStack>
              )}
            </YStack>

            <XStack jc="space-around" ai="flex-end" pt={16}>
              <YStack ai="center" flex={1}>
                <YStack width="90%" height={1} bg="$gray5" opacity={0.6} mb={12} />
                <Text fontSize={14} fontWeight="600" color="$color">Assinatura</Text>
                <Text fontSize={12} color="$gray5" mt={2}>Diretor</Text>
              </YStack>
              <YStack ai="center" jc="center" flex={1} gap={4}>
                <Icon name="Award" size={36} color="$warning" />
                <Text fontSize={10} textTransform="uppercase" letterSpacing={1} fontWeight="700" color="$gray5" textAlign="center">
                  Aprovado pelo Conselho
                </Text>
              </YStack>
              <YStack ai="center" flex={1}>
                <YStack width="90%" height={1} bg="$gray5" opacity={0.6} mb={12} />
                <Text fontSize={14} fontWeight="600" color="$color">Assinatura</Text>
                <Text fontSize={12} color="$gray5" mt={2}>Coordenador</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </div>
    </div>
  );
};
