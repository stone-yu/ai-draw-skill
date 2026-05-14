#!/usr/bin/env bash
# scripts/new.sh — scaffold ./ai-draw-out/<name>/ in the user's CWD.
#
# Usage:
#   ./scripts/new.sh <safe-name-with-theme>
#
# Effect:
#   - mkdir ./ai-draw-out/<name>/
#   - touch ./ai-draw-out/<name>/{index.html,README.md}  (empty stubs; the agent fills them)
#   - print a JSON summary the caller (any agent) can parse:
#       {"path": "./ai-draw-out/<name>", "tag": "<git-tag-or-main>"}

set -euo pipefail

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "Usage: $0 <name>" >&2
  exit 1
fi

# Sanitize name: keep CJK, alphanumerics, dash, underscore, dot
SAFE_NAME=$(echo "$NAME" | tr -d '/\\:*?"<>|')

OUT_DIR="./ai-draw-out/$SAFE_NAME"
mkdir -p "$OUT_DIR"
[ -f "$OUT_DIR/index.html" ] || : > "$OUT_DIR/index.html"
[ -f "$OUT_DIR/README.md"  ] || : > "$OUT_DIR/README.md"

# Detect Skill repo's current git tag (for jsdelivr URL substitution)
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if TAG=$(git -C "$SKILL_DIR" describe --tags --abbrev=0 2>/dev/null); then :; else TAG="main"; fi

printf '{"path": "%s", "tag": "%s"}\n' "$OUT_DIR" "$TAG"
