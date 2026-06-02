'use client';

import React, { use, useMemo } from 'react';
import { YStack, XStack, Text, Button, Icon } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { EditorProvider, useEditor } from '../../../context/EditorContext';
import { createLessonModeConfig } from '../../../context/editor-modes';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { BlockPalette } from '../../../components/editor/BlockPalette';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { BlockSettings } from '../../../components/editor/BlockSettings';

/**
 * Página do editor de aula. O editor de certificado foi extraído para
 * `apps/admin/src/app/studio/[courseId]/certificate/page.tsx` (SDR-001).
 * A query legacy `?mode=certificate` é redirecionada via 308 em
 * `next.config.ts`, por isso esta página só lida com o modo de aula.
 */
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

export default function StudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { courseId } = use(params);
  const { lessonId } = use(searchParams);

  const lessonConfig = useMemo(() => createLessonModeConfig(), []);

  if (lessonId) {
    return (
      <EditorProvider lessonId={lessonId} modeConfig={lessonConfig}>
        <StudioEditorLayout courseId={courseId} />
      </EditorProvider>
    );
  }

  return <EmptyState courseId={courseId} />;
}
