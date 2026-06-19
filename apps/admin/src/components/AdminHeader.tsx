'use client';

import React, { useState, useRef, useEffect } from 'react';
import { XStack, YStack, Text, Icon } from '@projeto/ui';
import { useRouter, usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';
import { AuthService } from '@projeto/core';

const NAV_ITEMS = ['Painel', 'Cursos', 'Alunos', 'Mídia', 'Relatórios'] as const;

const NAV_ROUTES: Record<string, string> = {
  Painel: '/',
  Cursos: '/cursos',
  Alunos: '/alunos',
  'Mídia': '/midia',
  'Relatórios': '/relatorios',
};

interface AdminHeaderProps {
  userProfile: { full_name: string; email: string } | null;
  onLogout: () => void;
}

export function AdminHeader({ userProfile, onLogout }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<any>(null);

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '--';
  const displayName = userProfile?.full_name || 'Usuário';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as any).contains?.(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // proceed even if signOut fails
    }
    onLogout();
  };

  const isActive = (label: string) => {
    if (label === 'Painel') return pathname === '/';
    if (label === 'Cursos') return pathname.startsWith('/cursos') || pathname.startsWith('/configuracoes') || pathname.startsWith('/studio');
    if (label === 'Alunos') return pathname.startsWith('/alunos');
    if (label === 'Mídia') return pathname.startsWith('/midia');
    if (label === 'Relatórios') return pathname.startsWith('/relatorios');
    return false;
  };

  const handleNav = (label: string) => {
    const route = NAV_ROUTES[label];
    if (route) router.push(route);
  };

  return (
    <XStack
      position="sticky" top={0} zIndex={40}
      borderBottomWidth={1} borderBottomColor="$border"
      bg="$background"
      style={{ backdropFilter: 'blur(12px)' }}
      px={24} height={64} ai="center" jc="space-between"
    >
      <XStack ai="center" gap={32}>
        <BrandMark />
        <XStack ai="center" gap={4} $sm={{ display: 'none' }}>
          {NAV_ITEMS.map((l) => {
            const active = isActive(l);
            return (
              <XStack
                key={l}
                px={12}
                py={6}
                borderRadius={6}
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$secondary' }}
                position="relative"
                onPress={() => handleNav(l)}
              >
                <Text
                  fontSize={14}
                  color={active ? '$text' : '$textMuted'}
                  fontWeight={active ? '600' : '400'}
                  style={{ userSelect: 'none' }}
                >
                  {l}
                </Text>
                {active && (
                  <XStack
                    position="absolute"
                    bottom={0}
                    left={12}
                    right={12}
                    height={2}
                    bg="$primary"
                    borderRadius={1}
                  />
                )}
              </XStack>
            );
          })}
        </XStack>
      </XStack>

      <XStack ai="center" gap={12}>
        <XStack position="relative" p={8} borderRadius={6} cursor="pointer">
          <Icon name="Bell" size={16} color="$textMuted" />
          <XStack position="absolute" right={6} top={6} w={6} h={6} borderRadius={3} bg="$primary" />
        </XStack>

        <YStack ref={menuRef} position="relative">
          <XStack
            ai="center"
            gap={8}
            px={10}
            py={6}
            borderRadius={6}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$background"
            cursor="pointer"
            hoverStyle={{ backgroundColor: '$secondary' }}
            pressStyle={{ scale: 0.97 }}
            onPress={() => setShowUserMenu(!showUserMenu)}
          >
            <XStack w={24} h={24} br={4} bg="$accent" ai="center" jc="center">
              <Text fontSize={11} fontWeight="600" color="$accentForeground">{initials}</Text>
            </XStack>
            <Text fontSize={14} color="$text" $sm={{ display: 'none' }}>{displayName}</Text>
            <Icon name="ChevronDown" size={14} color="$textMuted" />
          </XStack>

          {showUserMenu && (
            <YStack
              position="absolute"
              top="100%"
              right={0}
              marginTop={4}
              bg="$popover"
              borderWidth={1}
              borderColor="$border"
              br="$3"
              p="$2"
              minWidth={180}
              zIndex={999}
            >
              <XStack
                ai="center"
                gap="$2"
                px="$3"
                py="$2"
                br="$2"
                cursor="pointer"
                hoverStyle={{ bg: '$surface' }}
                pressStyle={{ bg: '$surface', opacity: 0.9 }}
                onPress={handleLogout}
              >
                <Icon name="LogOut" size={16} color="$textMuted" />
                <Text fontSize={14} color="$danger">Sair</Text>
              </XStack>
            </YStack>
          )}
        </YStack>
      </XStack>
    </XStack>
  );
}
