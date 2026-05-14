---
name: ai-draw
description: 单一 Skill 整合 fireworks-tech-graph / architecture-diagram-generator / html-ppt-skill 三个项目的画图能力。`/ai-draw <需求>` 一句话生成"自带主题 + 可选 PPT 模式"的可分享 HTML。支持 7 种画图类型（架构图 / 知识图谱 / 流程图 / 时序图 / 思维导图 / 类图 / ER 图）× 8 个精选主题。Trigger keywords (中+EN)：画 / 画图 / 画一个 / 给我画 / 帮我画 / draw / diagram / chart / 架构图 / 流程图 / 时序图 / 知识图谱 / 思维导图 / 类图 / ER 图 / 做一份 PPT / 做一份 deck / 做一份分享稿 / make a slide deck.
trigger: /ai-draw
---

# /ai-draw

`/ai-draw <需求>` — 一句话生成自带主题 + 可选 PPT 模式的可分享 HTML 画图。

## Subcommands

| Command | Action |
|---|---|
| `/ai-draw <需求>` | 新建：单图或 deck |
| `/ai-draw --mode site <markdown.md>` | 从 markdown 文档生成多页架构站（主页 + 下钻子页） |
| `/ai-draw redo --style <theme>` | 仅修改最近产出的 theme-link（单图 / deck / site 都支持） |
| `/ai-draw add <需求>` | 追加新 slide 到最近的 deck |
| `/ai-draw add <需求> --to <name>` | 显式指定 deck |
| `/ai-draw add --to <site> --under <parent-slug> <component>` | 在已有 site 的指定父页下加一个新子页 |
| `/ai-draw export png` | 调用 scripts/render.sh 生成 PNG（site 模式下逐页渲染） |
| `/ai-draw list` | 列出 `./ai-draw-out/` 下所有产出 |

### Flags

| Flag | Default | Action |
|---|---|---|
| `--style <theme>` | auto-recommend | Lock theme, skip recommendation |
| `--type <kind>` | auto-detect | Lock diagram type, skip disambiguation |
| `--mode single` / `--mode deck` / `--mode site` | auto | Skip mode confirmation |
| `--no-chrome` | off | (deck only) skip Agenda + Closing slides |
| `--no-notes` | off | Skip writing `<aside class="notes">` |
| `--no-open` | off | Skip auto-opening the generated file in browser |
| `--max-depth <N>` | 3 | (site only) max markdown heading depth to split into pages |
| `--slug-style <kebab\|pinyin>` | kebab | (site only) slug generation strategy for filenames |
| `--to <name>` | most-recent deck/site | (add only) target a specific deck or site |
| `--under <parent-slug>` | — | (site add only) which parent page to drill under |

## What you must do when invoked

### Step 1 — Parse the user's request

Read it for:
- **Diagram type** (use `references/diagram-types.md` to match keywords)
- **Number of diagrams** (1 vs many → influences single vs deck)
- **Explicit theme keyword** (`references/themes.md` "Explicit override keywords" section)
- **Explicit deck keyword** ("PPT", "deck", "分享稿", "演讲")
- **Site mode trigger** (3 layers, in priority order):
  1. **Explicit**: `--mode site` flag is present
  2. **Strong signal**: a `.md` file path mentioned + words like "多页 / drill down / 多页架构 / 多页文档站"
  3. **Suggest, don't auto-trigger**: when the user gives any of these "rich-input" patterns, ASK them once whether to go site mode (don't silently switch):
     - ≥ 2 file paths in the request (especially if any are `.md`)
     - ≥ 4 distinct sub-systems / components / modules enumerated in the request
     - The phrasing implies a "documentation site" rather than a single diagram (e.g. "整理一份架构文档", "做一个架构 wiki")

  Phrase the suggestion as:
  > "你这个输入信息量挺多，要不要走 `--mode site` 出一份多页架构站？子页之间能点击下钻、面包屑导航。也可以坚持单图。"

  Don't repeat the suggestion if the user says no.

  When site mode IS chosen (any of the 3 layers), **stop the normal flow and read `site/INSTRUCTIONS.md` instead** — site mode has its own algorithm (markdown parsing → subagent fan-out per page).
- **Subcommand** (add / redo / export / list — see table above)

### Step 2 — If multiple diagram types match → disambiguate

Ask the user per `INTERACTION.md` "Disambiguation flow". Wait for the answer before continuing.

### Step 3 — Theme recommendation

Unless the user already locked a theme via keyword or `--style`:

1. Look up the user's tone in `references/themes.md`
2. Offer 3 themes (one ⭐) per `INTERACTION.md` Step 2

### Step 4 — Mode confirmation (single vs deck)

Unless already derivable:

- Multiple diagrams in request → default deck, just say "→ deck（多图）" and proceed
- Explicit "PPT/deck" keyword → default deck, proceed
- Otherwise ask per `INTERACTION.md` Step 3

### Step 5 — Generate

1. Read the right `diagrams/<type>/INSTRUCTIONS.md` (only the type the user picked)
2. For deck mode also read `ppt/INSTRUCTIONS.md`
3. Run `./scripts/new.sh <safe-name>-<theme>` to scaffold `./ai-draw-out/<dir>/`
4. Fill in template placeholders following INSTRUCTIONS.md
5. Write `<dir>/index.html` and `<dir>/README.md` (use `ppt/README-template.md` as base, replace `{{...}}`)
6. Update `./ai-draw-out/.ai-draw-state.json` (see schema below)
7. **Auto-open the generated file in the user's default browser** (unless `--no-open` was given):
   ```bash
   ./scripts/open.sh <dir>/index.html
   ```
   The script handles macOS / Linux / WSL / Windows transparently. If `AI_DRAW_NO_OPEN=1` is set in the environment or `--no-open` was passed, skip this step.

