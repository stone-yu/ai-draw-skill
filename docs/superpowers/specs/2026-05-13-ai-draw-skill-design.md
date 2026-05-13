# ai-draw-skill — 设计文档

| | |
|---|---|
| 日期 | 2026-05-13 |
| 作者 | stone-yu + Claude（brainstorming） |
| 仓库 | https://github.com/stone-yu/ai-draw-skill |
| 状态 | Spec |

---

## 0. 一句话定位

把 [fireworks-tech-graph (graphify)](https://github.com/yizhiyanhua-ai/fireworks-tech-graph)、[architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator)、[html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) 三个开源项目的"画图 + 美术 + 演讲"能力**收编为一个 Claude Skill**，用户通过 `/ai-draw <需求>` 一句话生成"自带主题 + 可选 PPT 模式"的可分享 HTML。

---

## 1. 范围与目标

### 1.1 In Scope

| 项 | 内容 |
|---|---|
| **形态** | 单一 Claude Skill（仓库即 Skill）。CLI 脚本仅作为 Skill 内部资源，不暴露给用户 |
| **触发** | `/ai-draw <需求>` 及其子命令（`add` / `redo` / `export` / `list`） |
| **画图类型** | 架构图 / 知识图谱 / 流程图 / 时序图 / 思维导图 / 类图 / ER 图（共 7 种） |
| **风格主题** | 8 个精选主题：`tech-dark` / `blueprint` / `business-clean` / `xhs-soft` / `cyberpunk-neon` / `minimal-light` / `academic-paper` / `hand-drawn` |
| **PPT 模式** | 把多张图串成 deck，继承 html-ppt 的 ← → / T / S / O / F 运行时及演讲者模式 |
| **输出** | 用户当前目录下 `./ai-draw-out/<name>/{index.html, README.md}` |

### 1.2 Out of Scope（一期不做）

- 不内置 graphify 的 Python 提取管线（用户如需，自行跑 `graphifyy` 拿到 `graph.json` 后扔进我们的渲染器）
- 不支持脱离 GitHub/jsdelivr 的"纯离线产出物"（产出 HTML 引用 CDN）
- 不做 `upgrade --to-deck` / `--to-single` 单图↔Deck 互转（标 future）
- 不做 deck 之间的复制/合并（标 future）
- 不做 Mermaid 主题与我们 8 主题的精细映射，Mermaid 用其内置 `dark` / `neutral` 二选一（按当前主题亮暗）

---

## 2. 架构（方案 B：分文件夹注册表）

### 2.1 仓库结构

```
ai-draw-skill/
├── SKILL.md                                    # 入口：意图识别 + 派单 + 主题/Deck 交互
├── README.md
├── INTERACTION.md                              # 按需加载：主题推荐 + 单图 vs Deck 的 SOP
│
├── assets/
│   ├── base.css                                # CSS token 定义
│   ├── themes/                                 # 8 个主题，每个 override token
│   │   ├── tech-dark.css
│   │   ├── blueprint.css
│   │   ├── business-clean.css
│   │   ├── xhs-soft.css
│   │   ├── cyberpunk-neon.css
│   │   ├── minimal-light.css
│   │   ├── academic-paper.css
│   │   └── hand-drawn.css
│   ├── runtime.js                              # T/S/O/F/← →（移植自 html-ppt）
│   ├── presenter.js                            # 演讲者模式弹窗 + iframe 预览
│   └── exporter.js                             # PNG/PDF/剪贴板（移植自 architecture-diagram）
│
├── diagrams/                                   # 画图类型注册表（按需加载）
│   ├── architecture/
│   │   ├── INSTRUCTIONS.md                     # Claude 画这种类型时的专属规则
│   │   ├── template.html                       # 起手模板（含主题占位）
│   │   └── examples/                           # 2-3 个范例供 Claude 参考
│   ├── knowledge-graph/                        # 结构同上：INSTRUCTIONS.md + template.html + examples/
│   ├── flowchart/                              # 结构同上（Mermaid 类型，examples 可选）
│   ├── sequence/                               # 结构同上（Mermaid）
│   ├── mindmap/                                # 结构同上（Markmap）
│   ├── class/                                  # 结构同上（Mermaid）
│   └── er/                                     # 结构同上（Mermaid）
│
├── ppt/                                        # Deck 封装
│   ├── INSTRUCTIONS.md
│   ├── deck-template.html
│   └── README-template.md
│
├── references/
│   ├── themes.md                               # 8 主题各自适用场景
│   └── diagram-types.md                        # 7 种类型的判别词表
│
├── scripts/
│   ├── new.sh                                  # 脚手架 ./ai-draw-out/<name>/
│   └── render.sh                               # headless Chrome → PNG
│
└── docs/superpowers/specs/                     # 设计文档
```

### 2.2 资源加载策略：jsdelivr + GitHub

产出 HTML 通过 jsdelivr 引用本仓库静态资源：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@<TAG>/assets/base.css">
<script src="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@<TAG>/assets/runtime.js" defer></script>
```

`<TAG>` 是仓库 git tag（如 `v0.1.0`）。**Skill 必须维护 tag 版本**，避免改主题样式时把用户已有产出搞炸。

第三方库走公共 CDN：
- Mermaid v10 — `cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js`
- D3 v7 — `cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`
- Markmap v0.17 — `cdn.jsdelivr.net/npm/markmap-view@0.17`
- rough.js v4（仅 hand-drawn 主题用） — `cdn.jsdelivr.net/npm/roughjs@4/bundled/rough.js`
- jsPDF v2.5.2（仅 PDF 导出需要） — `cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js`
- html2canvas v1.4.1（PNG/剪贴板） — `cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`

所有第三方脚本均带 SRI 哈希。

---

## 3. 用户交互流程

### 3.1 主线

```
/ai-draw <需求>
   │
   ▼
[1] 意图识别（不问用户；根据 references/diagram-types.md 关键词表）
   · 画图类型
   · 单图 vs 多图（多图自动走 deck）
   · 显式风格关键词（命中则跳过主题推荐）
   · 显式 "PPT/deck/分享稿" 关键词（命中则跳过模式确认）
   │
   ▼
[2] 主题推荐（除非已显式指定）
   按需求语气从 8 主题里选 3 个（references/themes.md 决策表），1 个标 ⭐ 推荐
   │
   ▼
[3] 模式确认（仅在未推断出时问）
   · 单图（默认）
   · Deck（多图请求 / 用户说"做 PPT"时默认）
   │
   ▼
[4] 生成
   scripts/new.sh 在用户 cwd 下脚手架 ./ai-draw-out/<name>-<theme>/{index.html, README.md}
   更新 ./ai-draw-out/.ai-draw-state.json
   │
   ▼
[5] 完成回执
   路径 + 按键速查 + redo/add/export 命令提示
```

### 3.2 子命令

| 命令 | 行为 |
|---|---|
| `/ai-draw <需求>` | 新建：单图或 deck |
| `/ai-draw redo --style <theme>` | 在最近产出基础上仅修改 `theme-link` 的 href（不重绘） |
| `/ai-draw add <新图描述>` | 追加新 slide 到**最近创建**的 deck；若最近是单图会问要不要升级 |
| `/ai-draw add <新图描述> --to <name>` | 显式指定追加到哪个 deck |
| `/ai-draw export png` | 调用 `scripts/render.sh` 对最近产出生成 PNG |
| `/ai-draw list` | 列出 `./ai-draw-out/` 下所有产出 |

**子命令开关速查**：

| Flag | 适用命令 | 默认 | 行为 |
|---|---|---|---|
| `--style <theme>` | new / redo | 自动推荐 | 显式锁定主题，跳过推荐 |
| `--type <kind>` | new | 自动识别 | 显式锁定画图类型，跳过澄清 |
| `--mode single` / `--mode deck` | new | 自动判断 | 显式锁定单图 / Deck，跳过模式确认 |
| `--no-chrome` | new (deck only) | 含 Agenda + Closing | 跳过包页，只剩 Title + N 张图 |
| `--no-notes` | new / add | 写逐字稿 | 不生成 `<aside class="notes">` |
| `--to <name>` | add | 最近创建的 deck | 显式指定追加到哪个 deck |

### 3.3 主动澄清规则

只有"类型真的有歧义"才主动问。判别词表中**多个类型关键词同时命中**时澄清，否则按最大命中数那一种推：

```
👤 /ai-draw 画一个订单状态转换的图
🤖 这个有两种常见画法：
   ① 流程图  — 顺序流，强调"走到下一步"
   ② 状态图  — 圆圈+箭头，强调"在哪个状态、能去哪个状态"
   （选完后我会推 3 个主题）
```

### 3.4 状态文件 `.ai-draw-state.json`

```jsonc
{
  "lastUpdated": "2026-05-13T12:34:56Z",
  "decks": [
    {
      "name": "技术分享-blueprint",
      "path": "./ai-draw-out/技术分享-blueprint",
      "type": "deck",                          // "deck" | "single"
      "theme": "blueprint",
      "themeRecommendations": ["blueprint", "tech-dark", "cyberpunk-neon"],
      "slides": [
        {"layout": "title", "id": "title"},
        {"layout": "agenda", "id": "agenda"},
        {"layout": "diagram", "diagramType": "architecture", "id": "arch-1"},
        {"layout": "closing", "id": "closing"}
      ],
      "createdAt": "...",
      "createdFrom": "<原 /ai-draw 命令>"
    }
  ]
}
```

---

## 4. 主题系统

### 4.1 CSS Token 设计（`assets/base.css`）

```css
:root {
  /* 背景 */
  --bg: ...; --bg-2: ...; --bg-3: ...;
  /* 文字 */
  --text-1: ...; --text-2: ...; --text-3: ...;
  /* 强调与边框 */
  --accent: ...; --accent-2: ...; --border: ...; --grid: ...;
  /* 语义色（架构图/流程图共用） */
  --sem-frontend: ...; --sem-backend: ...; --sem-db: ...;
  --sem-cloud: ...; --sem-security: ...; --sem-bus: ...; --sem-generic: ...;
  /* 字体 */
  --font-display: ...; --font-body: ...; --font-mono: ...;
  /* 形状 */
  --radius: ...; --radius-lg: ...; --stroke: ...; --shadow: ...;
  /* 图谱专属 */
  --node-fill: ...; --node-stroke: ...; --edge-stroke: ...;
  /* 知识图谱社区色：固定 8 色 palette（不分组也用第 0 个） */
  --community-0: ...; --community-1: ...; ... --community-7: ...;
}
```

每个主题文件只 override 这套变量，不引入新选择器。

### 4.2 8 个主题定位

| # | 主题 | 视觉定位 |
|---|---|---|
| 1 | tech-dark | 暗色技术风（移植自 architecture-diagram 原配色），slate-950 底 + 青/紫/翠语义色，JetBrains Mono |
| 2 | blueprint | 蓝图工程风，深蓝底 + 白色细线 + 密网格 |
| 3 | business-clean | 商务正式风，米白底 + 沉稳蓝/绿强调色，Inter |
| 4 | xhs-soft | 小红书柔色卡片风，奶白底 + 粉橙渐变 + 大圆角 |
| 5 | cyberpunk-neon | 赛博朋克霓虹，纯黑底 + 品红/青/黄发光描边 |
| 6 | minimal-light | 极简白纸风，纯白 + 黑线 + 无强调色 + 无阴影 |
| 7 | academic-paper | 学术论文风，象牙白 + Source Serif + 灰线条 |
| 8 | hand-drawn | 手绘草图风，米黄底 + Caveat 字体 + **rough.js 抖动笔触** |

### 4.3 Claude 选主题决策表（`references/themes.md` 实质内容）

| 用户语气 / 关键词 | 推荐 ① ⭐ | 推荐 ② | 推荐 ③ |
|---|---|---|---|
| 技术分享 / 架构 / 微服务 / tech share | tech-dark | blueprint | cyberpunk-neon |
| 蓝图 / 工程 / engineering / CI/CD | blueprint | tech-dark | minimal-light |
| 客户汇报 / 商务 / 对外 / formal | business-clean | minimal-light | academic-paper |
| 小红书 / 分享卡片 / xhs / 卡片风 | xhs-soft | hand-drawn | minimal-light |
| cyber / 赛博 / 霓虹 / 产品发布 | cyberpunk-neon | tech-dark | blueprint |
| 极简 / minimal / 白底 / 性冷淡 | minimal-light | academic-paper | business-clean |
| 学术 / 论文 / 报告 / paper | academic-paper | minimal-light | business-clean |
| 草稿 / 手绘 / sketch / 白板 | hand-drawn | minimal-light | xhs-soft |
| **未命中关键词的兜底** | tech-dark | minimal-light | business-clean |

规则：
- ⭐ 只标第一个
- 用户产出文件夹名一律带主题后缀：`三层电商架构-tech-dark/`
- 产出 HTML 头部写 `data-themes="tech-dark,blueprint,cyberpunk-neon"`，T 键在这 3 个里循环；`Shift+T` 在全部 8 个里循环

### 4.4 主题 × 类型兼容性提示

下表中标 ⚠️ 的组合，Claude 在生成前**软提示**用户一次（不强制阻止）：

| 主题 \ 类型 | arch | KG | flow | seq | mind | class | er |
|---|---|---|---|---|---|---|---|
| tech-dark | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| blueprint | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| business-clean | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| xhs-soft | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| cyberpunk-neon | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| minimal-light | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| academic-paper | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| hand-drawn | ✅ | ✅ | ✅ | ✅ | ⭐ | ⚠️ | ⚠️ |

---

## 5. 7 种画图类型的实现

### 5.1 架构图 `diagrams/architecture/`

- **渲染**：Claude 作者内联 SVG（移植自 architecture-diagram 套路）
- **布局**：手动坐标
- **适合规模**：5-25 个组件
- **超过 12 组件的 fallback**：使用 ELK auto-layout（`cdn.jsdelivr.net/npm/elkjs@0.9/lib/elk.bundled.js`，~600KB）。在 INSTRUCTIONS.md 里写：组件数 ≤ 12 时 Claude 手算坐标；> 12 时输出 ELK 可吃的 JSON，运行时让 ELK 算
- **配色**：走 `var(--sem-*)` 语义色（frontend/backend/db/cloud/security/bus/generic）
- **关键陷阱（移植自原 SKILL）**：
  - 半透明组件框前画"遮罩 rect"避免箭头穿透
  - 60px 标准组件高度，40px 最小垂直间距
  - 图例放在所有 boundary 之外
- **导出工具栏**：移植自原 architecture-diagram，`⋯` 按钮展开 PNG / PDF / 剪贴板

### 5.2 知识图谱 `diagrams/knowledge-graph/`

- **渲染**：D3 v7 force-directed
- **输入**：`{nodes: [{id, label}], edges: [{source, target, relation?}]}` JSON inline 在 `<script>`
- **一期：不分 community**，所有节点统一用 `var(--node-fill)` + `var(--node-stroke)`；community 字段保留但忽略
- **交互**：拖拽 / hover 高亮邻居 / 双击节点查看邻居列表 / 顶部搜索框
- **适合规模**：20-300 节点；> 300 提示用户走外部 graphify 出预处理图

### 5.3 Mermaid 系（flowchart / sequence / class / er）

- **共用一套壳**，区别在 INSTRUCTIONS.md 教 Claude 哪种语法
- **主题**：**固定使用 Mermaid 内置 `dark` 或 `neutral`**——根据当前主题是否在 dark 名单中（`tech-dark`/`blueprint`/`cyberpunk-neon`）选 `dark`，否则选 `neutral`
- **换主题时**：runtime.js 重新 `mermaid.initialize({theme: ...})` + 重 render
- **不做 themeVariables 精细映射**（已确认放弃）

### 5.4 思维导图 `diagrams/mindmap/`

- **渲染**：Markmap v0.17，吃 Markdown 嵌套列表
- **Claude 工作**：把需求转成 `# / ## / ### / -` 的 markdown，调 `Markmap.create('#mindmap', null, markdown)`
- **主题**：通过 CSS 覆盖 `.markmap-node text` / `.markmap-link` 等选择器

### 5.5 类型对照速查

| 类型 | 库 | 输入形态 | Claude 主要任务 |
|---|---|---|---|
| architecture | 无（SVG） + ELK fallback | 组件清单 + 关系 | 算坐标 / 大图喂 ELK |
| knowledge-graph | D3 | JSON `{nodes, edges}` | 抽节点边 |
| flowchart | Mermaid | mermaid 源码 | 写 graph TD/LR |
| sequence | Mermaid | mermaid 源码 | 写 sequenceDiagram |
| class | Mermaid | mermaid 源码 | 写 classDiagram |
| er | Mermaid | mermaid 源码 | 写 erDiagram |
| mindmap | Markmap | 嵌套 markdown | 拆大纲 |

---

## 6. PPT Deck 模式

### 6.1 形态

**一个 HTML 文件**装多个 `<section class="slide">`，runtime.js 通过 `.slide.is-active` 决定可见。

```
ai-draw-out/技术分享-blueprint/
├── index.html      # 单文件，N 张 slide
└── README.md
```

`<body data-mode="deck">` 让 runtime.js 激活 deck 行为（翻页、演讲者、overview）。单图模式 `<body data-mode="single">`，runtime.js 只激活 T/F/导出工具栏。

### 6.2 内容编排

**单图请求 + 用户主动选 deck**（3 slide 微型 deck）：
1. Title — 自动从需求抽
2. Diagram — 图本身，notes 200 字逐字稿
3. Closing 要点 — 3-4 个 bullet，notes 150 字收尾

**多图请求**（2 + N + 1 slide）：
1. Title
2. Agenda — 自动从图列表生成
3..N+2. 每张图一页（标题 + 图 + 200-300 字逐字稿）
N+3. Closing

**`--no-chrome`**：跳过 Agenda + Closing 包页，只剩 Title + N 张图。

### 6.3 演讲者模式（完整继承 html-ppt）

按 `S` 键弹出独立窗口，4 张可拖拽 / 可拉伸 / localStorage 持久化的卡片：
- 🔵 CURRENT — `<iframe src="index.html?preview=N">` 当前 slide 精确预览
- 🟣 NEXT — 下一张 slide 精确预览
- 🟠 SPEAKER SCRIPT — 当前 `<aside class="notes">` 大字号
- 🟢 TIMER — 计时 + 页码 + 翻页按钮 + R 复位

两窗口通过 `BroadcastChannel` + `postMessage` 同步，**无 reload 无 flicker**。

整块约 600 行 JS **原样移植**自 html-ppt 的 `runtime.js + presenter.js`。

### 6.4 逐字稿规范（`ppt/INSTRUCTIONS.md`）

强制 Claude 遵守 html-ppt 的 3 条规则：
1. **不是讲稿、是提示信号**——加粗核心词 + 过渡句独立成段
2. **每页 150-300 字**——2-3 分钟/页节奏
3. **用口语，不用书面语**——"因此"→"所以"，"该方案"→"这个方案"

**默认开启**。`/ai-draw … --no-notes` 跳过逐字稿。

### 6.5 快捷键速查（写进每份 README）

| 键 | 模式 | 行为 |
|---|---|---|
| ← → / Space / PgDn | deck | 翻页 |
| Home / End | deck | 首页 / 末页 |
| T | 单图 + deck | 在 3 推荐主题间循环 |
| Shift+T | 单图 + deck | 在全部 8 主题间循环 |
| F | 单图 + deck | 全屏 |
| S | deck only | 打开演讲者窗口 |
| O | deck only | slide overview 网格 |
| N | deck only | 底部 notes 抽屉 |
| R | 演讲者窗口 | 复位计时器 |
| Esc | deck | 关弹层 |
| 点击 `⋯` | 单图 + deck | 导出 PNG / PDF / 剪贴板 |

### 6.6 `add` 命令的具体行为

```
/ai-draw add 数据库 ER 图
  → 读 .ai-draw-state.json 的 lastUpdated 那条
  → 若 type === "single"：问 "升级为 deck 还是新建一份 deck？"
  → 若 type === "deck"：
      · 生成新 slide HTML 片段（一张图）
      · 在 "closing" slide 前插入
      · 若存在 "agenda" slide：补一行
      · 更新 state.slides[]
```

`--to <name>` 显式指定 deck 而不是用最近的。

---

## 7. 错误处理 / 兜底 / 测试

### 7.1 错误处理策略

| 场景 | 行为 |
|---|---|
| 用户需求里画图类型完全无法识别 | 列出 7 种类型让用户挑 |
| 用户指定的主题不在 8 个里 | 列出 8 个名字，让用户重选 |
| 架构图组件数 > 12 | 自动切换 ELK auto-layout |
| 知识图谱节点数 > 300 | 警告：建议先用 `graphifyy` 预处理出 graph.json |
| Mermaid 解析失败 | 把 mermaid 源码也写到 `<details>` 标签里，方便用户手工修；同时告诉用户错误信息 |
| `add --to <name>` 指定的 deck 不存在 | 列出 state 里所有 deck 名 |
| `redo` 但 `.ai-draw-state.json` 不存在 | 告诉用户 `./ai-draw-out/` 下没有产出 |
| 用户在没有 git 仓库的目录调用 | 不影响功能，正常生成 |

### 7.2 兜底数据

- 未识别风格关键词 → tech-dark / minimal-light / business-clean
- 未识别图类型 + 命中"画图"动词 → flowchart（最通用）
- 多图请求中某一张图类型识别不出 → 用 flowchart 兜底

### 7.3 测试

**Skill 是声明式的**（SKILL.md + 模板），所以没有传统单测。验证策略：

| 层 | 验证方式 |
|---|---|
| 静态资源 | 每个 `assets/themes/*.css` 必须定义全套 CSS token——写一个 `scripts/check-themes.sh`，扫 base.css 的变量名，确认每个主题文件都覆盖了全套 |
| 模板渲染 | 每个 `diagrams/<type>/template.html` 必须在 8 主题下都打开不报错——写 `scripts/render-all.sh`，用 headless Chrome 跑 7 × 8 = 56 个组合，截图落到 `test-output/` 供人眼检查 |
| Mermaid 主题 | 单独写一份"dark vs neutral"对比 HTML，让人眼确认 Mermaid 视觉跟主题大致协调 |
| 演讲者模式 | 手动 smoke test：S 键打开窗口，确认 4 张卡片显示、可拖拽、`postMessage` 同步 |
| `add` 增量 | 写一份"先 new 再 add 三次"的脚本，确认 state.json 一致、index.html 结构正确、Agenda 正确更新 |

**不写自动化测试**——一期靠脚本生成截图 + 人眼检查。

---

## 8. 从三个源项目的迁移映射

明确哪些代码是**原样移植**、哪些是**重写**：

| 源 | 文件 / 模块 | 去向 | 处理 |
|---|---|---|---|
| architecture-diagram | `resources/template.html` | `diagrams/architecture/template.html` | 原样移植 + 把硬编码颜色换成 CSS 变量 |
| architecture-diagram | 导出工具栏（html2canvas/jsPDF + ⋯ 按钮） | `assets/exporter.js` | 原样移植 |
| architecture-diagram | SVG 配色 / spacing / arrow z-order 规则 | `diagrams/architecture/INSTRUCTIONS.md` | 文字搬运 |
| html-ppt | `assets/base.css` token 思想 | `assets/base.css` | 重写，token 名按本项目命名 |
| html-ppt | `assets/runtime.js`（T/F/O/S 键 + deep-link） | `assets/runtime.js` | 原样移植，删掉不要的 36 主题循环逻辑 |
| html-ppt | 演讲者模式弹窗 + iframe 预览 + BroadcastChannel | `assets/presenter.js` | 原样移植 |
| html-ppt | `scripts/render.sh` headless Chrome 截图 | `scripts/render.sh` | 原样移植 |
| html-ppt | 逐字稿写作规范 | `ppt/INSTRUCTIONS.md` | 文字搬运 |
| html-ppt | 36 主题 / 31 layouts / FX 动画 | 不要 | 一期不引（YAGNI） |
| graphify | HTML viz JS（D3 force-directed + 搜索 + hover） | `diagrams/knowledge-graph/template.html` | 重写（精简版，~80 行 D3） |
| graphify | Python 提取管线 / community 检测 / AST / Whisper | 不要 | 一期不引 |
| graphify | `graph.json` schema | `diagrams/knowledge-graph/INSTRUCTIONS.md` | 文字搬运（数据形态） |

---

## 9. 实施约束

1. **版本化**：仓库必须维护 git tag。每次改 `assets/` 都打新 tag，用户产出 HTML 引用具体 tag 而非 `main` 分支
2. **SRI**：所有 CDN 脚本（含 jsdelivr）写 `integrity="sha384-..."` 哈希，**SKILL.md 必须给 Claude 算 SRI 的步骤**（用 `curl ... | openssl dgst -sha384 -binary | openssl base64 -A`）
3. **CDN 不可用兜底**：产出 README 写明"用户内网时，可把仓库 clone 下来，把所有 jsdelivr 链接 sed 成相对路径"
4. **不污染用户 git**：`./ai-draw-out/` 默认不进版本控制，README 提醒用户加进 `.gitignore`
5. **国际化**：一期只支持中文 + 英文双语关键词识别，主题决策表里两种语言关键词混排

---

## 10. 开放问题（implementation 阶段决定）

| # | 问题 | 倾向 |
|---|---|---|
| 1 | 仓库 git tag 版本号策略（手动打 tag？跟 npm 走？） | 手动，跟 SemVer |
| 2 | `add` 命令往 deck 里插入新 slide 时，主题保持原 deck 主题还是用户能再选？ | 保持原 deck 主题，避免风格混乱 |
| 3 | `redo --style` 是否也允许 `redo --type <新画图类型>`？ | 一期只支持换主题，换类型走 `/ai-draw <新需求>` |
| 4 | `scripts/render.sh` 路径假设（macOS Chrome 路径硬编码） | 实施时加 Linux / Windows 兼容（参考 html-ppt） |

---

## 附录：示例对话（场景速查）

### 场景 1 — 单图自动推荐

```
/ai-draw 帮我画一个三层电商架构（接入层/服务层/数据层），内部技术分享用

→ 识别：架构图 + "技术分享" 语气 + 单图（无多图迹象）
→ 推荐：① tech-dark ⭐  ② blueprint  ③ cyberpunk-neon
→ 询问：单图 / Deck？
→ 用户选 "① ⓐ"
→ 生成 ./ai-draw-out/三层电商架构-tech-dark/{index.html, README.md}
```

### 场景 2 — 显式指定零追问

```
/ai-draw 用 cyberpunk-neon 给我画个微服务调用时序图，单图

→ 识别：sequence + cyberpunk-neon + 单图（全显式）
→ 直接生成 ./ai-draw-out/微服务调用时序图-cyberpunk-neon/
```

### 场景 3 — 多图自动 deck

```
/ai-draw 做一份技术分享 PPT：微服务架构图、调用时序图、核心数据流流程图

→ 识别：3 张图 → deck 模式 + "技术分享" 语气
→ 推荐：① tech-dark ⭐  ② blueprint  ③ cyberpunk-neon
→ 用户选 "②"
→ 生成 5 张 slide（Title + Agenda + 3 张图 + Closing），逐字稿默认开启
```

### 场景 4 — 类型歧义主动澄清

```
/ai-draw 画一个订单状态转换的图

→ 识别：命中 "流程" 和 "状态" 两个关键词 → 歧义
→ 询问：① 流程图 / ② 状态图（用 Mermaid stateDiagram）
→ 用户选 "②"
→ ……（继续主题推荐）
```

### 场景 5 — 追加

```
/ai-draw add 数据库 ER 图

→ 读 state，最近是 "技术分享-blueprint"（deck）
→ 在 Closing 前插入 ER slide
→ Agenda 补一行
```

### 场景 6 — 换主题

```
/ai-draw redo --style blueprint

→ 读 state.lastUpdated
→ sed 改 index.html 的 theme-link href
→ data-themes 列表更新
```
