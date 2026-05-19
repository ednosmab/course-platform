import { createTamagui, createTokens } from '@tamagui/core';
import { color, size, space, radius, zIndex, outfitFont, interFont, animations } from './tokens';

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
