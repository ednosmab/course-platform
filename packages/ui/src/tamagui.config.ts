import { createFont, createTamagui, createTokens } from '@tamagui/core';
import { createAnimations } from '@tamagui/animations-react-native';

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 25,
    mass: 1,
    stiffness: 170,
  },
  slow: {
    type: 'spring',
    damping: 30,
    mass: 1,
    stiffness: 100,
  },
});

const outfitFont = createFont({
  family: 'Outfit',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 22,
    6: 28,
    7: 36,
    8: 48,
    true: 16,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 22,
    4: 24,
    5: 28,
    6: 34,
    7: 42,
    8: 54,
    true: 22,
  },
  weight: {
    4: '400',
    6: '600',
    7: '700',
  },
  letterSpacing: {
    4: 0,
    7: -0.5,
  },
  face: {},
});

const interFont = createFont({
  family: 'Inter',
  size: {
    1: 11,
    2: 13,
    3: 15,
    4: 17,
    5: 19,
    6: 21,
    7: 28,
    8: 36,
    true: 15,
  },
  lineHeight: {
    1: 15,
    2: 17,
    3: 20,
    4: 22,
    5: 24,
    6: 26,
    7: 34,
    8: 42,
    true: 20,
  },
  weight: {
    4: '400',
    6: '600',
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
  face: {},
});

const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  true: 16,
};

const space = {
  ...size,
  '-1': -4,
  '-2': -8,
  '-3': -12,
  '-4': -16,
  '-5': -20,
  '-6': -24,
  '-8': -32,
};

const radius = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
  8: 24,
  true: 8,
};

const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  true: 100,
};

const color = {
  primary: '#4F46E5', // Indigo Premium
  secondary: '#7C3AED', // Violeta
  background: '#0F172A', // Slate Profundo
  surface: '#1E293B', // Slate Escuro
  text: '#F8FAFC', // Off-White
  white: '#FFFFFF',
  black: '#000000',
  gray1: '#F1F5F9',
  gray2: '#E2E8F0',
  gray3: '#CBD5E1',
  gray4: '#94A3B8',
  gray5: '#64748B',
  gray6: '#475569',
  gray7: '#334155',
  gray8: '#1E293B',
  gray9: '#0F172A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const tokens = createTokens({
  size,
  space,
  radius,
  zIndex,
  color,
});

const config = createTamagui({
  animations,
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    p: 'padding',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    m: 'margin',
    bg: 'backgroundColor',
    f: 'flex',
    w: 'width',
    h: 'height',
    ai: 'alignItems',
    jc: 'justifyContent',
    fd: 'flexDirection',
    br: 'borderRadius',
    zi: 'zIndex',
  } as const,
  fonts: {
    heading: outfitFont,
    body: interFont,
  },
  tokens,
  themes: {
    dark: {
      background: tokens.color.background,
      surface: tokens.color.surface,
      primary: tokens.color.primary,
      secondary: tokens.color.secondary,
      text: tokens.color.text,
      textMuted: tokens.color.gray4,
      border: tokens.color.gray7,
      success: tokens.color.success,
      warning: tokens.color.warning,
      danger: tokens.color.danger,
      info: tokens.color.info,
    },
    light: {
      background: tokens.color.white,
      surface: tokens.color.gray1,
      primary: tokens.color.primary,
      secondary: tokens.color.secondary,
      text: tokens.color.gray9,
      textMuted: tokens.color.gray5,
      border: tokens.color.gray2,
      success: tokens.color.success,
      warning: tokens.color.warning,
      danger: tokens.color.danger,
      info: tokens.color.info,
    },
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1024 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1560 },
  },
});

export type Conf = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
