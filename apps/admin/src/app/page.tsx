'use client';

import React, { useState } from 'react';
import { YStack, XStack, Text, Icon, Theme } from '@projeto/ui';
import Link from 'next/link';
import { BrandMark } from '../components/brand-mark';

const courses = [
  { id: 'c1', title: 'Onboarding de Vendas 2026', students: 124, lessons: 12, progress: 78, status: 'Publicado', cover: ['#60A5FA', '#6366F1'] },
  { id: 'c2', title: 'Fundamentos de UX para times de produto', students: 56, lessons: 8, progress: 45, status: 'Rascunho', cover: ['#34D399', '#14B8A6'] },
  { id: 'c3', title: 'Comunicação não-violenta no trabalho', students: 210, lessons: 6, progress: 92, status: 'Publicado', cover: ['#FBBF24', '#F97316'] },
  { id: 'c4', title: 'IA aplicada ao dia a dia', students: 88, lessons: 10, progress: 30, status: 'Rascunho', cover: ['#E879F9', '#EC4899'] },
  { id: 'c5', title: 'Liderança para novos gestores', students: 41, lessons: 14, progress: 60, status: 'Publicado', cover: ['#38BDF8', '#06B6D4'] },
  { id: 'c6', title: 'Excel sem trauma', students: 312, lessons: 18, progress: 100, status: 'Publicado', cover: ['#A78BFA', '#8B5CF6'] },
];

