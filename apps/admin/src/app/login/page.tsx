'use client';

import React, { Suspense } from 'react';
import { YStack, XStack, Text, Icon, Theme } from '@projeto/ui';
import { LoginForm } from '@projeto/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@projeto/core';
import { BrandMark } from '../../components/brand-mark';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (email: string, password: string) => {
    try {
      await AuthService.signIn(email, password);
      const role = await AuthService.getUserRole();

      if (role === 'student') {
        const studentUrl = process.env.NEXT_PUBLIC_STUDENT_APP_URL || 'http://localhost:8081';
        window.location.href = studentUrl;
      } else {
        router.push(redirectTo);
      }
      return { success: true, role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro inesperado. Tente novamente.' };
    }
  };

  const GRADIENT = 'linear-gradient(135deg, #5B8DEF, #6E5AE8)';

  return (
    <XStack f={1} minHeight="100vh" bg="$background">
      <YStack
        display="none"
        $lg={{ display: 'flex' }}
        w="50%"
        p="$8"
        jc="space-between"
        style={{ background: GRADIENT, position: 'relative', overflow: 'hidden' }}
      >
        <YStack style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <YStack style={{ position: 'absolute', top: -80, right: -60, width: 384, height: 384, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)', filter: 'blur(48px)' }} />
        <YStack style={{ position: 'absolute', bottom: -120, left: -60, width: 448, height: 448, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 60%)', filter: 'blur(48px)' }} />

        <XStack ai="center" gap="$2" style={{ position: 'relative', zIndex: 10 }}>
          <XStack w={36} h={36} br="$3" ai="center" jc="center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <Icon name="Sparkles" size={16} color="$white" />
          </XStack>
          <Text fontFamily="$display" fontSize={20} fontWeight="600" letterSpacing={-0.5} color="$white">
            Mosaico<span style={{ opacity: 0.7 }}>.</span>
          </Text>
        </XStack>

        <YStack style={{ position: 'relative', zIndex: 10 }} maxWidth={400} gap="$6">
          <XStack ai="center" gap="$2" alignSelf="flex-start" style={{ borderRadius: 9999, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px' }}>
            <XStack w={6} h={6} br={3} bg="$white" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <Text fontSize={12} fontWeight="500" color="rgba(255,255,255,0.9)">Estúdio + Portal do Aluno</Text>
          </XStack>

          <YStack gap="$4">
            <Text fontFamily="$display" fontSize={36} $lg={{ fontSize: 48 }} fontWeight="600" lineHeight="1.05" letterSpacing={-0.5} color="$white">
              Crie aulas visualmente ricas.
              <br />
              <span style={{ opacity: 0.8 }}>Sem código. Sem fricção.</span>
            </Text>
            <Text fontSize={16} color="rgba(255,255,255,0.85)" lineHeight="1.6">
              Um lugar só pra montar cursos, acompanhar alunos e entregar uma experiência fluida — do primeiro clique ao certificado.
            </Text>
          </YStack>

          <YStack gap="$3">
            {[
              'CMS visual em blocos arrastáveis',
              'Portal do aluno moderno e responsivo',
              'Relatórios de progresso em tempo real',
            ].map((item) => (
              <XStack key={item} ai="center" gap="$2">
                <Icon name="CheckCircle2" size={16} color="rgba(255,255,255,0.9)" />
                <Text fontSize={14} color="rgba(255,255,255,0.9)">{item}</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>

        <XStack ai="center" gap="$3" style={{ position: 'relative', zIndex: 10 }}>
          <XStack>
            {['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.7)'].map((bg, i) => (
              <XStack key={i} w={28} h={28} br={14} style={{ border: '2px solid rgba(255,255,255,0.4)', background: bg, marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </XStack>
          <Text fontSize={12} color="rgba(255,255,255,0.7)">+2.300 criadores já usam a Mosaico</Text>
        </XStack>
      </YStack>

      <YStack f={1} jc="center" ai="center" p="$6" $sm={{ p: '$4' }}>
        <XStack alignSelf="flex-start" $lg={{ display: 'none' }} mb="$4">
          <BrandMark />
        </XStack>

        <LoginForm onLogin={handleLogin} />
      </YStack>
    </XStack>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Theme name="cloudWhite">
        <LoginPageContent />
      </Theme>
    </Suspense>
  );
}
