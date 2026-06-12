import React from 'react';
import { XStack } from 'tamagui';

type ProgressBarProps = {
  progress: number;
  height?: number;
  /** Optional CSS gradient string applied to the fill bar (e.g. 'linear-gradient(90deg, #10B981, #5B8DEF)'). Falls back to $primary token. */
  gradient?: string;
};

export function ProgressBar({ progress, height = 6, gradient }: ProgressBarProps) {
  const clampedWidth = `${Math.min(100, Math.max(0, progress))}%`;
  return (
    <XStack
      w="100%"
      h={height}
      br={height / 2}
      bg="$secondary"
      overflow="hidden"
    >
      <XStack
        w={clampedWidth}
        h="100%"
        br={height / 2}
        bg={gradient ? undefined : '$primary'}
        style={gradient ? { background: gradient } : undefined}
      />
    </XStack>
  );
}
