#!/usr/bin/env bash
# scripts/install-hooks.sh — activate ai-draw's git hooks in this clone.
#
# Idempotent. Re-running just confirms the config.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git config core.hooksPath scripts/git-hooks
chmod +x scripts/git-hooks/* 2>/dev/null || true

echo "✓ Git hooks active in this clone"
echo "  core.hooksPath = scripts/git-hooks"
echo ""
echo "Hooks installed:"
ls scripts/git-hooks/ | sed 's/^/  - /'
echo ""
echo "Bypass any hook for a single push: git push --no-verify"
echo "Uninstall: git config --unset core.hooksPath"
