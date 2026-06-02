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
        alt="FLEXED"
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {!small && (
        <Text
          fontFamily="$display"
          fontWeight="900"
          fontSize={20}
          letterSpacing={-0.5}
        >
          FLEX<Text color="$primary">ED</Text>
        </Text>
      )}
    </XStack>
  );
}
