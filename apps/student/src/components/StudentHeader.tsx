import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, XStack, YStack, Text, Icon, useMedia, BrandMark } from '@projeto/ui';
import { AuthService } from '@projeto/core';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const NAV_TABS = [
  { label: 'Meu painel', action: 'dashboard' },
  { label: 'Meus cursos', action: 'courses' },
  { label: 'Explorar Cursos', action: 'explore' },
  { label: 'Conquistas', action: 'certificates' },
];

interface StudentHeaderProps {
  userProfile: { full_name: string; email: string } | null;
  onLogout: () => void;
  onTabAction: (action: string) => void;
  activeTab: string;
}

export function StudentHeader({ userProfile, onLogout, onTabAction, activeTab }: StudentHeaderProps) {
  const media = useMedia();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<any>(null);
  const { isOnline } = useConnectionStatus();

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '--';
  const firstName = userProfile?.full_name ? userProfile.full_name.split(' ')[0] : '--';

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

  return (
    <>
      <XStack
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$border"
        px={24}
        height={64}
        ai="center"
        jc="space-between"
      >
        <XStack ai="center" gap={32}>
          <BrandMark onPress={() => onTabAction('dashboard')} />
          <XStack ai="center" gap={4} $sm={{ display: 'none' }}>
            {NAV_TABS.map((tab) => {
              const isActive = tab.action === activeTab;
              return (
                <XStack
                  key={tab.label}
                  px={12}
                  py={6}
                  borderRadius={6}
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: '$secondary' }}
                  position="relative"
                  onPress={() => onTabAction(tab.action)}
                >
                  <Text
                    fontSize={14}
                    color={isActive ? '$text' : '$textMuted'}
                    fontWeight={isActive ? '600' : '400'}
                    style={{ userSelect: 'none' }}
                  >
                    {tab.label}
                  </Text>
                  {isActive && (
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
          {!isOnline && (
            <XStack
              px={8}
              py={4}
              borderRadius={4}
              backgroundColor="$warning"
              opacity={0.9}
            >
              <Text fontSize={11} fontWeight="600" color="$warningForeground">
                Offline
              </Text>
            </XStack>
          )}

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
              <Text fontSize={14} color="$text" $sm={{ display: 'none' }}>
                {firstName}
              </Text>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} mt="$3" display={media.sm ? 'flex' : 'none'}>
        <XStack gap={4}>
          {NAV_TABS.map((tab) => {
            const isActive = tab.action === activeTab;
            return (
              <XStack
                key={tab.label}
                px={12}
                py={6}
                borderRadius={6}
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$secondary' }}
                position="relative"
                onPress={() => onTabAction(tab.action)}
              >
                <Text
                  fontSize={14}
                  fontWeight={isActive ? '600' : '400'}
                  color={isActive ? '$text' : '$textMuted'}
                  style={{ userSelect: 'none' }}
                >
                  {tab.label}
                </Text>
                {isActive && (
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
      </ScrollView>
    </>
  );
}
