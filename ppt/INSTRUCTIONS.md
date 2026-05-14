# ppt/ — PPT 模式完整创作指南

本文件是 `SKILL.md` PPT 路由的权威参考。覆盖布局库、主题目录、动画 / FX、全 deck 模板、混合 slide、演讲稿规则和快速启动流程。

---

## § 1 Slide 从哪里来

PPT 模式有两个 slide 来源，可混用：

### 来源 A — 单页布局库（`assets/layouts/`）

共 31 个布局文件，每个是一段 `<section class="slide">` 的 HTML 骨架 + demo 数据。  
用法：从对应文件中复制骨架，把 demo 数据替换为真实内容，拼到 index.html 里。

### 来源 B — 全 deck 模板（`ppt/full-decks/<name>/`）

共 15 个完整的多 slide 模板，每个文件夹是自包含的（带独立 scoped CSS `.tpl-<name>`）。  
用法：将整个文件夹复制到 `./ai-draw-out/<output-name>/`，然后定制内容。

---

## § 2 布局目录（31 个布局）

### 封面 / 导航类

| 布局文件 | 用途 |
|---|---|
| `cover.html` | 封面 / 标题页，大标题 + 副标题 |
| `toc.html` | 目录页（Table of Contents） |
| `section-divider.html` | 章节分隔页，醒目大字 |
| `thanks.html` | 致谢 / Q&A 结语页 |
| `cta.html` | Call to Action 行动召唤页 |

### 内容类

| 布局文件 | 用途 |
|---|---|
| `bullets.html` | 经典要点列表（3-5 条） |
| `two-column.html` | 左右两栏，适合对比 + 说明 |
| `three-column.html` | 三栏，适合三要素 / 三步骤 |
| `comparison.html` | A vs B 对比，高亮差异点 |
| `pros-cons.html` | 优缺点 / 利弊分析 |
| `big-quote.html` | 大字引言 / 名言页 |
| `table.html` | 数据表格 |
| `todo-checklist.html` | 待办清单 / 检查项 |
| `diff.html` | Before / After 差异对比 |

### 图表 / 数据类

| 布局文件 | 用途 |
|---|---|
| `kpi-grid.html` | KPI 指标方格（数字 + 说明） |
| `stat-highlight.html` | 单一大数字 / 核心统计 |
| `chart-bar.html` | 柱状图 slide |
| `chart-line.html` | 折线图 slide |
| `chart-pie.html` | 饼图 / 环图 slide |
| `chart-radar.html` | 雷达图 slide |

### 流程 / 时间线类

| 布局文件 | 用途 |
|---|---|
| `process-steps.html` | 步骤流程（横向 / 编号） |
| `timeline.html` | 时间线，历史 / 里程碑 |
| `roadmap.html` | 产品 / 项目路线图（横向泳道） |
| `gantt.html` | 甘特图（项目计划） |

### 图 / 媒体类

| 布局文件 | 用途 |
|---|---|
| `image-hero.html` | 单张大图 + 说明文字 |
| `image-grid.html` | 多图网格（2×2 / 3×2） |
| `arch-diagram.html` | 架构图容器（嵌入 SVG 或图） |
| `flow-diagram.html` | 流程图容器 |
| `mindmap.html` | 思维导图容器 |

### 代码 / 技术类

| 布局文件 | 用途 |
|---|---|
| `code.html` | 代码块 slide，带语法高亮框 |
| `terminal.html` | 终端 / CLI 命令演示风格 |

---

## § 3 全 deck 模板目录（15 个）

位于 `ppt/full-decks/<name>/`，每个文件夹自包含（scoped CSS `.tpl-<name>`）。

