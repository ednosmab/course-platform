'use client';

import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Icon, Theme, Button, Spinner } from '@projeto/ui';
import Link from 'next/link';
import { BrandMark } from '../components/brand-mark';
import { CourseService, StorageService } from '@projeto/core';
import type { Course } from '@projeto/types';

export default function Dashboard() {
  const [filter, setFilter] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnail, setFormThumbnail] = useState<File | null>(null);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    try {
      const course = await CourseService.createCourse(
        formTitle.trim(),
        formDescription.trim(),
      );
      if (formThumbnail) {
        const url = await StorageService.uploadThumbnail(formThumbnail, course.id);
        if (url) {
          await CourseService.updateCourse(course.id, { thumbnail_url: url });
        }
      }
      setFormTitle('');
      setFormDescription('');
      setFormThumbnail(null);
      setFormThumbnailPreview(null);
      setShowCreateModal(false);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await CourseService.deleteCourse(id);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const filteredCourses = filter === 0 ? courses : filter === 1 ? courses.filter((c: any) => c.is_published) : courses.filter((c: any) => !c.is_published);

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        {/* Header */}
        <XStack
          position="sticky" top={0} zIndex={40}
          borderBottomWidth={1} borderBottomColor="$border"
          bg="$background"
          style={{ backdropFilter: 'blur(12px)' }}
          px={24} height={64} ai="center" jc="space-between"
        >
          <XStack ai="center" gap={32}>
            <BrandMark />
            <XStack ai="center" gap={4}>
              {['Cursos', 'Alunos', 'Mídia', 'Relatórios'].map((l, i) => (
                <XStack key={l} px={12} py={6} borderRadius={6} backgroundColor={i === 0 ? '$secondary' : 'transparent'} cursor="pointer">
                  <Text fontSize={14} color={i === 0 ? '$text' : '$textMuted'} fontWeight={i === 0 ? '500' : '400'} style={{ userSelect: 'none' }}>{l}</Text>
                </XStack>
              ))}
            </XStack>
          </XStack>
          <XStack ai="center" gap={12}>
            <XStack position="relative" style={{ display: 'none' }} $sm={{ display: 'flex' }}>
              <Icon name="Search" size={16} color="$textMuted" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input placeholder="Buscar cursos, aulas, alunos…" style={{ height: 36, width: 288, borderRadius: 8, border: '1px solid #DEE1EB', backgroundColor: '#F1F2F8', paddingLeft: 40, paddingRight: 12, fontSize: 14, outline: 'none', color: '#282836' }} />
            </XStack>
            <XStack position="relative" p={8} borderRadius={6} cursor="pointer">
              <Icon name="Bell" size={16} color="$textMuted" />
              <XStack position="absolute" right={6} top={6} w={6} h={6} borderRadius={3} bg="$primary" />
            </XStack>
            <XStack ai="center" gap={8} px={8} py={4} borderRadius={6} borderWidth={1} borderColor="$border" backgroundColor="$card" cursor="pointer">
              <XStack width={24} height={24} borderRadius={4} ai="center" jc="center" backgroundColor="$accent">
                <Text fontSize={11} fontWeight="$6" color="$accentForeground">MR</Text>
              </XStack>
              <Text fontSize={14}>Maria</Text>
              <Icon name="ChevronDown" size={14} color="$textMuted" />
            </XStack>
          </XStack>
        </XStack>

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Hero */}
          <YStack position="relative" overflow="hidden" borderRadius={16} borderWidth={1} borderColor="$border" backgroundColor="$card" p={32}>
            <div style={{ position: 'absolute', right: -64, top: -64, width: 256, height: 256, borderRadius: '50%', opacity: 0.6, filter: 'blur(64px)', background: 'linear-gradient(135deg, #E0F2FE, #EDE9FE)' }} />
            <YStack position="relative" gap={24} $md={{ fd: 'row', ai: 'flex-end', jc: 'space-between' }}>
              <YStack maxWidth={576}>
                <XStack ai="center" gap={6} px={10} py={4} borderRadius={9999} borderWidth={1} borderColor="$border" backgroundColor="$background" alignSelf="flex-start">
                  <XStack w={6} h={6} borderRadius={3} bg="#22C55E" />
                  <Text fontSize={12} color="$textMuted">Tudo certo por aqui</Text>
                </XStack>
                <Text fontFamily="$display" fontSize={36} fontWeight="$6" letterSpacing={-1} mt={16} $md={{ fontSize: 40 }}>
                  Oi, Maria 👋 vamos montar uma aula nova?
                </Text>
                <Text mt={8} color="$textMuted" fontSize={15}>
                  Arraste blocos, escreva clicando direto no texto e publique quando quiser. Sem formulário, sem drama.
                </Text>
              </YStack>
              <XStack gap={8}>
                <XStack px={16} py={10} borderRadius={8} borderWidth={1} borderColor="$border" backgroundColor="$card" cursor="pointer">
                  <Text fontSize={14}>Importar conteúdo</Text>
                </XStack>
                <XStack onPress={() => setShowCreateModal(true)} px={16} py={10} borderRadius={8} ai="center" gap={6} cursor="pointer" style={{ background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)' }}>
                  <Icon name="Plus" size={16} color="$white" />
                  <Text fontSize={14} color="$white" fontWeight="500">Novo curso</Text>
                </XStack>
              </XStack>
            </YStack>
          </YStack>

          {/* Courses */}
          <YStack mt={40}>
            <XStack ai="flex-end" jc="space-between" mb={16}>
              <YStack>
                <Text fontFamily="$display" fontSize={20} fontWeight="$6">Seus cursos</Text>
                <Text fontSize={14} color="$textMuted">Clique para abrir no Estúdio.</Text>
              </YStack>
              <XStack gap={4} p={4} borderRadius={8} borderWidth={1} borderColor="$border" backgroundColor="$card">
                {['Todos', 'Publicados', 'Rascunhos'].map((t, i) => (
                  <XStack key={t} px={12} py={4} borderRadius={4} backgroundColor={i === filter ? '$secondary' : 'transparent'} cursor="pointer" onPress={() => setFilter(i)}>
                    <Text fontSize={14} color={i === filter ? '$text' : '$textMuted'}>{t}</Text>
                  </XStack>
                ))}
              </XStack>
            </XStack>

            {loading ? (
              <YStack f={1} ai="center" jc="center" gap={12} opacity={0.7}>
                <Spinner size="large" color="$primary" />
                <Text color="$textMuted" fontSize={14}>Carregando cursos…</Text>
              </YStack>
            ) : filteredCourses.length === 0 ? (
              <YStack ai="center" jc="center" py={64} gap={8}>
                <Icon name="BookOpen" size={48} color="$textMuted" />
                <Text color="$textMuted" fontSize={16}>Nenhum curso encontrado</Text>
                <Text color="$textMuted" fontSize={14}>Clique em "Novo curso" para começar.</Text>
              </YStack>
            ) : (
              <XStack flexWrap="wrap" gap={16}>
                {filteredCourses.map((c: any) => (
                  <YStack key={c.id} flex={1} minWidth={320} maxWidth="calc(33.33% - 12px)">
                    <Link href={`/configuracoes/${c.id}`} style={{ textDecoration: 'none' }}>
                      <YStack overflow="hidden" borderRadius={16} borderWidth={1} borderColor="$border" backgroundColor="$card" cursor="pointer" hoverStyle={{ y: -2 }}>
                        <YStack height={128} position="relative" style={{ background: c.thumbnail_url ? `url(${c.thumbnail_url}) center/cover no-repeat` : 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>
                          <YStack position="absolute" inset={0} opacity={c.thumbnail_url ? 0 : 0.3} style={{ backgroundImage: c.thumbnail_url ? undefined : 'linear-gradient(to right, rgba(204, 208, 220, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(204, 208, 220, 0.35) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                          <XStack position="absolute" left={16} top={16}>
                            <XStack borderRadius={9999} px={8} py={2} style={{ backdropFilter: 'blur(8px)', backgroundColor: c.is_published ? 'rgba(34, 197, 94, 0.2)' : 'rgba(247, 248, 252, 0.7)' }}>
                              <Text fontSize={11} fontWeight="500" color={c.is_published ? '$successForeground' : '$text'}>{c.is_published ? 'Publicado' : 'Rascunho'}</Text>
                            </XStack>
                          </XStack>
                        </YStack>
                        <YStack p={20}>
                          <Text fontFamily="$display" fontSize={16} fontWeight="$6" style={{ lineHeight: 1.3 }}>{c.title}</Text>
                          {c.description && <Text fontSize={13} color="$textMuted" mt={4} numberOfLines={2}>{c.description}</Text>}
                        </YStack>
                      </YStack>
                    </Link>
                    <XStack jc="flex-end" mt={4} gap={8}>
                      <Text onPress={() => handleDelete(c.id)} fontSize={12} color="$danger" style={{ cursor: 'pointer' }}>
                        Excluir
                      </Text>
                    </XStack>
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        </main>

        {/* Create Modal */}
        {showCreateModal && (
          <XStack position="fixed" inset={0} ai="center" jc="center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}>
            <YStack bg="$card" br="$4" p={32} width={480} gap={20} borderWidth={1} borderColor="$border">
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={20} fontWeight="$6">Novo curso</Text>
                <XStack onPress={() => setShowCreateModal(false)} cursor="pointer" p={4}>
                  <Icon name="X" size={20} color="$textMuted" />
                </XStack>
              </XStack>
              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Título</Text>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Desenvolvimento Web Full Stack"
                  style={{ height: 40, borderRadius: 8, border: '1px solid #DEE1EB', padding: '0 12px', fontSize: 14, outline: 'none', color: '#282836' }}
                  autoFocus
                />
              </YStack>
              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Descrição</Text>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva o curso em poucas palavras..."
                  rows={3}
                  style={{ borderRadius: 8, border: '1px solid #DEE1EB', padding: 12, fontSize: 14, outline: 'none', color: '#282836', resize: 'vertical' }}
                />
              </YStack>
              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Thumbnail (1280×720px, máx 2MB)</Text>
                <YStack
                  position="relative"
                  height={140}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$border"
                  style={{ borderStyle: 'dashed', backgroundImage: formThumbnailPreview ? `url(${formThumbnailPreview})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}
                  ai="center"
                  jc="center"
                  overflow="hidden"
                  bg={formThumbnailPreview ? 'transparent' : '$background'}
                  onPress={() => document.getElementById('thumb-input-create')?.click()}
                >
                  <input id="thumb-input-create" type="file" accept="image/jpeg,image/webp,image/png" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) { alert('Arquivo muito grande. Máximo: 2MB.'); return; }
                      setFormThumbnail(file);
                      setFormThumbnailPreview(URL.createObjectURL(file));
                    }
                  }} />
                  {!formThumbnailPreview && (
                    <XStack ai="center" gap={6}>
                      <Icon name="Image" size={20} color="$textMuted" />
                      <Text fontSize={13} color="$textMuted">Clique para selecionar</Text>
                    </XStack>
                  )}
                </YStack>
              </YStack>
              <XStack gap={8} jc="flex-end">
                <Button variant="secondary" onPress={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button onPress={handleCreate} disabled={!formTitle.trim()}>Criar curso</Button>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
