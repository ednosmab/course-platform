import React from 'react';
import * as lucide from 'lucide-react';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

export function Icon({ name, size = 24, color, strokeWidth, style }: IconProps) {
  const IconComponent = (lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>>)[name];
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in lucide-react`);
    }
    return null;
  }
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

export type { IconProps };
