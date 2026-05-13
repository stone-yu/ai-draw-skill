#!/usr/bin/env bash
# scripts/check-themes.sh — confirm every theme overrides every base.css token.
# Exits non-zero if any theme is missing any token (CI gating).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$ROOT/assets/base.css"
THEMES_DIR="$ROOT/assets/themes"

[ -f "$BASE" ] || { echo "❌ $BASE not found"; exit 1; }
[ -d "$THEMES_DIR" ] || { echo "❌ $THEMES_DIR not found"; exit 1; }

# Extract token names from base.css declarations only (not from var() refs).
# A declaration looks like:  --foo-bar: value;
BASE_VARS=$(grep -oE -- '^[[:space:]]*--[a-z0-9-]+:' "$BASE" | sed 's/[[:space:]]//g; s/://g' | sort -u)

EXIT=0
for theme in "$THEMES_DIR"/*.css; do
  MISSING=""
  for v in $BASE_VARS; do
    grep -qE -- "^[[:space:]]*${v}:" "$theme" || MISSING="$MISSING $v"
  done
  if [ -n "$MISSING" ]; then
    printf "❌ %s missing:%s\n" "$(basename "$theme")" "$MISSING"
    EXIT=1
  else
    printf "✅ %s\n" "$(basename "$theme")"
  fi
done

exit $EXIT
