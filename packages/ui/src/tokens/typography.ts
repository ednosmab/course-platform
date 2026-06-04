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
 * Why these live here (and not inside `style={{ lineHeight: <number> }}`):
 * Tamagui's inline-style engine treats numeric values in `style` objects as
 * pixel values, so `style={{ lineHeight: 1.12 }}` is emitted as
 * `line-height: 1.12px` and collapses the line box. Passing the multiplier
 * via the `lineHeight` prop (or via a `createTokens` namespace) preserves the
 * unitless value, so the browser interprets it as a multiplier per CSS spec.
 *
 * @see apps/admin/src/app/page.tsx (heading + course card title)
 * @see image8.png vs image9.png (devtools evidence)
 */
export const lineHeightHeading = 1.12;
export const lineHeightCardTitle = 1.3;
