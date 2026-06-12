'use client';

import React from 'react';
import { Theme } from '@projeto/ui';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <Theme name="cloudWhite">{children}</Theme>;
}
