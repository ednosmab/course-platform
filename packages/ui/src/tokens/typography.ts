import { createFont } from '@tamagui/core';

export const outfitFont = createFont({
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

export const interFont = createFont({
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

export const spaceGroteskFont = createFont({
  family: 'Montserrat',
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
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    9: '900',
  },
  letterSpacing: {
    4: 0,
    7: -0.5,
  },
  face: {},
});

export const dmSansFont = createFont({
  family: 'DM Sans',
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

/**
 * Unitless line-height multipliers for the admin dashboard.
 *
 * IMPORTANT: these are **strings**, not numbers. Tamagui (via the
 * `react-native-web-internals` `dangerousStyleValue` helper) coerces any
 * numeric value passed to the `lineHeight` prop to px, because `lineHeight`
 * is missing from its `unitlessNumbers` allowlist. A number would be emitted
 * as `1.12px`, collapsing the line box to 1.12px and breaking the layout
 * (see image8.png — the hero heading overlapped the sticky brandmark).
 * A string bypasses the numeric branch and is passed through verbatim, so
 * the browser interprets it as a CSS-spec unitless multiplier.
 *
 * @see apps/admin/src/app/page.tsx (heading + course card title)
 * @see image8.png (bug) vs image9.png (fix with `line-height: 40px`)
 * @see node_modules/@tamagui/react-native-web-internals/.../dangerousStyleValue.cjs
 */
export const lineHeightHeading = '1.12' as const;
export const lineHeightCardTitle = '1.3' as const;
