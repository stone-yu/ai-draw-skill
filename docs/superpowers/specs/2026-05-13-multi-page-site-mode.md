# `--mode site` Multi-Page Architecture Sites — Design

| | |
|---|---|
| 日期 | 2026-05-13 |
| 版本目标 | v0.2 |
| 状态 | Spec — 用户跳过单独 plan 阶段直接进实现 |

## 0. 一句话

`/ai-draw --mode site <markdown.md>` 把一份带标题层级的 markdown 转成"主页 + 下钻子页"的多页架构站。每个标题一页，组件可点跳转，面包屑回溯，全部架构图，主题跨页同步。

## 0.1 跟"Claude 在原 architecture-diagram skill 里临场拆多页"的关系

需要明确：**原 architecture-diagram 的 SKILL.md 声明是单文件**（"Always produce a single self-contained `.html` file"），但是 Claude 在跑这个 skill 时，**遇到丰富输入（多份文档 / 多个相互关联子系统）会自己改写约束、生成多文件**。这是 Claude 的灵活性，不是 skill 的契约。

我们的 site mode 不是"补 architecture-diagram 缺的能力"，而是**把这种临场行为结构化**：

| 维度 | architecture-diagram + Claude 临场 | ai-draw `--mode site` |
|---|---|---|
| 触发 | 输入"看起来很复杂"时 Claude 自行决定 | 显式 `--mode site` flag 或关键词 |
| 文件结构 | 每次不一样 | 固定：`index.html` + `pages/<slug>.html` 递归 |
| 导航 | Claude 自己想（可能没有） | 强制：`<a xlink:href>` + `↗` + 面包屑 |
| 主题切换 | 子页可能不同步 | localStorage `data-site-id` 跨页同步 |
| 状态追踪 | 无 | `.ai-draw-state.json` 含 `tree` |
| 后续操作 | 没有 `add` / `redo` 接口 | `add --to <site> --under <parent>` 等 |

简言之：site mode 的差异化价值是**可重复 / 可契约 / 可二次操作**，不是"独家能力"。

## 1. 输入

- **必填**：`<markdown-path>`（相对或绝对）
- **flags**：
  - `--max-depth <N>` 默认 3
  - `--slug-style <kebab|pinyin>` 默认 kebab
  - `--style <theme>` 跳过主题推荐
  - `--no-open` / `--no-notes` 沿用语义
- **隐式触发**：用户给 md 路径 + 说"多页 / drill down / 多页架构"也走 site（不一定要 --mode site）

## 2. Markdown → 树（Claude 主控算法）

1. 读 md，解析标题
2. H1 缺失 → Claude 综合全文造一个虚拟"系统总览"H1
3. 每个 H2 = 一级子页（`pages/<slug>.html`）
4. 每个 H3 = 二级子页（`pages/<H2-slug>/<H3-slug>.html`），同理递归
5. 超 `--max-depth` 的标题合并到父页正文
6. 节内容用于：① 画架构图 ② 子节列出来当可点组件

## 3. Subagent 扇出（核心机制）

- 主控（这个会话的 Claude）：读 md、规划树、生成 `index.html`、写 state、open
- N 个并发 subagent（haiku，上限 8，超出分批）：每个负责一个子页
- 每个 subagent 拿到：slug / 输出路径 / 主题 / 主题列表 / 面包屑链 / 子节列表 / 节正文
- subagent 强制读 `diagrams/architecture/INSTRUCTIONS.md` + 填 `site/subpage-template.html`，绝不动其它页

## 4. 可点组件 + 面包屑

**可点组件**（写进 `diagrams/architecture/INSTRUCTIONS.md` 新增 §11）：

```html
<a xlink:href="pages/order-service.html">
  <rect ... fill="var(--bg-2)"/>
  <rect ... fill="var(--sem-backend)" fill-opacity="0.4" stroke="var(--sem-backend)"/>
  <text ...>OrderService</text>
  <text ...>spring-boot</text>
  <text x="X+W-12" y="Y+14" fill="var(--accent)" font-size="14"
        text-anchor="end" font-weight="700">↗</text>
</a>
```

**面包屑**（子页顶部）：

```html
<nav class="ai-draw-breadcrumb">
  <a href="../index.html">电商系统总览</a> ›
  <a href="../user-service.html">User Service</a> ›
  <span>Auth Module</span>
</nav>
```

CSS 都走现有 token，不新增。

## 5. 跨页主题同步（localStorage）

`assets/runtime.js` 改动：
- 页面带 `<html data-site-id="<slug>">` 时，`applyTheme()` 后把主题写到 `localStorage["ai-draw-site-theme:" + siteId]`
- 页面加载时若 `data-site-id` 存在，读 localStorage 覆盖默认主题

跨设备同步不在范围内（README 注明）。

## 6. 子命令支持

| 命令 | 行为 |
|---|---|
| `/ai-draw --mode site <md>` | 生成完整站点 |
| `/ai-draw add --to <site> --under <parent-slug> <component>` | 新增一个子页 |
| `/ai-draw redo --style <theme>` | sed 替换站点内所有页的 theme-link |
| `/ai-draw export png` | 渲染所有页为 `<site>/png/<slug>.png` |
| `/ai-draw list` | site 行：`<name>  site  N pages` |

## 7. 状态文件扩展

```jsonc
{
  "name": "电商系统总览-tech-dark",
  "type": "site",
  "theme": "tech-dark",
  "themeRecommendations": ["tech-dark", "blueprint", "cyberpunk-neon"],
  "sourceMarkdown": "docs/system.md",
  "tree": [
    {"slug": "index", "title": "...", "path": "index.html", "children": [...]},
    {"slug": "user-service", "title": "...", "path": "pages/user-service.html", "parent": "index", "children": [...]},
    ...
  ],
  "createdAt": "...",
  "createdFrom": "..."
}
```

## 8. 仓库新增文件

```
site/
├── INSTRUCTIONS.md           主控算法（markdown→树、subagent 扇出协议、写 state）
├── subagent-prompt.md        subagent 接受的 prompt 模板
├── index-template.html       主页模板（base 是 architecture template + data-site-id）
├── subpage-template.html     子页模板（多了面包屑 chrome）
└── examples/
    └── ecommerce-tech-dark/  完整范例站（5 页）

assets/runtime.js             +localStorage 主题同步
diagrams/architecture/INSTRUCTIONS.md  +§11 Drillable components
SKILL.md                      +site 子段 / +--mode site / +--max-depth / +--slug-style flags
INTERACTION.md                +site flow
README.md                     +mention site mode
```

## 9. 错误处理

| 场景 | 行为 |
|---|---|
| md 文件不存在 | 报路径错 + 列 cwd 下所有 .md |
| md 完全无标题 | 退化为 single 模式 + 提示 |
| 某 subagent 失败 | retry 1 次 → 仍败则该子页 stub："运行 /ai-draw fill <slug>" 重生（fill 命令一期不实现，stub 含说明） |
| 子页数 > 30 | 警告 + 建议 --max-depth 2 |
| `add --under` parent 不存在 | 列已有 slug |
| 跨设备 localStorage 不同步 | 已知限制，README 注明 |

## 10. YAGNI（一期不做）

- search / sidebar / 全站索引
- 子页用非架构图类型
- GitHub Pages 自动发布
- markdown 内嵌 mermaid 透传
- `/ai-draw fill <slug>` 命令（subagent 失败时只放 stub 提示）
