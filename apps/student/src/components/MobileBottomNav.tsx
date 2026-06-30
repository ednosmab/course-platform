import React from 'react';
import { XStack, YStack, Text, Icon } from '@projeto/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Approximate height of the mobile bottom navigation bar (content only,
 * without safe area inset). Used by screens to set ScrollView paddingBottom
 * so content is never occluded by the nav bar.
 *
 * Calculation: py(8*2) + icon(20) + gap(2) + text(10) + border(1) + buffer(3) ≈ 52
 */
export const MOBILE_BOTTOM_NAV_HEIGHT = 52;

const NAV_ITEMS = [
  { label: 'Painel', icon: 'Home', action: 'dashboard' },
  { label: 'Cursos', icon: 'BookOpen', action: 'courses' },
  { label: 'Explorar', icon: 'Search', action: 'explore' },
  { label: 'Conquistas', icon: 'Award', action: 'certificates' },
] as const;

interface MobileBottomNavProps {
  activeTab: string;
  onTabAction: (action: string) => void;
}

export function MobileBottomNav({ activeTab, onTabAction }: MobileBottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      bg="$background"
      borderTopWidth={1}
      borderTopColor="$border"
      pb={Math.max(insets.bottom, 4)}
    >
      <XStack
        px="$2"
        py="$2"
        ai="center"
        jc="space-around"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.action === activeTab;
          return (
            <YStack
              key={item.action}
              ai="center"
              gap="$0.5"
              px="$2"
              py="$1"
              borderRadius="$2"
              flex={1}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onTabAction(item.action)}
            >
              <Icon
                name={item.icon}
                size={20}
                color={isActive ? '$primary' : '$textMuted'}
              />
              <Text
                fontSize={10}
                fontWeight={isActive ? '700' : '500'}
                color={isActive ? '$primary' : '$textMuted'}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
