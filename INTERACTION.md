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

### Step 6 — Confirm with helpful next steps

```
✓ ./ai-draw-out/<dir>/
  ├ index.html       打开看：open ai-draw-out/<dir>/index.html
  ├ README.md        含按键说明 + 改主题命令
  └ (无 assets，全走 CDN)

小贴士：
· T 键   在 <theme1>/<theme2>/<theme3> 之间循环
· F 键   全屏
· S 键   演讲者模式 (deck only)
· 点击右上 ⋯ → 导出 PNG/PDF
· 不喜欢？/ai-draw redo --style <theme-name>
· 加一张？/ai-draw add <新图描述>
```

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
     - Confirm: "✓ 已加为第 N 张，open <path> 查看"
```

## `redo` flow

```
👤 /ai-draw redo --style minimal-light

1. Read .ai-draw-state.json → find lastUpdated entry
2. Open its index.html
3. Find <link id="theme-link" href="...themes/<old>.css"> and replace with new theme
4. Update data-themes attr on <html> if user passed all 3 (e.g. --themes tech-dark,minimal-light,blueprint)
5. Save
6. Confirm: "✓ <name> 主题已切换为 minimal-light，open 查看"

NEVER regenerate the diagram content — only the theme link is touched.
```

## `export png` flow

```
1. Read .ai-draw-state.json → lastUpdated entry
2. Run: ./scripts/render.sh <path-to-index.html> <slide-count>
3. Show user the output dir
```

## `list` flow

Read `./ai-draw-out/.ai-draw-state.json`, list each entry as:
```
<name>     <type>    <theme>    <created-date>    <slide-count>
```
