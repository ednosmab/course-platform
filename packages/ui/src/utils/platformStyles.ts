import { Platform } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

const isWeb = Platform.OS === 'web';

export const webHover = (style: ViewStyle): ViewStyle | undefined =>
  isWeb ? style : undefined;

export const webCursor = (cursor: ViewStyle['cursor']): string | undefined =>
  isWeb ? (cursor as string) : undefined;

export const webBlur = (radius: number): { backdropFilter: string } | undefined =>
  isWeb ? { backdropFilter: `blur(${radius}px)` } : undefined;

export const webNoSelect: TextStyle | undefined =
  isWeb ? { userSelect: 'none' } : undefined;

export const webOnly = <T>(value: T): T | undefined =>
  isWeb ? value : undefined;
