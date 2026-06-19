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
  color,
} from '@projeto/ui';
import { AdminHeader } from '../../components/AdminHeader';
import { ReportService, AuthService } from '@projeto/core';
import type { CourseReport, EnrollmentReport, CertificateReport, ProgressReport } from '@projeto/types';

const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

function KPICard({ title, value, subtitle, icon }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}) {
  return (
    <Card elevated p={16} flex={1} borderWidth={1} borderColor="$border" borderRadius={12}>
      <XStack ai="center" gap={12}>
        <YStack
          width={48}
          height={48}
          borderRadius={12}
          bg={BRAND_GRADIENT}
          ai="center"
          jc="center"
        >
          <Icon name={icon as any} size={24} color="$white" />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontSize={13} color="$textMuted">{title}</Text>
          <Text fontSize={24} fontWeight="700" color="$text">{value}</Text>
          {subtitle && <Text fontSize={12} color="$textMuted">{subtitle}</Text>}
        </YStack>
      </XStack>
    </Card>
  );
}

/**
 * @description Admin dashboard for reports and analytics. Displays KPIs for
 * progress, enrollments, course rankings, and certificate issuance.
 */
export default function RelatoriosPage() {
  const router = useRouter();

  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);
  const [enrollmentReport, setEnrollmentReport] = useState<EnrollmentReport | null>(null);
  const [certificateReport, setCertificateReport] = useState<CertificateReport | null>(null);
  const [courseReports, setCourseReports] = useState<CourseReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          AuthService.getCurrentProfile(),
          ReportService.getProgressReport(),
          ReportService.getEnrollmentReports(period),
          ReportService.getCertificateReports(),
          ReportService.getTopCourses(10),
        ]);

        if (!cancelled) {
          if (results[0].status === 'fulfilled') {
            const p = results[0].value;
            setUserProfile({ full_name: p?.full_name ?? 'Usuário', email: p?.email ?? '' });
          }
          if (results[1].status === 'fulfilled') setProgressReport(results[1].value);
          if (results[2].status === 'fulfilled') setEnrollmentReport(results[2].value);
          if (results[3].status === 'fulfilled') setCertificateReport(results[3].value);
          if (results[4].status === 'fulfilled') setCourseReports(results[4].value);

          // Log any failures
          results.forEach((r, i) => {
            if (r.status === 'rejected') {
              console.error(`Report ${i} failed:`, r.reason instanceof Error ? r.reason.message : String(r.reason));
            }
          });
        }
      } catch (err) {
        console.error('Error loading reports:', err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [period]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
          {/* Hero Header */}
          <YStack mb={32} gap={16}>
            <XStack ai="center" jc="space-between" flexWrap="wrap" gap={16}>
              <YStack gap={4}>
                <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
                  Relatórios
                </Text>
                <Text fontSize={15} color="$textMuted">
                  Métricas e analytics da plataforma
                </Text>
              </YStack>

              {/* Period selector */}
              <XStack gap={8}>
                {['7d', '30d', '90d', 'all'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'primary' : 'ghost'}
                    px={12}
                    py={6}
                    onPress={() => setPeriod(p)}
                  >
                    <Text fontSize={13} fontWeight={period === p ? '600' : '400'}>
                      {p === 'all' ? 'Tudo' : p}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </XStack>
          </YStack>

          {loading ? (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando relatórios…</Text>
            </YStack>
          ) : (
            <YStack gap={24}>
              {/* KPIs Row */}
              <XStack gap={16} flexWrap="wrap">
                <KPICard
                  title="Total de Alunos"
                  value={enrollmentReport?.total_students ?? 0}
                  icon="Users"
                />
                <KPICard
                  title="Progresso Médio"
                  value={`${progressReport?.avg_progress ?? 0}%`}
                  subtitle="Assistido por aula"
                  icon="TrendingUp"
                />
                <KPICard
                  title="Taxa de Conclusão"
                  value={`${progressReport?.completion_rate ?? 0}%`}
                  subtitle="Aulas concluídas"
                  icon="CheckCircle"
                />
                <KPICard
                  title="Certificados Emitidos"
                  value={certificateReport?.total ?? 0}
                  icon="Award"
                />
              </XStack>

              {/* Matrículas Section */}
              <Card elevated p={24} borderWidth={1} borderColor="$border" borderRadius={12}>
                <Text fontSize={20} fontWeight="700" color="$text" mb={16}>
                  Matrículas
                </Text>

                {/* Warning: students without enrollments */}
                {(enrollmentReport?.total_students ?? 0) > 0 && (enrollmentReport?.total ?? 0) === 0 && (
                  <Card p={16} mb={16} borderRadius={8} borderWidth={1} borderColor="$warning">
                    <XStack ai="center" gap={8}>
                      <Icon name="AlertTriangle" size={18} color="$warning" />
                      <Text fontSize={13} color="$warning" fontWeight="500">
                        {enrollmentReport?.total_students} aluno(s) cadastrado(s) sem matrícula ativa
                      </Text>
                    </XStack>
                  </Card>
                )}

                <XStack gap={24}>
                  {/* Status breakdown */}
                  <YStack flex={1} gap={12}>
                    <XStack jc="space-between">
                      <Text fontSize={14} color="$textMuted">Ativas</Text>
                      <Text fontSize={14} fontWeight="600" color="$success">
                        {enrollmentReport?.active ?? 0}
                      </Text>
                    </XStack>
                    <XStack jc="space-between">
                      <Text fontSize={14} color="$textMuted">Expiradas</Text>
                      <Text fontSize={14} fontWeight="600" color="$warning">
                        {enrollmentReport?.expired ?? 0}
                      </Text>
                    </XStack>
                    <XStack jc="space-between">
                      <Text fontSize={14} color="$textMuted">Canceladas</Text>
                      <Text fontSize={14} fontWeight="600" color="$danger">
                        {enrollmentReport?.canceled ?? 0}
                      </Text>
                    </XStack>
                    <XStack pt={12} borderTopWidth={1} borderColor="$border" jc="space-between">
                      <Text fontSize={14} fontWeight="600" color="$text">Total</Text>
                      <Text fontSize={14} fontWeight="700" color="$text">
                        {enrollmentReport?.total ?? 0}
                      </Text>
                    </XStack>
                  </YStack>

                  {/* By course */}
                  <YStack flex={2} gap={8}>
                    <Text fontSize={14} fontWeight="600" color="$text" mb={8}>
                      Por Curso
                    </Text>
                    {(enrollmentReport?.by_course ?? []).slice(0, 5).map((item) => (
                      <XStack key={item.course_id} ai="center" gap={12}>
                        <YStack flex={1}>
                          <Text fontSize={13} color="$text" numberOfLines={1}>
                            {item.course_title}
                          </Text>
                        </YStack>
                        <YStack width={100} height={8} bg="$border" borderRadius={4} overflow="hidden">
                          <YStack
                            height={8}
                            bg={BRAND_GRADIENT}
                            width={`${Math.min((item.count / (enrollmentReport?.total ?? 1)) * 100, 100)}%`}
                            borderRadius={4}
                          />
                        </YStack>
                        <Text fontSize={13} fontWeight="600" color="$text" width={40} ta="right">
                          {item.count}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </XStack>
              </Card>

              {/* Ranking de Cursos */}
              <Card elevated p={24} borderWidth={1} borderColor="$border" borderRadius={12}>
                <Text fontSize={20} fontWeight="700" color="$text" mb={16}>
                  Ranking de Cursos
                </Text>

                <YStack gap={12}>
                  {courseReports.length === 0 ? (
                    <Text color="$textMuted" ta="center" py={16}>
                      Nenhum dado disponível
                    </Text>
                  ) : (
                    courseReports.map((course, index) => (
                      <XStack key={course.course_id} ai="center" gap={12}>
                        <YStack
                          width={32}
                          height={32}
                          borderRadius={16}
                          bg={index < 3 ? BRAND_GRADIENT : '$border'}
                          ai="center"
                          jc="center"
                        >
                          <Text
                            fontSize={13}
                            fontWeight="700"
                            color={index < 3 ? '$white' : '$textMuted'}
                          >
                            {index + 1}
                          </Text>
                        </YStack>

                        <YStack flex={1} gap={4}>
                          <Text fontSize={14} fontWeight="600" color="$text">
                            {course.course_title}
                          </Text>
                          <Text fontSize={13} color="$textMuted">
                            {course.enrollment_count} matrículas • {course.completion_rate}% conclusão
                          </Text>
                        </YStack>

                        <YStack ai="flex-end">
                          <Text fontSize={14} fontWeight="700" color="$primary">
                            {course.avg_progress}%
                          </Text>
                          <Text fontSize={12} color="$textMuted">progresso médio</Text>
                        </YStack>
                      </XStack>
                    ))
                  )}
                </YStack>
              </Card>

              {/* Certificados */}
              <Card elevated p="$6">
                <Text fontSize="$6" fontWeight="700" color="$text" mb="$4">
                  Certificados Emitidos
                </Text>

                <XStack gap="$6">
                  {/* By course */}
                  <YStack flex={1} gap="$2">
                    <Text fontSize="$4" fontWeight="600" color="$text" mb="$2">
                      Por Curso
                    </Text>
                    {(certificateReport?.by_course ?? []).slice(0, 5).map((item) => (
                      <XStack key={item.course_id} justifyContent="space-between" alignItems="center">
                        <Text fontSize="$3" color="$text" numberOfLines={1} flex={1}>
                          {item.course_title}
                        </Text>
                        <Text fontSize="$3" fontWeight="600" color="$text">
                          {item.count}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>

                  {/* Timeline */}
                  <YStack flex={2} gap="$2">
                    <Text fontSize="$4" fontWeight="600" color="$text" mb="$2">
                      Últimos 30 Dias
                    </Text>
                    <XStack gap="$1" alignItems="flex-end" height={80}>
                      {(certificateReport?.timeline ?? []).slice(-30).map((item, index) => {
                        const maxCount = Math.max(...(certificateReport?.timeline ?? []).map(t => t.count), 1);
                        const height = (item.count / maxCount) * 100;
                        return (
                          <YStack
                            key={item.date}
                            flex={1}
                            bg={BRAND_GRADIENT}
                            height={Math.max(height, 4)}
                            borderRadius={2}
                            opacity={0.8}
                          />
                        );
                      })}
                    </XStack>
                  </YStack>
                </XStack>
              </Card>

              {/* Top Aulas */}
              <Card elevated p="$6">
                <Text fontSize="$6" fontWeight="700" color="$text" mb="$4">
                  Aulas Mais Assistidas
                </Text>

                <YStack gap="$3">
                  {(progressReport?.top_lessons ?? []).slice(0, 10).map((lesson, index) => (
                    <XStack key={lesson.lesson_id} alignItems="center" gap="$3">
                      <YStack
                        width={24}
                        alignItems="center"
                      >
                        <Text fontSize="$3" fontWeight="600" color="$textMuted">
                          {index + 1}
                        </Text>
                      </YStack>

                      <YStack flex={1} gap="$1">
                        <Text fontSize="$4" color="$text">
                          {lesson.lesson_title}
                        </Text>
                      </YStack>

                      <Text fontSize="$4" fontWeight="600" color="$primary">
                        {lesson.view_count} assistidas
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </Card>
            </YStack>
          )}
        </main>
      </YStack>
    </Theme>
  );
}
