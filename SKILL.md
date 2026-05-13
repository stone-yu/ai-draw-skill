---
name: ai-draw
description: 单一 Skill 整合 graphify / architecture-diagram / html-ppt 三个项目的画图能力。`/ai-draw <需求>` 一句话生成"自带主题 + 可选 PPT 模式"的可分享 HTML。支持 7 种画图类型（架构图 / 知识图谱 / 流程图 / 时序图 / 思维导图 / 类图 / ER 图）× 8 个精选主题。Trigger keywords (中+EN)：画 / 画图 / 画一个 / 给我画 / 帮我画 / draw / diagram / chart / 架构图 / 流程图 / 时序图 / 知识图谱 / 思维导图 / 类图 / ER 图 / 做一份 PPT / 做一份 deck / 做一份分享稿 / make a slide deck.
trigger: /ai-draw
---

# /ai-draw

`/ai-draw <需求>` — 一句话生成自带主题 + 可选 PPT 模式的可分享 HTML 画图。

## Subcommands

| Command | Action |
|---|---|
| `/ai-draw <需求>` | 新建：单图或 deck |
| `/ai-draw redo --style <theme>` | 仅修改最近产出的 theme-link |
| `/ai-draw add <需求>` | 追加新 slide 到最近的 deck |
| `/ai-draw add <需求> --to <name>` | 显式指定 deck |
| `/ai-draw export png` | 调用 scripts/render.sh 生成 PNG |
| `/ai-draw list` | 列出 `./ai-draw-out/` 下所有产出 |

### Flags

| Flag | Default | Action |
|---|---|---|
| `--style <theme>` | auto-recommend | Lock theme, skip recommendation |
| `--type <kind>` | auto-detect | Lock diagram type, skip disambiguation |
| `--mode single` / `--mode deck` | auto | Skip mode confirmation |
| `--no-chrome` | off | (deck only) skip Agenda + Closing slides |
| `--no-notes` | off | Skip writing `<aside class="notes">` |
| `--to <name>` | most-recent deck | (add only) target a specific deck |

## What you must do when invoked

### Step 1 — Parse the user's request

Read it for:
- **Diagram type** (use `references/diagram-types.md` to match keywords)
- **Number of diagrams** (1 vs many → influences single vs deck)
- **Explicit theme keyword** (`references/themes.md` "Explicit override keywords" section)
- **Explicit deck keyword** ("PPT", "deck", "分享稿", "演讲")
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

### Step 6 — Confirm

Tell the user the output path + 5 helpful tips per `INTERACTION.md` Step 6.

## Compatibility warnings

If chosen theme × type lands in ⚠️ of `references/themes.md` matrix, mention it ONCE before generating. Don't repeat.

## State schema (`./ai-draw-out/.ai-draw-state.json`)

```json
{
  "lastUpdated": "ISO-8601",
  "decks": [
    {
      "name": "技术分享-blueprint",
      "path": "./ai-draw-out/技术分享-blueprint",
      "type": "deck",
      "theme": "blueprint",
      "themeRecommendations": ["blueprint", "tech-dark", "cyberpunk-neon"],
      "diagramType": "architecture",     // for type:"single"; omitted for type:"deck"
      "slides": [                         // for type:"deck"
        { "layout": "title", "id": "title" },
        { "layout": "agenda", "id": "agenda" },
        { "layout": "diagram", "diagramType": "architecture", "id": "arch-1" },
        { "layout": "closing", "id": "closing" }
      ],
      "createdAt": "ISO-8601",
      "createdFrom": "<original /ai-draw command>"
    }
  ]
}
```

The order of `decks[]` is **most-recent first**. `add` / `redo` / `export` operations look at `decks[0]` unless `--to <name>` is given.

## Subcommand details

### `redo`

Per `INTERACTION.md` "redo flow". Just `sed`-style replace on the `theme-link` href; never regenerate content.

### `add`

Per `INTERACTION.md` "add flow". Reads state, opens deck index.html, splices in new `<section class="slide">` before closing.

### `export png`

```bash
./scripts/render.sh <state.decks[0].path>/index.html <slide-count>
```

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
- `assets/{base.css, themes/, runtime.js, exporter.js, presenter.js}` — runtime served via jsdelivr
- `scripts/{new.sh, render.sh, check-themes.sh, render-all.sh}` — bash helpers

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
