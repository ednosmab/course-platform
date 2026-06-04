import React from 'react';
import { Asset } from 'expo-asset';
import { XStack, Text } from 'tamagui';

type BrandMarkProps = {
  small?: boolean;
  onPress?: () => void;
};

const LOGO_SIZE = 40;

const logoAsset = require('../assets/flexed-logo.png');
const logoUri: string = Asset.fromModule(logoAsset).uri;

/**
 * Brand wordmark for **FLEXED Studio**.
 *
 * Renders the `flexed-logo.png` mark followed by the wordmark. The
 * wordmark keeps `FLEX` as the base text and accents the `ED` suffix
 * in the primary brand color, then appends ` Studio` as a descriptor.
 *
 * Typography: the wordmark uses the `$body` font (Inter) at regular
 * weight 400 — **never bold**. The display font and the 900 weight
 * were tried and rejected as too heavy for the brand.
 *
 * @param props.small   When true, only the icon is rendered (no wordmark).
 * @param props.onPress Optional press handler — makes the whole mark clickable.
 */
export function BrandMark({ small = false, onPress }: BrandMarkProps) {
  return (
    <XStack
      ai="center"
      gap="$2"
      cursor={onPress ? 'pointer' : undefined}
      onPress={onPress}
    >
      <img
        src={logoUri}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        alt="FLEXED Studio"
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {!small && (
        <Text
          fontFamily="$body"
          fontWeight="400"
          fontSize={20}
          letterSpacing={-0.3}
        >
          FLEX<Text color="$primary">ED</Text> Studio
        </Text>
      )}
    </XStack>
  );
}
