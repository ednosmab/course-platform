import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';
import { XStack, Text } from 'tamagui';
import defaultLogo from '../assets/flexed-logo.png';

type BrandMarkProps = {
  /** Custom logo image source. Defaults to FLEXED logo. */
  logo?: ImageSourcePropType;
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
 * Reusable brand wordmark — native variant.
 *
 * Renders a logo image via React Native `<Image>` plus an optional
 * text wordmark. Designed to be used by multiple tenants: each client
 * can supply their own `logo`, `brandName`, `brandSuffix` and
 * `accentColor`.
 *
 * @example
 * // Default FLEXED branding
 * <BrandMark />
 *
 * @example
 * // Custom client branding
 * <BrandMark
 *   logo={require('./acme-logo.png')}
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
  const logoSource = logo || defaultLogo;

  return (
    <XStack
      ai="center"
      gap="$2"
      onPress={onPress}
    >
      <Image
        source={logoSource}
        style={{
          width: small ? 32 : 39,
          height: small ? 32 : 39,
          borderRadius: 6,
        }}
        resizeMode="contain"
        accessibilityLabel={`${brandName} ${brandSuffix}`}
      />
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
