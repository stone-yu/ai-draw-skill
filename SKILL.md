---
name: ai-draw
description: 单一 Skill 整合 PPT 演讲稿生成（36 主题 / 31 布局 / 27 动画 / 20 特效 / 15 全 deck 模板）与画图能力（7 种类型 × 8 主题）。两个平等的顶级模式：`--mode ppt` 输出可分享的演讲 HTML；`--mode single` / `--mode site` 输出技术图。`/ai-draw <需求>` 自动识别意图，模糊时询问。Trigger keywords (中+EN)：画 / 画图 / 画一个 / 给我画 / 帮我画 / draw / diagram / chart / 架构图 / 流程图 / 时序图 / 知识图谱 / 思维导图 / 类图 / ER 图 / 演讲 / 分享 / 分享稿 / 讲稿 / 逐字稿 / PPT / deck / slides / keynote / 幻灯片 / pitch / 周报 / 课程 / 课件 / 小红书图文 / talk / presentation.
trigger: /ai-draw
---

# /ai-draw

`/ai-draw <需求>` — 两个平等的顶级模式：**PPT 演讲稿** 或 **画图**。一句话自动路由，模糊时询问。

## Subcommands

| Command | Action |
|---|---|
| `/ai-draw <需求>` | 新建：自动路由到 PPT 或画图 |
| `/ai-draw --mode ppt <需求>` | 强制 PPT 演讲稿模式 |
| `/ai-draw --mode single <需求>` | 强制画图（单图）模式 |
| `/ai-draw --mode site <markdown.md>` | 画图模式的多页架构站（主页 + 下钻子页） |
| `/ai-draw --mode deck <需求>` | **已退役**，等同于 `--mode ppt`（向后兼容，会提示升级） |
| `/ai-draw redo --style <theme>` | 仅切换最近产出的主题（PPT / 单图 / site 均支持） |
| `/ai-draw add <需求>` | PPT：追加新 slide；site：在最近 site 追加子页 |
| `/ai-draw add <需求> --to <name>` | 显式指定目标 PPT 或 site |
| `/ai-draw add --to <site> --under <parent-slug> <component>` | 在指定父页下加一个新子页 |
| `/ai-draw export png` | 调用 `scripts/render.sh` 生成 PNG（site 模式下逐页渲染） |
| `/ai-draw list` | 列出 `./ai-draw-out/` 下所有产出 |
| `/ai-draw list-themes [--mode diagram\|ppt] [--json]` | 列出全部可用主题及一句话描述 |

### Flags

| Flag | Default | Action |
|---|---|---|
| `--mode ppt` | — | 强制 PPT 演讲稿模式（覆盖关键词检测） |
| `--mode single` | — | 强制单图画图模式 |
| `--mode site` | — | 强制多页站画图模式 |
| `--mode deck` | — | **退役别名**，重定向到 `--mode ppt`；会输出一条友好提示 |
| `--style <theme>` | 自动推荐 | 锁定主题，跳过推荐 |
| `--type <kind>` | 自动识别 | 画图模式：锁定图类型，跳过歧义问答 |
| `--full-deck <name>` | 按观众推荐 | PPT 模式：直接选用指定全 deck 模板 |
| `--audience <kind>` | 从需求推断 | PPT 模式：`engineers`/`execs`/`xhs`/`students`/`vc`/`internal` |
| `--no-chrome` | off | PPT 模式：跳过 Agenda + Closing slides |
| `--no-notes` | off | 跳过写 `<aside class="notes">` |
| `--no-open` | off | 跳过生成后自动在浏览器打开 |
| `--max-depth <N>` | 3 | site 模式：markdown 标题最大下钻深度 |
| `--slug-style <kebab\|pinyin>` | kebab | site 模式：文件名 slug 生成策略 |
| `--to <name>` | 最近的 PPT/site | add 命令：指定目标 |
| `--under <parent-slug>` | — | site add：指定父页 |

---

## Platform support

