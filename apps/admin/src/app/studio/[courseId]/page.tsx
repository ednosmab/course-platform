'use client';

import React, { use, useEffect, useRef } from 'react';
import { YStack, XStack, Text, Button, Icon } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { EditorProvider, useEditor } from '../../../context/EditorContext';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { BlockPalette } from '../../../components/editor/BlockPalette';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { BlockSettings } from '../../../components/editor/BlockSettings';
import { CertificateBlockRenderer } from '@projeto/ui';
import { useCertificateCapture } from '../../../hooks/useCertificateCapture';

function StudioEditorLayout({ courseId }: { courseId: string }) {
  const { previewMode, activeBlockId } = useEditor();

  return (
    <YStack f={1} h="100vh" w="100vw" overflow="hidden">
      <EditorHeader courseId={courseId} />
      <XStack f={1} overflow="hidden" w="100%">
        {!previewMode && <BlockPalette />}
        <EditorCanvas />
        {!previewMode && activeBlockId && <BlockSettings />}
      </XStack>
    </YStack>
  );
}

function EmptyState({ courseId }: { courseId: string }) {
  const router = useRouter();

  return (
    <YStack f={1} ai="center" jc="center" gap={16} h="100vh">
      <Icon name="Edit3" size={48} color="$textMuted" />
      <Text fontSize={18} color="$textMuted" fontWeight="500">
        Nenhuma aula selecionada
      </Text>
      <Text fontSize={13} color="$textMuted">
        Selecione uma aula nas configurações do curso para editá-la aqui.
      </Text>
      <Button
        variant="ghost"
        borderWidth={1}
        borderColor="$border"
        onPress={() => router.push(`/configuracoes/${courseId}`)}
      >
        <Text fontSize={13}>Gerenciar módulos e aulas</Text>
      </Button>
    </YStack>
  );
}

function CaptureContainer({ blocks }: { blocks: any[] }) {
  return (
    <YStack w={600} bg="white" p={40} gap={16}>
      {blocks.map((block: any) => (
        <CertificateBlockRenderer key={block.id} block={block} scale={1} />
      ))}
    </YStack>
  );
}

function CertificateEditor({ courseId }: { courseId: string }) {
  const { previewMode, activeBlockId, blocks, saveStatus } = useEditor();
  const { captureRef, captureAndUpload } = useCertificateCapture(courseId);
  const captured = useRef(false);

  useEffect(() => {
    if (saveStatus === 'saved' && !captured.current) {
      captured.current = true;
      captureAndUpload();
    }
    if (saveStatus !== 'saved') {
      captured.current = false;
    }
  }, [saveStatus, captureAndUpload]);

  return (
    <>
      <YStack f={1} h="100vh" w="100vw" overflow="hidden">
        <EditorHeader courseId={courseId} />
        <XStack f={1} overflow="hidden" w="100%">
          {!previewMode && <BlockPalette />}
          <EditorCanvas />
          {!previewMode && activeBlockId && <BlockSettings />}
        </XStack>
      </YStack>
      <div
        ref={captureRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: 600,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <CaptureContainer blocks={blocks} />
      </div>
    </>
  );
}

export default function StudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string; mode?: string }>;
}) {
  const { courseId } = use(params);
  const { lessonId, mode } = use(searchParams);

  if (mode === 'certificate') {
    return (
      <EditorProvider courseId={courseId} mode="certificate">
        <CertificateEditor courseId={courseId} />
      </EditorProvider>
    );
  }

  if (lessonId) {
    return (
      <EditorProvider lessonId={lessonId}>
        <StudioEditorLayout courseId={courseId} />
      </EditorProvider>
    );
  }

  return <EmptyState courseId={courseId} />;
}
