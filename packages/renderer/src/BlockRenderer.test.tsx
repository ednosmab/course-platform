import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { BlockRenderer } from './BlockRenderer';
import type { AnyBlock } from '@projeto/types';

/**
 * Integration tests for the block renderer that exercise the XSS defenses
 * end-to-end. The renderer is a shared component (admin preview + student
 * lesson player), so we assert the same security guarantees for both
 * consumers.
 *
 * `renderToStaticMarkup` walks the React tree the same way the browser does
 * and produces a final HTML string. The sanitizer runs synchronously during
 * render, so we can inspect the resulting string for the absence of attack
 * vectors.
 */
describe('BlockRenderer — XSS defenses', () => {
  const baseTextBlock: Extract<AnyBlock, { type: 'text' }> = {
    id: 'b1',
    type: 'text',
    content: '',
    styles: {},
  };

  it('renders <script> payloads as inert text', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: 'Hello<script>window.__pwned = true</script>World',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('__pwned');
    expect(html).toContain('Hello');
    expect(html).toContain('World');
  });

  it('renders <img onerror> payloads without the event handler', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<img src=x onerror=alert(1)>',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/alert/);
  });

  it('renders <iframe> payloads as inert text', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<iframe src="https://evil.example"></iframe>safe',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toContain('<iframe');
    expect(html).toContain('safe');
  });

  it('renders <svg onload> payloads without the event handler', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<svg onload=alert(1)></svg>content',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toMatch(/onload/i);
    expect(html).not.toMatch(/<svg/i);
  });

  it('strips javascript: URIs from anchor hrefs', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<a href="javascript:alert(1)">click me</a>',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('click me');
  });

  it('strips data:text/html URIs from anchor hrefs', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<a href="data:text/html,<script>alert(1)</script>">click</a>',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).not.toMatch(/data:text\/html/i);
  });

  it('preserves safe rich-text formatting (b, i, a with https)', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: '<p>Read <b>this</b> and <a href="https://example.com">visit</a></p>',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).toContain('<b>this</b>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('visit');
  });

  it('falls back to markdown parser for plain-text content (no HTML detected)', () => {
    const block: typeof baseTextBlock = {
      ...baseTextBlock,
      content: 'Just **bold** and _italic_ here.',
    };
    const html = renderToStaticMarkup(<BlockRenderer block={block} />);
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });
});