ai-draw is tool-agnostic at the instruction layer (uses generic verbs like "read the file" / "run the script", not platform-specific tool names). It runs on any agent runtime that provides:

1. File read / write / edit on local disk
2. Shell command execution (to run `scripts/new.sh` / `scripts/open.sh`)
3. Some way to load SKILL.md content into agent context

| Platform | Status | Notes |
|---|---|---|
| **Claude Code** | ✅ Primary, fully tested | `/ai-draw <需求>` works via the Skill tool. Default install path: `~/.claude/skills/ai-draw/`. |
| **Anthropic Claude API** (Agent SDK / Managed Skills) | ✅ Compatible by design | Load SKILL.md via the managed-skill API. Same tools. |
| **GitHub Copilot CLI** | ⚠️ Best-effort, untested | See [`references/copilot-tools.md`](references/copilot-tools.md) for tool-name mapping. |
| **Google Gemini CLI** | ⚠️ Best-effort, untested | [`GEMINI.md`](GEMINI.md) auto-loads at session start with tool mapping + invocation guide. |
| **OpenAI Codex / GPT function-calling** | ⚠️ Best-effort, manual install | No native Skill loader — concat SKILL.md into system prompt. See [`references/codex-tools.md`](references/codex-tools.md). |
| **Cursor / Cline / Aider / others** | ❓ Likely workable | If the host has file-IO + shell, paste SKILL.md content into the agent's persistent context and ai-draw should drive itself. |

Bug reports / platform-specific quirks: https://github.com/stone-yu/ai-draw-skill/issues

---

## What you must do when invoked

### Step 0 — Mode detection (PPT vs Diagram)

**This step runs before everything else.**

#### PPT 模式关键词（任意命中 → PPT 路由）

演讲 / 分享 / 分享稿 / 讲稿 / 逐字稿 / PPT / deck / slides / keynote / 幻灯片 / pitch / 周报 / 课程 / 课件 / xhs 图文 / 小红书图文 / talk / presentation / pitch-deck / product-launch / 做一份 / 做一个 PPT / make a slide deck

#### 画图模式关键词（任意命中 → 画图路由）

画 / 画图 / 画一张 / 画一个 / 给我画 / 帮我画 / draw / diagram / chart / 架构图 / 流程图 / 时序图 / 知识图谱 / 思维导图 / 类图 / ER 图

#### 歧义处理（两组都命中，或两组都未命中）

问一次，不要自行决策：

> "你想要 ① 一份 **PPT 演讲稿**（多 slide，可全屏演示）② 一张 / 几张**图**（架构图、流程图等）？"

等用户回答后继续。**绝不在未确认时静默切换模式。**

#### 显式 flag 优先

`--mode ppt` / `--mode single` / `--mode site` 直接覆盖关键词检测，无需询问。  
`--mode deck` 视同 `--mode ppt`，并在确认消息中提示："deck 模式已升级为 PPT 模式，功能更完整。"

---

### Step 0b — Subcommand shortcuts

如果是 `redo` / `add` / `export` / `list`，跳转到对应的 Subcommand details，不走 Step 0 的意图识别。

---

### PPT 路由 → `ppt/INSTRUCTIONS.md`

确认为 PPT 模式后，读取 `ppt/INSTRUCTIONS.md`，执行完整 PPT 流程（3-问开场 + 脚手架 + 写 slide + 打开）。

#### PPT 路由内的 site 检测

PPT 模式**不触发** site 模式。site 仅属于画图路由。

---

### 画图路由 → `INTERACTION.md` + `diagrams/<type>/INSTRUCTIONS.md`

确认为画图模式后，按 `INTERACTION.md` 的 "Standard new-diagram flow" 执行：

1. **Step 1 of INTERACTION.md** — 解析图类型 + site 模式检测
2. **Step 2** — 主题推荐（从 12 themes-diagram）
3. **Step 3** — 单图 vs site 确认
4. **Step 4** — 等待用户
5. **Step 5** — 生成（读对应 `diagrams/<type>/INSTRUCTIONS.md`）
6. **Step 6** — 确认