| 模板名 | 适用场景 |
|---|---|
| `product-launch` | 产品发布会，功能亮点展示 |
| `tech-sharing` | 技术分享 / 工程内部分享 |
| `weekly-report` | 周报 / 进度汇报 |
| `pitch-deck` | 融资路演 / VC 演示 |
| `course-module` | 课程单元 / 培训课件 |
| `presenter-mode-reveal` | 演讲者模式专用，完整逐字稿示例 |
| `xhs-white-editorial` | 小红书图文（白底编辑风，横版） |
| `xhs-pastel-card` | 小红书柔色卡片（马卡龙调） |
| `xhs-post` | 小红书竖版图文（3:4 比例） |
| `graphify-dark-graph` | 知识图谱 / 图谱分享，深色风 |
| `knowledge-arch-blueprint` | 架构蓝图 / 系统设计分享 |
| `hermes-cyber-terminal` | 酷炫赛博终端风，技术 / CLI 主题 |
| `obsidian-claude-gradient` | 深紫渐变，知识管理 / AI 工具分享 |
| `testing-safety-alert` | 测试报告 / 安全告警 / 应急事件 |
| `dir-key-nav-minimal` | 极简目录导航，适合结构性内容 |

---

## § 4 主题目录（36 个 themes-ppt）

主题文件位于 `assets/themes-ppt/`。按观众 / 场景分组：

### 商务 / 投资人 / 路演

| 主题 | 一句话描述 |
|---|---|
| `pitch-deck-vc` ⭐ | YC 风白底 + 蓝紫渐变 accent + 大留白，融资路演首选 |
| `corporate-clean` | 纯白 + 海军蓝 + Inter，董事会 / B2B 销售 |
| `swiss-grid` | 瑞士网格 + Helvetica 感 + 12 栏底纹，严肃排版 |
| `editorial-serif` | 杂志风 Playfair 衬线 + 奶油底，品牌故事 |
| `minimal-white` | 极简白，Inter，极低阴影，内部汇报不抢内容 |

### 技术 / 工程 / 分享

| 主题 | 一句话描述 |
|---|---|
| `tokyo-night` ⭐ | Tokyo Night 蓝夜，偏冷技术分享 / 基础设施 |
| `dracula` | 经典 Dracula 紫红，代码密集技术分享 |
| `catppuccin-mocha` | catppuccin 深色，开发者内部分享 / 长时间观看 |
| `catppuccin-latte` | catppuccin 浅色，开发者极客友好的技术分享 |
| `terminal-green` | 绿屏终端 + 等宽 + 发光文字，CLI / 复古朋克 |
| `blueprint` | 蓝图工程 + 网格底纹，系统架构 / 工程蓝图 |
| `nord` | 北欧清冷蓝白，基础设施 / 云产品 |
| `gruvbox-dark` | 温暖复古深色，Terminal / vim / *nix 社群 |
| `solarized-light` | 经典低眩光，长时间观看的工作坊 / 教学 |
| `rose-pine` | 玫瑰松柔和暗色，设计+开发交界审美向 |

### 小红书 / 卡片 / 营销

| 主题 | 一句话描述 |
|---|---|
| `xiaohongshu-white` ⭐ | 小红书白底 + 暖红 accent + 衬线标题 |
| `soft-pastel` | 柔和马卡龙三色渐变，产品发布 / 消费者向 |
| `magazine-bold` | 奶油底 + 超大 Playfair + 橙色 spot，专栏封面 |
| `rainbow-gradient` | 白底 + 彩虹流动渐变 accent，欢乐 / 节日 |
| `aurora` | 极光渐变 + blur，封面 / CTA / 结语页 |
| `sunset-warm` | 橘/珊瑚/琥珀渐变，生活方式 / 情绪正向 |
| `arctic-cool` | 蓝/青/石板灰浅色版，商业分析 / 金融 |

### 学术 / 报告 / 论文

| 主题 | 一句话描述 |
|---|---|
| `academic-paper` ⭐ | 论文白 + 衬线正文 + 黑墨 + 蓝链接 |
| `editorial-serif` | 杂志风 Playfair 衬线，文字密度大的长文演讲 |
| `minimal-white` | 极简白，内部汇报 / 技术评审 |
| `engineering-whiteprint` | 白底 + 坐标纸网格 + 海军墨线 + 等宽字，API 文档 / 白皮书 |
| `news-broadcast` | 白底 + 红色竖条 + Oswald 大写，数据播报 / 新闻风 |

### 赛博 / 强烈 / 发布会

