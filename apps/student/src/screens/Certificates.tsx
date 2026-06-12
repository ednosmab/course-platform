/**
 * Certificates screen - Conquistas do aluno.
 *
 * Displays earned certificates in a grid of compact cards (200x141px A4 ratio).
 * Includes StudentHeader for navigation, category filters, and a detail modal.
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, Spinner, Input, Dialog, CertificateMiniature } from '@projeto/ui';
import { CertificateService, AuthService } from '@projeto/core';
import { Certificate, Course } from '@projeto/types';
import { StudentHeader } from '../components/StudentHeader';
import { CertificateDetailCard, CertificateWithCourse } from '../components/CertificateDetailCard';
import { downloadCertificatePdf, openCertificateValidation, shareCertificate } from '../services/certificate-actions';

type CertificatesProps = {
  onNavigateToDashboard: () => void;
  onNavigateToCourses: () => void;
  onNavigateToExplore: () => void;
  onLogout: () => void;
};

const categories = ['Todos', 'Vendas', 'Soft skills', 'Liderança', 'Cultura'];

const gradients = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #0ea5e9, #22d3ee)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
];

export function Certificates({
  onNavigateToDashboard,
  onNavigateToCourses,
  onNavigateToExplore,
  onLogout,
}: CertificatesProps) {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithCourse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await AuthService.getCurrentProfile();
      if (profile) {
        setUserProfile({
          full_name: profile.full_name || '',
          email: profile.email || '',
        });
      }

      if (profile?.id) {
        await CertificateService.recheckAndIssueAll(profile.id);
      }

      const certs = await CertificateService.getUserCertificates(profile?.id || '');

      const certsWithCourse: CertificateWithCourse[] = await Promise.all(
        certs.map(async (cert, idx) => {
          let course: Course | undefined;
          if (cert.course_id) {
            try {
              course = await CertificateService.getCourseData(cert.course_id);
            } catch {
              // ignore
            }
          }

          // Extract certificate_blocks and metadata
          const rawBlocks = (course as any)?.certificate_blocks || [];
          const meta = rawBlocks.find((b: any) => b.type === '__meta__');
          const certificateBlocks = rawBlocks.filter((b: any) => b.type !== '__meta__');

          return {
            ...cert,
            course,
            gradient: gradients[idx % gradients.length],
            category: course?.title?.includes('Vendas') ? 'Vendas' :
                      course?.title?.includes('Liderança') ? 'Liderança' :
                      course?.title?.includes('Comunicação') ? 'Soft skills' : 'Cultura',
            certificate_blocks: certificateBlocks,
            designWidth: meta?.designWidth || 1100,
            designHeight: meta?.designHeight || 778,
            isDoubleSided: meta?.isDoubleSided || false,
          };
        })
      );

      setCertificates(certsWithCourse);

    } catch (err: any) {
      console.error('Failed to load certificates:', err);
      setError(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabAction = (action: string) => {
    switch (action) {
      case 'dashboard':    onNavigateToDashboard(); break;
      case 'courses':      onNavigateToCourses(); break;
      case 'explore':      onNavigateToExplore(); break;
      case 'certificates': break; // already here
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchCat = filter === 'Todos' || cert.category === filter;
    const matchQuery = !query ||
      cert.course?.title?.toLowerCase().includes(query.toLowerCase()) ||
      false;
    return matchCat && matchQuery;
  });

  const totalHours = certificates.reduce((acc) => {
    return acc + Math.floor(Math.random() * 20 + 5);
  }, 0);

  const totalCategories = new Set(certificates.map(c => c.category)).size;

  if (error) {
    return (
      <YStack flex={1} bg="$background">
        <StudentHeader
          userProfile={userProfile}
          onLogout={onLogout}
          onTabAction={handleTabAction}
          activeTab="certificates"
        />
        <YStack flex={1} jc="center" ai="center" p="$6">
          <Icon name="AlertCircle" size={48} color="$danger" />
          <Text color="$danger" fontSize={16} fontWeight="700" mt="$4" textAlign="center">
            Erro ao carregar certificados
          </Text>
          <Text color="$gray4" fontSize={12} mt="$2" textAlign="center" lineHeight={18}>
            {error}
          </Text>
          <Button variant="secondary" mt="$6" onPress={loadData}>
            Tentar Novamente
          </Button>
        </YStack>
      </YStack>
    );
  }

  if (loading) {
    return (
      <YStack flex={1} bg="$background">
        <StudentHeader
          userProfile={userProfile}
          onLogout={onLogout}
          onTabAction={handleTabAction}
          activeTab="certificates"
        />
        <YStack flex={1} jc="center" ai="center">
          <Spinner size="large" color="$primary" />
          <Text color="$gray4" mt="$4" fontSize={13} fontWeight="600">
            Carregando certificados...
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg="$background">
      {/* StudentHeader - obrigatório em todas as telas do student */}
      <StudentHeader
        userProfile={userProfile}
        onLogout={onLogout}
        onTabAction={handleTabAction}
        activeTab="certificates"
      />

      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 32 }}>
        <YStack maxWidth={1400} w="100%" alignSelf="center" gap="$6">
          {/* Hero Section */}
          <Card p={0} overflow="hidden" br="$4">
            <YStack p="$5" gap="$4">
              <XStack ai="center" gap="$2">
                <YStack px="$2" py="$1" br="$4" bg="$primary">
                  <Text fontSize={11} fontWeight="700" color="$white">
                    Parabéns, {userProfile?.full_name?.split(' ')[0] || 'estudante'}
                  </Text>
                </YStack>
              </XStack>

              <Text variant="h2" fontWeight="bold">
                {certificates.length} certificados conquistados
              </Text>

              <Text variant="caption" color="$textMuted">
                Sua jornada de aprendizado em um só lugar. Baixe, compartilhe ou
                valide a autenticidade de cada certificado.
              </Text>

              <XStack gap="$3" mt="$2" flexWrap="wrap">
                <YStack flex={1} minWidth={100} p="$3" bg="$secondary" br="$3" ai="center">
                  <Text variant="h2" fontWeight="bold">{certificates.length}</Text>
                  <Text fontSize={10} color="$textMuted" textTransform="uppercase" fontWeight="700">
                    Certificados
                  </Text>
                </YStack>
                <YStack flex={1} minWidth={100} p="$3" bg="$secondary" br="$3" ai="center">
                  <Text variant="h2" fontWeight="bold">{totalHours}h</Text>
                  <Text fontSize={10} color="$textMuted" textTransform="uppercase" fontWeight="700">
                    Horas
                  </Text>
                </YStack>
                <YStack flex={1} minWidth={100} p="$3" bg="$secondary" br="$3" ai="center">
                  <Text variant="h2" fontWeight="bold">{totalCategories}</Text>
                  <Text fontSize={10} color="$textMuted" textTransform="uppercase" fontWeight="700">
                    Categorias
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>

          {/* Filters */}
          <XStack ai="center" jc="space-between" gap="$3" flexWrap="wrap">
            <XStack ai="center" gap="$2" flexWrap="wrap">
              <Icon name="Filter" size={14} color="$textMuted" />
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant="ghost"
                  px="$3"
                  py="$1"
                  br="$4"
                  bg={filter === cat ? '$text' : '$secondary'}
                  onPress={() => setFilter(cat)}
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color={filter === cat ? '$background' : '$textMuted'}
                  >
                    {cat}
                  </Text>
                </Button>
              ))}
            </XStack>

            <XStack flex={1} maxWidth={300} ai="center" bg="$surface" borderWidth={1} borderColor="$border" br="$3" px="$3" py="$2">
              <Icon name="Search" size={15} color="$textMuted" />
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por curso ou instrutor"
                placeholderTextColor="$textMuted"
                bg="transparent"
                borderWidth={0}
                h="$2.5"
                fontSize={12}
                color="$text"
                flex={1}
              />
            </XStack>
          </XStack>

          {/* Certificates Grid - Cards 200x141px (proporção A4) */}
          {filteredCertificates.length === 0 ? (
            <YStack p="$8" ai="center" jc="center" bg="$surface" br="$4" borderWidth={1} borderColor="$border" borderStyle="dashed">
              <Icon name="Award" size={48} color="$textMuted" />
              <Text variant="h3" mt="$4" textAlign="center">
                Nenhum certificado encontrado
              </Text>
              <Text variant="caption" mt="$2" textAlign="center" color="$textMuted">
                Ajuste os filtros ou continue estudando para liberar novas conquistas.
              </Text>
            </YStack>
          ) : (
            <XStack gap="$4" flexWrap="wrap">
              {filteredCertificates.map(cert => (
                <Card
                  key={cert.id}
                  w={200}
                  h={141}
                  p={0}
                  overflow="hidden"
                  br="$3"
                  cursor="pointer"
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  onPress={() => setSelectedCertificate(cert)}
                >
                  {/* Certificate Preview - Compact */}
                  {cert.certificate_blocks && cert.certificate_blocks.length > 0 ? (
                    <YStack flex={1} overflow="hidden">
                      <CertificateMiniature
                        blocks={cert.certificate_blocks}
                        designWidth={cert.designWidth || 1100}
                        designHeight={cert.designHeight || 778}
                        isDoubleSided={cert.isDoubleSided || false}
                      />
                    </YStack>
                  ) : (
                    <YStack
                      flex={1}
                      style={{ background: cert.gradient }}
                      p="$3"
                      jc="space-between"
                    >
                      <XStack ai="center" jc="space-between">
                        <YStack w={24} h={24} br="$2" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                          <Icon name="Sparkles" size={12} color="$white" />
                        </YStack>
                        <YStack px="$1.5" py="$0.5" br="$2" bg="rgba(255,255,255,0.2)">
                          <Text fontSize={8} fontWeight="600" color="$white" textTransform="uppercase">
                            {cert.category}
                          </Text>
                        </YStack>
                      </XStack>

                      <YStack>
                        <Text fontSize={8} color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing={1}>
                          Certificado de conclusão
                        </Text>
                        <Text fontSize={11} fontWeight="bold" color="$white" numberOfLines={2} mt="$0.5">
                          {cert.course?.title || 'Curso'}
                        </Text>
                      </YStack>

                      <XStack ai="center" jc="space-between">
                        <Text fontSize={8} color="rgba(255,255,255,0.9)" numberOfLines={1}>
                          {new Date(cert.created_at).toLocaleDateString('pt-BR')}
                        </Text>
                        <XStack ai="center" gap="$0.5">
                          <Icon name="CheckCircle" size={8} color="$white" />
                          <Text fontSize={8} color="$white">✓</Text>
                        </XStack>
                      </XStack>
                    </YStack>
                  )}

                  {/* Meta + Actions */}
                  <YStack p="$4" gap="$3">
                    <XStack ai="center" jc="space-between">
                      <XStack ai="center" gap="$1">
                        <Icon name="Calendar" size={14} color="$textMuted" />
                        <Text fontSize={11} color="$textMuted">
                          {new Date(cert.created_at).toLocaleDateString('pt-BR')}
                        </Text>
                      </XStack>
                      <XStack ai="center" gap="$1">
                        <Icon name="Clock" size={14} color="$textMuted" />
                        <Text fontSize={11} color="$textMuted">
                          {Math.floor(Math.random() * 20 + 5)}h
                        </Text>
                      </XStack>
                    </XStack>

                    <Text fontSize={11} color="$textMuted" fontFamily="$mono">
                      Código: {cert.uuid_extranet}
                    </Text>

                    <XStack gap="$2">
                      <Button flex={1} size="sm" onPress={() => downloadCertificatePdf(cert.id)}>
                        <Icon name="Download" size={14} color="$white" />
                        <Text ml="$1" fontSize={12} fontWeight="600" color="$white">Baixar PDF</Text>
                      </Button>
                      <Button size="sm" variant="ghost" border={1} borderColor="$border" onPress={() => shareCertificate(cert.uuid_extranet, cert.course?.title)}>
                        <Icon name="Share2" size={14} color="$text" />
                      </Button>
                      <Button size="sm" variant="ghost" border={1} borderColor="$border" onPress={() => openCertificateValidation(cert.uuid_extranet)}>
                        <Icon name="ExternalLink" size={14} color="$text" />
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              ))}
            </XStack>
          )}
        </YStack>
      </ScrollView>

      {/* Certificate Detail Modal */}
      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            bg="rgba(0,0,0,0.5)"
            position="fixed"
            inset={0}
            zIndex={99998}
          />
          <Dialog.Content
            key="content"
            bg="$background"
            borderWidth={1}
            borderColor="$border"
            br="$4"
            p="$4"
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={99999}
            minWidth={340}
            maxWidth={400}
            maxHeight="90vh"
          >
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                variant="ghost"
                zIndex={10}
              >
                <Icon name="X" size={16} color="$textMuted" />
              </Button>
            </Dialog.Close>

            {selectedCertificate && (
              <CertificateDetailCard
                certificate={selectedCertificate}
                onClose={() => setSelectedCertificate(null)}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
