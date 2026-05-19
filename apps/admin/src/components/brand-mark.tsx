'use client';

import React from 'react';
import { XStack, Text, Icon } from '@projeto/ui';
import Link from 'next/link';

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <XStack ai="center" gap="$2" cursor="pointer">
        <XStack
          w={32}
          h={32}
          br="$3"
          ai="center"
          jc="center"
          bg="#5B8DEF"
          style={{
            background: 'linear-gradient(135deg, #5B8DEF, #6E5AE8)',
          }}
        >
          <Icon name="Sparkles" size={16} color="white" />
        </XStack>
        {!small && (
          <Text fontFamily="$display" fontSize={18} fontWeight="$7" letterSpacing={-0.5}>
            Mosaico<span style={{ color: '#3B82F6' }}>.</span>
          </Text>
        )}
      </XStack>
    </Link>
  );
}
