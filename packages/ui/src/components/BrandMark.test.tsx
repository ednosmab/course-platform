import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regression guard for the FLEXED Studio wordmark.
 *
 * The shared BrandMark renders the wordmark as `FLEX` (base) + a
 * colored `ED` accent + ` Studio` descriptor. The colored `ED` is a
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

  it('appends " Studio" after the ED accent', () => {
    // The "Studio" word appears earlier in the JSDoc, so anchor the
    // assertion to the ED closing tag instead of a bare Studio search.
    expect(source).toMatch(/ED<\/Text>[\s\S]*?Studio/);
  });

  it('uses an alt attribute that mirrors the wordmark', () => {
    expect(source).toMatch(/alt=["']FLEXED Studio["']/);
  });

  it('does not use bold weight', () => {
    // The 900 / "bold" weight was rejected as too heavy.
    expect(source).not.toMatch(/fontWeight=["']900["']/);
  });

  it('uses the body font family (Inter), not the display font', () => {
    expect(source).toMatch(/fontFamily=["']\$body["']/);
  });
});
