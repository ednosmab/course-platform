'use client';

import React, { useState, useEffect, use } from 'react';
import { YStack, XStack, Text, Button, Icon, Spinner, Theme } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { BrandMark } from '../../../components/brand-mark';
import { CourseService, StorageService } from '@projeto/core';
import type { Module, Lesson, Course } from '@projeto/types';

export default function CourseConfigPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleInput, setShowModuleInput] = useState(false);
  const [showLessonInput, setShowLessonInput] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(true); // Exibe aberto por padrão nas configurações
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
      const structure = await CourseService.getCourseWithModulesAndLessons(courseId);
      const courseData = structure.course;
      setCourse(courseData);
      setEditTitle(courseData?.title || '');
      setEditDescription(courseData?.description || '');
      setCertificateEnabled((courseData as any)?.certificate_enabled ?? false);
      setEditThumbnailPreview(courseData?.thumbnail_url || null);

      setModules(structure.modules);
      setExpandedModules(new Set(structure.modules.map(m => m.id)));
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const createModule = async () => {
    if (!newTitle.trim()) return;
    const nextIndex = modules.length + 1;
    try {
      const data = await CourseService.createModule(courseId, newTitle.trim(), nextIndex);
      setNewTitle('');
      setShowModuleInput(false);
      fetchData();
      flashHighlight(data.id);
    } catch {
      // Silently handle — fetchData will re-run on next render
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
    } catch {
      // Silently handle
    }
  };

  const renameModule = async (id: string) => {
    if (!editModuleTitle.trim()) { setEditingModuleId(null); return; }
    try {
      await CourseService.updateModule(id, { title: editModuleTitle.trim() });
    } catch {
      // Silently handle
    }
    setEditingModuleId(null);
    fetchData();
  };

  const renameLesson = async (id: string) => {
    if (!editLessonTitle.trim()) { setEditingLessonId(null); return; }
    try {
      await CourseService.updateLesson(id, { title: editLessonTitle.trim() });
    } catch {
      // Silently handle
    }
    setEditingLessonId(null);
    fetchData();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Excluir módulo e todas as suas aulas?')) return;
    try {
      await CourseService.deleteModule(id);
    } catch {
      // Silently handle
    }
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return;
    try {
      await CourseService.deleteLesson(id);
    } catch {
      // Silently handle
    }
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
    try {
      await CourseService.reorderModules([
        { id: a.id, order_index: b.order_index },
        { id: b.id, order_index: a.order_index },
      ]);
    } catch {
      // Silently handle
    }
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
    try {
      await CourseService.reorderLessons([
        { id: a.id, order_index: b.order_index },
        { id: b.id, order_index: a.order_index },
      ]);
    } catch {
      // Silently handle
    }
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
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações.';
      setSaveMessage({ type: 'error', text: msg });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const togglePublish = async () => {
    const next = !course?.is_published;
    try {
      await CourseService.togglePublish(courseId, next);
    } catch {
      // Silently handle
    }
    setCourse((prev: any) => ({ ...prev, is_published: next }));
  };

  if (loading) return <YStack f={1} ai="center" jc="center" gap={12} opacity={0.7} h="100vh"><Spinner size="large" color="$primary" /><Text color="$textMuted" fontSize={14}>Carregando configurações…</Text></YStack>;

  return (
    <Theme name="cloudWhite">
      <YStack f={1} bg="$background" minHeight="100vh">
        <XStack
          borderBottomWidth={1} borderBottomColor="$border"
          backgroundColor="rgba(247, 248, 252, 0.8)"
          style={{ backdropFilter: 'blur(12px)' }}
          px={24} height={56} ai="center" gap={16}
        >
          <Button variant="ghost" onPress={() => router.push('/')} aria-label="Voltar" px="$1">
            <Icon name="ArrowLeft" size={20} color="$textMuted" />
          </Button>
          <Text fontSize={16} fontWeight="600">{course?.title || 'Configurações do Curso'}</Text>
          <Text fontSize={12} color="$textMuted" ml="auto">Modo Gestão</Text>
        </XStack>

        <YStack f={1} maxWidth={900} alignSelf="center" w="100%" p={24} gap={24}>
          
          {/* Header Geral */}
          <YStack gap={4}>
            <Text fontFamily="$display" fontSize={28} fontWeight="$6" letterSpacing={-0.5}>Configurações do Curso</Text>
            <Text fontSize={14} color="$textMuted">Gerencie os metadados, estrutura de aulas e personalize o certificado de conclusão.</Text>
          </YStack>

          {/* Grid Geral */}
          <XStack gap={24} $sm={{ fd: 'column' }}>
            
            {/* Esquerda: Módulos e Aulas */}
            <YStack f={3} gap={16}>
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={18} fontWeight="$6">Grade de Aulas</Text>
                <Button onPress={() => { setNewTitle(''); setShowModuleInput(true); }} variant="ghost" borderWidth={1} borderColor="$border" size="$2">
                  <Icon name="Plus" size={14} /><Text ml={4} fontSize={12}>Novo módulo</Text>
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
                  <Button onPress={createModule} disabled={!newTitle.trim()} variant="ghost" borderWidth={1} borderColor="$border" size="$2">Adicionar</Button>
                  <Button variant="secondary" onPress={() => setShowModuleInput(false)} size="$2">Cancelar</Button>
                </XStack>
              )}

              {modules.length === 0 && (
                <YStack ai="center" jc="center" py={48} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
                  <Icon name="FolderOpen" size={32} color="$textMuted" />
                  <Text color="$textMuted" fontSize={13}>Nenhum módulo criado ainda.</Text>
                </YStack>
              )}

              {modules.map(mod => (
                <YStack key={mod.id} borderWidth={1} borderColor={highlightedId === mod.id ? '$success' : '$border'} borderRadius={12} overflow="hidden" bg="$card">
                  <XStack
                    p={12} bg="$background" ai="center" jc="space-between" cursor="pointer"
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
                        <Button onPress={() => renameModule(mod.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border" size="$2">
                          <Text fontSize={12}>Salvar</Text>
                        </Button>
                      </XStack>
                    ) : (
                      <XStack ai="center" gap={8}>
                        <Icon name={expandedModules.has(mod.id) ? 'ChevronDown' : 'ChevronRight'} size={16} color="$textMuted" />
                        <Text fontSize={14} fontWeight="600">{mod.title}</Text>
                        <Text fontSize={11} color="$textMuted">({mod.lessons?.length || 0} aulas)</Text>
                      </XStack>
                    )}
                    <XStack gap={8}>
                      {editingModuleId !== mod.id && (
                        <>
                          <Text onPress={(e: any) => { e.stopPropagation(); moveModule(mod.id, 'up'); }} fontSize={12} color="$textMuted" style={{ cursor: 'pointer' }}>↑</Text>
                          <Text onPress={(e: any) => { e.stopPropagation(); moveModule(mod.id, 'down'); }} fontSize={12} color="$textMuted" style={{ cursor: 'pointer' }}>↓</Text>
                          <Text onPress={(e: any) => { e.stopPropagation(); setEditModuleTitle(mod.title); setEditingModuleId(mod.id); }} fontSize={11} color="$primary" style={{ cursor: 'pointer' }}>Editar</Text>
                          <Text onPress={(e: any) => { e.stopPropagation(); setShowLessonInput(mod.id); setNewTitle(''); }} fontSize={11} color="$successForeground" style={{ cursor: 'pointer' }}>+ Aula</Text>
                          <Text onPress={(e: any) => { e.stopPropagation(); deleteModule(mod.id); }} fontSize={11} color="$danger" style={{ cursor: 'pointer' }}>Excluir</Text>
                        </>
                      )}
                    </XStack>
                  </XStack>

                  {expandedModules.has(mod.id) && (
                    <YStack p={12} pt={4} gap={4}>
                      {showLessonInput === mod.id && (
                        <XStack gap={8} ai="center" mt={4} mb={8}>
                          <input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Título da aula"
                            autoFocus
                            style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 13, outline: 'none' }}
                            onKeyDown={e => { if (e.key === 'Enter') createLesson(mod.id); if (e.key === 'Escape') setShowLessonInput(null); }}
                          />
                          <Button onPress={() => createLesson(mod.id)} disabled={!newTitle.trim()} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border" size="$2">
                            <Text fontSize={12}>Adicionar</Text>
                          </Button>
                          <Button variant="secondary" onPress={() => setShowLessonInput(null)} px="$3" py="$1" size="$2">
                            <Text fontSize={12}>Cancelar</Text>
                          </Button>
                        </XStack>
                      )}

                      {mod.lessons?.length === 0 && (
                        <Text fontSize={12} color="$textMuted" py={8} pl={16}>Nenhuma aula criada.</Text>
                      )}

                      {mod.lessons?.map(lesson => (
                        <XStack
                          key={lesson.id}
                          p={8} pl={16} borderRadius={6}
                          ai="center" jc="space-between"
                          hoverStyle={{ bg: '$secondary' }}
                          cursor="pointer"
                          onPress={() => { if (editingLessonId !== lesson.id) router.push(`/studio/${courseId}?lessonId=${lesson.id}`); }}
                          bg={highlightedId === lesson.id ? 'rgba(34, 197, 94, 0.08)' : 'transparent'}
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
                              <Button onPress={() => renameLesson(lesson.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border" size="$2">
                                <Text fontSize={12}>Salvar</Text>
                              </Button>
                            </XStack>
                          ) : (
                            <XStack ai="center" gap={8}>
                              <Icon name="FileText" size={14} color="$textMuted" />
                              <Text fontSize={13} fontWeight="500">{lesson.title}</Text>
                              <XStack
                                px={6} py={1} borderRadius={4}
                                bg={lesson.is_published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(247, 248, 252, 0.7)'}
                              >
                                <Text fontSize={9} fontWeight="600" color={lesson.is_published ? '$successForeground' : '$textMuted'}>
                                  {lesson.is_published ? 'Publicada' : 'Rascunho'}
                                </Text>
                              </XStack>
                            </XStack>
                          )}
                          {editingLessonId !== lesson.id && (
                            <XStack gap={8} ai="center">
                              <Text onPress={(e: any) => { e.stopPropagation(); moveLesson(lesson.id, 'up'); }} fontSize={12} color="$textMuted" style={{ cursor: 'pointer' }}>↑</Text>
                              <Text onPress={(e: any) => { e.stopPropagation(); moveLesson(lesson.id, 'down'); }} fontSize={12} color="$textMuted" style={{ cursor: 'pointer' }}>↓</Text>
                              <Text onPress={(e: any) => { e.stopPropagation(); setEditLessonTitle(lesson.title); setEditingLessonId(lesson.id); }} fontSize={11} color="$primary" style={{ cursor: 'pointer' }}>Renomear</Text>
                              <Text onPress={(e: any) => { e.stopPropagation(); deleteLesson(lesson.id); }} fontSize={11} color="$danger" style={{ cursor: 'pointer' }}>Excluir</Text>
                            </XStack>
                          )}
                        </XStack>
                      ))}
                    </YStack>
                  )}
                </YStack>
              ))}
            </YStack>

            {/* Direita: Metadados, Publicação e Certificado */}
            <YStack f={2} gap={16}>
              <Text fontFamily="$display" fontSize={18} fontWeight="$6">Metadados e Opções</Text>
              
              {/* Box de Info */}
              <YStack borderWidth={1} borderColor="$border" borderRadius={12} bg="$card" p={16} gap={12}>
                <YStack gap={4}>
                  <Text fontSize={12} fontWeight="600" color="$textMuted">TÍTULO DO CURSO</Text>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ height: 36, borderRadius: 6, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 14, outline: 'none', color: '#282836' }} />
                </YStack>
                
                <YStack gap={4}>
                  <Text fontSize={12} fontWeight="600" color="$textMuted">DESCRIÇÃO DO CURSO</Text>
                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} style={{ borderRadius: 6, border: '1px solid #DEE1EB', padding: 10, fontSize: 13, outline: 'none', color: '#282836', resize: 'none' }} />
                </YStack>

                <YStack gap={4}>
                  <Text fontSize={12} fontWeight="600" color="$textMuted">IMAGEM DE CAPA (THUMBNAIL)</Text>
                  <YStack
                    position="relative"
                    height={110}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="$border"
                    style={{ borderStyle: 'dashed', backgroundImage: editThumbnailPreview ? `url(${editThumbnailPreview})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}
                    ai="center"
                    jc="center"
                    overflow="hidden"
                    bg={editThumbnailPreview ? 'transparent' : '$background'}
                    onPress={() => document.getElementById('thumb-input-config')?.click()}
                  >
                    <input id="thumb-input-config" type="file" accept="image/jpeg,image/webp,image/png" style={{ display: 'none' }} onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 2 * 1024 * 1024) { alert('Arquivo muito grande. Máximo: 2MB.'); return; }
                        setEditThumbnail(f);
                        setEditThumbnailPreview(URL.createObjectURL(f));
                      }
                    }} />
                    {!editThumbnailPreview && (
                      <XStack ai="center" gap={6}>
                        <Icon name="Image" size={16} color="$textMuted" />
                        <Text fontSize={11} color="$textMuted">Clique para selecionar</Text>
                      </XStack>
                    )}
                  </YStack>
                </YStack>

                <XStack ai="center" jc="space-between" mt={4} pt={12} borderTopWidth={1} borderTopColor="$border">
                  <YStack gap={2}>
                    <Text fontSize={13} fontWeight="600">Status de Publicação</Text>
                    <Text fontSize={11} color="$textMuted">{course?.is_published ? 'Disponível para os alunos' : 'Disponível apenas para rascunho'}</Text>
                  </YStack>
                  <XStack
                    w={40} h={22} br={11} bg={course?.is_published ? '$success' : '$border'}
                    ai="center" px={3}
                    cursor="pointer"
                    onPress={togglePublish}
                    style={{ justifyContent: course?.is_published ? 'flex-end' : 'flex-start' }}
                  >
                    <XStack w={16} h={16} br={8} bg="white" />
                  </XStack>
                </XStack>

                {saveMessage && (
                  <XStack p={8} borderRadius={6} borderWidth={1} borderColor={saveMessage.type === 'success' ? '$success' : '$danger'} bg="white" ai="center" gap={8}>
                    <Icon name={saveMessage.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={14} color={saveMessage.type === 'success' ? '$success' : '$danger'} />
                    <Text fontSize={12} color={saveMessage.type === 'success' ? '$successForeground' : '$text'}>{saveMessage.text}</Text>
                  </XStack>
                )}

                <Button onPress={saveCourseSettings} size="$3" variant="ghost" borderWidth={1} borderColor="$border">
                  <Text fontSize={13} fontWeight="600">Salvar Alterações</Text>
                </Button>
              </YStack>

              {/* Box de Certificado */}
              <YStack borderWidth={1} borderColor="$border" borderRadius={12} bg="$card" p={16} gap={12}>
                <XStack ai="center" gap={8}>
                  <Icon name="Award" size={20} color="$primary" />
                  <Text fontSize={14} fontWeight="600">Configurações do Certificado</Text>
                </XStack>
                <Text fontSize={12} color="$textMuted" lineHeight={18}>
                  Quando ativo, os alunos que concluírem todas as aulas com aproveitamento mínimo de 70% receberão um certificado oficial da plataforma com validação de código único (BSGI).
                </Text>
                
                <XStack ai="center" jc="space-between" bg="$background" p={8} borderRadius={6}>
                  <Text fontSize={12} fontWeight="600">Emitir certificado para este curso</Text>
                  <XStack
                    w={40} h={22} br={11} bg={certificateEnabled ? '$success' : '$border'}
                    ai="center" px={3}
                    cursor="pointer"
                    onPress={() => setCertificateEnabled(!certificateEnabled)}
                    style={{ justifyContent: certificateEnabled ? 'flex-end' : 'flex-start' }}
                  >
                    <XStack w={16} h={16} br={8} bg="white" />
                  </XStack>
                </XStack>

                {/* BOTÃO DE AÇÃO CRUCIAL: Personalizar no Studio */}
                <Button
                  onPress={() => router.push(`/studio/${courseId}?mode=certificate`)}
                  backgroundColor="$primary"
                  hoverStyle={{ opacity: 0.9 }}
                  size="$3"
                >
                  <XStack ai="center" gap={8}>
                    <Icon name="Settings" size={14} color="white" />
                    <Text color="white" fontSize={12} fontWeight="600">Personalizar Certificado no Studio</Text>
                  </XStack>
                </Button>
              </YStack>

            </YStack>
          </XStack>
          
        </YStack>
      </YStack>
    </Theme>
  );
}
