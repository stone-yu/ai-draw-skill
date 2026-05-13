# site/ — Main Controller Algorithm for `--mode site`

This file is the authoritative reference for the `/ai-draw --mode site <markdown.md>` flow.
Load it whenever a site-mode request is detected (explicit `--mode site` flag, or implicit via
keywords like "多页", "drill down", "多页架构", "multi-page").

---

## 0. Quick overview

1. Validate input → parse markdown → build page tree
2. Scaffold output dir
3. Main controller generates `index.html` (with drillable architecture diagram)
4. Dispatch up to 8 parallel subagents (haiku), one per subpage
5. Verify outputs; retry failures once; write stubs for persistent failures
6. Write `.ai-draw-state.json`, `README.md`, auto-open

---

## 1. Flags accepted in site mode

| Flag | Default | Meaning |
|---|---|---|
| `--mode site` | — | Explicitly enter site mode |
| `--max-depth <N>` | 3 | Max heading depth to expand into subpages; deeper headings collapse into parent content |
| `--slug-style <kebab\|pinyin>` | kebab | Slug generation strategy |
| `--style <theme>` | auto-recommend | Lock theme, skip recommendation |
| `--themes <csv>` | top-3 recommended | Override the `data-themes` attribute (3 comma-separated values) |
| `--no-open` | off | Skip auto-opening after generation |
| `--no-notes` | off | Skip writing extra notes content |

---

## 2. Markdown → tree (parsing algorithm)

### 2.1 Read and parse headings

Read the entire markdown file. Extract all lines starting with `#`.

### 2.2 H1 handling

- If an H1 exists → use it as the site title (root node).
- If NO H1 exists → synthesize a virtual H1 by reading the full document semantically and
  producing a concise "系统总览"-style title that captures the document's subject. Do NOT
  invent a title; derive it from the content.

### 2.3 Depth expansion rules

- H2 → first-level subpage → `pages/<slug>.html`
- H3 → second-level subpage → `pages/<H2-slug>/<H3-slug>.html`
- H4 and deeper (if `--max-depth` allows) → `pages/<h2-slug>/<h3-slug>/<h4-slug>.html`
- Headings at depth **> `--max-depth`** are NOT given their own subpage; their content is
  merged into their nearest ancestor page that IS within depth.

### 2.4 Section content

Each node's "content" is everything in the markdown between its own heading line (exclusive)
and the next heading of equal-or-higher level (exclusive). This content is passed verbatim to
the subagent as its section markdown.

### 2.5 Slug generation

**kebab (default):** Lowercase the title, replace spaces and punctuation with `-`, strip
non-ASCII characters, collapse consecutive `-`.

Examples: "User Service" → `user-service`, "订单系统" → `order-system` (translate first then
kebab), "Auth & Token Module" → `auth-token-module`.

**pinyin (`--slug-style pinyin`):** Convert Chinese characters to their pinyin romanization
(tone-free), then apply kebab rules.

Examples: "订单服务" → `dingdan-fuwu`, "用户中心" → `yonghu-zhongxin`.

### 2.6 Tree JSON shape

```jsonc
[
  {
    "slug": "index",
    "title": "电商系统总览",
    "path": "index.html",
    "depth": 0,
    "parent": null,
    "children": [
      {
        "slug": "user-service",
        "title": "User Service",
        "path": "pages/user-service.html",
        "depth": 1,
        "parent": "index",
        "content": "...section markdown...",
        "children": [
          {
            "slug": "auth-module",
            "title": "Auth Module",
            "path": "pages/user-service/auth-module.html",
            "depth": 2,
            "parent": "user-service",
            "content": "...section markdown...",
            "children": []
          }
        ]
      }
    ]
  }
]
```

### 2.7 Subpage count guard

If the tree would produce **more than 30 subpages**, warn:

> "This document has N headings at the requested depth. Generating 30+ pages may take a while.
> Consider passing `--max-depth 2` to reduce the count. Proceeding with depth 2…"

Then re-parse with `--max-depth 2`.

---

## 3. Step-by-step main controller flow

### Step 1 — Validate input

1. Check that the markdown path exists (relative or absolute).
2. If it does NOT exist:
   - Report the exact path that was not found.
   - Run `find . -name "*.md" -maxdepth 4 | head -20` and list the results for the user.
   - Stop. Do not proceed.
3. If the file is empty or has no headings → fall back to single-page mode and tell the user:
   > "The markdown has no headings. Falling back to single-page architecture diagram."

### Step 2 — Parse the document into a tree

