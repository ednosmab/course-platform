'use client';

import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, Text, Icon, Theme, Button, Card, Spinner, ProgressBar, Input, color, lineHeightHeading, lineHeightCardTitle } from '@projeto/ui';

const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;
const PROGRESS_GRADIENT = `linear-gradient(90deg, ${color.cwSuccess}, ${color.cwGradientFrom})`;
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BrandMark } from '../components/brand-mark';
import { CourseService, StorageService, AuthService } from '@projeto/core';
import type { Course } from '@projeto/types';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLUListElement>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [initialTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      const profile = await AuthService.getCurrentProfile();
      if (profile) setUserProfile({ full_name: profile.full_name ?? '', email: profile.email ?? '' });
    })();
  }, []);

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';
  const displayName = userProfile?.full_name || 'Usuário';
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
    let cancelled = false;

    (async () => {
      try {
        const data = await CourseService.getAllCourses();
        if (!cancelled) setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const statusFiltered = filter === 0 ? courses : filter === 1 ? courses.filter((c) => c.is_published) : courses.filter((c) => !c.is_published);
  const filteredCourses = searchQuery.trim()
    ? statusFiltered.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : statusFiltered;
  const firstName = displayName.split(' ')[0] || 'Usuário';
  const publishedCourses = courses.filter((course) => course.is_published).length;
  const draftCourses = courses.length - publishedCourses;
  const publishedPercent = courses.length > 0 ? Math.round((publishedCourses / courses.length) * 100) : 0;
  const updatedThisWeek = courses.filter((course) => {
    const value = course.updated_at || course.created_at;
    if (!value) return false;
    const updatedAt = new Date(value).getTime();
    return Number.isFinite(updatedAt) && initialTimestamp - updatedAt <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const formatDate = (value?: string | Date | null) => {
    if (!value) return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };
  const dashboardStats = [
    { icon: 'BookOpen', label: 'Cursos ativos', value: String(courses.length), trend: `${publishedCourses} publicados` },
    { icon: 'Users', label: 'Alunos', value: '--', trend: 'Conecte matrículas' },
    { icon: 'PlayCircle', label: 'Cursos publicados', value: String(publishedCourses), trend: `${draftCourses} rascunhos` },
    { icon: 'TrendingUp', label: 'Publicação', value: `${publishedPercent}%`, trend: `${updatedThisWeek} atualizados` },
  ];

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <style>{`
          @keyframes greenPulse {
            0% { transform: scale(0.92); opacity: 0.6; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { transform: scale(1.12); opacity: 1; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.92); opacity: 0.6; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .pulse-dot {
            animation: greenPulse 1.8s infinite ease-in-out;
          }
        `}</style>
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
              {['Cursos', 'Alunos', 'Mídia', 'Relatórios'].map((l, i) => {
                const isActive = l === 'Cursos' && (pathname.startsWith('/cursos') || pathname.startsWith('/configuracoes'));
                return (
                  <XStack
                    key={l}
                    px={12}
                    py={6}
                    borderRadius={6}
                    cursor="pointer"
                    hoverStyle={{ backgroundColor: '$secondary' }}
                    position="relative"
                    onPress={() => {
                      if (i === 0) {
                        router.push('/cursos');
                      }
                    }}
                  >
                    <Text
                      fontSize={14}
                      color={isActive ? '$text' : '$textMuted'}
                      fontWeight={isActive ? '600' : '400'}
                      style={{ userSelect: 'none' }}
                    >
                      {l}
                    </Text>
                    {isActive && (
                      <XStack
                        position="absolute"
                        bottom={0}
                        left={12}
                        right={12}
                        height={2}
                        backgroundColor="#10B981"
                        borderRadius={1}
                      />
                    )}
                  </XStack>
                );
              })}
            </XStack>
          </XStack>
          <XStack ai="center" gap={12}>
            <XStack position="relative">
              <Icon name="Search" size={16} color="$textMuted" style={{ position: 'absolute', left: 12, top: 10, pointerEvents: 'none' }} />
              <Input
                placeholder="Buscar cursos…"
                w={288}
                h={36}
                br="$3"
                borderColor="$border"
                backgroundColor="$background"
                paddingLeft={40}
                fontSize="$3"
                color="$text"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </XStack>
            <XStack position="relative" p={8} borderRadius={6} cursor="pointer">
              <Icon name="Bell" size={16} color="$textMuted" />
              <XStack position="absolute" right={6} top={6} w={6} h={6} borderRadius={3} bg="$primary" />
            </XStack>
            <ul ref={userMenuRef} style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setShowUserMenu(!showUserMenu); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 6,
                    border: '1px solid #DEE1EB', background: '#FFFFFF',
                    cursor: 'pointer', textDecoration: 'none', color: 'inherit',
                    fontFamily: 'inherit', fontSize: 'inherit',
                  }}
                >
                  <XStack width={24} height={24} borderRadius={4} ai="center" jc="center" backgroundColor="$accent">
                    <Text fontSize={11} fontWeight="$6" color="$accentForeground">{initials}</Text>
                  </XStack>
                  <Text fontSize={14}>{displayName}</Text>
                  <Icon name="ChevronDown" size={14} color="$textMuted" />
                </a>

                {showUserMenu && (
                  <ul
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 4,
                      listStyle: 'none', margin: 0, padding: 8, minWidth: 160,
                      borderRadius: 8, zIndex: 999,
                      background: '#FFFFFF', border: '1px solid #DEE1EB',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <li>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setShowUserMenu(false); router.push('/logout'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                          textDecoration: 'none', color: 'inherit',
                          fontFamily: 'inherit', fontSize: 'inherit',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F7F8FC'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <Icon name="LogOut" size={16} color="$textMuted" />
                        <Text fontSize={14} color="$danger">Sair</Text>
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </XStack>
        </XStack>

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Hero */}
          <YStack
            position="relative"
            overflow="hidden"
            borderRadius={16}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$card"
            p={32}
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <img
              src="/fundo.png"
              alt=""
              aria-hidden
              draggable={false}
              style={{
                position: 'absolute',
                right: 0,
                top: -106,
                width: 1280,
                height: 'auto',
                opacity: 0.7,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            <YStack position="relative" gap={24} $md={{ fd: 'row', ai: 'flex-end', jc: 'space-between' }}>
              <YStack maxWidth={576}>
                <XStack ai="center" gap={6} px={10} py={4} borderRadius={9999} borderWidth={1} borderColor="$border" backgroundColor="$background" alignSelf="flex-start">
                  <XStack w={6} h={6} borderRadius={3} bg="$success" />
                  <Text fontSize={12} color="$textMuted">Tudo certo por aqui</Text>
                </XStack>
                {/*
                  The `as never` cast is required because Tamagui's `lineHeight`
                  prop typing only accepts the `lineHeight` token map (in px) or
                  the literal `"unset"`. Strings with a unitless multiplier
                  (e.g. `"1.12"`) are valid CSS but lie outside the type
                  allowlist. We intentionally bypass the type check here so
                  the value reaches `dangerousStyleValue` as a string and is
                  emitted verbatim by Tamagui (which would otherwise coerce
                  numeric values to px via `lineHeight` not being in the
                  `unitlessNumbers` allowlist of @tamagui/react-native-web-internals).
                */}
                <Text fontFamily="$display" fontSize={36} fontWeight="$6" mt={16} lineHeight={lineHeightHeading as never} $md={{ fontSize: 40 }}>
                  Oi, {firstName}, vamos montar uma aula nova?
                </Text>
                <Text mt={8} color="$textMuted" fontSize={15}>
                  Arraste blocos, escreva clicando direto no texto e publique quando quiser. Sem formulário, sem drama.
                </Text>
              </YStack>
              <XStack gap={8}>
                <Button variant="ghost" borderWidth={1} borderColor="$border" bg="$card" px={16} py={10}>
                  <Text fontSize={14}>Importar conteúdo</Text>
                </Button>
                <Button onPress={() => setShowCreateModal(true)} px={16} py={10} ai="center" gap={6} style={{ background: BRAND_GRADIENT }}>
                  <Icon name="Plus" size={16} color="$white" />
                  <Text fontSize={14} color="$white" fontWeight="500">Novo curso</Text>
                </Button>
              </XStack>
            </YStack>

            <XStack position="relative" mt={32} gap={12} flexWrap="wrap">
              {dashboardStats.map((stat, idx) => (
                <Card
                  key={stat.label}
                  flex={1}
                  minWidth={220}
                  p={16}
                  bg="$background"
                  br="$4"
                  borderWidth={1}
                  borderColor="$border"
                  hoverStyle={{ scale: 1.01, borderColor: '$primary' }}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <XStack ai="center" jc="space-between">
                    <Icon name={stat.icon} size={16} color="$textMuted" />
                    <Text fontSize={11} color={stat.value === '--' ? '$textMuted' : '$success'}>{stat.trend}</Text>
                  </XStack>
                  <Text mt={12} fontFamily="$display" fontSize={28} fontWeight="$6">{stat.value}</Text>
                  <Text fontSize={12} color="$textMuted">{stat.label}</Text>
                </Card>
              ))}
            </XStack>
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
              <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} style={{ borderStyle: 'dashed' }} bg="$card">
                <Icon name="Search" size={40} color="$textMuted" />
                <Text color="$textMuted" fontSize={16} fontWeight="600">
                  {searchQuery.trim() ? 'Nenhum resultado para sua busca' : 'Nenhum curso encontrado'}
                </Text>
                <Text color="$textMuted" fontSize={14}>
                  {searchQuery.trim() ? `Nenhum curso corresponde a "${searchQuery}"` : 'Clique em "Novo curso" para começar.'}
                </Text>
              </YStack>
            ) : (
              <XStack flexWrap="wrap" gap={16}>
                {filteredCourses.map((c) => {
                  const readiness = c.is_published ? 100 : 45;
                  return (
                  <YStack key={c.id} flex={1} minWidth={320} maxWidth="calc(33.33% - 12px)">
                    <Link href={`/configuracoes/${c.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        p={0}
                        overflow="hidden"
                        br="$4"
                        cursor="pointer"
                        interactive
                        borderWidth={1}
                        borderColor={c.is_published ? 'rgba(16, 185, 129, 0.35)' : '$border'}
                        style={
                          c.is_published
                            ? {
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)',
                              }
                            : undefined
                        }
                      >
                        <YStack
                          height={128}
                          position="relative"
                          style={{
                            background: c.thumbnail_url
                              ? `url(${c.thumbnail_url}) center/cover no-repeat`
                              : PROGRESS_GRADIENT,
                          }}
                        >
                          <YStack
                            position="absolute"
                            inset={0}
                            opacity={c.thumbnail_url ? 0 : 0.3}
                            style={{
                              backgroundImage: c.thumbnail_url
                                ? undefined
                                : 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
                              backgroundSize: '24px 24px',
                            }}
                          />

                          <XStack position="absolute" left={16} top={16}>
                            <XStack
                              borderRadius={9999}
                              px={10}
                              py={4}
                              ai="center"
                              gap={6}
                              style={{
                                backdropFilter: 'blur(8px)',
                                backgroundColor: c.is_published
                                  ? 'rgba(16, 185, 129, 0.9)'
                                  : 'rgba(55, 65, 81, 0.8)',
                              }}
                            >
                              {c.is_published && (
                                <XStack
                                  w={6}
                                  h={6}
                                  borderRadius={3}
                                  bg="#FFFFFF"
                                  className="pulse-dot"
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '50%',
                                  }}
                                />
                              )}
                              <Text fontSize={11} fontWeight="700" color="#FFFFFF">
                                {c.is_published ? 'Em Andamento' : 'Em Preparação'}
                              </Text>
                            </XStack>
                          </XStack>
                        </YStack>
                        <YStack p={20}>
                          <XStack ai="flex-start" jc="space-between" gap={8}>
                            <Text flex={1} fontFamily="$display" fontSize={16} fontWeight="$6" lineHeight={lineHeightCardTitle as never}>{c.title}</Text>
                            <XStack
                              p={4}
                              br="$2"
                              hoverStyle={{ bg: '$secondary' }}
                              onPress={(event) => {
                                event.stopPropagation?.();
                                event.preventDefault?.();
                              }}
                            >
                              <Icon name="MoreHorizontal" size={16} color="$textMuted" />
                            </XStack>
                          </XStack>
                          {c.description && <Text fontSize={13} color="$textMuted" mt={4} numberOfLines={2}>{c.description}</Text>}
                          <XStack mt={8} ai="center" gap={10}>
                            <Text fontSize={12} color="$textMuted">Atualizado em {formatDate(c.updated_at || c.created_at)}</Text>
                            <Text fontSize={12} color="$textMuted">•</Text>
                            <Text fontSize={12} color="$textMuted">{c.is_published ? 'No ar' : 'Em edição'}</Text>
                          </XStack>
                          <YStack mt={16} gap={6}>
                            <XStack ai="center" jc="space-between">
                              <Text fontSize={11} color="$textMuted">{c.is_published ? 'Publicado' : 'Pronto para publicar'}</Text>
                              <Text fontSize={11} color="$textMuted">{readiness}%</Text>
                            </XStack>
                            <ProgressBar progress={readiness} height={6} gradient={PROGRESS_GRADIENT} />
                          </YStack>
                        </YStack>
                      </Card>
                    </Link>
                    <XStack jc="flex-end" mt={4} gap={8}>
                      <Text onPress={() => handleDelete(c.id)} fontSize={12} color="$danger" style={{ cursor: 'pointer' }}>
                        Excluir
                      </Text>
                    </XStack>
                  </YStack>
                  );
                })}
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
                <Input
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="Ex: Desenvolvimento Web Full Stack"
                  h={40}
                  br="$3"
                  borderColor="$border"
                  autoFocus
                />
              </YStack>
              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Descrição</Text>
                <YStack
                  borderWidth={1}
                  borderColor="$border"
                  borderRadius="$3"
                  bg="$background"
                  p="$3"
                  focusStyle={{ borderColor: '$primary' }}
                >
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descreva o curso em poucas palavras..."
                    rows={3}
                    style={{
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: 'inherit',
                      background: 'transparent',
                      width: '100%',
                    }}
                  />
                </YStack>
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
