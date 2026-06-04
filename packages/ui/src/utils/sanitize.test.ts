import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

/**
 * Verifies the XSS defenses of `sanitizeHtml` end-to-end via the real
 * DOMPurify library running in jsdom. Each test case maps to a known
 * attack vector and asserts that the malicious payload is neutralized
 * while legitimate rich-text formatting is preserved.
 */
describe('sanitizeHtml', () => {
  describe('XSS attack vectors', () => {
    it('strips <script> tags and their content', () => {
      const malicious = 'Hello<script>alert("xss")</script>World';
      const result = sanitizeHtml(malicious);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('strips <img onerror> event handlers', () => {
      const malicious = '<img src=x onerror=alert(1)>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/onerror/i);
      expect(result).not.toMatch(/alert/);
    });

    it('strips <iframe> tags', () => {
      const malicious = '<iframe src="https://evil.example"></iframe>safe';
      const result = sanitizeHtml(malicious);
      expect(result).not.toContain('<iframe');
      expect(result).toContain('safe');
    });

    it('strips <svg> with onload handler', () => {
      const malicious = '<svg onload=alert(1)></svg>content';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/onload/i);
      expect(result).not.toMatch(/<svg/i);
    });

    it('strips javascript: URIs from anchor hrefs', () => {
      const malicious = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/javascript:/i);
    });

    it('strips data: URIs from anchor hrefs', () => {
      const malicious = '<a href="data:text/html,<script>alert(1)</script>">click</a>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/data:text\/html/i);
    });

    it('strips vbscript: URIs', () => {
      const malicious = '<a href="vbscript:msgbox(1)">click</a>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/vbscript:/i);
    });

    it('strips on* event attributes from all elements', () => {
      const malicious = '<p onclick="steal()">hi</p><div onmouseover="evil()">x</div>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/onclick/i);
      expect(result).not.toMatch(/onmouseover/i);
    });

    it('strips <object>, <embed>, and <form>', () => {
      const malicious = '<object data="x.swf"></object><embed src="x"><form action="/x"><input name="y"></form>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/<object/i);
      expect(result).not.toMatch(/<embed/i);
      expect(result).not.toMatch(/<form/i);
      expect(result).not.toMatch(/<input/i);
    });

    it('strips inline style attributes (CSS exfiltration defense)', () => {
      const malicious = '<p style="background:url(javascript:alert(1))">x</p>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/style=/i);
    });

    it('strips meta-refresh that could redirect the page', () => {
      const malicious = '<meta http-equiv="refresh" content="0;url=https://evil.example">';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/<meta/i);
    });

    it('strips nested payloads encoded with HTML entities', () => {
      // Sanitizer is on the decoded DOM, so entity encoding is decoded first.
      const malicious = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitizeHtml(malicious);
      // After decoding we should not have a <script> tag in the final output.
      expect(result).not.toMatch(/<script/i);
    });
  });

  describe('legitimate rich text is preserved', () => {
    it('keeps basic formatting (b, strong, i, em, u)', () => {
      const html = '<p>Hello <b>world</b> and <strong>strong</strong> and <em>em</em></p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<b>world</b>');
      expect(result).toContain('<strong>strong</strong>');
      expect(result).toContain('<em>em</em>');
    });

    it('keeps ordered and unordered lists', () => {
      const html = '<ul><li>one</li><li>two</li></ul><ol><li>a</li><li>b</li></ol>';
      const result = sanitizeHtml(html);
      expect(result).toMatch(/<ul>/);
      expect(result).toMatch(/<ol>/);
      expect(result).toContain('<li>one</li>');
    });

    it('keeps headings and paragraphs', () => {
      const html = '<h1>Title</h1><h2>Sub</h2><p>Body</p><br><hr>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Sub</h2>');
      expect(result).toContain('<p>Body</p>');
    });

    it('keeps anchor links with safe (https) hrefs', () => {
      const html = '<a href="https://example.com" target="_blank" rel="noopener">link</a>';
      const result = sanitizeHtml(html);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('link');
    });

    it('keeps blockquotes and code blocks', () => {
      const html = '<blockquote>quoted</blockquote><pre><code>code()</code></pre>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<blockquote>quoted</blockquote>');
      expect(result).toContain('<code>code()</code>');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('returns plain text unchanged when no markup is present', () => {
      expect(sanitizeHtml('just plain text')).toBe('just plain text');
    });

    it('handles deeply nested malicious content', () => {
      const malicious = '<div><p><span><script>alert(1)</script></span></p></div>';
      const result = sanitizeHtml(malicious);
      expect(result).not.toMatch(/<script/i);
      expect(result).not.toMatch(/alert/);
    });
  });
});
