import { describe, it, expect } from 'vitest';
import { lineHeightHeading, lineHeightCardTitle } from './typography';

describe('typography tokens: lineHeight multipliers', () => {
  it('exports lineHeightHeading as a unitless number', () => {
    expect(typeof lineHeightHeading).toBe('number');
    expect(lineHeightHeading).not.toBeNaN();
  });

  it('exports lineHeightCardTitle as a unitless number', () => {
    expect(typeof lineHeightCardTitle).toBe('number');
    expect(lineHeightCardTitle).not.toBeNaN();
  });

  it('keeps lineHeightHeading at the design spec value (1.12)', () => {
    expect(lineHeightHeading).toBe(1.12);
  });

  it('keeps lineHeightCardTitle at the design spec value (1.3)', () => {
    expect(lineHeightCardTitle).toBe(1.3);
  });

  it('multipliers are unitless (not strings carrying "px" suffix)', () => {
    // Regression guard: a future refactor that turns these into strings like
    // "1.12px" would re-introduce the dashboard hero bug. We assert the
    // values stay as raw numbers so they round-trip through Tamagui's
    // prop pipeline as unitless multipliers per CSS spec.
    expect(String(lineHeightHeading)).not.toMatch(/px$/);
    expect(String(lineHeightCardTitle)).not.toMatch(/px$/);
  });
});
