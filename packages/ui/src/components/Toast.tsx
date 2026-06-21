import React, { useEffect, useState } from 'react';
import { YStack, XStack, Text, Icon } from '@projeto/ui';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Simple auto-dismissing toast notification.
 * Renders at the bottom-center of the screen and disappears after `duration` ms.
 */
export function Toast({ message, type = 'success', duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const iconMap = {
    success: 'CheckCircle2' as const,
    error: 'AlertCircle' as const,
    info: 'Info' as const,
  };

  const colorMap = {
    success: '$success',
    error: '$danger',
    info: '$primary',
  };

  return (
    <XStack
      position="fixed"
      bottom="$6"
      left="50%"
      transform="translateX(-50%)"
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
      br="$4"
      px="$4"
      py="$3"
      ai="center"
      gap="$2"
      zIndex={9999}
      elevation={4}
      opacity={visible ? 1 : 0}
    >
      <Icon name={iconMap[type]} size={16} color={colorMap[type]} />
      <Text fontSize={13} fontWeight="600" color="$text">
        {message}
      </Text>
    </XStack>
  );
}