#### 画图路由内的 site 模式触发（三层优先级）

1. **显式**：`--mode site` flag 存在
2. **强信号**：提到 `.md` 文件路径 + "多页 / drill down / 多页架构站 / 多页文档站"
3. **建议，不自动触发**：用户给出下列"富输入"模式时，询问一次是否走 site 模式：
   - 请求中包含 ≥ 2 个文件路径（尤其含 `.md`）
   - 请求中列举了 ≥ 4 个独立子系统 / 组件 / 模块
   - 措辞隐含"文档站"而非单图（如"整理一份架构文档"、"做一个架构 wiki"）

   建议措辞：
   > "你这个输入信息量挺多，要不要走 `--mode site` 出一份多页架构站？子页之间能点击下钻、面包屑导航。也可以坚持单图。"

   用户说不 → 不重复建议。  
   site 模式确认后，**读 `site/INSTRUCTIONS.md`** 执行其 9 步控制器算法。

---

## Compatibility warnings (画图模式专用)

如果用户选定的主题 × 图类型落在 `references/themes.md` 兼容矩阵的 ⚠️ 格，提一次警告。不重复。PPT 模式无需此检查。

---

## State schema (`./ai-draw-out/.ai-draw-state.json`)

```jsonc
{
  "lastUpdated": "ISO-8601",
  "decks": [
    // type: "single" — 画图模式单图
    { "name": "...", "path": "...", "type": "single", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "diagramType": "architecture",
      "createdAt": "...", "createdFrom": "..." },

    // type: "ppt" — PPT 模式（v0.3 新增）
    { "name": "...", "path": "...", "type": "ppt", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "fullDeckTemplate": "tech-sharing",
      "audience": "engineers",
      "slides": [
        { "layout": "cover", "id": "cover" },
        { "layout": "toc", "id": "toc" },
        { "layout": "bullets", "id": "slide-2" },
        { "layout": "arch-diagram", "diagramType": "architecture", "id": "arch-1" },
        { "layout": "thanks", "id": "thanks" }
      ],
      "createdAt": "...", "createdFrom": "..." },

    // type: "deck-legacy" — v0.1 旧 deck（只读，不再新建）
    { "name": "...", "path": "...", "type": "deck-legacy", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "slides": [
        { "layout": "title", "id": "title" },
        { "layout": "diagram", "diagramType": "architecture", "id": "arch-1" }
      ],
      "createdAt": "...", "createdFrom": "..." },

    // type: "site" — 画图模式多页站（v0.2+）
    { "name": "...", "path": "...", "type": "site", "theme": "...",
      "themeRecommendations": ["...","...","..."],
      "sourceMarkdown": "docs/system.md",
      "tree": [
        { "slug": "index", "title": "...", "path": "index.html",
          "children": ["user-service"] },
        { "slug": "user-service", "title": "...", "path": "pages/user-service.html",
          "parent": "index", "children": [] }
      ],
      "createdAt": "...", "createdFrom": "..." }
  ]
}
```

`decks[]` 存所有输出（single / ppt / deck-legacy / site）。顺序：**最新在前**。`add` / `redo` / `export` 操作默认操作 `decks[0]`，除非 `--to <name>` 指定。

---

## Subcommand details

### `redo`

按 `INTERACTION.md` "redo flow"。仅 sed 替换 `<link id="theme-link">` 的 href，不重新生成内容。  
- 画图模式产出 → 换 `assets/themes-diagram/<theme>.css`  
- PPT 模式产出 → 换 `assets/themes-ppt/<theme>.css`  
**自动打开**更新后的文件（除非 `--no-open`）。

### `add`

按 `INTERACTION.md` "add flow" 或 "PPT add flow"。读取 state，在目标 index.html 中写入新 `<section class="slide">`，自动跳转打开（`./scripts/open.sh "<path>/index.html#/<N>"`）。

