import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regression guard for the FLEXED Class wordmark.
 *
 * The shared BrandMark renders the wordmark as `FLEX` (base) + a
 * colored `ED` accent + ` Class` descriptor. The colored `ED` is a
 * load-bearing part of the brand identity — these tests ensure it is
 * not accidentally flattened into a single uniform string.
 *
 * Tests inspect the source file (not the rendered output) because
 * the default test environment for this package is `node` and cannot
 * mount Tamagui components.
 */
describe('BrandMark wordmark', () => {
  const source = readFileSync(
    resolve(__dirname, './BrandMark.tsx'),
    'utf-8',
  );

  it('renders FLEX as the base wordmark text', () => {
    expect(source).toMatch(/>\s*FLEX</);
  });

  it('keeps the ED color accent as a nested Text node', () => {
    expect(source).toMatch(/FLEX<Text[^>]*color[^>]*>ED<\/Text>/);
  });

  it('appends " Class" after the ED accent', () => {
    // The "Class" word appears earlier in the JSDoc, so anchor the
    // assertion to the ED closing tag instead of a bare Class search.
    expect(source).toMatch(/ED<\/Text>[\s\S]*?Class/);
  });

  it('does not use bold weight', () => {
    // The 900 / "bold" weight was rejected as too heavy.
    expect(source).not.toMatch(/fontWeight=["']900["']/);
  });

  it('uses the body font family (Inter), not the display font', () => {
    expect(source).toMatch(/fontFamily=["']\$body["']/);
  });
});
