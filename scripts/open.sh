#!/usr/bin/env bash
# scripts/open.sh — cross-platform "open a file/URL/dir in the default app".
#
# Usage:
#   ./scripts/open.sh <path-or-url>
#
# Resolves to:
#   - macOS:   open <target>
#   - Linux:   xdg-open <target>   (fallback: gnome-open, kde-open, sensible-browser)
#   - Windows / WSL: cmd.exe /c start <target>
#
# Honors AI_DRAW_NO_OPEN=1 — exits 0 silently. Lets callers (CI, --no-open) skip without branching.

set -euo pipefail

TARGET="${1:?Usage: $0 <path-or-url>}"

# Respect the global skip env var
if [ "${AI_DRAW_NO_OPEN:-}" = "1" ]; then
  echo "[open.sh] AI_DRAW_NO_OPEN=1 — skipping open of $TARGET" >&2
  exit 0
fi

# Resolve to absolute path if it looks like a local file (not a URL)
if [[ "$TARGET" != http://* && "$TARGET" != https://* && "$TARGET" != file://* ]]; then
  if [ -e "$TARGET" ]; then
    TARGET="$(cd "$(dirname "$TARGET")" && pwd)/$(basename "$TARGET")"
  fi
fi

case "$(uname -s)" in
  Darwin)
    open "$TARGET" ;;
  Linux)
    # Detect WSL — uses Windows host's default app
    if grep -qi microsoft /proc/version 2>/dev/null; then
      # Convert /mnt/c/... to C:\... if needed
      WINPATH="$(wslpath -w "$TARGET" 2>/dev/null || echo "$TARGET")"
      cmd.exe /c start "" "$WINPATH" 2>/dev/null || true
    elif command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$TARGET" >/dev/null 2>&1 &
    elif command -v gnome-open >/dev/null 2>&1; then
      gnome-open "$TARGET" >/dev/null 2>&1 &
    elif command -v kde-open >/dev/null 2>&1; then
      kde-open "$TARGET" >/dev/null 2>&1 &
    elif command -v sensible-browser >/dev/null 2>&1; then
      sensible-browser "$TARGET" >/dev/null 2>&1 &
    else
      echo "[open.sh] No opener found on Linux — install xdg-utils" >&2
      exit 1
    fi
    ;;
  CYGWIN*|MINGW*|MSYS*)
    cmd.exe /c start "" "$TARGET" ;;
  *)
    echo "[open.sh] Unsupported OS: $(uname -s) — open $TARGET manually" >&2
    exit 1
    ;;
esac
