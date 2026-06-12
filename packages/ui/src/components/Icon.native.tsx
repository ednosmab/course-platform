import React from 'react';
import * as lucide from 'lucide-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 24, color, strokeWidth, style }: IconProps) {
  const IconComponent = (lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: StyleProp<ViewStyle> }>>)[name];
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in lucide-react-native`);
    }
    return null;
  }
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

export type { IconProps };
