import React, { useState, useRef } from 'react';
import { XStack, YStack, Text, Icon, BrandMark } from '@projeto/ui';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MobileHeaderProps {
  userProfile: { full_name: string; email: string } | null;
  onLogout: () => void;
  onPressLogo?: () => void;
}

export function MobileHeader({ userProfile, onLogout, onPressLogo }: MobileHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<any>(null);
  const { isOnline } = useConnectionStatus();
  const insets = useSafeAreaInsets();

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '--';

  const handleLogout = async () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <YStack bg="$background" borderBottomWidth={1} borderBottomColor="$border">
      <XStack
        px="$3"
        pt={insets.top > 0 ? '$2' : '$1'}
        pb="$2"
        ai="center"
        jc="space-between"
      >
        <BrandMark onPress={onPressLogo} />

        <XStack ai="center" gap="$2">
          {!isOnline && (
            <XStack
              px="$2"
              py="$1"
              borderRadius="$2"
              backgroundColor="$warning"
              opacity={0.9}
            >
              <Text fontSize={10} fontWeight="600" color="$white">
                Offline
              </Text>
            </XStack>
          )}

          <XStack p="$2" borderRadius="$2">
            <Icon name="Bell" size={18} color="$textMuted" />
            <XStack position="absolute" right={4} top={4} w={6} h={6} borderRadius={3} bg="$primary" />
          </XStack>

          <YStack ref={menuRef} position="relative">
            <XStack
              ai="center"
              gap="$1"
              px="$2"
              py="$1"
              borderRadius="$2"
              borderWidth={1}
              borderColor="$border"
              backgroundColor="$background"
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
              onPress={() => setShowUserMenu(!showUserMenu)}
            >
              <XStack w={28} h={28} br="$2" bg="$accent" ai="center" jc="center">
                <Text fontSize={11} fontWeight="600" color="$accentForeground">{initials}</Text>
              </XStack>
            </XStack>

            {showUserMenu && (
              <>
                <YStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  zIndex={998}
                  onPress={() => setShowUserMenu(false)}
                />
                <YStack
                  position="absolute"
                  top="100%"
                  right={0}
                  marginTop="$1"
                  bg="$popover"
                  borderWidth={1}
                  borderColor="$border"
                  br="$3"
                  p="$2"
                  minWidth={180}
                  zIndex={999}
                >
                  <YStack
                    ai="center"
                    gap="$2"
                    px="$3"
                    py="$2"
                    br="$2"
                    pressStyle={{ bg: '$secondary', opacity: 0.9 }}
                    onPress={handleLogout}
                  >
                    <Icon name="LogOut" size={16} color="$textMuted" />
                    <Text fontSize={14} color="$danger">Sair</Text>
                  </YStack>
                </YStack>
              </>
            )}
          </YStack>
        </XStack>
      </XStack>
    </YStack>
  );
}
