import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../ui/src/utils/sanitize';

/**
 * Unit tests for the XSS sanitizer used by BlockRenderer and the student
 * lesson player. Validates that the security contract holds across the
 * full taxonomy of CMS-injection attack vectors.
 *
 * `sanitizeHtml` is the single chokepoint for all dynamic HTML produced by
 * the CMS before it reaches the DOM via `dangerouslySetInnerHTML`. These
 * tests assert the security guarantees the BlockRenderer depends on.
 *
 * The sanitizer is imported directly from its source file (not via the
 * package barrel) to avoid pulling in the Tamagui SSR dependency chain,
 * which fails to parse in Vitest 1.6.1's SSR transform. The security
 * contract under test is the sanitizer's, not BlockRenderer's; the same
 * guarantees apply when BlockRenderer invokes sanitizeHtml at runtime.
 */
describe('sanitizeHtml — XSS defenses', () => {
  it('renders <script> payloads as inert text', () => {
    const safe = sanitizeHtml('Hello<script>window.__pwned = true</script>World');
    expect(safe).not.toContain('<script');
    expect(safe).not.toContain('__pwned');
    expect(safe).toContain('Hello');
    expect(safe).toContain('World');
  });

  it('renders <img onerror> payloads without the event handler', () => {
    const safe = sanitizeHtml('<img src=x onerror=alert(1)>');
    expect(safe).not.toMatch(/onerror/i);
    expect(safe).not.toMatch(/alert/);
  });

  it('renders <iframe> payloads as inert text', () => {
    const safe = sanitizeHtml('<iframe src="https://evil.example"></iframe>safe');
    expect(safe).not.toContain('<iframe');
    expect(safe).toContain('safe');
  });

  it('renders <svg onload> payloads without the event handler', () => {
    const safe = sanitizeHtml('<svg onload=alert(1)></svg>content');
    expect(safe).not.toMatch(/onload/i);
    expect(safe).not.toMatch(/<svg/i);
  });

  it('strips javascript: URIs from anchor hrefs', () => {
    const safe = sanitizeHtml('<a href="javascript:alert(1)">click me</a>');
    expect(safe).not.toMatch(/javascript:/i);
    expect(safe).toContain('click me');
  });

  it('strips data:text/html URIs from anchor hrefs', () => {
    const safe = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    expect(safe).not.toMatch(/data:text\/html/i);
  });

  it('preserves safe rich-text formatting (b, i, a with https)', () => {
    const safe = sanitizeHtml('<p>Read <b>this</b> and <a href="https://example.com">visit</a></p>');
    expect(safe).toContain('<b>this</b>');
    expect(safe).toContain('href="https://example.com"');
    expect(safe).toContain('visit');
  });

  it('strips style attributes to prevent CSS exfiltration', () => {
    const safe = sanitizeHtml('<p style="background:url(javascript:alert(1))">text</p>');
    expect(safe).not.toMatch(/style=/i);
    expect(safe).toContain('text');
  });

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('handles plain text without HTML', () => {
    const safe = sanitizeHtml('Just plain text, no markup here.');
    expect(safe).toBe('Just plain text, no markup here.');
  });
});