export default function Dashboard() {
  const [filter, setFilter] = useState(0);

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        {/* Header */}
        <XStack
          position="sticky"
          top={0}
          zIndex={40}
          borderBottomWidth={1}
          borderBottomColor="$border"
          backgroundColor="rgba(247, 248, 252, 0.8)"
          style={{ backdropFilter: 'blur(12px)' }}
          px={24}
          height={64}
          ai="center"
          jc="space-between"
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
            <XStack position="relative" style={{ display: 'none' }} $sm={{ display: 'flex' }}>
              <Icon name="Search" size={16} color="$textMuted" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input
                placeholder="Buscar cursos, aulas, alunos…"
                style={{
                  height: 36,
                  width: 288,
                  borderRadius: 8,
                  border: '1px solid #DEE1EB',
                  backgroundColor: '#F1F2F8',
                  paddingLeft: 40,
                  paddingRight: 12,
                  fontSize: 14,
                  outline: 'none',
                  color: '#282836',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.backgroundColor = '#FFFFFF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#DEE1EB'; e.target.style.backgroundColor = '#F1F2F8'; }}
              />
            </XStack>
            <XStack position="relative" p={8} borderRadius={6} cursor="pointer">
              <Icon name="Bell" size={16} color="$textMuted" />
              <span style={{ position: 'absolute', right: 6, top: 6, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3B82F6' }} />
            </XStack>
            <XStack
              ai="center"
              gap={8}
              px={8}
              py={4}
              borderRadius={6}
              borderWidth={1}
              borderColor="$border"
              backgroundColor="$card"
              cursor="pointer"
            >
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
          <YStack
            position="relative"
            overflow="hidden"
            borderRadius={16}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$card"
            p={32}
          >
            <div style={{
              position: 'absolute', right: -64, top: -64, width: 256, height: 256,
              borderRadius: '50%', opacity: 0.6, filter: 'blur(64px)',
              background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)',
            }} />
            <YStack position="relative" gap={24} $md={{ fd: 'row', ai: 'flex-end', jc: 'space-between' }}>
              <YStack maxWidth={576}>
                <XStack
                  ai="center"
                  gap={6}
                  px={10}
                  py={4}
                  borderRadius={9999}
                  borderWidth={1}
                  borderColor="$border"
                  backgroundColor="$background"
                  alignSelf="flex-start"
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  <Text fontSize={12} color="$textMuted">Tudo certo por aqui</Text>
                </XStack>
                <Text
                  fontFamily="$display"
                  fontSize={36}
                  fontWeight="$6"
                  letterSpacing={-1}
                  mt={16}
                  $md={{ fontSize: 40 }}
                >
                  Oi, Maria 👋 vamos montar uma aula nova?
                </Text>
                <Text mt={8} color="$textMuted" fontSize={15}>
                  Arraste blocos, escreva clicando direto no texto e publique quando quiser. Sem formulário, sem drama.
                </Text>
              </YStack>
              <XStack gap={8}>
                <XStack
                  px={16}
                  py={10}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$border"
                  backgroundColor="$card"
                  cursor="pointer"
                >
                  <Text fontSize={14}>Importar conteúdo</Text>
                </XStack>
                <Link href="/studio/c1" style={{ textDecoration: 'none' }}>
                  <XStack
                    px={16}
                    py={10}
                    borderRadius={8}
                    ai="center"
                    gap={6}
                    cursor="pointer"
                    style={{ background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)' }}
                  >
                    <Icon name="Plus" size={16} color="white" />
                    <Text fontSize={14} color="white" fontWeight="500">Novo curso</Text>
                  </XStack>
                </Link>
              </XStack>
            </YStack>

            {/* Stats */}
            <XStack
              position="relative"
              mt={32}
              flexWrap="wrap"
              gap={12}
            >
              {[
                { icon: 'BookOpen', label: 'Cursos ativos', value: '12', trend: '+2 esta semana' },
                { icon: 'Users', label: 'Alunos', value: '831', trend: '+48 no mês' },
                { icon: 'PlayCircle', label: 'Aulas publicadas', value: '146', trend: '9 em rascunho' },
                { icon: 'TrendingUp', label: 'Conclusão média', value: '72%', trend: '+4 pp' },
              ].map((s) => (
                <YStack
                  key={s.label}
                  flex={1}
                  minWidth={160}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor="$border"
                  backgroundColor="$background"
                  p={16}
                >
                  <XStack ai="center" jc="space-between">
                    <Icon name={s.icon} size={16} color="$textMuted" />
                    <Text fontSize={11} color="$success">{s.trend}</Text>
                  </XStack>
                  <Text fontFamily="$display" fontSize={28} fontWeight="$6" mt={12}>{s.value}</Text>
                  <Text fontSize={12} color="$textMuted">{s.label}</Text>
                </YStack>
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
                  <XStack
                    key={t}
                    px={12}
                    py={4}
                    borderRadius={4}
                    backgroundColor={i === filter ? '$secondary' : 'transparent'}
                    cursor="pointer"
                    onPress={() => setFilter(i)}
                  >
                    <Text fontSize={14} color={i === filter ? '$text' : '$textMuted'}>{t}</Text>
                  </XStack>
                ))}
              </XStack>
            </XStack>

            <XStack flexWrap="wrap" gap={16}>
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/studio/${c.id}`}
                  style={{ textDecoration: 'none', flex: 1, minWidth: 320, maxWidth: 'calc(33.33% - 12px)' }}
                >
                  <YStack
                    overflow="hidden"
                    borderRadius={16}
                    borderWidth={1}
                    borderColor="$border"
                    backgroundColor="$card"
                    cursor="pointer"
                    hoverStyle={{ y: -2 }}
                  >
                    <YStack
                      height={128}
                      position="relative"
                      style={{ background: `linear-gradient(135deg, ${c.cover[0]}, ${c.cover[1]})` }}
                    >
                      <YStack
                        position="absolute"
                        inset={0}
                        opacity={0.3}
                        style={{
                          backgroundImage:
                            'linear-gradient(to right, rgba(204, 208, 220, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(204, 208, 220, 0.35) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                        }}
                      />
                      <XStack position="absolute" left={16} top={16}>
                        <span style={{
                          borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 500,
                          backdropFilter: 'blur(8px)',
                          backgroundColor: c.status === 'Publicado' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(247, 248, 252, 0.7)',
                          color: c.status === 'Publicado' ? '#222C28' : '#282836',
                        }}>
                          {c.status}
                        </span>
                      </XStack>
                    </YStack>
                    <YStack p={20}>
                      <XStack ai="flex-start" jc="space-between" gap={8}>
                        <Text fontFamily="$display" fontSize={16} fontWeight="$6" style={{ lineHeight: 1.3 }}>{c.title}</Text>
                        <XStack p={4} borderRadius={4} cursor="pointer">
                          <Icon name="MoreHorizontal" size={16} color="$textMuted" />
                        </XStack>
                      </XStack>
                      <XStack ai="center" gap={8} mt={4}>
                        <Text fontSize={12} color="$textMuted">{c.lessons} aulas</Text>
                        <Text fontSize={12} color="$textMuted">•</Text>
                        <Text fontSize={12} color="$textMuted">{c.students} alunos</Text>
                      </XStack>
                      <YStack mt={16}>
                        <XStack jc="space-between" mb={4}>
                          <Text fontSize={11} color="$textMuted">Progresso da turma</Text>
                          <Text fontSize={11} color="$textMuted">{c.progress}%</Text>
                        </XStack>
                        <YStack height={6} borderRadius={9999} backgroundColor="$secondary" overflow="hidden">
                          <YStack
                            height="100%"
                            borderRadius={9999}
                            style={{ width: `${c.progress}%`, background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)' }}
                          />
                        </YStack>
                      </YStack>
                    </YStack>
                  </YStack>
                </Link>
              ))}
            </XStack>
          </YStack>
        </main>
      </YStack>
    </Theme>
  );
}
