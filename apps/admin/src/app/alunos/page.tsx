'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  YStack,
  XStack,
  Text,
  Icon,
  Theme,
  Button,
  Card,
  Spinner,
  Input,
  color,
  FilterBar,
} from '@projeto/ui';
import { AdminHeader } from '../../components/AdminHeader';
import { StudentService, AuthService } from '@projeto/core';
import type { Profile } from '@projeto/types';

const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

/**
 * @description Admin page for managing students. Lists all students with search,
 * filtering, and CRUD operations. Follows the same pattern as the courses page.
 */
export default function AlunosPage() {
  const router = useRouter();
  const [students, setStudents] = useState<(Profile & { enrollment_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-az' | 'name-za' | 'recent'>('name-az');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'student' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const profile = await AuthService.getCurrentProfile();
        if (!cancelled) setUserProfile({
          full_name: profile?.full_name ?? 'Usuário',
          email: profile?.email ?? '',
        });

        const studentsData = await StudentService.listStudents();
        if (!cancelled) setStudents(studentsData);
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = search === '' ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.enrollment_count > 0) ||
      (statusFilter === 'inactive' && s.enrollment_count === 0);

    return matchesSearch && matchesStatus;
  });

  const sortStudents = (a: Profile & { enrollment_count: number }, b: Profile & { enrollment_count: number }) => {
    switch (sortBy) {
      case 'name-az':
        return (a.full_name || '').localeCompare(b.full_name || '');
      case 'name-za':
        return (b.full_name || '').localeCompare(a.full_name || '');
      case 'recent':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return 0;
    }
  };

  const sortedStudents = [...filteredStudents].sort(sortStudents);

  const handleCreate = async () => {
    setFormError('');
    setSubmitting(true);

    try {
      if (!formData.email || !formData.full_name) {
        setFormError('Email e nome são obrigatórios');
        return;
      }

      const newStudent = await StudentService.createStudent(formData);
      setStudents(prev => [{ ...newStudent, enrollment_count: 0 }, ...prev]);
      setShowCreateModal(false);
      setFormData({ email: '', full_name: '', role: 'student' });
    } catch (err) {
      setFormError('Erro ao criar aluno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingStudent) return;
    setFormError('');
    setSubmitting(true);

    try {
      await StudentService.updateStudent(editingStudent.id, {
        full_name: formData.full_name,
        role: formData.role as 'student' | 'teacher' | 'admin',
      });

      setStudents(prev => prev.map(s =>
        s.id === editingStudent.id
          ? { ...s, full_name: formData.full_name, role: formData.role as 'student' | 'teacher' | 'admin' }
          : s
      ));
      setEditingStudent(null);
      setFormData({ email: '', full_name: '', role: 'student' });
    } catch (err) {
      setFormError('Erro ao atualizar aluno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      await StudentService.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const openEditModal = (student: Profile) => {
    setEditingStudent(student);
    setFormData({
      email: student.email,
      full_name: student.full_name ?? '',
      role: student.role,
    });
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const filterLabel = statusFilter === 'all' ? null : statusFilter === 'active' ? 'Com matrícula' : 'Sem matrícula';

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Hero Header */}
          <YStack mb={32} gap={16}>
            <XStack ai="center" jc="space-between" flexWrap="wrap" gap={16}>
              <YStack gap={4}>
                <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
                  Alunos
                </Text>
                <Text fontSize={15} color="$textMuted">
                  Gerencie os alunos da plataforma
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
                    placeholder="Buscar por nome ou email..."
                    w={280}
                    h={36}
                    br="$3"
                    borderColor="$border"
                    backgroundColor="$background"
                    paddingLeft={40}
                    fontSize="$3"
                    color="$text"
                    value={search}
                    onChangeText={setSearch}
                  />
                </XStack>

                {/* Botão Novo Aluno */}
                <Button
                  onPress={() => {
                    setFormData({ email: '', full_name: '', role: 'student' });
                    setShowCreateModal(true);
                  }}
                  px={16}
                  py={10}
                  ai="center"
                  gap={6}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon name="Plus" size={16} color="$white" />
                  <Text fontSize={14} color="$white" fontWeight="500">Novo Aluno</Text>
                </Button>
              </XStack>
            </XStack>
          </YStack>

          {/* Filtros e Ordenação */}
          <XStack gap={12} ai="center" flexWrap="wrap" mb={16}>
            <FilterBar
              filterOptions={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Com matrícula' },
                { value: 'inactive', label: 'Sem matrícula' },
              ]}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              sortOptions={[
                { value: 'name-az', label: 'Nome A-Z' },
                { value: 'name-za', label: 'Nome Z-A' },
                { value: 'recent', label: 'Mais recentes' },
              ]}
              sortValue={sortBy}
              onSortChange={(value) => setSortBy(value as typeof sortBy)}
              resultCount={sortedStudents.length}
              resultLabel="alunos"
              filterLabel={filterLabel || undefined}
              onClearFilter={() => setStatusFilter('all')}
              showResultCount={false}
              removeBottomMargin
            />
          </XStack>

          {/* Content */}
          {loading ? (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando alunos…</Text>
            </YStack>
          ) : sortedStudents.length === 0 ? (
            <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
              <Icon name="Users" size={48} color="$textMuted" />
              <Text color="$textMuted" fontSize={16} fontWeight="600">
                {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </Text>
              <Text color="$textMuted" fontSize={14}>
                {search ? 'Ajuste a busca ou filtro.' : 'Clique em "Novo Aluno" para adicionar.'}
              </Text>
            </YStack>
          ) : (
            <YStack gap={12}>
              {sortedStudents.map((student) => (
                <Card
                  key={student.id}
                  p={0}
                  br="$4"
                  cursor="pointer"
                  interactive
                  borderWidth={1}
                  borderColor="$border"
                  pressStyle={{ opacity: 0.9 }}
                  onPress={() => router.push(`/alunos/${student.id}`)}
                >
                  <XStack ai="center" p={20} gap={16}>
                    {/* Avatar */}
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={24}
                      bg={BRAND_GRADIENT}
                      ai="center"
                      jc="center"
                      flexShrink={0}
                    >
                      <Text color="$white" fontSize={16} fontWeight="600">
                        {student.full_name?.charAt(0)?.toUpperCase() ?? student.email.charAt(0).toUpperCase()}
                      </Text>
                    </YStack>

                    {/* Info */}
                    <YStack flex={1} gap={4}>
                      <Text fontFamily="$display" fontSize={16} fontWeight="$6" numberOfLines={1}>
                        {student.full_name ?? 'Sem nome'}
                      </Text>
                      <Text fontSize={13} color="$textMuted" numberOfLines={1}>
                        {student.email}
                      </Text>
                    </YStack>

                    {/* Enrollment count */}
                    <YStack ai="center" mr={16}>
                      <Text fontSize={20} fontWeight="700" color="$primary">
                        {student.enrollment_count}
                      </Text>
                      <Text fontSize={11} color="$textMuted">
                        matrículas
                      </Text>
                    </YStack>

                    {/* Actions */}
                    <XStack gap={8}>
                      <XStack
                        p={8}
                        borderRadius={8}
                        cursor="pointer"
                        hoverStyle={{ backgroundColor: '$secondary' }}
                        onPress={(e) => {
                          e.stopPropagation();
                          openEditModal(student);
                        }}
                      >
                        <Icon name="Pencil" size={16} color="$textMuted" />
                      </XStack>
                      <XStack
                        p={8}
                        borderRadius={8}
                        cursor="pointer"
                        hoverStyle={{ backgroundColor: '$secondary' }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(student.id);
                        }}
                      >
                        <Icon name="Trash2" size={16} color="$danger" />
                      </XStack>
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </main>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingStudent) && (
          <XStack
            position="fixed"
            inset={0}
            ai="center"
            jc="center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
          >
            <YStack bg="$card" br="$4" p={32} width={480} gap={20} borderWidth={1} borderColor="$border">
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={20} fontWeight="$6">
                  {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                </Text>
                <XStack
                  onPress={() => {
                    setShowCreateModal(false);
                    setEditingStudent(null);
                    setFormError('');
                  }}
                  cursor="pointer"
                  p={4}
                >
                  <Icon name="X" size={20} color="$textMuted" />
                </XStack>
              </XStack>

              {formError && (
                <Text color="$danger" fontSize={13}>{formError}</Text>
              )}

              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Nome completo</Text>
                <Input
                  value={formData.full_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                  placeholder="Nome do aluno"
                  h={40}
                  br="$3"
                  borderColor="$border"
                  autoFocus
                />
              </YStack>

              <YStack gap={8}>
                <Text fontSize={14} fontWeight="500">Email</Text>
                <Input
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="email@exemplo.com"
                  h={40}
                  br="$3"
                  borderColor="$border"
                />
              </YStack>

              <XStack gap={12} jc="flex-end" mt={8}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    setShowCreateModal(false);
                    setEditingStudent(null);
                    setFormError('');
                  }}
                  px={16}
                  py={10}
                >
                  <Text fontSize={14}>Cancelar</Text>
                </Button>
                <Button
                  onPress={editingStudent ? handleEdit : handleCreate}
                  disabled={submitting}
                  px={16}
                  py={10}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <XStack ai="center" gap={6}>
                    {submitting ? (
                      <Spinner size="small" color="$white" />
                    ) : (
                      <Icon name={editingStudent ? 'Save' : 'Plus'} size={14} color="$white" />
                    )}
                    <Text fontSize={14} color="$white" fontWeight="500">
                      {editingStudent ? 'Salvar' : 'Criar'}
                    </Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
