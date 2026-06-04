import React from 'react';
import { XStack } from 'tamagui';

type ProgressBarProps = {
  progress: number;
  height?: number;
};

export function ProgressBar({ progress, height = 6 }: ProgressBarProps) {
  return (
    <XStack
      w="100%"
      h={height}
      br={height / 2}
      bg="$secondary"
      overflow="hidden"
    >
      <XStack
        w={`${Math.min(100, Math.max(0, progress))}%`}
        h="100%"
        br={height / 2}
        bg="$primary"
      />
    </XStack>
  );
}
