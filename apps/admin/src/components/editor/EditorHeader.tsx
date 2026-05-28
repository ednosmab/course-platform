'use client';

import React, { useState } from 'react';
import { XStack, YStack, Text, Button, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { PositionPanel } from './PositionPanel';

interface EditorHeaderProps {
  courseId?: string;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ courseId }) => {
  const { t } = useTranslation('editor');
  const router = useRouter();
  const { canUndo, canRedo, undo, redo, saveStatus, previewMode, setPreviewMode, viewportMode, setViewportMode, publishLesson, courseTitle, moduleTitle, lessonTitle, mode } = useEditor();
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPositionPanelOpen, setIsPositionPanelOpen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishError(null);
      await publishLesson();
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('publishFailed');
      setPublishError(message);
      setTimeout(() => setPublishError(null), 5000);
    }
  };

  const courseUrl = `/studio/${courseId}`;

  return (
    <YStack position="relative">
      {/* Floating button when collapsed */}
      {headerCollapsed && (
        <XStack
          position="fixed"
          top={4}
          right={50}
          zIndex={9999}
          w={32} h={28}
          ai="center" jc="center"
          bg="#EFF6FF"
          borderWidth={1.5}
          borderColor="$primary"
          borderRadius={8}
          cursor="pointer"
          opacity={0.55}
          hoverStyle={{ bg: '#DBEAFE', opacity: 1 }}
          onPress={(e: any) => { e.stopPropagation(); setHeaderCollapsed(false); }}
        >
          <Icon name="ChevronDown" size={16} color="$text" />
        </XStack>
      )}

      <XStack
        ai="center" jc="space-between"
        px="$4"
        height={headerCollapsed ? 0 : 56}
        borderBottomWidth={headerCollapsed ? 0 : 1}
        borderBottomColor="$border"
        bg="$background"
        gap="$4"
        style={{ transition: 'height 0.2s ease, border-bottom-width 0.2s ease', cursor: 'pointer' }}
        onPress={() => setHeaderCollapsed(!headerCollapsed)}
        hoverStyle={{ bg: headerCollapsed ? '$secondary' : '$background' }}
      >
        {!headerCollapsed && (
          <>
            <XStack ai="center" gap="$4">
            <XStack cursor="pointer" onPress={(e: any) => { e.stopPropagation(); if (window.history.length > 1) router.back(); else router.push('/'); }} hoverStyle={{ opacity: 0.7 }}>
              <Icon name="ArrowLeft" size={20} color="$textMuted" />
            </XStack>

            <XStack ai="center" gap="$3">
              <XStack ai="center" gap="$2">
                <XStack w={24} h={24} borderRadius="$2" borderWidth={1} borderColor="$border" ai="center" jc="center">
                  <Icon name="CloudLightning" size={14} color="$textMuted" />
                </XStack>
                <XStack ai="center" gap={2}>
                  <Text
                    fontSize={14} fontWeight="500"
                    cursor="pointer"
                    onPress={(e: any) => { e.stopPropagation(); router.push(`/configuracoes/${courseId}`); }}
                    hoverStyle={{ opacity: 0.7 }}
                  >
                    {courseTitle || t('courseLabel')}
                  </Text>
                  <Text fontSize={14} color="$textMuted">/</Text>
                  <Text fontSize={14} fontWeight="500">{moduleTitle || t('moduleLabel')}</Text>
                  <Text fontSize={14} color="$textMuted">/</Text>
                  <Text fontSize={14} fontWeight="600">{lessonTitle}</Text>
                </XStack>
              </XStack>

              <XStack ai="center" gap={6} ml="$3">
                {saveStatus === 'saving' && (
                  <>
                    <XStack w={6} h={6} borderRadius={3} bg="$warning" />
                    <Text fontSize={11}>{t('saving')}</Text>
                  </>
                )}
                {(saveStatus === 'saved' || saveStatus === 'idle') && (
                  <>
                    <XStack w={6} h={6} borderRadius={3} bg="$success" />
                    <Text fontSize={11}>{t('saved')}</Text>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <XStack w={6} h={6} borderRadius={3} bg="$danger" />
                    <Text fontSize={11} color="$danger">{t('saveError')}</Text>
                  </>
                )}
              </XStack>
              <XStack cursor="pointer" onPress={(e: any) => { e.stopPropagation(); setHeaderCollapsed(true); }} ml="$1" style={{ opacity: 0.35 }} hoverStyle={{ opacity: 1 }}>
                <Icon name="ChevronUp" size={14} color="$textMuted" />
              </XStack>
            </XStack>
          </XStack>

          <XStack ai="center" gap={1} borderWidth={1} borderColor="$border" borderRadius={8} bg="$background" p={4}>
            {[
              { id: 'desktop' as const, icon: 'Monitor' as const },
              { id: 'tablet' as const, icon: 'Tablet' as const },
              { id: 'mobile' as const, icon: 'Smartphone' as const },
            ].map(({ id, icon }) => (
              <XStack
                key={id}
                onPress={(e: any) => { e.stopPropagation(); setViewportMode(id); }}
                w={36} h={28}
                ai="center" jc="center"
                borderRadius={6}
                bg={viewportMode === id ? '$secondary' : 'transparent'}
                cursor="pointer"
                hoverStyle={{ bg: viewportMode === id ? '$secondary' : '$muted' }}
              >
                <Icon name={icon} size={16} color={viewportMode === id ? '$text' : '$textMuted'} />
              </XStack>
            ))}
          </XStack>

          <XStack ai="center" gap="$3">
            <XStack gap={1} mr="$2">
              <Button variant="ghost" aria-label="Desfazer" onPress={(e: any) => { e.stopPropagation(); undo(); }} disabled={!canUndo} opacity={canUndo ? 1 : 0.4} px="$1">
                <Icon name="Undo2" size={16} />
              </Button>
              <Button variant="ghost" aria-label="Refazer" onPress={(e: any) => { e.stopPropagation(); redo(); }} disabled={!canRedo} opacity={canRedo ? 1 : 0.4} px="$1">
                <Icon name="Redo2" size={16} />
              </Button>
            </XStack>

            <Button
              variant="ghost"
              onPress={(e: any) => { e.stopPropagation(); setPreviewMode(!previewMode); }}
            >
              {previewMode ? <Icon name="EyeOff" size={15} /> : <Icon name="Eye" size={15} />}<Text>{previewMode ? t('exitPreview') : t('preview')}</Text>
            </Button>

            <Button
              variant="ghost"
              onPress={(e: any) => { e.stopPropagation(); setIsPositionPanelOpen(!isPositionPanelOpen); }}
            >
              <Icon name="Layers" size={15} /><Text>{t('position')}</Text>
            </Button>

            <XStack ai="center" gap="$2">
              <Button
                variant="ghost"
                borderWidth={1} borderColor="$border"
                onPress={(e: any) => { e.stopPropagation(); handlePublish(); }}
              >
                {mode === 'certificate' ? (
                  published ? (
                    <><Icon name="CheckCircle2" size={15} /><Text>{t('common:saved')}</Text></>
                  ) : (
                    <Text>{t('common:save')}</Text>
                  )
                ) : (
                  published ? (
                    <><Icon name="CheckCircle2" size={15} /><Text>{t('published')}</Text></>
                  ) : (
                    <Text>{t('publish')}</Text>
                  )
                )}
              </Button>
              {publishError && (
                <Text fontSize={12} color="$danger" maxWidth={220} style={{ lineHeight: 1.3 }}>
                  {publishError}
                </Text>
              )}
            </XStack>
          </XStack>

          {isPositionPanelOpen && (
            <PositionPanel onClose={() => setIsPositionPanelOpen(false)} />
          )}
        </>
      )}
    </XStack>
    </YStack>
  );
};
