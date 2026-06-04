import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const ADMIN_SRC = resolve(ROOT, 'apps/admin/src');
const STUDENT_SRC = resolve(ROOT, 'apps/student/src');
const STUDENT_APP = resolve(ROOT, 'apps/student/App.tsx');

let exitCode = 0;

function fail(rule: string, file: string, detail?: string) {
  console.error(`❌ [${rule}] ${file}${detail ? ` — ${detail}` : ''}`);
  exitCode = 1;
}

function pass(rule: string, detail: string) {
  console.log(`✅ [${rule}] ${detail}`);
}

function grepFiles(pattern: string, paths: string[], include?: string): string[] {
  const ext = include ? ` --include="${include}"` : '';
  try {
    const out = execSync(
      `grep -rn "${pattern}" ${paths.join(' ')}${ext} --color=never 2>/dev/null || true`,
      { encoding: 'utf-8', cwd: ROOT }
    );
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// ── Rule 1: No direct lucide imports in apps ────────────────────────────────
const lucideAdmin = grepFiles(
  "from ['\"]lucide-react['\"]",
  [ADMIN_SRC],
  '*.tsx'
);
if (lucideAdmin.length > 0) {
  lucideAdmin.forEach((line) => fail('NO_LUCIDE_DIRECT', 'apps/admin/src', line.trim()));
} else {
  pass('NO_LUCIDE_DIRECT', 'No direct lucide-react imports in admin');
}

const lucideStudent = grepFiles(
  "from ['\"]lucide-react-native['\"]",
  [STUDENT_SRC, STUDENT_APP],
  '*.tsx'
);
if (lucideStudent.length > 0) {
  lucideStudent.forEach((line) => fail('NO_LUCIDE_DIRECT', 'apps/student', line.trim()));
} else {
  pass('NO_LUCIDE_DIRECT', 'No direct lucide-react-native imports in student');
}

// ── Rule 2: No StyleSheet.create() in student app ──────────────────────────
const stylesheet = grepFiles(
  'StyleSheet\\.create\\(',
  [STUDENT_SRC, STUDENT_APP],
  '*.tsx'
);
if (stylesheet.length > 0) {
  stylesheet.forEach((line) => fail('NO_STYLESHEET', 'apps/student', line.trim()));
} else {
  pass('NO_STYLESHEET', 'No StyleSheet.create() in student');
}

// ── Rule 3: No native HTML tags in components (admin) ──────────────────────
// Allow <div> in canvas-area and sidebar contexts, but flag in component files
const htmlTags = grepFiles(
  '<(div|span|button|p|h[1-6])[\\s>]',
  [ADMIN_SRC],
  '*.tsx'
);
// Filter out known canvas/sidebar container files
const allowedFiles = ['EditorCanvas.tsx', 'BlockPalette.tsx', 'BlockSettings.tsx', 'PositionPanel.tsx', 'EditorHeader.tsx'];
const violations = htmlTags.filter((line) => {
  const file = line.split(':')[0];
  const fileName = file.split('/').pop() || '';
  return !allowedFiles.includes(fileName);
});
if (violations.length > 0) {
  violations.forEach((line) => fail('NO_HTML_TAGS', line.trim()));
} else {
  pass('NO_HTML_TAGS', 'No native HTML tags in new components');
}

// ── Rule 4: No hardcoded hex colors in student ─────────────────────────────
const hexColors = grepFiles(
  "#[0-9a-fA-F]{3,8}",
  [STUDENT_SRC, STUDENT_APP],
  '*.tsx'
);
if (hexColors.length > 0) {
  hexColors.forEach((line) => fail('NO_HARDCODED_COLORS', line.trim()));
} else {
  pass('NO_HARDCODED_COLORS', 'No hardcoded hex colors in student');
}

console.log('');
if (exitCode === 0) {
  console.log('✅ All UI governance rules pass.');
} else {
  console.log(`❌ ${exitCode} UI governance violation(s) found.`);
}

process.exit(exitCode);
