import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const STUDENT_SRC = join(__dirname, '..');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  'arch',
]);

const BANNED_IMPORT_PATTERNS = [
  /import\s*\{\s*[^}]*\bsupabase\b[^}]*\}\s*from\s+['"]@projeto\/core['"]/,
  /import\s+\bsupabase\b\s+from\s+['"]@projeto\/core['"]/,
  /const\s*\{\s*[^}]*\bsupabase\b[^}]*\}\s*=\s*await\s+import\(['"]@projeto\/core['"]\)/,
];

const BANNED_CALL_PATTERNS = [
  /\bsupabase\.from\(\s*['"]/,
  /\bsupabase\.storage\b/,
  /\bsupabase\.channel\(/,
  /\bsupabase\.auth\b/,
];

function getAllTsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        files.push(...getAllTsFiles(fullPath));
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Arch: Proibido acoplamento direto ao Supabase no Student App', () => {
  const files = getAllTsFiles(STUDENT_SRC);
  const violations: { file: string; line: number; content: string }[] = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relPath = filePath.replace(STUDENT_SRC, 'src');

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];

      for (const pattern of BANNED_IMPORT_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({ file: relPath, line: lineNumber, content: line.trim() });
        }
      }

      if (line.includes('supabase')) {
        for (const pattern of BANNED_CALL_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({ file: relPath, line: lineNumber, content: line.trim() });
          }
        }
      }
    }
  }

  it('no Student App file should import or call supabase directly', () => {
    if (violations.length > 0) {
      const details = violations.map((v) => `  ❌ ${v.file}:${v.line}  →  ${v.content}`).join('\n');
      expect.fail(
        `Found ${violations.length} Supabase coupling violation(s).\n` +
          `Use Services (CourseService, LessonService, AuthService, StorageService) instead of accessing the client directly.\n\n${details}`,
      );
    }
  });
});