### Step 6 — Confirm

Tell the user the output path + 5 helpful tips per `INTERACTION.md` Step 6. Mention that the file has already been opened (or note that it was skipped if `--no-open`).

## Compatibility warnings

If chosen theme × type lands in ⚠️ of `references/themes.md` matrix, mention it ONCE before generating. Don't repeat.

## State schema (`./ai-draw-out/.ai-draw-state.json`)

```jsonc
{
  "lastUpdated": "ISO-8601",
  "decks": [
    // type: "single"
    { "name": "...", "path": "...", "type": "single", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "diagramType": "architecture",
      "createdAt": "...", "createdFrom": "..." },

    // type: "deck"
    { "name": "...", "path": "...", "type": "deck", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "slides": [
        { "layout": "title", "id": "title" },
        { "layout": "agenda", "id": "agenda" },
        { "layout": "diagram", "diagramType": "architecture", "id": "arch-1" },
        { "layout": "closing", "id": "closing" }
      ],
      "createdAt": "...", "createdFrom": "..." },

    // type: "site" — new in v0.2
    { "name": "...", "path": "...", "type": "site", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "sourceMarkdown": "docs/system.md",
      "tree": [
        { "slug": "index", "title": "...", "path": "index.html",
          "children": ["user-service", "order-service"] },
        { "slug": "user-service", "title": "...", "path": "pages/user-service.html",
          "parent": "index", "children": ["user-service/auth-module"] },
        { "slug": "user-service/auth-module", "title": "...", "path": "pages/user-service/auth-module.html",
          "parent": "user-service", "children": [] }
      ],
      "createdAt": "...", "createdFrom": "..." }
  ]
}
```

The `decks[]` array stores all output kinds (single / deck / site) — kept as one list for simplicity. Order is **most-recent first**. `add` / `redo` / `export` operations look at `decks[0]` unless `--to <name>` is given.

## Subcommand details

### `redo`

Per `INTERACTION.md` "redo flow". Just `sed`-style replace on the `theme-link` href; never regenerate content. **Auto-open the updated file** (`./scripts/open.sh <path>/index.html`) unless `--no-open`.

### `add`

Per `INTERACTION.md` "add flow". Reads state, opens deck index.html, splices in new `<section class="slide">` before closing. **Auto-open the deck at the newly-added slide** via the `#/N` hash: `./scripts/open.sh "<path>/index.html#/<new-slide-num>"` unless `--no-open`.

### `export png`

```bash
./scripts/render.sh <state.decks[0].path>/index.html <slide-count>
```

For **site mode**, loop over every entry in `state.decks[0].tree[]` and render each page individually:

```bash
for page in state.decks[0].tree[]:
  ./scripts/render.sh <site>/<page.path> 1 <site>/png
  mv <site>/png/single.png <site>/png/<flatten-slash(page.slug)>.png
```

**Auto-open the PNG output directory** afterward (unless `--no-open`):
```bash
./scripts/open.sh <state.decks[0].path>/png
```

### `--mode site` (new in v0.2)

When the user passes `--mode site <markdown.md>` OR uses one of the site trigger keywords above, **stop following these steps and read `site/INSTRUCTIONS.md`** — site mode has its own multi-step controller flow (parse markdown → build page tree → generate index.html → dispatch up to 8 parallel subagents for subpages → write state → open).

The `add --to <site> --under <parent-slug>` subcommand also dispatches to `site/INSTRUCTIONS.md`.

### `list`

Read state, format as table with name / type / theme / created / slides.

## Files in this skill

- `SKILL.md` — this file
- `INTERACTION.md` — full conversational SOP (load when generating)
- `references/themes.md` — theme decision + override keywords + compatibility matrix
- `references/diagram-types.md` — diagram-type intent recognition
- `diagrams/<type>/INSTRUCTIONS.md` — per-type rules (load only the one you need)
- `diagrams/<type>/template.html` — per-type starting template
- `diagrams/<type>/examples/*.html` — reference outputs
- `ppt/{deck-template.html, INSTRUCTIONS.md, README-template.md}` — deck wrapper
- `site/{INSTRUCTIONS.md, subagent-prompt.md, index-template.html, subpage-template.html}` — multi-page site mode (v0.2)
- `assets/{base.css, themes/, runtime.js, exporter.js, presenter.js}` — runtime served via jsdelivr
- `scripts/{new.sh, open.sh, render.sh, check-themes.sh, render-all.sh}` — bash helpers

## Asset URLs

The Skill repo is `stone-yu/ai-draw-skill`. Generated HTML references assets via jsdelivr at the repo's current git tag:

```html
https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.1.0/assets/...
```

`scripts/new.sh` reads the current git tag (or falls back to `main`) and substitutes it into the template.

## Honesty rules

- Never fabricate that an output exists — always confirm by reading the file you wrote
- Never report "added a slide" without having written the new `<section>` to disk
- If `redo` finds the theme-link line is already the requested theme, say so and skip the write
