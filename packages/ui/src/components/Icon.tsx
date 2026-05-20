import React from 'react';
import * as lucide from 'lucide-react';
import { useTheme } from '@tamagui/core';

function getTokenValue(token: string, theme: Record<string, any>): string {
  const val = theme[token];
  if (!val) return token;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.val ?? String(val);
  return String(val);
}

function resolveColor(value: string | undefined, theme: Record<string, any>): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^\$(\w+)$/);
  return match ? getTokenValue(match[1], theme) : value;
}

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

export function Icon({ name, size = 24, color, strokeWidth, style }: IconProps) {
  const theme = useTheme() as Record<string, any>;
  const resolvedColor = resolveColor(color, theme);
  const IconComponent = (lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>>)[name];
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in lucide-react`);
    }
    return null;
  }
  return <IconComponent size={size} color={resolvedColor} strokeWidth={strokeWidth} style={style} />;
}

export type { IconProps };
