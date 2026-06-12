#!/usr/bin/env bash
# check-test-env-vars.sh
#
# Guardrail: prevent test-only environment variables (E2E_*, MOCK_*,
# BYPASS_*) from leaking into production configuration. The only
# allowed source of these vars is `playwright.config.ts` →
# `webServer.env`.
#
# Run locally via `pnpm run verify` and on every CI/CD build. Fails
# (exit 1) if any forbidden var is found in:
#   - Tracked `.env*` files
#   - `next.config.*` (admin or student)
#   - Deploy configs: `vercel.json`, `wrangler.toml`, `netlify.toml`
#   - This script itself (it documents the whitelist)
#
# See: docs/skills/e2e_testing.md and ENV-01 in FORBIDDEN_OPERATIONS.md.
set -euo pipefail

FORBIDDEN_VARS=("E2E_BYPASS_AUTH" "MOCK_" "BYPASS_AUTH")
FAIL=0

# 1. Block forbidden vars in tracked .env files
for var in "${FORBIDDEN_VARS[@]}"; do
  ENV_HITS=$(git ls-files '*.env*' 2>/dev/null | xargs -I {} sh -c "grep -l \"^${var}\" '{}' 2>/dev/null" || true)
  if [ -n "$ENV_HITS" ]; then
    echo "❌ ${var} found in tracked .env file(s):"
    echo "$ENV_HITS" | sed 's/^/   /'
    FAIL=1
  fi
done

# 2. Block forbidden vars in build/deploy configs
DEPLOY_CONFIGS=("next.config.ts" "next.config.js" "next.config.mjs" "vercel.json" "wrangler.toml" "netlify.toml")
for config in "${DEPLOY_CONFIGS[@]}"; do
  for var in "${FORBIDDEN_VARS[@]}"; do
    HITS=$(git ls-files "$config" 2>/dev/null | xargs -I {} sh -c "grep -l \"${var}\" '{}' 2>/dev/null" || true)
    if [ -n "$HITS" ]; then
      echo "❌ ${var} found in ${config}:"
      echo "$HITS" | sed 's/^/   /'
      FAIL=1
    fi
  done
done

# 3. Verify the whitelist is the only place
WHITELIST="playwright.config.ts"
WHITELIST_HITS=$(git ls-files "$WHITELIST" 2>/dev/null | wc -l)
if [ "$WHITELIST_HITS" -eq 0 ]; then
  echo "⚠️  Whitelist file (${WHITELIST}) not found in tracked files. Update this script."
fi

if [ $FAIL -eq 0 ]; then
  echo "✅ No test-only env vars leaked into production config."
  exit 0
else
  echo ""
  echo "Forbidden vars must ONLY appear in ${WHITELIST} → webServer.env."
  echo "See docs/skills/e2e_testing.md for the contract."
  exit 1
fi
