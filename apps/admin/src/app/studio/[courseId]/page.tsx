'use client';

import React from 'react';
import { YStack, XStack } from '@projeto/ui';
import { EditorProvider } from '../../../context/EditorContext';
import { useEditor } from '../../../context/EditorContext';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { BlockPalette } from '../../../components/editor/BlockPalette';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { BlockSettings } from '../../../components/editor/BlockSettings';

function StudioLayout() {
  const { previewMode } = useEditor();

  return (
    <YStack f={1} h="100vh" w="100vw" overflow="hidden">
      <EditorHeader />
      <XStack f={1} overflow="hidden" w="100%">
        {!previewMode && <BlockPalette />}
        <EditorCanvas />
        {!previewMode && <BlockSettings />}
      </XStack>
    </YStack>
  );
}

export default function StudioPage({ params }: { params: { courseId: string } }) {
  return (
    <EditorProvider>
      <StudioLayout />
    </EditorProvider>
  );
}
