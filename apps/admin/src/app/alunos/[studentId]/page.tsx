'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  YStack,
  XStack,
  Text,
  Icon,
  Theme,
  Button,
  Card,
  Spinner,
  color,
} from '@projeto/ui';
import { AdminHeader } from '../../../components/AdminHeader';
import { StudentService, AuthService, CourseService } from '@projeto/core';
import type { Profile, Enrollment, Course, StudentProgress } from '@projeto/types';

/**
 * @description Student detail page showing profile, enrollments, and progress.
 * Accessible from the students list by clicking on a student card.
 */
export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<(StudentProgress & { course_title: string; lesson_title: string })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'progress'>('enrollments');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [profile, studentData, enrollmentsData, progressData, coursesData] = await Promise.all([
          AuthService.getCurrentProfile(),
          StudentService.getStudentById(studentId),
          StudentService.getEnrollmentsByStudent(studentId),
          StudentService.getStudentProgress(studentId),
          CourseService.getAllCourses(),
        ]);

        if (!cancelled) {
          setUserProfile({
            full_name: profile?.full_name ?? 'Usuário',
            email: profile?.email ?? '',
          });
          setStudent(studentData);
          setEnrollments(enrollmentsData);
          setProgress(progressData);
          setCourses(coursesData);
        }
      } catch (err) {
        console.error('Error loading student data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [studentId]);

  const handleAssignCourse = async () => {
    if (!selectedCourseId) return;
    setAssigning(true);

    try {
      await StudentService.assignToCourse(studentId, selectedCourseId);
      const updatedEnrollments = await StudentService.getEnrollmentsByStudent(studentId);
      setEnrollments(updatedEnrollments);
      setShowAssignModal(false);
      setSelectedCourseId('');
    } catch (err) {
      console.error('Error assigning course:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta matrícula?')) return;

    try {
      await StudentService.removeEnrollment(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err) {
      console.error('Error removing enrollment:', err);
    }
  };

  const handleUpdateStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      await StudentService.updateEnrollmentStatus(enrollmentId, newStatus);
      setEnrollments(prev => prev.map(e =>
        e.id === enrollmentId ? { ...e, status: newStatus as any } : e
      ));
    } catch (err) {
      console.error('Error updating enrollment:', err);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

  if (loading) {
    return (
      <Theme name="cloudWhite">
        <YStack bg="$background" minHeight="100vh">
          <AdminHeader userProfile={userProfile} onLogout={handleLogout} />
          <YStack alignItems="center" justifyContent="center" flex={1}>
            <Spinner size="large" color="$primary" />
            <Text color="$textMuted" mt="$4">Carregando dados do aluno...</Text>
          </YStack>
        </YStack>
      </Theme>
    );
  }

  if (!student) {
    return (
      <Theme name="cloudWhite">
        <YStack bg="$background" minHeight="100vh">
          <AdminHeader userProfile={userProfile} onLogout={handleLogout} />
          <YStack alignItems="center" justifyContent="center" flex={1}>
            <Text color="$textMuted">Aluno não encontrado</Text>
            <Button mt="$4" onPress={() => router.push('/alunos')}>
              <Text>Voltar</Text>
            </Button>
          </YStack>
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
          {/* Back button */}
          <Button
            variant="ghost"
            onPress={() => router.push('/alunos')}
            mb="$4"
          >
            <Icon name="ArrowLeft" size={16} color="$textMuted" />
            <Text color="$textMuted" ml="$2">Voltar para Alunos</Text>
          </Button>

          {/* Student Header */}
          <Card elevated p="$6" mb="$6">
            <XStack alignItems="center" gap="$4">
              <YStack
                width={72}
                height={72}
                borderRadius={36}
                bg={BRAND_GRADIENT}
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$white" fontSize="$8" fontWeight="600">
                  {student.full_name?.charAt(0)?.toUpperCase() ?? student.email.charAt(0).toUpperCase()}
                </Text>
              </YStack>

              <YStack flex={1} gap="$1">
                <Text fontSize="$7" fontWeight="700" color="$text">
                  {student.full_name ?? 'Sem nome'}
                </Text>
                <Text fontSize="$4" color="$textMuted">
                  {student.email}
                </Text>
                <Text fontSize="$3" color="$textMuted">
                  Membro desde {new Date(student.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </YStack>

              <Button
                onPress={() => setShowAssignModal(true)}
                style={{ background: BRAND_GRADIENT }}
              >
                <Icon name="Plus" size={16} color="$white" />
                <Text color="$white" ml="$2">Matricular</Text>
              </Button>
            </XStack>
          </Card>

          {/* Tabs */}
          <XStack gap="$2" mb="$6">
            <Button
              variant={activeTab === 'enrollments' ? 'primary' : 'ghost'}
              onPress={() => setActiveTab('enrollments')}
            >
              <Icon name="BookOpen" size={16} />
              <Text ml="$2">Matrículas ({enrollments.length})</Text>
            </Button>
            <Button
              variant={activeTab === 'progress' ? 'primary' : 'ghost'}
              onPress={() => setActiveTab('progress')}
            >
              <Icon name="BarChart" size={16} />
              <Text ml="$2">Progresso ({progress.length})</Text>
            </Button>
          </XStack>

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <YStack gap="$3">
              {enrollments.length === 0 ? (
                <Card variant="outlined" py="$8" alignItems="center">
                  <Icon name="BookOpen" size={48} color="$textMuted" />
                  <Text color="$textMuted" mt="$4">Nenhuma matrícula encontrada</Text>
                </Card>
              ) : (
                enrollments.map((enrollment) => {
                  const course = courses.find(c => c.id === enrollment.course_id);
                  return (
                    <Card key={enrollment.id} elevated p="$4">
                      <XStack alignItems="center" gap="$4">
                        <YStack flex={1} gap="$1">
                          <Text fontSize="$4" fontWeight="600" color="$text">
                            {course?.title ?? 'Curso não encontrado'}
                          </Text>
                          <Text fontSize="$3" color="$textMuted">
                            Matriculado em {new Date(enrollment.created_at).toLocaleDateString('pt-BR')}
                          </Text>
                        </YStack>

                        <YStack alignItems="center">
                          <Text
                            fontSize="$3"
                            fontWeight="600"
                            color={
                              enrollment.status === 'active' ? '$success' :
                              enrollment.status === 'expired' ? '$warning' : '$danger'
                            }
                          >
                            {enrollment.status === 'active' ? 'Ativa' :
                             enrollment.status === 'expired' ? 'Expirada' : 'Cancelada'}
                          </Text>
                        </YStack>

                        <XStack gap="$2">
                          {enrollment.status === 'active' && (
                            <Button
                              variant="ghost"
                              onPress={() => handleUpdateStatus(enrollment.id, 'canceled')}
                            >
                              <Icon name="XCircle" size={16} color="$danger" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onPress={() => handleRemoveEnrollment(enrollment.id)}
                          >
                            <Icon name="Trash2" size={16} color="$danger" />
                          </Button>
                        </XStack>
                      </XStack>
                    </Card>
                  );
                })
              )}
            </YStack>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <YStack gap="$3">
              {progress.length === 0 ? (
                <Card variant="outlined" py="$8" alignItems="center">
                  <Icon name="BarChart" size={48} color="$textMuted" />
                  <Text color="$textMuted" mt="$4">Nenhum progresso registrado</Text>
                </Card>
              ) : (
                progress.map((item) => (
                  <Card key={item.id} elevated p="$4">
                    <XStack alignItems="center" gap="$4">
                      <YStack flex={1} gap="$1">
                        <Text fontSize="$4" fontWeight="600" color="$text">
                          {item.lesson_title}
                        </Text>
                        <Text fontSize="$3" color="$textMuted">
                          {item.course_title}
                        </Text>
                      </YStack>

                      <YStack alignItems="flex-end" gap="$1">
                        <Text fontSize="$4" fontWeight="700" color="$primary">
                          {item.percentage_watched}%
                        </Text>
                        <Text fontSize="$2" color="$textMuted">
                          {item.completed ? 'Concluída' : 'Em andamento'}
                        </Text>
                      </YStack>
                    </XStack>
                  </Card>
                ))
              )}
            </YStack>
          )}
        </main>

        {/* Assign Course Modal */}
        {showAssignModal && (
          <XStack
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Card elevated p="$6" width={480} mx="$4">
              <YStack gap="$4">
                <Text fontSize="$6" fontWeight="700" color="$text">
                  Matricular em Curso
                </Text>

                <YStack gap="$2">
                  <Text fontSize="$3" color="$textMuted">Selecionar curso</Text>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      width: '100%',
                    }}
                  >
                    <option value="">Selecione um curso...</option>
                    {courses.filter(c => c.is_published).map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </YStack>

                <XStack gap="$3" mt="$4">
                  <Button
                    flex={1}
                    variant="secondary"
                    onPress={() => {
                      setShowAssignModal(false);
                      setSelectedCourseId('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    flex={1}
                    onPress={handleAssignCourse}
                    disabled={!selectedCourseId || assigning}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {assigning ? (
                      <Spinner size="small" color="$white" />
                    ) : (
                      <Text color="$white">Matricular</Text>
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
