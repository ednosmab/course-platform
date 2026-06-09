import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

const logoAsset = require('../assets/flexed-logo.png');

type BrandMarkProps = {
  small?: boolean;
  onPress?: () => void;
};

/**
 * Brand wordmark for **FLEXED Studio**.
 *
 * Renders the logo image (via CSS backgroundImage — no expo-asset needed)
 * plus the text wordmark. The admin app uses its own `brand-mark.tsx` with
 * `next/image` for LCP optimization.
 *
 * Typography: the wordmark uses the `$body` font (Inter) at regular
 * weight 400 — **never bold**. The display font and the 900 weight
 * were tried and rejected as too heavy for the brand.
 *
 * @param props.small   When true, renders a compact version (image only).
 * @param props.onPress Optional press handler — makes the whole mark clickable.
 */
export function BrandMark({ small = false, onPress }: BrandMarkProps) {
  const logoUrl = typeof logoAsset === 'string' ? logoAsset : (logoAsset as any)?.uri || '';

  return (
    <XStack
      ai="center"
      gap="$2"
      cursor={onPress ? 'pointer' : undefined}
      onPress={onPress}
    >
      <YStack
        height={small ? 32 : 39}
        width={small ? 32 : 55}
        borderRadius={6}
        overflow="hidden"
      >
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundImage: `url(${logoUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </YStack>
      {!small && (
        <Text
          fontFamily="$body"
          fontWeight="400"
          fontSize={20}
          letterSpacing={-0.3}
        >
          FLEX<Text color="$primary">ED</Text> Class
        </Text>
      )}
    </XStack>
  );
}
