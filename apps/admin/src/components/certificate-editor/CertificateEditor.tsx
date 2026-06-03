'use client';

import React, { useMemo, useState } from 'react';
import { YStack, XStack } from '@projeto/ui';
import { EditorProvider, useEditor } from '../../context/EditorContext';
import { createCertificateModeConfig } from '../../context/editor-modes';
import { CertificateEditorHeader } from './CertificateEditorHeader';
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
function CertificateEditorLayout() {
  const { blocks, activeBlockId, activeSide, certIsDoubleSided, certDesignWidth, certDesignHeight, setCertDesignSize } = useEditor();
  const [canvasPanelCollapsed, setCanvasPanelCollapsed] = useState(false);

  return (
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
      <YStack f={1} h="100vh" w="100vw" overflow="hidden">
        <CertificateEditorHeader courseId={courseId} />
        <CertificateEditorLayout />
      </YStack>
    </EditorProvider>
  );
};
