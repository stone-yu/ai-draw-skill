#!/usr/bin/env bash
# scripts/render.sh — render an HTML file (or each slide of a deck) to PNG via headless Chrome.
#
# Usage:
#   ./scripts/render.sh <path-to-index.html> [slide-count] [out-dir]
#
# If slide-count > 1, calls Chrome N times with #/1, #/2, ... appended to the URL.
# Output: <out-dir>/slide-1.png ... slide-N.png  (or single.png if slide-count=1)

set -euo pipefail

INPUT="${1:?Usage: $0 <html> [slide-count] [out-dir]}"
COUNT="${2:-1}"
OUT_DIR="${3:-$(dirname "$INPUT")/png}"

# Find Chrome binary
CHROME=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "$(command -v google-chrome 2>/dev/null)" \
  "$(command -v chromium 2>/dev/null)" \
  "$(command -v chrome 2>/dev/null)"
do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then CHROME="$candidate"; break; fi
done
[ -n "$CHROME" ] || { echo "❌ Chrome / Chromium not found" >&2; exit 1; }

mkdir -p "$OUT_DIR"
ABS_INPUT="$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")"

if [ "$COUNT" -le 1 ]; then
  "$CHROME" --headless --no-sandbox --hide-scrollbars --window-size=1600,1000 \
    --screenshot="$OUT_DIR/single.png" "file://$ABS_INPUT"
  echo "→ $OUT_DIR/single.png"
else
  for i in $(seq 1 "$COUNT"); do
    "$CHROME" --headless --no-sandbox --hide-scrollbars --window-size=1600,1000 \
      --screenshot="$OUT_DIR/slide-$i.png" "file://$ABS_INPUT#/$i"
    echo "→ $OUT_DIR/slide-$i.png"
  done
fi
