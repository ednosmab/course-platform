'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  YStack,
  XStack,
  Text,
  Icon,
  Theme,
  Button,
  Card,
  Spinner,
  ProgressBar,
  Input,
  lineHeightHeading,
  lineHeightCardTitle,
} from '@projeto/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '../../components/brand-mark';
import { CourseService, StorageService, getSupabaseClient } from '@projeto/core';
import type { Course } from '@projeto/types';

// Gradiente padrão da marca do FLEXED Studio
const BRAND_GRADIENT = 'linear-gradient(135deg, #10B981, #059669)';

// Mapeamento de categorias e seus ícones correspondentes
const CATEGORY_ICONS: Record<string, string> = {
  'Tecnologia': 'Laptop',
  'Vendas': 'DollarSign',
  'Liderança': 'Shield',
  'Soft Skills': 'Smile',
  'Design': 'Palette',
  'Cultura': 'Globe',
  'Geral': 'Folder',
};

export default function CursosPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Perfil do Administrador
  const [displayName, setDisplayName] = useState('');
  const [initials, setInitials] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLUListElement>(null);

  // Modal de Criação de Cursos
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnail, setFormThumbnail] = useState<File | null>(null);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState<string | null>(null);

  // Fecha o menu de usuário se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Carrega informações do perfil e cursos na inicialização
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const client = getSupabaseClient();
        const { data: { user } } = await client.auth.getUser();
        if (user && !cancelled) {
          const { data: profile } = await client.from('profiles').select('full_name, email').eq('id', user.id).single();
          if (profile) {
            const name = profile.full_name || profile.email || 'Admin';
            setDisplayName(name);
            setInitials(name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
          }
        }

        const data = await CourseService.getAllCourses();
        if (!cancelled) setCourses(data);
      } catch (err) {
        console.error('Failed to initialize page:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Lógica para Criar Curso
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

  // Lógica para Excluir Curso
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await CourseService.deleteCourse(id);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  // Função para inferir a categoria do curso a partir do título/descrição
  const getCourseCategory = (course: Course) => {
    const title = (course.title || '').toLowerCase();
    
    if (
      title.includes('desenvolvimento') || title.includes('web') || title.includes('full stack') ||
      title.includes('programação') || title.includes('javascript') || title.includes('tecnologia') ||
      title.includes('software') || title.includes('api') || title.includes('devops') || title.includes('banco de dados')
    ) {
      return 'Tecnologia';
    }
    if (title.includes('vendas') || title.includes('comercial') || title.includes('negociação') || title.includes('marketing') || title.includes('conversão')) {
      return 'Vendas';
    }
    if (title.includes('liderança') || title.includes('gestão') || title.includes('gerenciamento') || title.includes('leadership') || title.includes('feedback')) {
      return 'Liderança';
    }
    if (title.includes('comunicação') || title.includes('oratória') || title.includes('soft') || title.includes('empatia') || title.includes('apresentação')) {
      return 'Soft Skills';
    }
    if (title.includes('cultura') || title.includes('valores') || title.includes('onboarding') || title.includes('empresa') || title.includes('história')) {
      return 'Cultura';
    }
    if (title.includes('design') || title.includes('interface') || title.includes('ux') || title.includes('ui') || title.includes('prototipagem') || title.includes('usabilidade')) {
      return 'Design';
    }
    return 'Geral';
  };

  // Formata datas
  const formatDate = (value?: string | Date | null) => {
    if (!value) return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  // Filtra cursos com base na busca
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    return course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Agrupa os cursos por categoria
  const groupedCourses: Record<string, Course[]> = {};
  filteredCourses.forEach((c) => {
    const cat = getCourseCategory(c);
    if (!groupedCourses[cat]) {
      groupedCourses[cat] = [];
    }
    groupedCourses[cat].push(c);
  });

  // Ordena os cursos dentro de cada categoria:
  // 1. Não publicados (sendo preparados/rascunhos) primeiro.
  // 2. Publicados (em andamento) depois.
  // 3. Em caso de empate, pelo created_at mais recente primeiro (decrescente).
  const sortCourses = (a: Course, b: Course) => {
    if (a.is_published !== b.is_published) {
      return a.is_published ? 1 : -1; // false (não publicado) vem antes de true (publicado)
    }
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  };

  Object.keys(groupedCourses).forEach((cat) => {
    groupedCourses[cat].sort(sortCourses);
  });

  const categories = Object.keys(groupedCourses).sort();

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
              {['Cursos', 'Alunos', 'Mídia', 'Relatórios'].map((l, i) => (
                <XStack
                  key={l}
                  px={12}
                  py={6}
                  borderRadius={6}
                  backgroundColor={i === 0 ? '$secondary' : 'transparent'}
                  cursor="pointer"
                  onPress={() => {
                    if (i === 0) {
                      router.push('/cursos');
                    }
                  }}
                >
                  <Text
                    fontSize={14}
                    color={i === 0 ? '$text' : '$textMuted'}
                    fontWeight={i === 0 ? '500' : '400'}
                    style={{ userSelect: 'none' }}
                  >
                    {l}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </XStack>

          <XStack ai="center" gap={12}>
            <XStack position="relative" p={8} borderRadius={6} cursor="pointer">
              <Icon name="Bell" size={16} color="$textMuted" />
              <XStack position="absolute" right={6} top={6} w={6} h={6} borderRadius={3} bg="$primary" />
            </XStack>
            {displayName && (
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
            )}
          </XStack>
        </XStack>

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Hero Header */}
          <YStack mb={32} gap={16}>
            <XStack ai="center" jc="space-between" flexWrap="wrap" gap={16}>
              <YStack gap={4}>
                <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
                  Cursos do Administrador
                </Text>
                <Text fontSize={15} color="$textMuted">
                  Gerencie a produção e acompanhe os cursos em andamento no FLEXED Studio.
                </Text>
              </YStack>

              <XStack gap={12} ai="center">
                {/* Busca */}
                <XStack position="relative" ai="center">
                  <Icon
                    name="Search"
                    size={16}
                    color="$textMuted"
                    style={{ position: 'absolute', left: 12, top: 10, pointerEvents: 'none' }}
                  />
                  <Input
                    placeholder="Buscar cursos por título…"
                    w={280}
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

                {/* Botão Novo Curso */}
                <Button
                  onPress={() => setShowCreateModal(true)}
                  px={16}
                  py={10}
                  ai="center"
                  gap={6}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon name="Plus" size={16} color="$white" />
                  <Text fontSize={14} color="$white" fontWeight="500">Novo curso</Text>
                </Button>
              </XStack>
            </XStack>
          </YStack>

          {loading ? (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando cursos…</Text>
            </YStack>
          ) : filteredCourses.length === 0 ? (
            <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
              <Icon name="BookOpen" size={48} color="$textMuted" />
              <Text color="$textMuted" fontSize={16} fontWeight="600">Nenhum curso encontrado</Text>
              <Text color="$textMuted" fontSize={14}>Ajuste a sua busca ou clique em &quot;Novo curso&quot; para criar um.</Text>
            </YStack>
          ) : (
            <YStack gap={40}>
              {categories.map((category) => {
                const categoryCourses = groupedCourses[category];
                const categoryIcon = CATEGORY_ICONS[category] || 'Folder';
                
                return (
                  <YStack key={category} gap={16}>
                    {/* Header da Categoria */}
                    <XStack ai="center" gap={8} borderBottomWidth={1} borderBottomColor="$border" pb={8}>
                      <Icon name={categoryIcon} size={18} color="$primary" />
                      <Text fontSize={18} fontWeight="bold" color="$text">
                        {category}
                      </Text>
                      <XStack px={8} py={2} borderRadius={12} bg="$secondary">
                        <Text fontSize={11} fontWeight="600" color="$textMuted">
                          {categoryCourses.length} {categoryCourses.length === 1 ? 'curso' : 'cursos'}
                        </Text>
                      </XStack>
                    </XStack>

                    {/* Grid de Cursos na Categoria */}
                    <XStack flexWrap="wrap" gap={16}>
                      {categoryCourses.map((c) => {
                        const isPublished = c.is_published;
                        const readiness = isPublished ? 100 : 45;
                        
                        return (
                          <YStack
                            key={c.id}
                            flex={1}
                            minWidth={320}
                            maxWidth="calc(33.33% - 12px)"
                            $md={{ maxWidth: 'calc(50% - 8px)' }}
                            $sm={{ maxWidth: '100%' }}
                          >
                            <Link href={`/configuracoes/${c.id}`} style={{ textDecoration: 'none' }}>
                              <Card
                                p={0}
                                overflow="hidden"
                                br="$4"
                                cursor="pointer"
                                interactive
                                borderWidth={1}
                                borderColor="$border"
                                style={
                                  isPublished
                                    ? {
                                        borderLeft: '4px solid #10B981',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)',
                                      }
                                    : undefined
                                }
                              >
                                {/* Thumbnail overlay */}
                                <YStack
                                  height={128}
                                  position="relative"
                                  style={{
                                    background: c.thumbnail_url
                                      ? `url(${c.thumbnail_url}) center/cover no-repeat`
                                      : 'linear-gradient(135deg, #10B981, #059669)',
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

                                  {/* Badge de Status */}
                                  <XStack position="absolute" left={16} top={16}>
                                    <XStack
                                      borderRadius={9999}
                                      px={10}
                                      py={4}
                                      ai="center"
                                      gap={6}
                                      style={{
                                        backdropFilter: 'blur(8px)',
                                        backgroundColor: isPublished
                                          ? 'rgba(16, 185, 129, 0.9)'
                                          : 'rgba(55, 65, 81, 0.8)',
                                      }}
                                    >
                                      {isPublished && (
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
                                      <Text
                                        fontSize={11}
                                        fontWeight="700"
                                        color="#FFFFFF"
                                      >
                                        {isPublished ? 'Em Andamento' : 'Em Preparação'}
                                      </Text>
                                    </XStack>
                                  </XStack>
                                </YStack>

                                <YStack p={20}>
                                  <Text
                                    fontFamily="$display"
                                    fontSize={16}
                                    fontWeight="$6"
                                    lineHeight={lineHeightCardTitle as never}
                                    numberOfLines={1}
                                  >
                                    {c.title}
                                  </Text>
                                  
                                  {c.description ? (
                                    <Text fontSize={13} color="$textMuted" mt={6} numberOfLines={2}>
                                      {c.description}
                                    </Text>
                                  ) : (
                                    <Text fontSize={13} color="$textMuted" mt={6} style={{ fontStyle: 'italic' }}>
                                      Nenhuma descrição fornecida.
                                    </Text>
                                  )}

                                  <XStack mt={12} ai="center" gap={10}>
                                    <Text fontSize={12} color="$textMuted">
                                      Atualizado: {formatDate(c.updated_at || c.created_at)}
                                    </Text>
                                    <Text fontSize={12} color="$textMuted">•</Text>
                                    <Text fontSize={12} color="$textMuted">
                                      {isPublished ? 'Publicado' : 'Rascunho'}
                                    </Text>
                                  </XStack>

                                  <YStack mt={16} gap={6}>
                                    <XStack ai="center" jc="space-between">
                                      <Text fontSize={11} color="$textMuted">
                                        {isPublished ? 'Pronto para consumo' : 'Estruturando conteúdo'}
                                      </Text>
                                      <Text fontSize={11} color="$textMuted">
                                        {readiness}%
                                      </Text>
                                    </XStack>
                                    <ProgressBar progress={readiness} height={6} />
                                  </YStack>
                                </YStack>
                              </Card>
                            </Link>
                            
                            <XStack jc="space-between" ai="center" mt={8} px={4}>
                              <Link href={`/configuracoes/${c.id}`} style={{ textDecoration: 'none' }}>
                                <XStack ai="center" gap={4} cursor="pointer">
                                  <Icon name="Settings" size={12} color="$primary" />
                                  <Text fontSize={12} color="$primary" fontWeight="500">Configurações</Text>
                                </XStack>
                              </Link>
                              
                              <Text
                                onPress={() => handleDelete(c.id)}
                                fontSize={12}
                                color="$danger"
                                style={{ cursor: 'pointer' }}
                              >
                                Excluir
                              </Text>
                            </XStack>
                          </YStack>
                        );
                      })}
                    </XStack>
                  </YStack>
                );
              })}
            </YStack>
          )}
        </main>

        {/* Create Modal */}
        {showCreateModal && (
          <XStack
            position="fixed"
            inset={0}
            ai="center"
            jc="center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
          >
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
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descreva brevemente os objetivos e tópicos abordados no curso..."
                    style={{
                      width: '100%',
                      border: 0,
                      outline: 0,
                      background: 'transparent',
                      resize: 'none',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      color: 'inherit',
                    }}
                  />
                </YStack>
              </YStack>

              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Imagem de Capa (Thumbnail)</Text>
                <YStack
                  position="relative"
                  height={110}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$border"
                  style={{
                    borderStyle: 'dashed',
                    backgroundImage: formThumbnailPreview ? `url(${formThumbnailPreview})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                  }}
                  ai="center"
                  jc="center"
                  overflow="hidden"
                  bg={formThumbnailPreview ? 'transparent' : '$background'}
                  onPress={() => document.getElementById('thumb-input-modal')?.click()}
                >
                  <input
                    id="thumb-input-modal"
                    type="file"
                    accept="image/jpeg,image/webp,image/png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 2 * 1024 * 1024) {
                          alert('Arquivo muito grande. Máximo: 2MB.');
                          return;
                        }
                        setFormThumbnail(f);
                        setFormThumbnailPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                  {!formThumbnailPreview && (
                    <XStack ai="center" gap={6}>
                      <Icon name="Image" size={16} color="$textMuted" />
                      <Text fontSize={12} color="$textMuted">Clique para selecionar</Text>
                    </XStack>
                  )}
                </YStack>
              </YStack>

              <XStack gap={12} jc="flex-end" mt={8}>
                <Button variant="ghost" onPress={() => setShowCreateModal(false)} px={16} py={10}>
                  <Text fontSize={14}>Cancelar</Text>
                </Button>
                <Button
                  onPress={handleCreate}
                  disabled={!formTitle.trim()}
                  px={16}
                  py={10}
                  style={{ background: BRAND_GRADIENT, opacity: formTitle.trim() ? 1 : 0.5 }}
                >
                  <Text fontSize={14} color="$white" fontWeight="500">Criar Curso</Text>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