| 主题 | 一句话描述 |
|---|---|
| `cyberpunk-neon` ⭐ | 纯黑 + 霓虹粉青黄 + 发光，黑客 / 赛博 talk |
| `vaporwave` | 深紫 + 粉红青蓝渐变，潮流艺术 / A E S T H E T I C |
| `y2k-chrome` | 银铬渐变 + 彩虹 accent + 大圆角，千禧怀旧 / Gen-Z |
| `neo-brutalism` | 厚描边 + 硬阴影 + 明黄 accent，创业路演 / 敢说敢做 |
| `retro-tv` | 暖奶油 + CRT 扫描线 + 琥珀橙，怀旧叙事 / 八九十年代 |

### 极简 / 克制

| 主题 | 一句话描述 |
|---|---|
| `minimal-white` ⭐ | 极简白，无强调色，内容优先 |
| `swiss-grid` | 瑞士网格，严肃排版设计 |
| `japanese-minimal` | 象牙白 + 朱红 accent + 极大留白，禅意叙事 |
| `sharp-mono` | 纯黑白 + Archivo Black + 硬阴影，宣言类视觉 |

### 设计师 / 创意

| 主题 | 一句话描述 |
|---|---|
| `bauhaus` ⭐ | 几何 + 红黄蓝原色，设计 talk / 产品美学 |
| `memphis-pop` | 孟菲斯波普背景点 + 大字标题，年轻 / 品牌合作 |
| `midcentury` | 奶油底 + 芥末/青/焦橙 + 锐利几何，设计史 / 复古品牌 |
| `glassmorphism` | 毛玻璃 + 多色光斑背景，Apple 式发布会 |

---

## § 5 动画使用

### CSS 入场动画（27 个，`assets/animations.css`）

在任意元素上加 `data-anim="<name>"`：

```html
<h2 data-anim="fade-up">系统架构</h2>
<ul class="anim-stagger-list">
  <li>前端层</li>
  <li>API 网关</li>
  <li>数据库</li>
</ul>
```

`anim-stagger-list` 加在 `<ul>` / 网格容器上，子项依次入场。  
常用动画名：`fade-up` / `fade-in` / `slide-right` / `zoom-in` / `flip-x` / `bounce` / `blur-in` / `typewriter`（完整列表共 27 个）。

### Canvas FX 动画（20 个，`assets/fx/*.js`）

在元素上加 `data-fx="<name>"`，引入 `assets/fx-runtime.js`，FX 在 slide 进入时自动初始化，离开时自动清理：

```html
<div data-fx="knowledge-graph" style="width:100%;height:400px;"></div>
<script src="https://cdn.jsdelivr.net/gh/stone-yu/ai-draw-skill@v0.3.0/assets/fx-runtime.js"></script>
```

完整 FX 列表：
`particle-burst` / `confetti-cannon` / `firework` / `starfield` / `matrix-rain` /
`knowledge-graph`（力导向图）/ `neural-net`（脉冲）/ `constellation` / `orbit-ring` /
`galaxy-swirl` / `word-cascade` / `letter-explode` / `chain-react` / `magnetic-field` /
`data-stream` / `gradient-blob` / `sparkle-trail` / `shockwave` / `typewriter-multi` / `counter-explosion`

---

## § 6 演讲稿规则（Speaker notes / 逐字稿）

默认开启（`--no-notes` 可跳过）。用 `<aside class="notes">` 包裹，默认不显示（只在 S 键演讲者模式中可见）。

**三条规则**（来自 html-ppt 演讲者模式设计）：

1. **不是讲稿，是提示信号** — 加粗核心词，每个过渡句独立成段
2. **每页 150-300 字** — 约 2-3 分钟的讲述节奏
3. **用口语，不用书面语** — "因此" → "所以"；"该方案" → "这个方案"；"进行讨论" → "聊聊"

演讲场景时，优先推荐使用 `presenter-mode-reveal` 全 deck 模板——它专为演讲者模式设计，每页都有完整示例逐字稿。

