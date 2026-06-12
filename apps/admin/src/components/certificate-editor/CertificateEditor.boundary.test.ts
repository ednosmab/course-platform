import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE_PATH = join(__dirname, 'CertificateEditor.tsx');
const SOURCE = readFileSync(SOURCE_PATH, 'utf-8');

describe('CertificateEditor boundary (SDR-001)', () => {
  it('does NOT import BlockPalette (lesson-only component)', () => {
    expect(SOURCE).not.toContain('BlockPalette');
  });

  it('does NOT import EditorCanvas (lesson-only component)', () => {
    expect(SOURCE).not.toContain('EditorCanvas');
  });

  it('imports CertificatePalette instead of BlockPalette', () => {
    expect(SOURCE).toContain('CertificatePalette');
  });

  it('imports CertificateCanvas instead of EditorCanvas', () => {
    expect(SOURCE).toContain('CertificateCanvas');
  });

  it('passes certIsDoubleSided to CertificateCanvas as isDoubleSided', () => {
    expect(SOURCE).toContain('isDoubleSided={certIsDoubleSided}');
  });

  it('passes activeSide to CertificateCanvas', () => {
    expect(SOURCE).toContain('activeSide={activeSide}');
  });

  it('configures EditorProvider with createCertificateModeConfig (mode implicit via modeConfig)', () => {
    expect(SOURCE).toContain('createCertificateModeConfig');
    expect(SOURCE).toContain('modeConfig={certConfig}');
    expect(SOURCE).not.toContain('mode="certificate"');
  });
});