Apply §2 rules. Build the tree JSON (hold in memory; do NOT write it yet). Count total subpages
(all non-root nodes). If > 30, apply the depth guard from §2.7.

### Step 3 — Theme recommendation (if not locked via `--style`)

1. Read `references/themes.md` to pick 3 recommendations appropriate for architecture/technical docs.
2. Present them to the user (⭐ marks the top pick). Wait for selection OR proceed automatically
   if the user already passed `--style`.

### Step 4 — Scaffold output directory

```bash
./scripts/new.sh <safe-name>-<theme>
mkdir -p ./ai-draw-out/<safe-name>-<theme>/pages
```

Where `<safe-name>` is the kebab slug of the H1 title. The output root is:
`./ai-draw-out/<safe-name>-<theme>/`

Subsequent references use `<outdir>` for this root.

### Step 5 — Generate `index.html` (main controller does this directly)

**Do NOT dispatch a subagent for the index page.** The main controller fills
`site/index-template.html` itself.

Rules:
- `{{TITLE}}` → H1 title (twice: `<title>` and `<h1>`)
- `{{SUBTITLE}}` → one-line subtitle derived from the document context (e.g. first paragraph
  after H1, or "多页架构站 · <N> 个子页" if nothing is available)
- `{{SITE_ID}}` → kebab slug of the H1 title (same as `<safe-name>`)
- `{{THEMES_CSV}}` → the 3 recommended themes as a comma-separated string
- `{{ARROWS}}`, `{{COMPONENTS}}` → architecture diagram following
  `diagrams/architecture/INSTRUCTIONS.md` §2–§5. Each H2 node becomes a **drillable component**
  per §11, with `xlink:href="pages/<h2-slug>.html"`. Non-H2 elements (e.g. databases, external
  services mentioned in the H1 section) are regular non-drillable components.
- `{{LEGEND}}` → legend per §6
- `{{SUMMARY_CARDS}}` → 3 cards summarizing the overall system

Write the filled template to `<outdir>/index.html`.

Asset paths: `scripts/new.sh` already rewrites `../../assets/...` to the jsdelivr CDN URL.
If running manually, replace `../../assets/` with
`https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@<tag>/assets/`.

### Step 6 — Dispatch subagents for all subpages

**Concurrency cap: maximum 8 subagents in parallel.** For N total subpages:
- If N ≤ 8: dispatch all at once.
- If N > 8: split into ⌈N/8⌉ batches; dispatch batch 1, wait for all to finish, dispatch
  batch 2, etc.

For each subpage node, dispatch ONE subagent using the prompt template at
`site/subagent-prompt.md`. Substitute all `<PLACEHOLDER>` values:

