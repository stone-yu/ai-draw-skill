#!/usr/bin/env bash
# scripts/render-all.sh — render every example × every theme to PNG.
# Intended for a human eyeball pass before tagging a release.
#
# Output: test-output/<example-name>/<theme-name>.png

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/test-output"
THEMES=(tech-dark blueprint business-clean xhs-soft cyberpunk-neon minimal-light academic-paper hand-drawn)

mkdir -p "$OUT"
EXAMPLES=$(find "$ROOT/diagrams" -name '*.html' -path '*/examples/*')

for example in $EXAMPLES; do
  name=$(basename "$example" .html)
  echo "=== $name ==="
  for theme in "${THEMES[@]}"; do
    # Make a copy with the theme link rewritten
    work_dir="$OUT/$name"
    mkdir -p "$work_dir"
    work_html="$work_dir/_${theme}.html"
    sed "s|themes/[a-z-]*\.css|themes/${theme}.css|g" "$example" > "$work_html"
    # Render
    "$ROOT/scripts/render.sh" "$work_html" 1 "$work_dir" >/dev/null 2>&1 || { echo "  ✗ $theme"; continue; }
    mv "$work_dir/single.png" "$work_dir/${theme}.png"
    rm "$work_html"
    echo "  ✓ $theme"
  done
done

echo
echo "Done. Eyeball pass: open test-output/<name>/<theme>.png and look for visual breaks."
