#!/usr/bin/env bash
set -euo pipefail

echo "Checking React version consistency across student and shared packages..."
echo ""

ROOT=$(git rev-parse --show-toplevel)
STUDENT_REACT="19.1.0"
STUDENT_DOM="19.1.0"
HAS_ERROR=0

check_pinned() {
  local pkg="$1"
  local file="$2"
  local react_ver dom_ver
  react_ver=$(node -e "const p=require('${file}');console.log(p.dependencies?.react||p.devDependencies?.react||'')" 2>/dev/null || true)
  dom_ver=$(node -e "const p=require('${file}');console.log(p.dependencies?.['react-dom']||p.devDependencies?.['react-dom']||'')" 2>/dev/null || true)
  local expected_r="$STUDENT_REACT"
  local expected_d="$STUDENT_DOM"
  if [ -n "$react_ver" ] && [ "$react_ver" != "$expected_r" ]; then
    echo "❌ ${pkg}: react@${react_ver} (esperado ${expected_r})"
    HAS_ERROR=1
  fi
  if [ -n "$dom_ver" ] && [ "$dom_ver" != "$expected_d" ]; then
    echo "❌ ${pkg}: react-dom@${dom_ver} (esperado ${expected_d})"
    HAS_ERROR=1
  fi
  if [ "$HAS_ERROR" -eq 0 ]; then
    echo "✅ ${pkg}: react@${react_ver}, react-dom@${dom_ver}"
  fi
}

check_pinned "root" "${ROOT}/package.json"
check_pinned "admin" "${ROOT}/apps/admin/package.json"
check_pinned "student" "${ROOT}/apps/student/package.json"
check_pinned "ui" "${ROOT}/packages/ui/package.json"

echo ""
if [ "$HAS_ERROR" -eq 0 ]; then
  echo "✅ Todas as dependências React estão consistentes (react@${STUDENT_REACT})"
else
  echo "⚠️  Inconsistências encontradas."
  echo "   Todos os pacotes devem usar react@${STUDENT_REACT} e react-dom@${STUDENT_DOM}"
  exit 1
fi
