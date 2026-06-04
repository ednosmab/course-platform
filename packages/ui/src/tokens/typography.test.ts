import { describe, it, expect } from 'vitest';
import { lineHeightHeading, lineHeightCardTitle } from './typography';

describe('typography tokens: lineHeight multipliers', () => {
  it('exports lineHeightHeading as a string (to bypass Tamagui px coercion)', () => {
    // CRITICAL: must be a string, not a number. See dangerousStyleValue.cjs
    // in @tamagui/react-native-web-internals: numeric lineHeight values
    // are suffixed with "px" because lineHeight is not in the unitless
    // allowlist. A number here would collapse the line box to 1.12px.
    expect(typeof lineHeightHeading).toBe('string');
  });

  it('exports lineHeightCardTitle as a string (to bypass Tamagui px coercion)', () => {
    expect(typeof lineHeightCardTitle).toBe('string');
  });

  it('keeps lineHeightHeading at the design spec value (1.12)', () => {
    expect(lineHeightHeading).toBe('1.12');
  });

  it('keeps lineHeightCardTitle at the design spec value (1.3)', () => {
    expect(lineHeightCardTitle).toBe('1.3');
  });

  it('multipliers are unitless CSS strings (no "px" suffix)', () => {
    // Regression guard: a future refactor that turns these into strings like
    // "1.12px" would re-introduce the dashboard hero bug. Unitless strings
    // round-trip through Tamagui as CSS multipliers per spec.
    expect(lineHeightHeading).not.toMatch(/px$/);
    expect(lineHeightCardTitle).not.toMatch(/px$/);
  });
});

