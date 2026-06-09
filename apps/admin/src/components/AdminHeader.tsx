'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XStack, Text, Icon } from '@projeto/ui';
import { useRouter, usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';
import { AuthService } from '@projeto/core';

const NAV_ITEMS = ['Painel', 'Cursos', 'Alunos', 'Mídia', 'Relatórios'] as const;

const NAV_ROUTES: Record<string, string> = {
  Painel: '/',
  Cursos: '/cursos',
};

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLUListElement>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';
  const displayName = userProfile?.full_name || 'Usuário';

  useEffect(() => {
    (async () => {
      const profile = await AuthService.getCurrentProfile();
      if (profile) setUserProfile({ full_name: profile.full_name ?? '', email: profile.email ?? '' });
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (label: string) => {
    if (label === 'Painel') return pathname === '/';
    if (label === 'Cursos') return pathname.startsWith('/cursos') || pathname.startsWith('/configuracoes');
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
        <XStack ai="center" gap={4}>
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

        <ul ref={userMenuRef} style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setShowUserMenu(!showUserMenu); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6,
                border: '1px solid #DEE1EB', background: '#FFFFFF',
                cursor: 'pointer', textDecoration: 'none', color: 'inherit',
                fontFamily: 'inherit', fontSize: 'inherit',
              }}
            >
              <XStack width={24} height={24} borderRadius={4} ai="center" jc="center" backgroundColor="$accent">
                <Text fontSize={11} fontWeight="$6" color="$accentForeground">{initials}</Text>
              </XStack>
              <Text fontSize={14}>{displayName}</Text>
              <Icon name="ChevronDown" size={14} color="$textMuted" />
            </a>

            {showUserMenu && (
              <ul
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  listStyle: 'none', margin: 0, padding: 8, minWidth: 160,
                  borderRadius: 8, zIndex: 999,
                  background: '#FFFFFF', border: '1px solid #DEE1EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              >
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowUserMenu(false); router.push('/logout'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                      textDecoration: 'none', color: 'inherit',
                      fontFamily: 'inherit', fontSize: 'inherit',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F7F8FC'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Icon name="LogOut" size={16} color="$textMuted" />
                    <Text fontSize={14} color="$danger">Sair</Text>
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </XStack>
    </XStack>
  );
}
