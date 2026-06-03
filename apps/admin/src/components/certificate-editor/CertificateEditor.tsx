'use client';

import React, { useMemo, useState } from 'react';
import { YStack, XStack, Text, Icon, Button } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { EditorProvider, useEditor } from '../../context/EditorContext';
import { createCertificateModeConfig } from '../../context/editor-modes';
import { EditorHeader } from '../editor/EditorHeader';
import { CertificatePalette } from './CertificatePalette';
import { CertificateCanvas } from './CertificateCanvas';
import { BlockSettings } from '../editor/BlockSettings';
import { CertificateCanvasPanel } from './CertificateCanvasPanel';
import { CertificateCertSettings } from './CertificateCertSettings';
import { CertificateImageSettings } from './CertificateImageSettings';
import { CertificateBlockSideSelector } from './CertificateBlockSideSelector';

/**
 * Layout interno do editor de certificado. Consome o `EditorProvider`
 * configurado em `mode === 'certificate'`. Diferente do editor de aula,
 * o painel de propriedades aparece sempre que há um bloco activo (não
 * depende do toggle `previewMode`) — esta é a regra de boundary do
 * SDR-001.
 */
function CertificateEditorLayout({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { blocks, activeBlockId, activeSide, certIsDoubleSided, certDesignWidth, certDesignHeight, setCertDesignSize } = useEditor();
  const [canvasPanelCollapsed, setCanvasPanelCollapsed] = useState(false);

  return (
    <YStack f={1} h="100vh" w="100vw" overflow="hidden">
      <XStack
        ai="center"
        jc="space-between"
        px="$3"
        py="$2"
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$border"
        gap="$2"
      >
        <XStack ai="center" gap="$2">
          <Icon name="Award" size={16} color="$primary" />
          <Text fontSize={13} fontWeight="600">Editor de Certificado</Text>
          <Text fontSize={11} color="$textMuted">— isolamento SDR-001</Text>
        </XStack>
        <Button
          variant="ghost"
          borderWidth={1}
          borderColor="$border"
          onPress={() => router.push(`/configuracoes/${courseId}`)}
          px="$3"
        >
          <XStack ai="center" gap="$1.5">
            <Icon name="ArrowLeft" size={12} color="$textMuted" />
            <Text fontSize={12} color="$textMuted">Voltar às Configurações</Text>
          </XStack>
        </Button>
      </XStack>

      <XStack f={1} overflow="hidden" w="100%">
        <CertificatePalette />
        <CertificateCanvas
          blocks={blocks}
          designWidth={certDesignWidth}
          designHeight={certDesignHeight}
          activeSide={activeSide}
          isDoubleSided={certIsDoubleSided}
        />
        {activeBlockId ? (
          <BlockSettings
            propsHeader={<CertificateCertSettings />}
            propsFooter={<CertificateBlockSideSelector />}
            imageSettingsSlot={<CertificateImageSettings />}
          />
        ) : !canvasPanelCollapsed ? (
          <CertificateCanvasPanel
            designWidth={certDesignWidth}
            designHeight={certDesignHeight}
            onSelectPreset={setCertDesignSize}
            onToggleCollapse={() => setCanvasPanelCollapsed(true)}
          />
        ) : null}
      </XStack>
    </YStack>
  );
}

/**
 * Entry point da rota dedicada `/studio/[courseId]/certificate`.
 *
 * - Substitui a antiga combinação `?mode=certificate` (preservada via
 *   redirect 308 em `next.config.ts`).
 * - O `EditorProvider` é configurado com `modeConfig` de certificado,
 *   garantindo que `EditorContext.mode === 'certificate'`.
 * - Não importa lógica de aula (lesson blocks, layouts responsivos) —
 *   essa separação é a boundary rule do SDR-001.
 */
export const CertificateEditor: React.FC<{ courseId: string }> = ({ courseId }) => {
  const certConfig = useMemo(() => createCertificateModeConfig(), []);

  return (
    <EditorProvider courseId={courseId} mode="certificate" modeConfig={certConfig}>
      <EditorHeader courseId={courseId} />
      <CertificateEditorLayout courseId={courseId} />
    </EditorProvider>
  );
};
