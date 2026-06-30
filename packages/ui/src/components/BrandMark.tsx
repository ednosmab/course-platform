import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Platform } from 'react-native';

const defaultLogoAsset: { uri?: string } | string = (() => {
  try {
    return require('../assets/flexed-logo.png');
  } catch {
    return { uri: '' };
  }
})();

type BrandMarkProps = {
  /** Custom logo URL or asset. Defaults to FLEXED logo. */
  logo?: string;
  /** Primary brand name. Defaults to "FLEXED". */
  brandName?: string;
  /** Secondary brand suffix (rendered in accent color). Defaults to "Class". */
  brandSuffix?: string;
  /** Accent color for the suffix text. Defaults to "$primary". */
  accentColor?: string;
  /** When true, renders compact version (image only, no text). */
  small?: boolean;
  /** Optional press handler — makes the whole mark clickable. */
  onPress?: () => void;
};

/**
 * Reusable brand wordmark — web variant.
 *
 * Renders the logo image via CSS `backgroundImage` (no expo-asset needed)
 * plus an optional text wordmark. Designed to be used by multiple tenants:
 * each client can supply their own `logo`, `brandName`, `brandSuffix`
 * and `accentColor`.
 *
 * Typography: the wordmark uses the `$body` font (Inter) at regular
 * weight 400 — **never bold**. The display font and the 900 weight
 * were tried and rejected as too heavy for the brand.
 *
 * @example
 * // Default FLEXED branding
 * <BrandMark />
 *
 * @example
 * // Custom client branding
 * <BrandMark
 *   logo="https://example.com/acme-logo.png"
 *   brandName="ACME"
 *   brandSuffix="Academy"
 *   accentColor="$success"
 * />
 */
export function BrandMark({
  logo,
  brandName = 'FLEXED',
  brandSuffix = 'Class',
  accentColor = '$primary',
  small = false,
  onPress,
}: BrandMarkProps) {
  const logoUrl = logo || (typeof defaultLogoAsset === 'string'
    ? defaultLogoAsset
    : (defaultLogoAsset as any)?.uri || '');

  return (
    <XStack
      ai="center"
      gap="$2"
      cursor={onPress && Platform.OS === 'web' ? 'pointer' : undefined}
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
          {brandName}<Text color={accentColor}> {brandSuffix}</Text>
        </Text>
      )}
    </XStack>
  );
}
