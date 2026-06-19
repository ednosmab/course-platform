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
} from '@projeto/ui';
import { FilterBar } from '@projeto/ui';
import { AdminHeader } from '../../components/AdminHeader';
import { StudentService, AuthService } from '@projeto/core';
import type { Profile } from '@projeto/types';

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
        if (!cancelled) setUserProfile(profile);

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
        role: formData.role,
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

  const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
          {/* Hero Header */}
          <XStack alignItems="center" justifyContent="space-between" mb="$6">
            <YStack>
              <Text
                fontSize="$8"
                fontWeight="700"
                color="$text"
                style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Alunos
              </Text>
              <Text fontSize="$4" color="$textMuted" mt="$1">
                Gerencie os alunos da plataforma
              </Text>
            </YStack>

            <Button
              onPress={() => {
                setFormData({ email: '', full_name: '', role: 'student' });
                setShowCreateModal(true);
              }}
              style={{ background: BRAND_GRADIENT }}
            >
              <Icon name="Plus" size={16} color="$white" />
              <Text color="$white" ml="$2">Novo Aluno</Text>
            </Button>
          </XStack>

          {/* Search */}
          <XStack position="relative" ai="center" mb={16}>
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

          {/* Filters */}
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
            sortValue="name-az"
            onSortChange={() => {}}
            resultCount={filteredStudents.length}
            resultLabel="alunos"
            showResultCount={false}
            removeBottomMargin
          />

          {/* Content */}
          {loading ? (
            <YStack alignItems="center" justifyContent="center" py="$10">
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" mt="$4">Carregando alunos...</Text>
            </YStack>
          ) : filteredStudents.length === 0 ? (
            <Card variant="outlined" py="$10" alignItems="center">
              <Icon name="Users" size={48} color="$textMuted" />
              <Text color="$textMuted" mt="$4" fontSize="$4">
                {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </Text>
            </Card>
          ) : (
            <YStack gap="$3">
              {filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  variant="elevated"
                  pressStyle={{ opacity: 0.9 }}
                  onPress={() => router.push(`/alunos/${student.id}`)}
                >
                  <XStack alignItems="center" p="$4" gap="$4">
                    {/* Avatar */}
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={24}
                      bg={BRAND_GRADIENT}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="$white" fontSize="$4" fontWeight="600">
                        {student.full_name?.charAt(0)?.toUpperCase() ?? student.email.charAt(0).toUpperCase()}
                      </Text>
                    </YStack>

                    {/* Info */}
                    <YStack flex={1} gap="$1">
                      <Text fontSize="$4" fontWeight="600" color="$text">
                        {student.full_name ?? 'Sem nome'}
                      </Text>
                      <Text fontSize="$3" color="$textMuted">
                        {student.email}
                      </Text>
                    </YStack>

                    {/* Enrollment count */}
                    <YStack alignItems="center" mr="$4">
                      <Text fontSize="$5" fontWeight="700" color="$primary">
                        {student.enrollment_count}
                      </Text>
                      <Text fontSize="$2" color="$textMuted">
                        matrículas
                      </Text>
                    </YStack>

                    {/* Actions */}
                    <XStack gap="$2">
                      <Button
                        size="small"
                        variant="ghost"
                        onPress={(e) => {
                          e.stopPropagation();
                          openEditModal(student);
                        }}
                      >
                        <Icon name="Pencil" size={16} color="$textMuted" />
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(student.id);
                        }}
                      >
                        <Icon name="Trash2" size={16} color="$danger" />
                      </Button>
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
            bg="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Card variant="elevated" p="$6" width={480} mx="$4">
              <YStack gap="$4">
                <Text fontSize="$6" fontWeight="700" color="$text">
                  {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                </Text>

                {formError && (
                  <Text color="$danger" fontSize="$3">{formError}</Text>
                )}

                <YStack gap="$2">
                  <Text fontSize="$3" color="$textMuted">Nome completo</Text>
                  <Input
                    value={formData.full_name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                    placeholder="Nome do aluno"
                  />
                </YStack>

                <YStack gap="$2">
                  <Text fontSize="$3" color="$textMuted">Email</Text>
                  <Input
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    editable={!editingStudent}
                  />
                </YStack>

                <XStack gap="$3" mt="$4">
                  <Button
                    flex={1}
                    variant="secondary"
                    onPress={() => {
                      setShowCreateModal(false);
                      setEditingStudent(null);
                      setFormError('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    flex={1}
                    onPress={editingStudent ? handleEdit : handleCreate}
                    disabled={submitting}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {submitting ? (
                      <Spinner size="small" color="$white" />
                    ) : (
                      <Text color="$white">{editingStudent ? 'Salvar' : 'Criar'}</Text>
                    )}
                  </Button>
                </XStack>
              </YStack>
            </Card>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
