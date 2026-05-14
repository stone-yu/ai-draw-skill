#!/usr/bin/env bash
# scripts/render-previews.sh — render one canonical example × all 12 diagram themes,
# producing docs/theme-previews/<theme>.png for README thumbnails.
#
# Usage: ./scripts/render-previews.sh
#
# Works by sed-swapping the <link id="theme-link"> href in-place (in examples/
# dir so relative ../../../assets/ paths still resolve), rendering via Chrome
# headless, then moving the PNG to docs/theme-previews/.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="$ROOT/diagrams/architecture/examples/three-tier-ecommerce.html"
EX_DIR="$(dirname "$EXAMPLE")"
OUT_DIR="$ROOT/docs/theme-previews"
THEMES=(tech-dark blueprint business-clean saas-modern glassmorphism linear-mode neo-brutalism xhs-soft cyberpunk-neon minimal-light academic-paper hand-drawn)

[ -f "$EXAMPLE" ] || { echo "❌ $EXAMPLE not found"; exit 1; }
mkdir -p "$OUT_DIR"

for theme in "${THEMES[@]}"; do
  work_html="$EX_DIR/_preview-${theme}.html"
  # Replace the theme-link href on its line
  sed -E "s|themes-diagram/[a-z0-9-]+\.css|themes-diagram/${theme}.css|g" "$EXAMPLE" > "$work_html"
  # Render to a temp dir alongside the html
  bash "$ROOT/scripts/render.sh" "$work_html" 1 "$EX_DIR/_png" >/dev/null 2>&1 || {
    echo "  ✗ $theme (render failed)"
    rm -f "$work_html"
    continue
  }
  mv "$EX_DIR/_png/single.png" "$OUT_DIR/${theme}.png"
  rm -rf "$EX_DIR/_png" "$work_html"
  printf "  ✓ %-20s → docs/theme-previews/%s.png\n" "$theme" "$theme"
done

echo ""
echo "Done. $(ls "$OUT_DIR" | wc -l | tr -d ' ') previews in docs/theme-previews/"