### `export png`

```bash
./scripts/render.sh <state.decks[0].path>/index.html <slide-count>
```

site 模式下逐页循环渲染。自动打开 PNG 目录（除非 `--no-open`）。

### `list`

读 state，格式化为表格：`name / type / theme / created / slide-count 或 page-count`。

### `list-themes`

直接调用 `./scripts/list-themes.sh` 并把输出原样回给用户。Flag 透传：
- `--mode diagram` — 只列 12 个画图主题
- `--mode ppt` — 只列 36 个 PPT 主题
- `--json` — 输出 JSON（适合用户再 pipe 给别的工具）
- 无 flag — 列全部 48 个

Source-of-truth 是 `assets/themes-{diagram,ppt}/*.css`；描述从 `references/themes.md` 解析。新加主题后无需手动更新 CLI，自动同步。

---

## Files in this skill

- `SKILL.md` — 本文件（模式路由器）
- `INTERACTION.md` — 完整对话 SOP（PPT 流 + 画图流 + site 流）
- `ppt/INSTRUCTIONS.md` — PPT 模式完整创作指南
- `references/themes.md` — 双主题目录（12 themes-diagram + 36 themes-ppt）+ 兼容矩阵
- `references/diagram-types.md` — 图类型意图识别
- `diagrams/<type>/INSTRUCTIONS.md` — 各图类型规则（按需加载）
- `diagrams/<type>/template.html` — 各图类型起始模板
- `diagrams/<type>/examples/*.html` — 参考输出
- `ppt/full-decks/<name>/` — 15 个完整 deck 模板（PPT 模式使用）
- `site/{INSTRUCTIONS.md, subagent-prompt.md, index-template.html, subpage-template.html}` — 多页站（画图模式 v0.2+）
- `assets/themes-diagram/` — 12 个画图主题 CSS
- `assets/themes-ppt/` — 36 个 PPT 主题 CSS
- `assets/layouts/` — 31 个单页布局模板（PPT 模式 slide 素材库）
- `assets/animations.css` — 27 个 CSS 入场动画
- `assets/fx/` — 20 个 canvas FX 模块
- `assets/fx-runtime.js` — FX 自动初始化
- `assets/runtime.js` — 画图模式运行时（single + site，含 site-id 同步）
- `assets/runtime-ppt.js` — PPT 模式运行时（含演讲者模式 / 总览 / notes）
- `assets/exporter.js` — PNG/PDF/剪贴板导出工具栏（两种模式共用）
- `assets/base.css` — token 基础层
- `scripts/{new.sh, open.sh, render.sh, check-themes.sh, render-all.sh}` — bash 辅助脚本

> `assets/presenter.js` — 已废弃（PPT 模式演讲者功能已内置于 runtime-ppt.js），保留仅供参考。  
> `ppt/deck-template.html` — 已删除（v0.3 移除旧 deck 壳）。

---

## Asset URLs

Skill 仓库为 `stone-yu/ai-draw-skill`。生成的 HTML 通过 jsDelivr 引用资产：

```html
<!-- 画图模式 -->
<link rel="stylesheet" id="theme-link" href="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/themes-diagram/tech-dark.css">
<script src="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/runtime.js"></script>

<!-- PPT 模式 -->
<link rel="stylesheet" id="theme-link" href="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/themes-ppt/tokyo-night.css">
<script src="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/runtime-ppt.js"></script>

<!-- 共用 -->
<script src="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/exporter.js"></script>
```

`scripts/new.sh` 读当前 git tag（或 fallback 到 `main`），自动替换模板中的 URL。

---

## Honesty rules

- 绝不伪造产出存在 — 总是通过读取已写入的文件来确认
- 绝不声称"已加一张 slide"而未将 `<section>` 实际写入磁盘
- `redo` 发现 theme-link 已是目标主题 → 告知并跳过写入
- **绝不在未确认时静默切换 PPT / 画图模式 — 歧义时只问一次**
