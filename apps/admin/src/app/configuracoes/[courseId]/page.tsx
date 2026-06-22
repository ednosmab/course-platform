'use client';

import React, { useState, useEffect, use } from 'react';
import { createPortal } from 'react-dom';
import { YStack, XStack, Text, Button, Icon, Spinner, Theme, CertificateMiniature, CertificatePage } from '@projeto/ui';
import { useRouter } from 'next/navigation';
import { BrandMark } from '../../../components/brand-mark';
import { CourseService, StorageService } from '@projeto/core';
import type { Module, Lesson, Course, CourseAccess } from '@projeto/types';

const A4_PRINT_W = 1123;
const A4_PRINT_H = 794;

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
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accessMode, setAccessMode] = useState<'free' | 'progressive' | 'restricted'>('free');
  const [prerequisiteCourseId, setPrerequisiteCourseId] = useState<string | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [prerequisiteError, setPrerequisiteError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const certMeta = (course?.certificate_blocks || []).find((b: any) => b.type === '__meta__') as any;
  const certDesignWidth = certMeta?.designWidth ?? 1100;
  const certDesignHeight = certMeta?.designHeight ?? Math.round(1100 / 1.414);
  const certIsDoubleSided = !!certMeta?.isDoubleSided;
  const certificateBlocks = (course?.certificate_blocks || []).filter((b: any) => b.type !== '__meta__');

  // Toggle frente/verso do modal de preview (só usado se isDoubleSided)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  // Print via iframe isolado — evita race conditions do @media print no DOM da app.
  const handlePrint = () => {
    const overlayEl = document.getElementById('certificate-modal-overlay');
    if (!overlayEl) return;

    const overlayHTML = overlayEl.outerHTML;
    const printScale = 1122.5 / certDesignWidth;

    const printStyles = `
      <style>
        @page { size: A4 landscape; margin: 0; }
        html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body * { visibility: hidden !important; }
        #certificate-modal-overlay,
        #certificate-modal-overlay * { visibility: visible !important; }
        #certificate-modal-overlay { position: static !important; inset: auto !important; display: block !important; background: white !important; }
        #certificate-modal-card { max-width: none !important; max-height: none !important; width: 297mm !important; height: auto !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; background: transparent !important; margin: 0 !important; padding: 0 !important; }
        #certificate-modal-header { display: none !important; }
        #certificate-print-root { display: block !important; width: 297mm !important; height: auto !important; padding: 0 !important; margin: 0 !important; background: white !important; }
        #certificate-print-root > div { width: 297mm !important; height: 210mm !important; position: relative !important; overflow: hidden !important; display: block !important; margin: 0 !important; page-break-inside: avoid !important; }
        #certificate-print-root > div:first-child { page-break-after: always !important; }
        .certificate-a4-canvas { position: absolute !important; left: 0 !important; top: 0 !important; width: var(--cert-design-width) !important; height: var(--cert-design-height) !important; transform: scale(var(--cert-print-scale)) !important; transform-origin: top left !important; box-shadow: none !important; max-width: none !important; max-height: none !important; border-radius: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style>
    `;

    const srcdoc = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          ${printStyles}
          <style>
            :root {
              --cert-design-width: ${certDesignWidth}px;
              --cert-design-height: ${certDesignHeight}px;
              --cert-print-scale: ${printScale};
            }
          </style>
        </head>
        <body>${overlayHTML}</body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.srcdoc = srcdoc;

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print failed:', e);
      } finally {
        setTimeout(() => iframe.remove(), 1000);
      }
    };

    document.body.appendChild(iframe);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'certificate-print-styles';
    style.textContent = `
      /* Screen: hide the non-selected side based on data-preview-side */
      @media screen {
        #certificate-modal-card[data-preview-side="front"] #certificate-print-root > div:nth-child(2) {
          display: none !important;
        }
        #certificate-modal-card[data-preview-side="back"] #certificate-print-root > div:first-child {
          display: none !important;
        }
      }

      @media print {
        @page { size: A4 landscape; margin: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        /* Hide everything except the certificate modal */
        body * { visibility: hidden !important; }
        #certificate-modal-overlay,
        #certificate-modal-overlay * {
          visibility: visible !important;
        }

        #certificate-modal-overlay {
          position: static !important; inset: auto !important;
          background: white !important; display: block !important;
        }

        #certificate-modal-card {
          max-width: none !important; max-height: none !important;
          width: 297mm !important; height: auto !important;
          border-radius: 0 !important; box-shadow: none !important;
          overflow: visible !important; background: transparent !important;
          margin: 0 !important; padding: 0 !important;
        }

        #certificate-modal-header { display: none !important; }

        #certificate-print-root {
          display: block !important;
          width: 297mm !important; height: auto !important;
          padding: 0 !important; margin: 0 !important;
          background: white !important;
        }

        #certificate-print-root > div {
          width: 297mm !important; height: 210mm !important;
          position: relative !important; overflow: hidden !important;
          display: block !important; margin: 0 !important;
          page-break-inside: avoid !important;
        }
        #certificate-print-root > div:first-child {
          page-break-after: always !important;
        }

        .certificate-a4-canvas {
          position: absolute !important; left: 0 !important; top: 0 !important;
          width: var(--cert-design-width) !important;
          height: var(--cert-design-height) !important;
          transform: scale(var(--cert-print-scale)) !important;
          transform-origin: top left !important;
          box-shadow: none !important; max-width: none !important;
          max-height: none !important; border-radius: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    const root = document.documentElement;
    root.style.setProperty('--cert-design-width', `${certDesignWidth}px`);
    root.style.setProperty('--cert-design-height', `${certDesignHeight}px`);
    root.style.setProperty('--cert-print-scale', (1122.5 / certDesignWidth).toString());

    return () => {
      style.remove();
      root.style.removeProperty('--cert-design-width');
      root.style.removeProperty('--cert-design-height');
      root.style.removeProperty('--cert-print-scale');
    };
  }, [certDesignWidth, certDesignHeight]);

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

      try {
        const accessData = await CourseService.getCourseAccess(courseId);
        if (accessData) {
          setAccessMode(accessData.access_mode);
          setPrerequisiteCourseId(accessData.prerequisite_course_id ?? null);
        }
      } catch {
        // course_access table may not exist yet
      }

      try {
        const courses = await CourseService.getAllCourses();
        setAllCourses(courses.filter(c => c.id !== courseId));
      } catch (err) {
        console.error('Error loading courses for prerequisite:', err);
      }
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData();
  }, [courseId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) fetchData();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
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
    setSaving(true);
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
      await CourseService.updateCourseAccess(courseId, {
        access_mode: accessMode,
        prerequisite_course_id: prerequisiteCourseId,
      });
      setCourse((prev: any) => ({ ...prev, title: editTitle.trim(), description: editDescription.trim(), certificate_enabled: certificateEnabled, thumbnail_url }));
      setEditThumbnail(null);
      setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => {
        setSaveMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error('Save error:', err);
      const msg = err?.message || err?.error_description || err?.details || (err?.code ? `Erro ${err.code}` : null) || 'Erro ao salvar configurações.';
      setSaveMessage({ type: 'error', text: msg });
      setTimeout(() => setSaveMessage(null), 8000);
    } finally {
      setSaving(false);
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

  const handleDeleteCertificate = async () => {
    const confirm = window.confirm("Tem certeza que deseja excluir permanentemente o design do certificado deste curso?");
    if (!confirm) return;

    setSaving(true);
    setSaveMessage(null);
    try {
      await CourseService.updateCourse(courseId, { certificate_blocks: [] });
      await CourseService.updateCourseSettings(courseId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        certificate_enabled: false,
        thumbnail_url: course?.thumbnail_url || null,
      });

      setCourse((prev: any) => ({
        ...prev,
        certificate_blocks: [],
        certificate_enabled: false,
      }));
      setCertificateEnabled(false);

      setSaveMessage({ type: 'success', text: 'Certificado excluído com sucesso!' });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete certificate error:', err);
      const msg = err?.message || 'Erro ao excluir certificado.';
      setSaveMessage({ type: 'error', text: msg });
      setTimeout(() => setSaveMessage(null), 8000);
    } finally {
      setSaving(false);
    }
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
                <Button onPress={() => { setNewTitle(''); setShowModuleInput(true); }} variant="ghost" borderWidth={1} borderColor="$border">
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
                  <Button onPress={createModule} disabled={!newTitle.trim()} variant="ghost" borderWidth={1} borderColor="$border">Adicionar</Button>
                  <Button variant="secondary" onPress={() => setShowModuleInput(false)}>Cancelar</Button>
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
                        <Button onPress={() => renameModule(mod.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
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
                          <Button onPress={() => createLesson(mod.id)} disabled={!newTitle.trim()} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
                            <Text fontSize={12}>Adicionar</Text>
                          </Button>
                          <Button variant="secondary" onPress={() => setShowLessonInput(null)} px="$3" py="$1">
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
                              <Button onPress={() => renameLesson(lesson.id)} px="$3" py="$1" variant="ghost" borderWidth={1} borderColor="$border">
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

                {/* Separador */}
                <YStack h={1} bg="$border" my={8} />

                <XStack ai="center" gap={8}>
                  <Icon name="Shield" size={20} color="$primary" />
                  <Text fontSize={14} fontWeight="600">Controle de Acesso</Text>
                </XStack>
                <Text fontSize={12} color="$textMuted" lineHeight={18}>
                  Configure como os alunos acessam este curso. Modo livre permite acesso a todos. Modo progressivo exige conclusão de pré-requisito. Modo restrito requer atribuição de plano.
                </Text>

                <XStack gap={6} mt={8} jc="space-between">
                  <Button
                    px={10} py={4}
                    borderWidth={1}
                    borderColor={accessMode === 'free' ? '#3B82F6' : '#DEE1EB'}
                    bg={accessMode === 'free' ? '#3B82F6' : 'white'}
                    onPress={() => {
                      setAccessMode('free');
                      setPrerequisiteCourseId(null);
                    }}
                  >
                    <Text color={accessMode === 'free' ? 'white' : '#666'} fontSize={12} fontWeight={accessMode === 'free' ? '600' : '400'}>Livre</Text>
                  </Button>
                  <Button
                    px={10} py={4}
                    borderWidth={1}
                    borderColor={accessMode === 'progressive' ? '#3B82F6' : '#DEE1EB'}
                    bg={accessMode === 'progressive' ? '#3B82F6' : 'white'}
                    onPress={() => setAccessMode('progressive')}
                  >
                    <Text color={accessMode === 'progressive' ? 'white' : '#666'} fontSize={12} fontWeight={accessMode === 'progressive' ? '600' : '400'}>Progressivo</Text>
                  </Button>
                  <Button
                    px={10} py={4}
                    borderWidth={1}
                    borderColor={accessMode === 'restricted' ? '#3B82F6' : '#DEE1EB'}
                    bg={accessMode === 'restricted' ? '#3B82F6' : 'white'}
                    onPress={() => {
                      setAccessMode('restricted');
                      setPrerequisiteCourseId(null);
                    }}
                  >
                    <Text color={accessMode === 'restricted' ? 'white' : '#666'} fontSize={12} fontWeight={accessMode === 'restricted' ? '600' : '400'}>Restrito</Text>
                  </Button>
                </XStack>

                {accessMode === 'progressive' && (
                  <YStack mt={8} gap={4}>
                    <Text fontSize={12} fontWeight="600">Pré-requisito</Text>
                    <YStack
                      borderWidth={1}
                      borderColor="$border"
                      borderRadius={6}
                      bg="white"
                    >
                      <select
                        value={prerequisiteCourseId || ''}
                        onChange={async (e) => {
                          const selectedId = e.target.value || null;
                          setPrerequisiteCourseId(selectedId);
                          setPrerequisiteError(null);
                          if (selectedId) {
                            const hasCycle = await CourseService.detectPrerequisiteCycle(courseId, selectedId);
                            if (hasCycle) {
                              setPrerequisiteError('Este pré-requisito criaria um ciclo. Selecione outro curso.');
                              setPrerequisiteCourseId(null);
                            }
                          }
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '13px',
                          width: '100%',
                          backgroundColor: 'transparent',
                          outline: 'none',
                        }}
                      >
                      <option value="">Selecione o pré-requisito...</option>
                      {allCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    {prerequisiteError && (
                      <Text fontSize={11} color="$error">{prerequisiteError}</Text>
                    )}
                    </YStack>
                  </YStack>
                )}

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


                {/* Separador */}
                <YStack h={1} bg="$border" my={8} />

                <XStack ai="center" gap={8}>
                  <Icon name="Award" size={20} color="$primary" />
                  <Text fontSize={14} fontWeight="600">Certificado</Text>
                </XStack>
                <Text fontSize={12} color="$textMuted" lineHeight={18}>
                  Quando ativo, os alunos que concluírem todas as aulas com aproveitamento mínimo de 70% receberão um certificado oficial com validação de código único (extranet).
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

                {certificateEnabled && certificateBlocks.length > 0 && (
                  <YStack gap={8}>
                    <Text fontSize={11} fontWeight="600" color="$textMuted" textTransform="uppercase" letterSpacing={1}>
                      Preview do Certificado
                    </Text>
                    <XStack cursor="pointer" onPress={() => setPreviewOpen(true)} hoverStyle={{ opacity: 0.85 }}>
                      <CertificateMiniature
                        blocks={certificateBlocks}
                        designWidth={certDesignWidth}
                        designHeight={certDesignHeight}
                        isDoubleSided={certIsDoubleSided}
                      />
                    </XStack>
                    <Text fontSize={10} color="$textMuted" textAlign="center">Clique no preview para ampliar</Text>
                  </YStack>
                )}
                {previewOpen && mounted && createPortal(
                  <YStack
                    id="certificate-modal-overlay"
                    position="fixed"
                    inset={0}
                    zIndex={99999}
                    bg="rgba(0,0,0,0.7)"
                    ai="center" jc="center"
                    onPress={() => setPreviewOpen(false)}
                  >
                    <YStack
                      id="certificate-modal-card"
                      data-preview-side={certIsDoubleSided ? previewSide : undefined}
                      bg="white"
                      borderRadius={12}
                      overflow="hidden"
                      width="95vw"
                      height="92vh"
                      style={{
                        maxWidth: 'min(95vw, 1500px)',
                        maxHeight: 'min(92vh, 1100px)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                      } as React.CSSProperties}
                      onPress={(e: any) => e.stopPropagation()}
                    >
                      <XStack id="certificate-modal-header" ai="center" jc="space-between" p={12} borderBottomWidth={1} borderBottomColor="$border">
                        <XStack ai="center" gap={12}>
                          <Text fontSize={14} fontWeight="600">Preview do Certificado</Text>
                          {certIsDoubleSided && (
                            <XStack ml="$2" bg="$background" borderRadius="$2" p="$0.5" gap="$0.5" borderWidth={1} borderColor="$border">
                              <Button
                                variant={previewSide === 'front' ? 'primary' : 'ghost'}
                                onPress={() => setPreviewSide('front')}
                                px="$3"
                              >
                                <Text fontSize={11} color={previewSide === 'front' ? 'white' : '$textMuted'}>Frente</Text>
                              </Button>
                              <Button
                                variant={previewSide === 'back' ? 'primary' : 'ghost'}
                                onPress={() => setPreviewSide('back')}
                                px="$3"
                              >
                                <Text fontSize={11} color={previewSide === 'back' ? 'white' : '$textMuted'}>Verso</Text>
                              </Button>
                            </XStack>
                          )}
                        </XStack>
                        <XStack ai="center" gap={8}>
                          <Button variant="ghost" borderWidth={1} borderColor="$border" onPress={handlePrint}>
                            <Icon name="Download" size={14} color="$textMuted" />
                          </Button>
                          <Button variant="ghost" onPress={() => setPreviewOpen(false)} px="$2">
                            <Icon name="X" size={18} color="$textMuted" />
                          </Button>
                        </XStack>
                      </XStack>
                      <YStack f={1} bg="white" style={{ overflow: 'hidden' }}>
                        <CertificatePage
                          blocks={certificateBlocks}
                          isDoubleSided={certIsDoubleSided}
                          side={previewSide}
                          visiblePages={1}
                        />
                      </YStack>
                    </YStack>
                  </YStack>,
                  document.body
                )}

                <XStack gap={8} w="100%">
                  <Button
                    onPress={() => router.push(`/studio/${courseId}/certificate`)}
                    backgroundColor="$primary"
                    hoverStyle={{ opacity: 0.9 }}
                    flex={1}
                  >
                    <XStack ai="center" gap={8}>
                      <Icon name="Settings" size={14} color="white" />
                      <Text color="white" fontSize={12} fontWeight="600">Personalizar no Studio</Text>
                    </XStack>
                  </Button>

                  {certificateBlocks.length > 0 && (
                    <Button
                      onPress={handleDeleteCertificate}
                      backgroundColor="$dangerSurface"
                      hoverStyle={{ backgroundColor: '$danger' }}
                      borderWidth={1}
                      borderColor="$danger"
                      px="$3"
                    >
                      <XStack ai="center" gap={6}>
                        <Icon name="Trash2" size={14} color="$danger" />
                        <Text color="$danger" fontSize={12} fontWeight="600">Excluir</Text>
                      </XStack>
                    </Button>
                  )}
                </XStack>

                {saveMessage && (
                  <XStack p={8} borderRadius={6} borderWidth={1} borderColor={saveMessage.type === 'success' ? '$success' : '$danger'} bg="white" ai="center" gap={8}>
                    <Icon name={saveMessage.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={14} color={saveMessage.type === 'success' ? '$success' : '$danger'} />
                    <Text fontSize={12} color={saveMessage.type === 'success' ? '$successForeground' : '$text'}>{saveMessage.text}</Text>
                  </XStack>
                )}

                <Button onPress={saveCourseSettings} disabled={saving} variant="ghost" borderWidth={1} borderColor="$border" opacity={saving ? 0.6 : 1}>
                  <Text fontSize={13} fontWeight="600">{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
                </Button>
              </YStack>

            </YStack>
          </XStack>

        </YStack>
      </YStack>
    </Theme>
  );
}
