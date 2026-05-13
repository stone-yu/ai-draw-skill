# INTERACTION.md — `/ai-draw` user interaction SOP

This file documents the conversational flow that `SKILL.md` follows. SKILL.md keeps the high-level outline; load this file when you need the full template wording.

## Standard new-diagram flow

### Step 1 — Acknowledge + identify (no question yet)

State what you parsed in **one short paragraph**:

```
识别为「<diagram-type>」。
{{TYPE_REASON}} <! e.g. "命中关键词「时序」+「调用链」" or "未命中类型关键词，按通用画法走 flowchart" -->
```

### Step 2 — Theme recommendation (only if user did NOT specify)

Offer exactly 3 themes from `references/themes.md`, the first marked ⭐:

```
{{TONE_LABEL}}语气，推荐 3 个主题：
   ① <theme-name> ⭐    — <one-liner from references/themes.md>
   ② <theme-name>       — <one-liner>
   ③ <theme-name>       — <one-liner>
```

Then immediately the next question (don't wait for them to answer theme separately):

### Step 3 — Mode confirm (only if not derivable)

Append in the SAME message:

```
生成「单图」还是「PPT deck」？{{MODE_HINT}}
   ⓐ 单图  ⓑ PPT deck
```

`MODE_HINT`:
- `(多图建议 deck)` if request has multiple diagrams
- `("做 PPT" 推 deck)` if user used PPT keywords
- nothing otherwise

### Step 4 — Wait for user

Acceptable user inputs:
- `① ⓐ` (theme + mode)
- `1 a`
- `tech-dark deck`
- `第一个 单图`
- Just `①` → assume single image (most common); confirm: "默认单图，要 deck 加一句 deck"

### Step 5 — Generate

1. Run `./scripts/new.sh <safe-name>-<theme>` (creates `./ai-draw-out/<dir>/`)
2. Pick the right `diagrams/<type>/template.html` (or `ppt/deck-template.html` for deck mode)
3. Read `diagrams/<type>/INSTRUCTIONS.md`
4. Fill in placeholders with content derived from the user's request
5. Write `index.html` and `README.md`
6. Update `./ai-draw-out/.ai-draw-state.json`
7. **Auto-open the generated file** (default behavior):
   ```bash
   ./scripts/open.sh <dir>/index.html
   ```
   Skip when `--no-open` flag is present OR environment var `AI_DRAW_NO_OPEN=1` is set.

### Step 6 — Confirm with helpful next steps

```
✓ ./ai-draw-out/<dir>/
  ├ index.html       已在浏览器中打开
  ├ README.md        含按键说明 + 改主题命令
  └ (无 assets，全走 CDN)

小贴士：
· T 键   在 <theme1>/<theme2>/<theme3> 之间循环
· F 键   全屏
· S 键   演讲者模式 (deck only)
· 点击右上 ⋯ → 导出 PNG/PDF
· 不喜欢？/ai-draw redo --style <theme-name>
· 加一张？/ai-draw add <新图描述>
· 下次不想自动打开？加 --no-open
```

If `--no-open` was passed (or `AI_DRAW_NO_OPEN=1`), replace `已在浏览器中打开` with the explicit open command: `open ai-draw-out/<dir>/index.html`.

## Disambiguation flow

If the user's request matches **multiple diagram types** per `references/diagram-types.md`, ask first (before theme):

```
这个有两种常见画法：
   ① <type-A>  — <distinction A>
   ② <type-B>  — <distinction B>

（选完后我会推 3 个主题）
```

Wait for the answer, then resume from Step 2.

## Compatibility warning flow

If the user's chosen theme × type is in the ⚠️ cell of the compatibility matrix, ask once:

```
你选了 <theme> × <type>。提醒一下：<theme> 跟 <type> 的<reason>不太搭。
要不要换成 <alt1> / <alt2>？或者你坚持就这样？
```

If they say "就这样" / "yes" / silence ≥ 1 turn → proceed. Don't repeat the warning.

## `add` flow

```
👤 /ai-draw add 数据库 ER 图

1. Read .ai-draw-state.json → find lastUpdated entry
2. If type === "single":
     ask: "最近的产出是单图。要 ① 升级为 deck 再加 / ② 新建一份 deck？"
3. If type === "deck":
     - Generate new diagram slide (per ppt/INSTRUCTIONS.md §1)
     - Insert before closing slide (or at end if no closing)
     - Update agenda <ol> if exists
     - Update state.slides[]
     - **Auto-open the deck at the new slide** (unless --no-open):
         `./scripts/open.sh "<path>/index.html#/<new-slide-num>"`
     - Confirm: "✓ 已加为第 N 张，已自动跳转打开"
```

## `redo` flow

```
👤 /ai-draw redo --style minimal-light

1. Read .ai-draw-state.json → find lastUpdated entry
2. Open its index.html
3. Find <link id="theme-link" href="...themes/<old>.css"> and replace with new theme
4. Update data-themes attr on <html> if user passed all 3 (e.g. --themes tech-dark,minimal-light,blueprint)
5. Save
6. **Auto-open** (unless --no-open): `./scripts/open.sh <path>/index.html`
7. Confirm: "✓ <name> 主题已切换为 minimal-light，已重新打开"

NEVER regenerate the diagram content — only the theme link is touched.
```

## `export png` flow

```
1. Read .ai-draw-state.json → lastUpdated entry
2. Run: ./scripts/render.sh <path-to-index.html> <slide-count>
3. Auto-open the PNG output dir (unless --no-open): ./scripts/open.sh <path>/png
4. Show user the output dir
```

## `list` flow

Read `./ai-draw-out/.ai-draw-state.json`, list each entry as:
```
<name>     <type>    <theme>    <created-date>    <slide-count or pages-count>
```

For `type:"single"` show 1 page; for `type:"deck"` show slide count; for `type:"site"` show `<N> pages` derived from `tree.length`.

---

## `site` flow (v0.2)

When the user runs `/ai-draw --mode site <markdown.md>` OR mentions a `.md` path with words like "多页 / drill down / 多页架构":

**Don't follow the standard new-diagram flow** — site mode has its own controller algorithm.

### Step 1 — Validate input

- Check the markdown file exists. If not, list `.md` files in cwd and ask which one
- If the file is empty or has no headings at all, fall back to single mode: tell the user "文档没有标题层级，已退化为单图" and continue as a normal single architecture diagram

### Step 2 — Theme recommendation (same as standard flow)

Use `references/themes.md` to recommend 3 themes based on the markdown's tone (read the first paragraph and any "## Overview" section). Skip if `--style <theme>` is given.

### Step 3 — Hand off to `site/INSTRUCTIONS.md`

Read `site/INSTRUCTIONS.md` and follow its 9-step controller algorithm. The hand-off is total — the standard "fill template → write file → done" flow does NOT apply to site mode.

### Step 4 — Confirm

After the controller finishes, report:

```
✓ ./ai-draw-out/<name>-<theme>/
  ├ index.html                  已在浏览器中打开
  ├ pages/<N>.html              N 个子页
  ├ pages/<...>/<...>.html      （如果有深度 ≥ 2 的页）
  └ README.md

小贴士：
· 点 ↗ 角标的组件 → 下钻到子页
· 顶部面包屑 → 回溯
· T 键 主题切换会跨页同步
· 加一页？/ai-draw add --to <name> --under <parent-slug> <component>
· 全部导 PNG？/ai-draw export png
```

## `site add` flow

```
👤 /ai-draw add --to 电商系统总览-tech-dark --under user-service AuthModule

1. Read state, find target site by name
2. Find <parent-slug> in tree (here: "user-service")
3. Compute new slug: "user-service/auth-module" (kebab-case)
4. Compute output path: pages/user-service/auth-module.html
5. Dispatch a single subagent (using site/subagent-prompt.md) to generate that page
6. Update parent page's index.html or pages/user-service.html — add a drillable
   component pointing to the new subpage (using §11 of architecture INSTRUCTIONS)
7. Update parent's children[] and add new entry to tree[]
8. Auto-open the new page (unless --no-open):
   ./scripts/open.sh "<path>/pages/user-service/auth-module.html"
9. Confirm: "✓ 已加为 user-service/auth-module，已自动打开"
```

## `site redo` flow

`/ai-draw redo --style <theme>` against a site:

1. Read state.decks[0]; confirm type === "site"
2. For each entry in tree[], sed its `<link id="theme-link" href="...">` to the new theme
3. Update `data-themes` attribute if user provided `--themes` triple
4. Update state's `theme` field
5. Auto-open `index.html` (theme is also persisted in localStorage so subsequent navigation keeps it)
6. Confirm: "✓ N pages 已切换为 <theme>"
