import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Boundary contract for EditorCanvas (SDR-001).
 *
 * The lesson editor and the certificate editor are physically isolated.
 * EditorCanvas is a LESSON-ONLY component. It must NEVER carry
 * `mode === 'certificate'` branching, never import certificate-specific
 * renderers, and never accept certificate-only state from EditorContext.
 *
 * The certificate route renders CertificateEditor (which uses
 * CertificateCanvas from apps/admin/src/components/certificate-editor/).
 * The legacy `?mode=certificate` query is redirected (HTTP 308) to
 * the dedicated route by next.config.ts before React hydrates, so the
 * `mode === 'certificate'` branch in EditorCanvas is unreachable code.
 *
 * This test enforces the boundary at the source level.
 */
const SOURCE_PATH = join(__dirname, 'EditorCanvas.tsx');
const SOURCE = readFileSync(SOURCE_PATH, 'utf-8');

describe('EditorCanvas boundary (SDR-001)', () => {
  it('does NOT contain the "isCertMode" branching pattern', () => {
    expect(SOURCE).not.toContain('isCertMode');
  });

  it('does NOT import CertificateBlockRenderer (cert-only renderer)', () => {
    expect(SOURCE).not.toContain('CertificateBlockRenderer');
  });

  it('does NOT use the term "certificate" in any conditional branch', () => {
    expect(SOURCE).not.toMatch(/mode\s*===\s*['"]certificate['"]/);
  });

  it('does NOT destructure certificate-only fields from useEditor', () => {
    expect(SOURCE).not.toContain('certDesignWidth');
    expect(SOURCE).not.toContain('certDesignHeight');
    expect(SOURCE).not.toContain('certDesignChosen');
    expect(SOURCE).not.toContain('setCertDesignSize');
    expect(SOURCE).not.toContain('certIsDoubleSided');
  });
});
