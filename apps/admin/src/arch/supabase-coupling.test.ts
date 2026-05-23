import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const APPS_DIR = join(__dirname, '..', '..', '..', '..', 'apps');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  '.expo',
]);

const EXCLUDED_FILES = new Set([
  join('admin', 'src', 'lib', 'supabase-client.ts'),
  join('admin', 'src', 'lib', 'supabase-server.ts'),
  join('admin', 'src', 'lib', 'supabase-middleware.ts'),
  join('admin', 'src', 'middleware.ts'),
  join('admin', 'src', 'arch', 'supabase-coupling.test.ts'),
]);

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

function getRelativePath(filePath: string): string {
  const appsIdx = filePath.indexOf(join('apps', ''));
  if (appsIdx === -1) return filePath;
  return filePath.slice(appsIdx);
}

const BANNED_IMPORT_PATTERNS = [
  /import\s*\{\s*[^}]*\bsupabase\b[^}]*\}\s*from\s+['"]@projeto\/core['"]/,
  /import\s+\bsupabase\b\s+from\s+['"]@projeto\/core['"]/,
  /const\s*\{\s*[^}]*\bsupabase\b[^}]*\}\s*=\s*await\s+import\(['"]@projeto\/core['"]\)/,
];

const BANNED_CALL_PATTERNS = [
  /\bsupabase\.from\(\s*['"]/,
  /\bsupabase\.storage\b/,
  /\bsupabase\.channel\(/,
];

describe('Arch: Proibido acoplamento direto ao Supabase no frontend', () => {
  const files = getAllTsFiles(APPS_DIR);
  const violations: { file: string; line: number; content: string }[] = [];

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    if (EXCLUDED_FILES.has(relPath)) continue;

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];

      // Check banned imports
      for (const pattern of BANNED_IMPORT_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            file: relPath,
            line: lineNumber,
            content: line.trim(),
          });
        }
      }

      // Check banned calls (only if supabase is accessible)
      if (line.includes('supabase')) {
        for (const pattern of BANNED_CALL_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: relPath,
              line: lineNumber,
              content: line.trim(),
            });
          }
        }
      }
    }
  }

  it('nenhum arquivo do frontend deve importar ou chamar supabase diretamente', () => {
    const violationCount = violations.length;

    if (violationCount > 0) {
      const details = violations
        .map(
          (v) =>
            `  ❌ ${v.file}:${v.line}  →  ${v.content}`,
        )
        .join('\n');

      expect.fail(
        `Foram encontradas ${violationCount} violação(ões) de acoplamento ao Supabase.\n` +
          `Use os Services (CourseService, LessonService, AuthService, StorageService) em vez de acessar supabase diretamente.\n\n${details}`,
      );
    }
  });
});
