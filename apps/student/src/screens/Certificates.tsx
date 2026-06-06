import React, { useState, useEffect } from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, Spinner, Input } from '@projeto/ui';
import { CertificateService, AuthService } from '@projeto/core';
import { Certificate, Course } from '@projeto/types';
import { downloadCertificatePdf, openCertificateValidation, shareCertificate } from '../services/certificate-actions';

type CertificatesProps = {
  onBack: () => void;
};

interface CertificateWithCourse extends Certificate {
  course?: Course;
  gradient: string;
  category: string;
}

const categories = ['Todos', 'Vendas', 'Soft skills', 'Liderança', 'Cultura'];

const gradients = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #0ea5e9, #22d3ee)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
];

export function Certificates({ onBack }: CertificatesProps) {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await AuthService.getCurrentProfile();
      setUserProfile(profile);

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

          return {
            ...cert,
            course,
            gradient: gradients[idx % gradients.length],
            category: course?.title?.includes('Vendas') ? 'Vendas' :
                      course?.title?.includes('Liderança') ? 'Liderança' :
                      course?.title?.includes('Comunicação') ? 'Soft skills' : 'Cultura',
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

  const filteredCertificates = certificates.filter(cert => {
    const matchCat = filter === 'Todos' || cert.category === filter;
    const matchQuery = !query ||
      cert.course?.title?.toLowerCase().includes(query.toLowerCase()) ||
      false;
    return matchCat && matchQuery;
  });

  const totalHours = certificates.reduce((acc, cert) => {
    return acc + Math.floor(Math.random() * 20 + 5);
  }, 0);

  const totalCategories = new Set(certificates.map(c => c.category)).size;

  if (error) {
    return (
      <YStack flex={1} jc="center" ai="center" p="$6" bg="$background">
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
    );
  }

  if (loading) {
    return (
      <YStack flex={1} jc="center" ai="center" bg="$background">
        <Spinner size="large" color="$primary" />
        <Text color="$gray4" mt="$4" fontSize={13} fontWeight="600">
          Carregando certificados...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <YStack
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$border"
        px="$6"
        py="$3"
      >
        <XStack ai="center" jc="space-between" maxWidth={1400} w="100%" als="center">
          <XStack ai="center" gap="$4">
            <Button variant="ghost" px="$2" py="$2" onPress={onBack}>
              <Icon name="ChevronLeft" size={20} color="$text" />
            </Button>
            <YStack>
              <Text variant="caption" textTransform="uppercase" letterSpacing={1} fontWeight="700" color="$textMuted">
                Conquistas
              </Text>
              <Text variant="h3" fontWeight="bold">
                Meus certificados
              </Text>
            </YStack>
          </XStack>

          <Button variant="ghost" border={1} borderColor="$border" px="$3" py="$2">
            <Icon name="Share2" size={16} color="$text" />
            <Text ml="$2" fontSize={12} fontWeight="600">Compartilhar perfil</Text>
          </Button>
        </XStack>
      </YStack>

      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 32 }}>
        <YStack maxWidth={1400} w="100%" als="center" gap="$6">
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
                <YStack flex={1} minW={100} p="$3" bg="$secondary" br="$3" ai="center">
                  <Text variant="h2" fontWeight="bold">{certificates.length}</Text>
                  <Text fontSize={10} color="$textMuted" textTransform="uppercase" fontWeight="700">
                    Certificados
                  </Text>
                </YStack>
                <YStack flex={1} minW={100} p="$3" bg="$secondary" br="$3" ai="center">
                  <Text variant="h2" fontWeight="bold">{totalHours}h</Text>
                  <Text fontSize={10} color="$textMuted" textTransform="uppercase" fontWeight="700">
                    Horas
                  </Text>
                </YStack>
                <YStack flex={1} minW={100} p="$3" bg="$secondary" br="$3" ai="center">
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

            <XStack flex={1} maxW={300} ai="center" bg="$surface" borderWidth={1} borderColor="$border" br="$3" px="$3" py="$2">
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

          {/* Certificates Grid */}
          {filteredCertificates.length === 0 ? (
            <YStack p="$8" ai="center" jc="center" bg="$surface" br="$4" border={1} borderColor="$border" borderStyle="dashed">
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
                  flex={1}
                  minW={280}
                  maxW={400}
                  p={0}
                  overflow="hidden"
                  br="$4"
                >
                  {/* Certificate Preview */}
                  <YStack
                    h={160}
                    style={{ background: cert.gradient }}
                    position="relative"
                  >
                    <YStack
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      opacity={0.3}
                      style={{
                        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)',
                      }}
                    />

                    <YStack flex={1} p="$4" jc="space-between">
                      <XStack ai="center" jc="space-between">
                        <XStack ai="center" gap="$2">
                          <YStack w={32} h={32} br="$2" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                            <Icon name="Sparkles" size={16} color="$white" />
                          </YStack>
                          <Text fontSize={14} fontWeight="bold" color="$white">
                            Mosaico
                          </Text>
                        </XStack>
                        <YStack px="$2" py="$0.5" br="$2" bg="rgba(255,255,255,0.2)">
                          <Text fontSize={10} fontWeight="600" color="$white" textTransform="uppercase">
                            {cert.category}
                          </Text>
                        </YStack>
                      </XStack>

                      <YStack>
                        <Text fontSize={10} color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing={2}>
                          Certificado de conclusão
                        </Text>
                        <Text fontSize={16} fontWeight="bold" color="$white" numberOfLines={2} mt="$1">
                          {cert.course?.title || 'Curso'}
                        </Text>
                      </YStack>

                      <XStack ai="center" jc="space-between">
                        <Text fontSize={11} color="rgba(255,255,255,0.9)">
                          {cert.course?.author_id || 'Instrutor'}
                        </Text>
                        <XStack ai="center" gap="$1">
                          <Icon name="CheckCircle" size={12} color="$white" />
                          <Text fontSize={11} color="$white">Autenticado</Text>
                        </XStack>
                      </XStack>
                    </YStack>
                  </YStack>

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
    </YStack>
  );
}
