import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regression guard for the dashboard hero bug.
 *
 * The bug (image8.png in the chat): `style={{ lineHeight: 1.12 }}` was
 * emitted by Tamagui's style-object engine as `line-height: 1.12px`,
 * collapsing the heading line box and making the text appear to overlap
 * the sticky brandmark in the header.
 *
 * The fix: pass the multiplier via the dedicated `lineHeight` prop
 * (or a Tamagui token), not inside `style={{}}`. We lock the fix in
 * here with a static-analysis test so a future refactor cannot silently
 * re-introduce the pattern.
 */
const pageSource = readFileSync(resolve(__dirname, 'page.tsx'), 'utf8');

describe('Dashboard page: lineHeight usage', () => {
  it('does not use the broken `style={{ lineHeight: <number> }}` pattern', () => {
    // Match: style={{ lineHeight: <digits-or-decimal> }}
    // We do not match string literals like `lineHeight: '1.12'` because
    // those are CSS-spec compliant (unitless multiplier is preserved).
    const buggyPattern = /style\s*=\s*\{\s*\{\s*lineHeight\s*:\s*\d+(\.\d+)?\s*\}\s*\}/;
    expect(pageSource).not.toMatch(buggyPattern);
  });

  it('uses the lineHeightHeading token on the hero heading', () => {
    // The heading "Oi, {firstName}, vamos montar uma aula nova?" must
    // reference the centralized multiplier. We assert the token name
    // appears adjacent to the heading markup.
    const headingIdx = pageSource.indexOf('Oi, {firstName}');
    expect(headingIdx).toBeGreaterThan(-1);
    const window = pageSource.slice(headingIdx - 200, headingIdx);
    expect(window).toContain('lineHeightHeading');
  });

  it('uses the lineHeightCardTitle token on the course card title', () => {
    const cardTitleIdx = pageSource.indexOf('{c.title}');
    expect(cardTitleIdx).toBeGreaterThan(-1);
    const window = pageSource.slice(cardTitleIdx - 200, cardTitleIdx);
    expect(window).toContain('lineHeightCardTitle');
  });

  it('imports the two lineHeight tokens from @projeto/ui', () => {
    expect(pageSource).toMatch(
      /import\s*\{[^}]*\blineHeightHeading\b[^}]*\}\s*from\s*['"]@projeto\/ui['"]/
    );
    expect(pageSource).toMatch(
      /import\s*\{[^}]*\blineHeightCardTitle\b[^}]*\}\s*from\s*['"]@projeto\/ui['"]/
    );
  });
});