| Placeholder | Value |
|---|---|
| `<PAGE_SLUG>` | node.slug |
| `<PAGE_TITLE>` | node.title |
| `<OUTPUT_PATH>` | `<outdir>/<node.path>` (absolute or unambiguous relative) |
| `<THEME>` | chosen theme name |
| `<THEMES_CSV>` | 3 recommended themes CSV |
| `<SITE_ID>` | kebab slug of H1 title |
| `<BREADCRUMB_ARRAY>` | JSON array of `{title, href}` from root to this node's parent, e.g. `[{"title":"电商系统总览","href":"../index.html"},{"title":"User Service","href":"./user-service.html"}]` — hrefs are relative to the OUTPUT file location |
| `<CHILDREN_ARRAY>` | JSON array of `{slug, title}` for direct children of this node |
| `<PARENT_PATH>` | path to parent page (relative to this page's file location) |
| `<SECTION_MARKDOWN>` | node.content (the raw markdown text for this section) |
| `<DEPTH>` | node.depth (integer) |

Ensure that all `pages/<h2>/` subdirectories are created before dispatching depth-2 subagents:

```bash
mkdir -p <outdir>/pages/<h2-slug>
```

### Step 7 — Verify outputs and handle failures

After each batch of subagents completes:

1. For each expected output file, verify it exists and is non-empty.
2. If a file is **missing or empty**: retry ONCE by dispatching a fresh subagent with the same
   prompt.
3. If still missing after retry: write a **stub page** at the expected path:

```html
<!DOCTYPE html>
<html lang="zh-CN" data-themes="<THEMES_CSV>" data-site-id="<SITE_ID>">
<head>
  <meta charset="utf-8">
  <title>[STUB] <PAGE_TITLE></title>
  <link rel="stylesheet" href="<ASSET_PREFIX>/assets/themes/<THEME>.css" id="theme-link">
</head>
<body style="padding:40px;font-family:monospace;">
  <h1 style="color:var(--text-1);">[生成失败] <PAGE_TITLE></h1>
  <p style="color:var(--text-2);">此子页生成失败。请使用以下命令重新生成（v0.2 中 fill 命令尚未实现，此处作为占位标记）：</p>
  <pre style="color:var(--accent);">/ai-draw fill <PAGE_SLUG></pre>
  <p style="color:var(--text-3);">或手动删除此文件后重跑：/ai-draw --mode site &lt;markdown.md&gt;</p>
  <a href="<PARENT_PATH>" style="color:var(--accent);">← 返回上一页</a>
</body>
</html>
```

Note: `/ai-draw fill <slug>` is documented but NOT implemented in v0.2. The stub is a marker
only.

After all batches complete, report to the user:
- How many pages were generated successfully
- Which pages (if any) fell back to stubs

### Step 8 — Write `.ai-draw-state.json`

Append a new entry to `./ai-draw-out/.ai-draw-state.json` (create if absent). The new entry
goes at the **front** of `decks[]` (most-recent-first):

```jsonc
{
  "name": "<safe-name>-<theme>",
  "path": "./ai-draw-out/<safe-name>-<theme>",
  "type": "site",
  "theme": "<theme>",
  "themeRecommendations": ["<theme1>", "<theme2>", "<theme3>"],
  "sourceMarkdown": "<original markdown path>",
  "tree": [ /* full tree JSON from §2.6 */ ],
  "createdAt": "<ISO-8601>",
  "createdFrom": "<original /ai-draw command text>"
}
```

### Step 9 — Write `README.md`

Write `<outdir>/README.md` using the template shape from `ppt/README-template.md`, adapting
"deck/slides" wording to "site/pages":

```markdown
# <H1 Title>

<One-line context from subtitle>

Generated by [ai-draw](https://github.com/stone-yu/ai-draw-skill) on <DATE>.

## Open

```bash
open index.html
```

## Navigate

- Click any component with `↗` to drill into its subpage
- Breadcrumb at the top of each subpage leads back to parent
- Press `T` to cycle themes (synced across all pages via localStorage)

## Keyboard

| Key | Action |
|---|---|
| `T` | Cycle 3 recommended themes (<THEMES_CSV>) |
| `Shift+T` | Cycle all 8 themes |
| `F` | Fullscreen |
| Click `⋯` | Export current page to PNG |

## Add a subpage

```bash
/ai-draw add --to <safe-name>-<theme> --under <parent-slug> <description>
```

## Re-theme entire site

```bash
/ai-draw redo --style <new-theme>
```

## Export all pages to PNG

```bash
/ai-draw export png
```

## Files

- `index.html` — site home (open this)
- `pages/` — subpages
- `README.md` — this file
```

### Step 10 — Auto-open

Unless `--no-open` was passed or `AI_DRAW_NO_OPEN=1` is set:

```bash
./scripts/open.sh <outdir>/index.html
```

### Step 11 — Final report to user

> "Site generated: **<H1 title>**
> - X pages total (index + N subpages)
> - Y pages succeeded; Z stubs written
> - Theme: <theme>
> - Open: `<outdir>/index.html`
> - To add a new subpage: `/ai-draw add --to <name> --under <parent-slug> <description>`"

---

## 4. `add --to <site> --under <parent-slug> <component>` subcommand

### Purpose

Add a single new subpage beneath an existing page in the site tree.

### Steps

1. Read `./ai-draw-out/.ai-draw-state.json`. Find the entry where `name == <site>` or
   `path` matches. If not found: list all site entries and stop.
2. Walk the `tree` to find the node with `slug == <parent-slug>`. If not found:
   - List all existing slugs and stop.
3. Determine new slug from `<component>` description (apply §2.5 slug rules).
4. Determine output path:
   - If parent is root (`index`): `pages/<new-slug>.html`
   - If parent is depth 1: `pages/<parent-slug>/<new-slug>.html`
   - Deeper: extend pattern accordingly.
   - Ensure the directory exists: `mkdir -p <outdir>/pages/<parent-slug>/`
5. Dispatch ONE subagent using `site/subagent-prompt.md`, filling in:
   - breadcrumb chain = root → parent chain + the parent itself
   - children of the new page = [] (empty, it's brand new)
   - section markdown = `<component>` description (the user's text)
6. Verify the new file exists. If not, retry once. If still missing, write a stub.
7. Update the **parent's page** to add a new drillable component pointing to the new slug:
   - Read `<outdir>/<parent.path>`.
   - Find the `{{COMPONENTS}}` section or existing SVG component blocks.
   - Append a new drillable component per `diagrams/architecture/INSTRUCTIONS.md` §11.
   - The `xlink:href` is relative to the parent page's location:
     - From `index.html` → `pages/<new-slug>.html`
     - From `pages/<parent-slug>.html` → `<parent-slug>/<new-slug>.html`
   - Write the updated parent page back.
8. Update breadcrumb in the new page if necessary (should already be correct from subagent).
9. Update state:
   - Add the new node to the parent's `children` array in the tree.
   - Update `lastUpdated`.
   - Write state back to disk.
10. Auto-open new subpage via `./scripts/open.sh <outdir>/<new-page-path>` (unless `--no-open`).

---

## 5. `redo --style <theme>` for sites

1. Read state; find target site (default: most recent site-type entry).
2. Walk ALL pages in the tree (index.html + every pages/*.html recursively).
3. For each file, replace the `theme-link` href:
   ```bash
   # Conceptually (do this as a file read/edit, not literal sed):
   # old: .../themes/<old-theme>.css
   # new: .../themes/<new-theme>.css
   ```
4. If `--themes <csv>` was also passed, update the `data-themes` attribute on `<html>` in each file.
5. Update state entry: `theme = <new-theme>`.
6. Write state back.
7. Auto-open `<outdir>/index.html` (unless `--no-open`).

---

## 6. `export png` for sites

1. Read state; find target site.
2. Collect ALL page paths from the tree in depth-first order (index first, then subpages).
3. For each page, call:
   ```bash
   ./scripts/render.sh <outdir>/<page.path> 1
   ```
   Output is written to `<outdir>/png/<flat-slug>.png` where `<flat-slug>` is the page's full
   path with `/` replaced by `-` and `.html` stripped.
   Example: `pages/user-service/auth-module.html` → `user-service-auth-module.png`.
4. Ensure the png/ dir exists: `mkdir -p <outdir>/png/`.
5. After all pages are exported, auto-open the png directory:
   ```bash
   ./scripts/open.sh <outdir>/png/
   ```
   (unless `--no-open`)

---

## 7. Asset path rules

Templates use `../../assets/...` as placeholder paths. `scripts/new.sh` rewrites these to
the jsdelivr CDN URL when scaffolding. However, site pages at different depths need different
relative paths:

| Page location | Depth | Relative path to assets |
|---|---|---|
| `<outdir>/index.html` | 0 | rewritten to CDN by new.sh |
| `<outdir>/pages/<slug>.html` | 1 | `../../../assets/...` |
| `<outdir>/pages/<parent>/<slug>.html` | 2 | `../../../../assets/...` |

`site/subpage-template.html` uses `../../../assets/...` (depth-1 default). The main controller
MUST prepend an additional `../` for depth-2 pages before passing the path to the subagent.
Document the adjusted prefix in the subagent prompt's `<OUTPUT_PATH>` and note it in
`<ASSET_PREFIX>`.

---

## 8. Honesty rules

- **Never** claim a subagent succeeded without verifying its output file exists and is non-empty.
- **Never** claim "added page X" without writing the file to disk.
- **Never** dispatch more than 8 subagents in parallel; always batch.
- **Never** write to a page other than the one assigned (subagents: max 1 file write each).
- If state file is absent, create a fresh one — do NOT invent prior history.
- Report stub pages honestly: "N pages failed and were written as stubs."

---

## 9. Error reference

| Scenario | Behavior |
|---|---|
| Markdown file not found | Report path + list .md files in cwd; stop |
| Markdown has no headings | Fall back to single-page mode |
| Subagent fails twice | Write stub page with fill-command note |
| > 30 subpages | Warn + re-parse with --max-depth 2 |
| `add --under` parent not found | List existing slugs; stop |
| `redo` theme already set | Say so; skip write |
| localStorage not syncing cross-device | Known limitation; README notes it |

---

## 10. Files in this skill (site/)

| File | Role |
|---|---|
| `site/INSTRUCTIONS.md` | This file — main controller algorithm |
| `site/subagent-prompt.md` | Per-page subagent prompt template |
| `site/index-template.html` | Main page HTML template |
| `site/subpage-template.html` | Subpage HTML template (with breadcrumb) |

Also load:
- `diagrams/architecture/INSTRUCTIONS.md` — architecture diagram rules (especially §11 for drillable components)
- `references/themes.md` — theme recommendations
- `ppt/README-template.md` — shape reference for README generation
