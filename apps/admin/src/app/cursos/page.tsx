'use client';

import React, { useState, useEffect } from 'react';
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
  color,
  lineHeightHeading,
  lineHeightCardTitle,
  FilterBar,
} from '@projeto/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '../../components/AdminHeader';
import { CourseService, StorageService, AuthService } from '@projeto/core';
import type { Course } from '@projeto/types';

// Gradiente padrão da marca do FLEXED Studio
const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;
// Gradiente verde → azul usado nas barras de progresso dos cursos
const PROGRESS_GRADIENT = `linear-gradient(90deg, ${color.cwSuccess}, ${color.cwGradientFrom})`;

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

  // Inject keyframe for drop indicator glow
  if (typeof document !== 'undefined' && !document.getElementById('drop-glow-keyframes')) {
    const style = document.createElement('style');
    style.id = 'drop-glow-keyframes';
    style.textContent = `
      @keyframes dropLineColor {
        0%   { background: linear-gradient(90deg, rgba(59,130,246,0.1), rgba(59,130,246,0.5), rgba(59,130,246,0.1)); box-shadow: 0 0 6px 1px rgba(59,130,246,0.2); opacity: 0.6; transform: scaleX(0.96); }
        25%  { background: linear-gradient(90deg, rgba(59,130,246,0.2), rgba(59,130,246,0.8), rgba(59,130,246,0.2)); box-shadow: 0 0 10px 3px rgba(59,130,246,0.5); opacity: 1;   transform: scaleX(1); }
        50%  { background: linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.5), rgba(16,185,129,0.1)); box-shadow: 0 0 6px 1px rgba(16,185,129,0.2); opacity: 0.6; transform: scaleX(0.96); }
        75%  { background: linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.8), rgba(16,185,129,0.2)); box-shadow: 0 0 10px 3px rgba(16,185,129,0.5); opacity: 1;   transform: scaleX(1); }
        100% { background: linear-gradient(90deg, rgba(59,130,246,0.1), rgba(59,130,246,0.5), rgba(59,130,246,0.1)); box-shadow: 0 0 6px 1px rgba(59,130,246,0.2); opacity: 0.6; transform: scaleX(0.96); }
      }
      @keyframes dropDotColor {
        0%   { background-color: #3B82F6; box-shadow: 0 0 4px 1px rgba(59,130,246,0.3); transform: scale(0.85); }
        25%  { background-color: #3B82F6; box-shadow: 0 0 10px 3px rgba(59,130,246,0.7); transform: scale(1.15); }
        50%  { background-color: #10B981; box-shadow: 0 0 4px 1px rgba(16,185,129,0.3); transform: scale(0.85); }
        75%  { background-color: #10B981; box-shadow: 0 0 10px 3px rgba(16,185,129,0.7); transform: scale(1.15); }
        100% { background-color: #3B82F6; box-shadow: 0 0 4px 1px rgba(59,130,246,0.3); transform: scale(0.85); }
      }
    `;
    document.head.appendChild(style);
  }
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'custom' | 'recent' | 'oldest' | 'name-az' | 'name-za'>('custom');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  // Modal de Criação de Cursos
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnail, setFormThumbnail] = useState<File | null>(null);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState<string | null>(null);

  // Modal de Ordenação para o Aluno
  const [showStudentOrderModal, setShowStudentOrderModal] = useState(false);
  const [studentOrderCourses, setStudentOrderCourses] = useState<Course[]>([]);
  const [isSavingStudentOrder, setIsSavingStudentOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

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

  // Abre o modal de ordenação para o aluno
  const openStudentOrderModal = async () => {
    try {
      const allCourses = await CourseService.getAllCourses();
      const sorted = [...allCourses].sort((a, b) => (a.student_order_index ?? 0) - (b.student_order_index ?? 0));
      setStudentOrderCourses(sorted);
      setShowStudentOrderModal(true);
    } catch (err) {
      console.error('Failed to load courses for student ordering:', err);
    }
  };

  // Salva a ordenação para o aluno
  const saveStudentOrder = async () => {
    try {
      setIsSavingStudentOrder(true);
      await CourseService.reorderCoursesForStudent(
        studentOrderCourses.map((c, i) => ({ id: c.id, student_order_index: i }))
      );
      setShowStudentOrderModal(false);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to save student order:', err);
    } finally {
      setIsSavingStudentOrder(false);
    }
  };

  // Drag-and-drop handlers para ordenação do aluno
  const onStudentDragStart = (e: React.DragEvent, courseId: string) => {
    setDraggedId(courseId);
    setDropIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', courseId);
  };

  const onStudentDragEnd = () => {
    setDraggedId(null);
    setDropIndex(null);
  };

  const onStudentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onStudentDragOverItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    const idx = studentOrderCourses.findIndex(c => c.id === targetId);
    setDropIndex(y < midPoint ? idx : idx + 1);
  };

  const onStudentDragLeaveItem = () => {
    setDropIndex(null);
  };

  const onStudentDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropIndex(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    const targetIdx = studentOrderCourses.findIndex(c => c.id === targetId);
    const insertIdx = y < midPoint ? targetIdx : targetIdx + 1;

    const items = [...studentOrderCourses];
    const dragIdx = items.findIndex(c => c.id === draggedId);
    const [removed] = items.splice(dragIdx, 1);
    const adjustedInsert = dragIdx < insertIdx ? insertIdx - 1 : insertIdx;
    items.splice(adjustedInsert, 0, removed);

    setStudentOrderCourses(items);
    setDraggedId(null);
    setDropIndex(null);
  };

  // Carrega perfil e cursos na inicialização
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await AuthService.getCurrentProfile();
        if (profile) setUserProfile({ full_name: profile.full_name ?? '', email: profile.email ?? '' });

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

  // Filtra cursos com base no status e na busca
  const statusFiltered = filter === 0 ? courses : filter === 1 ? courses.filter((c) => c.is_published) : courses.filter((c) => !c.is_published);
  const filteredCourses = statusFiltered.filter((course) => {
    if (!searchQuery.trim()) return true;
    return course.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Ordena os cursos conforme o critério selecionado
  const sortCourses = (a: Course, b: Course) => {
    switch (sortBy) {
      case 'custom':
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      case 'recent':
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      case 'oldest':
        return new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
      case 'name-az':
        return (a.title || '').localeCompare(b.title || '');
      case 'name-za':
        return (b.title || '').localeCompare(a.title || '');
      default:
        return 0;
    }
  };

  const sortedCourses = [...filteredCourses].sort(sortCourses);

  // Agrupa os cursos por categoria
  const groupedCourses: Record<string, Course[]> = {};
  sortedCourses.forEach((c) => {
    const cat = getCourseCategory(c);
    if (!groupedCourses[cat]) {
      groupedCourses[cat] = [];
    }
    groupedCourses[cat].push(c);
  });

  const categories = Object.keys(groupedCourses).sort();

  const filterLabel = filter === 0 ? null : filter === 1 ? 'Publicados' : 'Rascunhos';

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
        <AdminHeader userProfile={userProfile} onLogout={() => router.push('/logout')} />

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

          {/* Filtros e Ordenação */}
          <XStack gap={12} ai="center" flexWrap="wrap">
            <FilterBar
              filterOptions={[
                { value: '0', label: 'Todos' },
                { value: '1', label: 'Publicados' },
                { value: '2', label: 'Rascunhos' },
              ]}
              filterValue={String(filter)}
              onFilterChange={(value) => setFilter(Number(value))}
              sortOptions={[
                { value: 'custom', label: 'Ordem personalizada' },
                { value: 'recent', label: 'Mais recentes' },
                { value: 'oldest', label: 'Mais antigos' },
                { value: 'name-az', label: 'Nome A-Z' },
                { value: 'name-za', label: 'Nome Z-A' },
              ]}
              sortValue={sortBy}
              onSortChange={(value) => setSortBy(value as typeof sortBy)}
              resultCount={sortedCourses.length}
              resultLabel="cursos"
              filterLabel={filterLabel || undefined}
              onClearFilter={() => setFilter(0)}
            />
            <Button
              variant="secondary"
              px={12}
              py={8}
              ai="center"
              gap={6}
              onPress={openStudentOrderModal}
            >
              <Icon name="GripVertical" size={14} color="$textMuted" />
              <Text fontSize={13} color="$textMuted" fontWeight="500">Ordem para o aluno</Text>
            </Button>
          </XStack>

          {loading ? (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando cursos…</Text>
            </YStack>
          ) : sortedCourses.length === 0 ? (
            <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
              <Icon name="BookOpen" size={48} color="$textMuted" />
              <Text color="$textMuted" fontSize={16} fontWeight="600">Nenhum curso encontrado</Text>
              <Text color="$textMuted" fontSize={14}>Ajuste a busca ou filtro, ou clique em &quot;Novo curso&quot; para criar um.</Text>
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
                                borderColor={isPublished ? 'rgba(16, 185, 129, 0.35)' : '$border'}
                                style={
                                  isPublished
                                    ? {
                                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.04)',
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
                                    <ProgressBar progress={readiness} height={6} gradient={PROGRESS_GRADIENT} />
                                  </YStack>
                                </YStack>
                              </Card>
                            </Link>
                            
                            <XStack jc="space-between" ai="center" mt={8} px={4}>
                              <XStack ai="center" gap={6}>
                                <Link href={`/configuracoes/${c.id}`} style={{ textDecoration: 'none' }}>
                                  <XStack ai="center" gap={4} cursor="pointer">
                                    <Icon name="Settings" size={12} color="$primary" />
                                    <Text fontSize={12} color="$primary" fontWeight="500">Configurações</Text>
                                  </XStack>
                                </Link>
                              </XStack>
                              
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

        {/* Modal de Ordenação para o Aluno */}
        {showStudentOrderModal && (
          <XStack
            position="fixed"
            inset={0}
            ai="center"
            jc="center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
            onDragOver={onStudentDragOver}
          >
            <YStack bg="$card" br="$4" p={32} width="80%" gap={20} borderWidth={1} borderColor="$border" style={{ overflowX: 'hidden', maxHeight: '90vh', minHeight: '90vh' }}>
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={20} fontWeight="$6">Ordem para o aluno</Text>
                <XStack onPress={() => setShowStudentOrderModal(false)} cursor="pointer" p={4}>
                  <Icon name="X" size={20} color="$textMuted" />
                </XStack>
              </XStack>

              <Text fontSize={13} color="$textMuted">
                Defina a ordem que os alunos verão na tela &quot;Explorar Cursos&quot;.
              </Text>

              <YStack gap={6} pt={10} pb={4} flex={1} style={{ overflowY: 'auto', padding: '10px 15% 4px' }}>
                {studentOrderCourses.map((course, index) => {
                  const isDragging = course.id === draggedId;
                  const showDropLine = dropIndex === index;

                  return (
                    <YStack key={course.id} position="relative">
                      {showDropLine && (
                        <div style={{
                          position: 'absolute',
                          top: -6,
                          left: -20,
                          right: -20,
                          height: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}>
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            flexShrink: 0,
                            animation: 'dropDotColor 1.4s ease-in-out infinite',
                          }} />
                          <div style={{
                            flex: 1,
                            height: 2,
                            borderRadius: 999,
                            animation: 'dropLineColor 1.4s ease-in-out infinite',
                          }} />
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            flexShrink: 0,
                            animation: 'dropDotColor 1.4s ease-in-out infinite',
                          }} />
                        </div>
                      )}
                      <div
                        draggable
                        onDragStart={(e) => onStudentDragStart(e, course.id)}
                        onDragOver={(e) => onStudentDragOverItem(e, course.id)}
                        onDragLeave={onStudentDragLeaveItem}
                        onDrop={(e) => onStudentDrop(e, course.id)}
                        onDragEnd={onStudentDragEnd}
                        style={{
                          cursor: isDragging ? 'grabbing' : 'grab',
                          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 200ms ease, opacity 200ms ease',
                          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: isDragging ? '0 8px 25px rgba(0,0,0,0.15), 0 0 0 0.5px #3B82F6' : 'none',
                          borderRadius: 8,
                        }}
                      >
                        <XStack
                          ai="center"
                          gap={10}
                          p={10}
                          br="$3"
                          borderWidth={1}
                          borderColor={isDragging ? '#3B82F6' : '$border'}
                          bg={isDragging ? '$background' : '$card'}
                          opacity={isDragging ? 0.9 : 1}
                          style={{ transition: isDragging ? 'none' : 'border-color 200ms ease, background-color 200ms ease, opacity 200ms ease' }}
                        >
                          <XStack cursor="grab" flexShrink={0}>
                            <Icon name="GripVertical" size={16} color="$textMuted" />
                          </XStack>
                          <Text flex={1} fontSize={14} numberOfLines={1}>
                            {index + 1}. {course.title}
                          </Text>
                          <XStack ai="center" gap={2} flexShrink={0}>
                            <Button
                              variant="ghost"
                              px="$2"
                              py="$1"
                              br="$2"
                              disabled={index === 0}
                              opacity={index === 0 ? 0.3 : 1}
                              onPress={() => {
                                const items = [...studentOrderCourses];
                                [items[index], items[index - 1]] = [items[index - 1], items[index]];
                                setStudentOrderCourses(items);
                              }}
                            >
                              <Icon name="ChevronUp" size={14} color="$text" />
                            </Button>
                            <Button
                              variant="ghost"
                              px="$2"
                              py="$1"
                              br="$2"
                              disabled={index === studentOrderCourses.length - 1}
                              opacity={index === studentOrderCourses.length - 1 ? 0.3 : 1}
                              onPress={() => {
                                const items = [...studentOrderCourses];
                                [items[index], items[index + 1]] = [items[index + 1], items[index]];
                                setStudentOrderCourses(items);
                              }}
                            >
                              <Icon name="ChevronDown" size={14} color="$text" />
                            </Button>
                          </XStack>
                        </XStack>
                      </div>
                    </YStack>
                  );
                })}
                {dropIndex === studentOrderCourses.length && (
                  <div style={{
                    position: 'relative',
                    height: 4,
                    margin: '0 -20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      flexShrink: 0,
                      animation: 'dropDotColor 1.4s ease-in-out infinite',
                    }} />
                    <div style={{
                      flex: 1,
                      height: 2,
                      borderRadius: 999,
                      animation: 'dropLineColor 1.4s ease-in-out infinite',
                    }} />
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      flexShrink: 0,
                      animation: 'dropDotColor 1.4s ease-in-out infinite',
                    }} />
                  </div>
                )}
              </YStack>

              <XStack gap={12} jc="flex-end" mt={8}>
                <Button variant="ghost" onPress={() => setShowStudentOrderModal(false)} px={16} py={10}>
                  <Text fontSize={14}>Cancelar</Text>
                </Button>
                <Button
                  onPress={saveStudentOrder}
                  disabled={isSavingStudentOrder}
                  px={16}
                  py={10}
                  style={{ background: BRAND_GRADIENT, opacity: isSavingStudentOrder ? 0.5 : 1 }}
                >
                  <Text fontSize={14} color="$white" fontWeight="500">
                    {isSavingStudentOrder ? 'Guardando...' : 'Guardar'}
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
