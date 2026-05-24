'use client';

import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Spinner } from 'tamagui';
import { Icon } from '../Icon';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; role?: string | null; error?: string }>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error || 'Erro inesperado. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack maxWidth={400} w="100%" gap="$8">
      <YStack gap="$2">
        <XStack ai="center" gap="$2" alignSelf="flex-start" bg="$secondary" style={{ borderRadius: 9999, padding: '4px 12px' }}>
          <Text fontSize={12} fontWeight="500" color="$secondaryForeground">Bem-vindo de volta 👋</Text>
        </XStack>
        <Text fontFamily="$display" fontSize={30} fontWeight="600" letterSpacing={-0.5} color="$foreground">
          Entre na sua conta
        </Text>
        <Text fontSize={14} color="$textMuted">
          Acesse o Estúdio ou o Portal do Aluno com seu e-mail.
        </Text>
      </YStack>

      <XStack gap="$2">
        <Button variant="ghost" flex={1} h={40} borderWidth={1} borderColor="$border" onPress={() => {}}>
          <XStack ai="center" gap="$2">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden><path fill="$danger" d="M12 10.2v3.9h5.5c-.24 1.42-1.7 4.16-5.5 4.16-3.31 0-6-2.74-6-6.12s2.69-6.12 6-6.12c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.83 3.4 14.66 2.4 12 2.4 6.92 2.4 2.8 6.52 2.8 11.6S6.92 20.8 12 20.8c6.93 0 9.2-4.86 9.2-7.34 0-.49-.05-.86-.12-1.26H12z"/></svg>
            <Text fontSize={14}>Google</Text>
          </XStack>
        </Button>
        <Button variant="ghost" flex={1} h={40} borderWidth={1} borderColor="$border" onPress={() => {}}>
          <XStack ai="center" gap="$2">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden><path d="M16.365 1.43c0 1.14-.42 2.22-1.12 3.02-.78.9-2.05 1.6-3.07 1.52-.13-1.12.43-2.27 1.1-3 .77-.86 2.09-1.5 3.09-1.54zM20.5 17.16c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.38 3.5-4.11 3.52-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.77-4.04-3.33C.04 16.6-.27 11.4 1.4 8.66 2.58 6.7 4.48 5.55 6.27 5.55c1.82 0 2.97 1 4.48 1 1.46 0 2.35-1 4.46-1 1.6 0 3.29.87 4.5 2.38-3.95 2.17-3.31 7.81.79 9.23z"/></svg>
            <Text fontSize={14}>Apple</Text>
          </XStack>
        </Button>
      </XStack>

      <XStack ai="center" gap="$3">
        <YStack h={1} f={1} bg="$border" />
        <Text fontSize={12} textTransform="uppercase" letterSpacing={1} color="$textMuted">ou com e-mail</Text>
        <YStack h={1} f={1} bg="$border" />
      </XStack>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <YStack gap="$4">
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$foreground">E-mail</Text>
            <XStack ai="center" borderWidth={1} borderColor="$border" br="$3" px="$3" h={44} bg="$white">
              <Icon name="Mail" size={16} color="$textMuted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
                style={{ border: 'none', outline: 'none', flex: 1, marginLeft: 8, fontSize: 14, background: 'transparent', color: '#282836' }}
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <XStack ai="center" jc="space-between">
              <Text fontSize={14} fontWeight="500" color="$foreground">Senha</Text>
              <Text fontSize={12} fontWeight="500" color="$primary" cursor="pointer" hoverStyle={{ textDecorationLine: 'underline' }}>Esqueci a senha</Text>
            </XStack>
            <XStack ai="center" borderWidth={1} borderColor="$border" br="$3" px="$3" h={44} bg="$white">
              <Icon name="Lock" size={16} color="$textMuted" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ border: 'none', outline: 'none', flex: 1, marginLeft: 8, fontSize: 14, background: 'transparent', color: '#282836' }}
              />
              <XStack cursor="pointer" onPress={() => setShowPwd(!showPwd)} p="$1" br="$2" hoverStyle={{ bg: '$secondary' }} aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}>
                <Icon name={showPwd ? 'EyeOff' : 'Eye'} size={16} color="$textMuted" />
              </XStack>
            </XStack>
          </YStack>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#808498' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#3B82F6', cursor: 'pointer' }}
            />
            Lembrar de mim por 30 dias
          </label>

          {error && (
            <XStack ai="center" gap="$2" bg="$danger" p="$3" br="$3">
              <Icon name="AlertCircle" size={14} color="$white" />
              <Text fontSize={13} color="$white">{error}</Text>
            </XStack>
          )}

          <Button
            onPress={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={loading}
            h={44}
            style={{ background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)', border: 'none', width: '100%' }}
            opacity={loading ? 0.7 : 1}
          >
            {loading ? (
              <XStack ai="center" gap="$2">
                <Spinner size="small" color="$white" />
                <Text fontSize={14} fontWeight="600" color="$white">Entrando...</Text>
              </XStack>
            ) : (
              <XStack ai="center" gap="$2">
                <Text fontSize={14} fontWeight="600" color="$white">Entrar</Text>
                <Icon name="ArrowRight" size={16} color="$white" />
              </XStack>
            )}
          </Button>
        </YStack>
      </form>

      <YStack
        p="$4"
        borderWidth={1}
        borderColor="$border"
        borderRadius={12}
      >
        <XStack ai="center" jc="space-between">
          <YStack>
            <Text fontSize={14} fontWeight="500">Primeira vez por aqui?</Text>
            <Text fontSize={12} color="$textMuted">Crie sua conta em menos de 1 minuto.</Text>
          </YStack>
          <Text fontSize={14} fontWeight="500" color="$primary" cursor="pointer" hoverStyle={{ textDecorationLine: 'underline' }} style={{ whiteSpace: 'nowrap' }}>
            Criar conta
          </Text>
        </XStack>
      </YStack>

      <Text fontSize={12} color="$textMuted" textAlign="center">
        Ao continuar você concorda com os{' '}
        <a style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>Termos</a>
        {' '}e a{' '}
        <a style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>Política de Privacidade</a>.
      </Text>
    </YStack>
  );
}
