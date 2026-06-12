'use client';

import React from 'react';
import Image from 'next/image';
import { XStack, Text } from '@projeto/ui';
import Link from 'next/link';
import flexedLogo from '../assets/flexed-logo.png';

/**
 * Admin-local copy of the **FLEXED Studio** brand mark.
 *
 * The shared implementation lives in `@projeto/ui` (`BrandMark`).
 * This file exists because the admin web app needs `next/image` with
 * `priority` for the LCP element on auth pages, while the shared one
 * uses the `expo-asset` pipeline (intended for Expo/RN consumers).
 *
 * The wordmark rules documented on the canonical `BrandMark` MUST be
 * kept in sync here. If you change the wordmark, change it in both
 * places.
 */
export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <XStack ai="center" gap="$2" cursor="pointer">
        <Image
          src={flexedLogo}
          alt="FLEXED Studio"
          priority
          style={{
            height: small ? 32 : 39.5,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        {!small && (
          <Text
            fontFamily="$body"
            fontSize={20}
            fontWeight="400"
            letterSpacing={-0.3}
          >
            FLEX<Text color="$cwPrimary" fontSize={20}>ED</Text> Studio
          </Text>
        )}
      </XStack>
    </Link>
  );
}
