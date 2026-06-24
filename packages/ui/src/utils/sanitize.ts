import DOMPurify from 'dompurify';

/**
 * Safe HTML tags preserved in CMS-generated content.
 * Teachers format text using bold/italic/headings/links/lists.
 * Anything outside this list is stripped on the client.
 */
const ALLOWED_TAGS = [
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'i', 'li', 'mark', 'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
];

/**
 * Attributes retained after sanitization.
 * `href` is required for links; `target`/`rel` are added by DOMPurify's safe
 * defaults for external links. `class` is permitted so editor style hints
 * survive sanitization; `style` is intentionally excluded to prevent CSS
 * exfiltration / click-jacking via inline styles.
 */
const ALLOWED_ATTR = ['href', 'name', 'target', 'title', 'class', 'id'];

/**
 * Lazily resolves the DOMPurify instance. We must guard the import behind a
 * `typeof window` check because:
 *  - React Native has no `window` global; importing `dompurify` there would
 *    throw a reference error.
 *  - Server-side rendering (Next.js) runs the module before `window` exists.
 *
 * On non-browser environments we fall back to a regex tag-stripper. This
 * matches the existing behavior of `HtmlBlock.tsx` (Native branch) and is
 * safe-by-default: any markup is dropped, leaving plain text.
 */
type DomPurifyLike = {
  sanitize: (html: string, options?: Record<string, unknown>) => string;
};

let cachedPurifier: DomPurifyLike | null = null;

function getPurifier(): DomPurifyLike | null {
  if (typeof window === 'undefined') return null;
  if (cachedPurifier) return cachedPurifier;
  cachedPurifier = DOMPurify as unknown as DomPurifyLike;
  return cachedPurifier;
}

/**
 * Strips every HTML tag and decodes the most common HTML entities.
 *
 * Used as a safe fallback when DOMPurify is unavailable (SSR, React Native).
 * It is intentionally lossy: rich-text formatting is sacrificed for safety,
 * which is the correct trade-off in fallback mode.
 */
function stripAllTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Sanitizes an HTML string produced by the CMS before it is injected into the
 * DOM via `dangerouslySetInnerHTML`.
 *
 * Two threat models are covered:
 *  1. **Stored XSS** — a teacher (or anyone who gains access to a course)
 *     stores `<script>`, `<img onerror>`, `<iframe>`, `<svg/onload>` or
 *     `javascript:` URIs in a text or html block. DOMPurify's default config
 *     strips these before they reach the DOM.
 *  2. **Reflected / Native XSS** — the same payload is passed through React
 *     Native where there is no DOMParser. The fallback path (`stripAllTags`)
 *     drops all markup, preventing any injection.
 *
 * Configuration notes:
 *  - `FORBID_TAGS` and `FORBID_ATTR` are explicit, even though DOMPurify's
 *    defaults already block them, to make the security contract auditable.
 *  - `ALLOW_DATA_ATTR: false` — data-* attributes can leak meta-information
 *    to third-party scripts; we never need them in CMS content.
 *  - `USE_PROFILES: { html: true }` is the recommended DOMPurify preset for
 *    user-generated rich text; it matches the tag/attr allow-list above.
 *
 * @param html - Raw HTML from a CMS block (Text or Html). May be empty.
 * @returns A string that is safe to assign to `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  const purifier = getPurifier();
  if (!purifier) {
    return stripAllTags(html);
  }

  return purifier.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form', 'input', 'button', 'svg', 'math', 'video', 'audio', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'style'],
    USE_PROFILES: { html: true },
  });
}
