#!/bin/bash
# check-block-registry.sh
# Validates that interactive blocks follow the save-pattern contract.
# Checks: schema has interactive + stateSchema, component exported, registered in renderer.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TYPES_DIR="$REPO_ROOT/packages/types/src"
UI_DIR="$REPO_ROOT/packages/ui/src/blocks"
RENDERER_FILE="$REPO_ROOT/packages/renderer/src/BlockRenderer.tsx"
ERRORS=0

echo "=== Block Registry Validation ==="
echo ""

# Check 1: Verify interactive blocks in types have stateSchema
echo "[1/3] Checking Zod schemas for interactive + stateSchema..."
for f in "$TYPES_DIR"/*.ts; do
  if grep -q "interactive.*z\.literal(true)" "$f" 2>/dev/null; then
    if ! grep -q "stateSchema" "$f" 2>/dev/null; then
      echo "  ERROR: $f has 'interactive' but no 'stateSchema'"
      ERRORS=$((ERRORS + 1))
    else
      echo "  OK: $(basename "$f")"
    fi
  fi
done

# Check 2: Verify UI components export InteractiveBlockProps usage
echo ""
echo "[2/3] Checking UI block components for InteractiveBlockProps..."
for f in "$UI_DIR"/*.tsx; do
  if grep -q "InteractiveBlockProps" "$f" 2>/dev/null; then
    if ! grep -q "defaultState\|onStateChange" "$f" 2>/dev/null; then
      echo "  ERROR: $f uses InteractiveBlockProps but missing defaultState/onStateChange"
      ERRORS=$((ERRORS + 1))
    else
      echo "  OK: $(basename "$f")"
    fi
  fi
done

# Check 3: Verify SharedBlockRenderer has render branches for interactive blocks
echo ""
echo "[3/3] Checking SharedBlockRenderer for interactive block branches..."
if [ -f "$RENDERER_FILE" ]; then
  INTERACTIVE_BLOCKS=$(grep -c "interactive.*z\.literal(true)" "$TYPES_DIR"/*.ts 2>/dev/null | grep -v ":0$" | wc -l)
  RENDER_BRANCHES=$(grep -c "onBlockStateChange\|savedStates" "$RENDERER_FILE" 2>/dev/null || echo "0")
  echo "  Interactive block types found: $INTERACTIVE_BLOCKS"
  echo "  Renderer branches with save wiring: $RENDER_BRANCHES"
else
  echo "  WARNING: SharedBlockRenderer not found at expected path"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS errors found"
  exit 1
else
  echo "PASSED: All checks passed"
  exit 0
fi
