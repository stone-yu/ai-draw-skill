#!/usr/bin/env bash
# scripts/list-themes.sh — list available themes with one-line descriptions.
#
# Source of truth:
#   assets/themes-diagram/*.css   (12 diagram themes)
#   assets/themes-ppt/*.css       (36 PPT themes)
#
# Descriptions parsed from references/themes.md (best-effort).
#
# Usage:
#   ./scripts/list-themes.sh                  # pretty-print all themes
#   ./scripts/list-themes.sh --mode diagram   # only 12 diagram themes
#   ./scripts/list-themes.sh --mode ppt       # only 36 PPT themes
#   ./scripts/list-themes.sh --json           # JSON output (for piping)
#   ./scripts/list-themes.sh --mode ppt --json
#   ./scripts/list-themes.sh --help

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEMES_MD="$ROOT/references/themes.md"

MODE="all"
FORMAT="pretty"

while [ $# -gt 0 ]; do
  case "$1" in
    --mode)        MODE="${2:-all}"; shift 2 ;;
    --mode=*)      MODE="${1#--mode=}"; shift ;;
    --json)        FORMAT="json"; shift ;;
    --help|-h)
      sed -n '3,15p' "$0" | sed 's/^# *//'
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

case "$MODE" in
  diagram|ppt|all) ;;
  *) echo "❌ --mode must be diagram / ppt / all (got: $MODE)" >&2; exit 1 ;;
esac

# Pull one-liner from references/themes.md.
# Two formats supported:
#   - Diagram themes:  "- **<name>** — <desc>"  (bullet list)
#   - PPT themes:      "| `<name>` | <desc> |"   (table row)
# Always succeeds (||true) so set -e doesn't kill the loop when a theme has
# no description in themes.md.
describe() {
  local name="$1"
  # Try bullet format first (diagram themes)
  local d
  d=$(grep -m 1 -E "^- \*\*${name}\*\* — " "$THEMES_MD" 2>/dev/null \
        | sed -E "s/^- \*\*${name}\*\* — //" || true)
  if [ -z "$d" ]; then
    # Try table format (PPT themes). Allow optional ⭐ between name and pipe:
    #   | `<name>` | <description> |
    #   | `<name>` ⭐ | <description> |
    d=$(grep -m 1 -E "^\| \`${name}\`[^|]*\| " "$THEMES_MD" 2>/dev/null \
          | sed -E "s/^\| \`${name}\`[^|]*\| //; s/ *\|$//" || true)
  fi
  printf '%s' "$d"
}

list_dir() {
  local dir="$1"
  for f in "$dir"/*.css; do
    [ -f "$f" ] || continue
    basename "$f" .css
  done | sort
}

print_pretty_section() {
  local label="$1" dir="$2" cnt
  cnt=$(ls -1 "$dir"/*.css 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "▌ $label ($cnt themes)"
  echo "  ────────────────────────────────────────────────────────────"
  while IFS= read -r name; do
    desc=$(describe "$name")
    [ -z "$desc" ] && desc="(no description in references/themes.md)"
    printf "  %-22s  %s\n" "$name" "$desc"
  done < <(list_dir "$dir")
}

print_json_section() {
  local label="$1" dir="$2" first=1
  printf '  "%s": [\n' "$label"
  while IFS= read -r name; do
    desc=$(describe "$name" | sed 's/"/\\"/g')
    [ $first -eq 1 ] && first=0 || printf ',\n'
    printf '    {"name": "%s", "description": "%s"}' "$name" "$desc"
  done < <(list_dir "$dir")
  printf '\n  ]'
}

if [ "$FORMAT" = "json" ]; then
  printf '{\n'
  case "$MODE" in
    diagram) print_json_section "themes-diagram" "$ROOT/assets/themes-diagram" ;;
    ppt)     print_json_section "themes-ppt"     "$ROOT/assets/themes-ppt" ;;
    all)
      print_json_section "themes-diagram" "$ROOT/assets/themes-diagram"
      printf ',\n'
      print_json_section "themes-ppt" "$ROOT/assets/themes-ppt"
      ;;
  esac
  printf '\n}\n'
else
  case "$MODE" in
    diagram) print_pretty_section "画图模式 themes-diagram" "$ROOT/assets/themes-diagram" ;;
    ppt)     print_pretty_section "PPT 模式 themes-ppt"     "$ROOT/assets/themes-ppt" ;;
    all)
      print_pretty_section "画图模式 themes-diagram" "$ROOT/assets/themes-diagram"
      print_pretty_section "PPT 模式 themes-ppt" "$ROOT/assets/themes-ppt"
      ;;
  esac
  echo ""
  echo "Tip: ./scripts/list-themes.sh --mode ppt | grep -i pitch"
  echo "     ./scripts/list-themes.sh --json | jq '.[\"themes-diagram\"][] | .name'"
fi
