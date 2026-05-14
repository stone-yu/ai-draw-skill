#!/usr/bin/env bash
# scripts/render-all.sh — render every example × every diagram theme to PNG.
# Intended for a human eyeball pass before tagging a release.
#
# Output: test-output/<example-name>/<theme-name>.png
#
# Note: examples reference assets via ../../../assets/, so the swapped HTML
# must be rendered IN the example's original directory (not in test-output/)
# for relative paths to resolve. The work file is then cleaned up after.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/test-output"
THEMES=(tech-dark blueprint business-clean saas-modern glassmorphism linear-mode neo-brutalism xhs-soft cyberpunk-neon minimal-light academic-paper hand-drawn)

mkdir -p "$OUT"
EXAMPLES=$(find "$ROOT/diagrams" -name '*.html' -path '*/examples/*' -not -name '_*')

for example in $EXAMPLES; do
  name=$(basename "$example" .html)
  ex_dir="$(dirname "$example")"
  work_dir="$OUT/$name"
  mkdir -p "$work_dir"
  echo "=== $name ==="
  for theme in "${THEMES[@]}"; do
    work_html="$ex_dir/_render-all-${theme}.html"
    sed -E "s|themes-diagram/[a-z0-9-]+\.css|themes-diagram/${theme}.css|g" "$example" > "$work_html"
    bash "$ROOT/scripts/render.sh" "$work_html" 1 "$ex_dir/_png" >/dev/null 2>&1 || {
      echo "  ✗ $theme"
      rm -f "$work_html"
      continue
    }
    mv "$ex_dir/_png/single.png" "$work_dir/${theme}.png"
    rm -rf "$ex_dir/_png" "$work_html"
    echo "  ✓ $theme"
  done
done

echo
echo "Done. Eyeball pass: open test-output/<name>/<theme>.png and look for visual breaks."
