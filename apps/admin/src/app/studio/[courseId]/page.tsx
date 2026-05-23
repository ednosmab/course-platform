'use client';

import React, { useState, useEffect, use } from 'react';
import { YStack, XStack, Text, Button, Icon, Spinner, Theme } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { BrandMark } from '../../../components/brand-mark';
import { EditorProvider, useEditor } from '../../../context/EditorContext';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { BlockPalette } from '../../../components/editor/BlockPalette';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { BlockSettings } from '../../../components/editor/BlockSettings';
import { CourseService, StorageService } from '@projeto/core';
import type { Module, Lesson } from '@projeto/types';

function CourseOverview({ courseId, onSelectLesson }: { courseId: string; onSelectLesson: (lessonId: string) => void }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleInput, setShowModuleInput] = useState(false);
  const [showLessonInput, setShowLessonInput] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [editThumbnail, setEditThumbnail] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const flashHighlight = (id: string) => {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 2000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await CourseService.getCourseWithModulesAndLessons(courseId);
      setCourse(result.course);
      setEditTitle(result.course.title || '');
      setEditDescription(result.course.description || '');
      setCertificateEnabled((result.course as any).certificate_enabled ?? false);
      setEditThumbnailPreview(result.course.thumbnail_url || null);
      setModules(result.modules);
      setExpandedModules(new Set(result.modules.map(m => m.id)));
    } catch (err) {
      console.error('Failed to load course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const createModule = async () => {
    if (!newTitle.trim()) return;
    const nextIndex = modules.length + 1;
    try {
      const data = await CourseService.createModule(courseId, newTitle.trim(), nextIndex);
      setNewTitle('');
      setShowModuleInput(false);
      fetchData();
      flashHighlight(data.id);
    } catch (err) {
      console.error('Failed to create module:', err);
    }
  };

  const createLesson = async (moduleId: string) => {
    if (!newTitle.trim()) return;
    const mod = modules.find(m => m.id === moduleId);
    const nextIndex = (mod?.lessons?.length || 0) + 1;
    try {
      const data = await CourseService.createLesson(moduleId, newTitle.trim(), nextIndex);
      setNewTitle('');
      setShowLessonInput(null);
      fetchData();
      flashHighlight(data.id);
    } catch (err) {
      console.error('Failed to create lesson:', err);
    }
  };

  const renameModule = async (id: string) => {
    if (!editModuleTitle.trim()) { setEditingModuleId(null); return; }
    await CourseService.updateModule(id, { title: editModuleTitle.trim() });
    setEditingModuleId(null);
    fetchData();
  };

  const renameLesson = async (id: string) => {
    if (!editLessonTitle.trim()) { setEditingLessonId(null); return; }
    await CourseService.updateLesson(id, { title: editLessonTitle.trim() });
    setEditingLessonId(null);
    fetchData();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Excluir módulo e todas as suas aulas?')) return;
    await CourseService.deleteModule(id);
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;
    await CourseService.deleteLesson(id);
    fetchData();
  };

  const moveModule = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...modules].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex(m => m.id === id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      CourseService.reorderModules([{ id: a.id, order_index: b.order_index }]),
      CourseService.reorderModules([{ id: b.id, order_index: a.order_index }]),
    ]);
    fetchData();
  };

  const moveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const mod = modules.find(m => m.lessons.some(l => l.id === lessonId));
    if (!mod) return;
    const sorted = [...mod.lessons].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex(l => l.id === lessonId);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      CourseService.reorderLessons([{ id: a.id, order_index: b.order_index }]),
      CourseService.reorderLessons([{ id: b.id, order_index: a.order_index }]),
    ]);
    fetchData();
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const saveCourseSettings = async () => {
    setSaveMessage(null);
    try {
      let thumbnail_url = course?.thumbnail_url || null;
      if (editThumbnail) {
        const url = await StorageService.uploadThumbnail(editThumbnail, courseId);
        if (url) thumbnail_url = url;
      }
      await CourseService.updateCourseSettings(courseId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        certificate_enabled: certificateEnabled,
        thumbnail_url,
      });
      setCourse((prev: any) => ({ ...prev, title: editTitle.trim(), description: editDescription.trim(), certificate_enabled: certificateEnabled, thumbnail_url }));
      setEditThumbnail(null);
      setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => {
        setSaveMessage(null);
        setShowSettings(false);
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações.';
      setSaveMessage({ type: 'error', text: msg });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const togglePublish = async () => {
    const next = !course?.is_published;
    await CourseService.togglePublish(courseId, next);
    setCourse((prev: any) => ({ ...prev, is_published: next }));
  };

  if (loading) return <YStack f={1} ai="center" jc="center" gap={12} opacity={0.7} h="100vh"><Spinner size="large" color="$primary" /><Text color="$textMuted" fontSize={14}>Carregando curso…</Text></YStack>;

  return (
    <YStack f={1} bg="$background">
      <XStack
        borderBottomWidth={1} borderBottomColor="$border"
        backgroundColor="rgba(247, 248, 252, 0.8)"
        style={{ backdropFilter: 'blur(12px)' }}
        px={24} height={56} ai="center" gap={16}
      >
        <Button variant="ghost" onPress={() => router.push('/')} aria-label="Voltar" px="$1">
          <Icon name="ArrowLeft" size={20} color="$textMuted" />
        </Button>
        <Text fontSize={16} fontWeight="600">{course?.title || 'Carregando...'}</Text>
      </XStack>

      <YStack f={1} maxWidth={800} alignSelf="center" w="100%" p={24} gap={16}>
        <XStack ai="center" jc="space-between">
          <Text fontFamily="$display" fontSize={24} fontWeight="$6">Módulos e aulas</Text>
          <Button onPress={() => { setNewTitle(''); setShowModuleInput(true); }} variant="ghost" borderWidth={1} borderColor="$border">
            <Icon name="Plus" size={14} /><Text ml={4} fontSize={13}>Novo módulo</Text>
          </Button>
        </XStack>

        {showModuleInput && (
          <XStack gap={8} ai="center">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Título do módulo"
              autoFocus
              style={{ flex: 1, height: 36, borderRadius: 6, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 14, outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') createModule(); if (e.key === 'Escape') setShowModuleInput(false); }}
            />
            <Button onPress={createModule} disabled={!newTitle.trim()} variant="ghost" borderWidth={1} borderColor="$border">Adicionar</Button>
            <Button variant="secondary" onPress={() => setShowModuleInput(false)}>Cancelar</Button>
          </XStack>
        )}

        {modules.length === 0 && (
          <YStack ai="center" jc="center" py={48} gap={8}>
            <Icon name="FolderOpen" size={40} color="$textMuted" />
            <Text color="$textMuted">Nenhum módulo ainda. Crie o primeiro!</Text>
          </YStack>
        )}

        {modules.map(mod => (
          <YStack key={mod.id} borderWidth={1} borderColor={highlightedId === mod.id ? '$success' : '$border'} borderRadius={12} overflow="hidden" bg="$card" style={highlightedId === mod.id ? { boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)', transition: 'box-shadow 0.3s' } : undefined}>
            <XStack
              p={16} bg="$background" ai="center" jc="space-between" cursor="pointer"
              onPress={() => { if (!editingModuleId) toggleModule(mod.id); }}
              hoverStyle={{ bg: '$secondary' }}
            >
              {editingModuleId === mod.id ? (
                <XStack ai="center" gap={8} flex={1} onPress={(e: any) => e.stopPropagation()}>
                  <input
                    value={editModuleTitle}
                    onChange={e => setEditModuleTitle(e.target.value)}
                    autoFocus
                    style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #3B82F6', padding: '0 10px', fontSize: 14, outline: 'none' }}
                    onKeyDown={e => { if (e.key === 'Enter') renameModule(mod.id); if (e.key === 'Escape') setEditingModuleId(null); }}
                  />
                  <Button onPress={() => renameModule(mod.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
                    <Text fontSize={12}>Salvar</Text>
                  </Button>
                </XStack>
              ) : (
                <XStack ai="center" gap={8}>
                  <Icon name={expandedModules.has(mod.id) ? 'ChevronDown' : 'ChevronRight'} size={16} color="$textMuted" />
                  <Text fontSize={15} fontWeight="600">{mod.title}</Text>
                  <Text fontSize={12} color="$textMuted">({mod.lessons?.length || 0} aulas)</Text>
                </XStack>
              )}
              <XStack gap={4}>
                {editingModuleId !== mod.id && (
                  <>
                    <Text onPress={(e: any) => { e.stopPropagation(); moveModule(mod.id, 'up'); }} fontSize={14} color="$textMuted" style={{ cursor: 'pointer' }}>↑</Text>
                    <Text onPress={(e: any) => { e.stopPropagation(); moveModule(mod.id, 'down'); }} fontSize={14} color="$textMuted" mr={4} style={{ cursor: 'pointer' }}>↓</Text>
                    <Text onPress={(e: any) => { e.stopPropagation(); setEditModuleTitle(mod.title); setEditingModuleId(mod.id); }} fontSize={12} color="$secondaryForeground" style={{ cursor: 'pointer' }}>Renomear</Text>
                    <Text onPress={(e: any) => { e.stopPropagation(); setShowLessonInput(mod.id); setNewTitle(''); }} fontSize={12} color="$primary" ml={8} style={{ cursor: 'pointer' }}>+ Aula</Text>
                    <Text onPress={(e: any) => { e.stopPropagation(); deleteModule(mod.id); }} fontSize={12} color="$danger" ml={8} style={{ cursor: 'pointer' }}>Excluir</Text>
                  </>
                )}
              </XStack>
            </XStack>

            {expandedModules.has(mod.id) && (
              <YStack p={16} pt={0} gap={4}>
                {showLessonInput === mod.id && (
                  <XStack gap={8} ai="center" mt={8}>
                    <input
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="Título da aula"
                      autoFocus
                      style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 13, outline: 'none' }}
                      onKeyDown={e => { if (e.key === 'Enter') createLesson(mod.id); if (e.key === 'Escape') setShowLessonInput(null); }}
                    />
                    <Button onPress={() => createLesson(mod.id)} disabled={!newTitle.trim()} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
                      <Text fontSize={12}>Adicionar</Text>
                    </Button>
                    <Button variant="secondary" onPress={() => setShowLessonInput(null)} px="$3" py="$1">
                      <Text fontSize={12}>Cancelar</Text>
                    </Button>
                  </XStack>
                )}

                {mod.lessons?.length === 0 && (
                  <Text fontSize={13} color="$textMuted" py={8} pl={24}>Nenhuma aula ainda.</Text>
                )}

                {mod.lessons?.map(lesson => (
                  <XStack
                    key={lesson.id}
                    p={10} pl={24} borderRadius={6}
                    ai="center" jc="space-between"
                    hoverStyle={{ bg: '$secondary' }}
                    cursor="pointer"
                    onPress={() => { if (editingLessonId !== lesson.id) onSelectLesson(lesson.id); }}
                    bg={highlightedId === lesson.id ? 'rgba(34, 197, 94, 0.08)' : 'transparent'}
                    style={highlightedId === lesson.id ? { transition: 'background-color 0.3s' } : undefined}
                  >
                    {editingLessonId === lesson.id ? (
                      <XStack ai="center" gap={8} flex={1} onPress={(e: any) => e.stopPropagation()}>
                        <input
                          value={editLessonTitle}
                          onChange={e => setEditLessonTitle(e.target.value)}
                          autoFocus
                          style={{ flex: 1, height: 28, borderRadius: 6, border: '1px solid #3B82F6', padding: '0 8px', fontSize: 13, outline: 'none' }}
                          onKeyDown={e => { if (e.key === 'Enter') renameLesson(lesson.id); if (e.key === 'Escape') setEditingLessonId(null); }}
                        />
                        <Button onPress={() => renameLesson(lesson.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
                          <Text fontSize={12}>Salvar</Text>
                        </Button>
                      </XStack>
                    ) : (
                      <XStack ai="center" gap={8}>
                        <Icon name="FileText" size={14} color="$textMuted" />
                        <Text fontSize={14}>{lesson.title}</Text>
                        <XStack
                          px={6} py={1} borderRadius={4}
                          bg={lesson.is_published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(247, 248, 252, 0.7)'}
                        >
                          <Text fontSize={10} fontWeight="600" color={lesson.is_published ? '$successForeground' : '$textMuted'}>
                            {lesson.is_published ? 'Publicada' : 'Rascunho'}
                          </Text>
                        </XStack>
                      </XStack>
                    )}
                    {editingLessonId !== lesson.id && (
                      <XStack gap={4} ai="center">
                        <Text onPress={(e: any) => { e.stopPropagation(); moveLesson(lesson.id, 'up'); }} fontSize={14} color="$textMuted" style={{ cursor: 'pointer' }}>↑</Text>
                        <Text onPress={(e: any) => { e.stopPropagation(); moveLesson(lesson.id, 'down'); }} fontSize={14} color="$textMuted" style={{ cursor: 'pointer' }}>↓</Text>
                        <Text onPress={(e: any) => { e.stopPropagation(); setEditLessonTitle(lesson.title); setEditingLessonId(lesson.id); }} fontSize={12} color="$secondaryForeground" ml={4} style={{ cursor: 'pointer' }}>Renomear</Text>
                        <Text onPress={(e: any) => { e.stopPropagation(); deleteLesson(lesson.id); }} fontSize={12} color="$danger" ml={8} style={{ cursor: 'pointer' }}>Excluir</Text>
                      </XStack>
                    )}
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        ))}

        {/* Settings & Certificates */}
        <YStack borderWidth={1} borderColor="$border" borderRadius={12} bg="$card" mt={8}>
          <XStack p={16} bg="$background" ai="center" jc="space-between" cursor="pointer" onPress={() => setShowSettings(!showSettings)} hoverStyle={{ bg: '$secondary' }}>
            <XStack ai="center" gap={8}>
              <Icon name="Settings" size={16} color="$textMuted" />
              <Text fontSize={15} fontWeight="600">Configurações</Text>
            </XStack>
            <Icon name={showSettings ? 'ChevronDown' : 'ChevronRight'} size={16} color="$textMuted" />
          </XStack>

          {showSettings && (
            <YStack p={16} gap={16}>
              <YStack gap={6}>
                <Text fontSize={13} fontWeight="500">Título do curso</Text>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ height: 36, borderRadius: 6, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 14, outline: 'none' }} />
              </YStack>
              <YStack gap={6}>
                <Text fontSize={13} fontWeight="500">Descrição</Text>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} style={{ borderRadius: 6, border: '1px solid #DEE1EB', padding: 12, fontSize: 14, outline: 'none', resize: 'vertical' }} />
              </YStack>
              <YStack gap={6}>
                <Text fontSize={13} fontWeight="500">Thumbnail (1280×720px, máx 2MB)</Text>
                <YStack
                  position="relative"
                  height={140}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$border"
                  style={{ borderStyle: 'dashed', backgroundImage: editThumbnailPreview ? `url(${editThumbnailPreview})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}
                  ai="center"
                  jc="center"
                  overflow="hidden"
                  bg={editThumbnailPreview ? 'transparent' : '$background'}
                  onPress={() => document.getElementById('thumb-input-studio')?.click()}
                >
                  <input id="thumb-input-studio" type="file" accept="image/jpeg,image/webp,image/png" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 2 * 1024 * 1024) { alert('Arquivo muito grande. Máximo: 2MB.'); return; }
                      setEditThumbnail(f);
                      setEditThumbnailPreview(URL.createObjectURL(f));
                    }
                  }} />
                  {!editThumbnailPreview && (
                    <XStack ai="center" gap={6}>
                      <Icon name="Image" size={20} color="$textMuted" />
                      <Text fontSize={13} color="$textMuted">Clique para selecionar</Text>
                    </XStack>
                  )}
                </YStack>
              </YStack>

              <XStack ai="center" gap={12}>
                <Text fontSize={13} fontWeight="500">Publicado</Text>
                <XStack
                  w={44} h={24} br={12} bg={course?.is_published ? '$success' : '$border'}
                  ai="center" px={3}
                  cursor="pointer"
                  onPress={togglePublish}
                  style={{ justifyContent: course?.is_published ? 'flex-end' : 'flex-start' }}
                >
                  <XStack w={18} h={18} br={9} bg="$white" />
                </XStack>
              </XStack>

              <YStack borderWidth={1} borderColor="$border" borderRadius={8} p={16} gap={12}>
                <XStack ai="center" gap={8}>
                  <Icon name="Award" size={20} color="$primary" />
                  <Text fontSize={15} fontWeight="600">Certificado</Text>
                </XStack>
                <Text fontSize={13} color="$textMuted">
                  Alunos que completarem todas as aulas receberão um certificado de conclusão com código único (BSGI).
                </Text>
                <XStack ai="center" gap={12}>
                  <Text fontSize={13} fontWeight="500">Emitir certificado</Text>
                  <XStack
                    w={44} h={24} br={12} bg={certificateEnabled ? '$success' : '$border'}
                    ai="center" px={3}
                    cursor="pointer"
                    onPress={() => setCertificateEnabled(!certificateEnabled)}
                    style={{ justifyContent: certificateEnabled ? 'flex-end' : 'flex-start' }}
                  >
                    <XStack w={18} h={18} br={9} bg="$white" />
                  </XStack>
                </XStack>
              </YStack>

              {saveMessage && (
                <XStack p={10} borderRadius={6} borderWidth={1} borderColor={saveMessage.type === 'success' ? '$success' : '$danger'} bg="$white" ai="center" gap={8}>
                  <Icon name={saveMessage.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={16} color={saveMessage.type === 'success' ? '$success' : '$danger'} />
                  <Text fontSize={13} color={saveMessage.type === 'success' ? '$successForeground' : '$text'}>{saveMessage.text}</Text>
                </XStack>
              )}
              <Button onPress={saveCourseSettings} variant="ghost" borderWidth={1} borderColor="$border">
                <Text fontSize={13} fontWeight="600">Salvar configurações</Text>
              </Button>
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}

function StudioLayout({ lessonId, courseId }: { lessonId: string; courseId: string }) {
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

export default function StudioPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (!selectedLessonId) {
    return (
      <Theme name="cloudWhite">
        <CourseOverview courseId={courseId} onSelectLesson={setSelectedLessonId} />
      </Theme>
    );
  }

  return (
    <Theme name="cloudWhite">
      <EditorProvider lessonId={selectedLessonId}>
        <StudioLayout lessonId={selectedLessonId} courseId={courseId} />
      </EditorProvider>
    </Theme>
  );
}
