'use client';

import React from 'react';
import Image from 'next/image';
import { XStack, Text } from '@projeto/ui';
import Link from 'next/link';
import flexedLogo from '../assets/flexed-logo.png';

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <XStack ai="center" gap="$2" cursor="pointer">
        <Image
          src={flexedLogo}
          alt="FLEXED"
          priority
          style={{
            height: small ? 32 : 40,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        {!small && (
          <Text
            fontFamily="$display"
            fontSize={20}
            fontWeight="900"
            letterSpacing={-0.5}
          >
            FLEX<Text color="$cwPrimary">ED</Text>
          </Text>
        )}
      </XStack>
    </Link>
  );
}