演讲者模式（S 键）弹出四张磁性卡片：
- **CURRENT** — 当前 slide 的 iframe 实时预览
- **NEXT** — 下一 slide 的 iframe 实时预览
- **SPEAKER SCRIPT** — 大字逐字稿（滚动）
- **TIMER** — 计时器 + slide 计数 + prev/next/reset 按钮

---

## § 7 混合 slide（PPT 中嵌入图）

当某页需要展示架构图、流程图等 7 种图类型之一时：

1. 使用 `assets/layouts/arch-diagram.html` 或 `assets/layouts/flow-diagram.html` 骨架
2. 在 `<section>` 上加 `data-diagram-type="<type>"`（architecture / flowchart / sequence / mindmap / knowledge-graph / class / er）
3. 读对应 `diagrams/<type>/INSTRUCTIONS.md`，生成 SVG 内联到 slide 里
4. 颜色只用 PPT 主题有的 token：`var(--bg)` / `var(--bg-soft)` / `var(--text-1)` / `var(--text-2)` / `var(--accent)` / `var(--accent-2)`
5. **不使用** `--sem-frontend` / `--sem-backend` / `--sem-db` 等画图专属 token（PPT 主题不定义这些）；如需语义区分，改用固定颜色或退化为单一 accent

示例骨架：

```html
<section class="slide layout-arch-diagram" data-diagram-type="architecture">
  <h2>系统整体架构</h2>
  <div class="diagram-container">
    <svg viewBox="0 0 800 500" style="max-height:70vh;">
      <!-- 节点颜色用 var(--accent) / var(--bg-soft) / var(--text-1) -->
    </svg>
  </div>
  <aside class="notes">（150-300 字的讲解逐字稿）</aside>
</section>
```

---

## § 8 快速启动（3 步）

```bash
# 1. 脚手架
./scripts/new.sh my-talk-tokyo-night    # 创建 ./ai-draw-out/my-talk-tokyo-night/

# 2. 复制全 deck 模板（可选，也可从 layouts/ 拼）
cp -r ppt/full-decks/tech-sharing/* ai-draw-out/my-talk-tokyo-night/

# 3. 打开预览
./scripts/open.sh ai-draw-out/my-talk-tokyo-night/index.html
```

主题热切换：文件中修改 `<link id="theme-link" href="...themes-ppt/<new>.css">` 后刷新，或直接按 T 键在 data-themes 列表间循环。

---

## § 9 ppt/ 文件结构

```
ppt/
├── INSTRUCTIONS.md          — 本文件（PPT 模式创作指南）
├── README-template.md       — 生成产出时 README.md 的模板
└── full-decks/
    ├── product-launch/      — 产品发布全 deck
    ├── tech-sharing/        — 技术分享全 deck
    ├── weekly-report/       — 周报全 deck
    ├── pitch-deck/          — 路演全 deck
    ├── course-module/       — 课程全 deck
    ├── presenter-mode-reveal/ — 演讲者模式 + 逐字稿全 deck
    ├── xhs-white-editorial/ — 小红书白底编辑风
    ├── xhs-pastel-card/     — 小红书柔色卡片
    ├── xhs-post/            — 小红书竖版 3:4
    ├── graphify-dark-graph/ — 知识图谱分享
    ├── knowledge-arch-blueprint/ — 架构蓝图
    ├── hermes-cyber-terminal/ — 赛博终端风
    ├── obsidian-claude-gradient/ — 深紫渐变 AI 分享
    ├── testing-safety-alert/ — 测试 / 安全 / 告警
    └── dir-key-nav-minimal/  — 极简目录导航
```

运行时资产（通过 jsDelivr CDN 引用，无需本地复制）：

```
assets/
├── themes-ppt/<name>.css     — 36 个 PPT 主题
├── layouts/<name>.html       — 31 个单页布局模板
├── animations.css            — 27 个 CSS 入场动画
├── fx/<name>.js              — 20 个 canvas FX 模块
├── fx-runtime.js             — FX 自动初始化
├── runtime-ppt.js            — PPT 运行时（翻页 / 演讲者 / 总览 / notes）
├── exporter.js               — PNG/PDF/剪贴板导出工具栏
└── base.css                  — token 基础层（由主题 CSS 覆盖）
```
