import React from 'react';
import { YStack, XStack, Text, Theme, LoginForm } from '@projeto/ui';
import { AuthService } from '@projeto/core';

export function StudentLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const handleLogin = async (email: string, password: string) => {
    try {
      await AuthService.signIn(email, password);
      const role = await AuthService.getUserRole();
      if (role !== 'student') {
        await AuthService.logout();
        return { success: false, error: 'Acesso permitido apenas para alunos.' };
      }
      onLoginSuccess();
      return { success: true, role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro inesperado. Tente novamente.' };
    }
  };

  return (
    <Theme name="cloudWhite">
      <YStack f={1} bg="$background" jc="center" ai="center" p="$6">
        <XStack mb="$8">
          <Text fontFamily="$display" fontSize={24} fontWeight="600" letterSpacing={-0.5}>
            Portal do Aluno
          </Text>
        </XStack>
        <LoginForm onLogin={handleLogin} />
      </YStack>
    </Theme>
  );
}
