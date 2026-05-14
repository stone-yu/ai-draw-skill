# ai-draw-skill

A single Claude Skill with **two equal top-level modes** — pick whichever fits your need:

```
/ai-draw <需求>
```

| Mode | Purpose | Triggered by |
|---|---|---|
| 🎤 **PPT 演讲稿** | Multi-slide HTML presentations with full speaker mode | "演讲 / 分享 / PPT / deck / 周报 / 课件 / 小红书图文 / 做一份 PPT" or `--mode ppt` |
| 🖼️ **画图** | Single-page or multi-page architecture diagrams | "画 / 画图 / 架构图 / 流程图 / 时序图 ..." or `--mode single` / `--mode site` |

Ambiguous request? `/ai-draw` will ask once which mode you want — never silently guesses.

---

## 🎤 PPT mode — what it makes

- **36 PPT themes** organized by audience: business / tech sharing / 小红书 / academic / cyber / minimal / designer
- **31 single-page slide layouts**: cover, bullets, two/three-column, kpi-grid, code, terminal, image-grid, comparison, pros-cons, big-quote, table, gantt, roadmap, timeline, mindmap, flow-diagram, arch-diagram, charts (bar/line/pie/radar), process-steps, …
- **15 full-deck templates** (drop-in starting points): `tech-sharing`, `product-launch`, `weekly-report`, `pitch-deck`, `course-module`, `xhs-post`, `xhs-pastel-card`, `xhs-white-editorial`, `presenter-mode-reveal` (with 逐字稿), `graphify-dark-graph`, `knowledge-arch-blueprint`, `hermes-cyber-terminal`, `obsidian-claude-gradient`, `testing-safety-alert`, `dir-key-nav-minimal`
- **27 CSS animations + 20 canvas FX**: `data-anim="fade-up"`, `data-fx="knowledge-graph"`, etc.
- **Speaker mode (`S` key)**: popup window with 4 magnetic cards — current slide preview / next preview / 逐字稿 / timer
- **3-question opening**: content+audience / theme / starting template — same as html-ppt upstream

## 🖼️ 画图 mode — what it makes

- **7 diagram types**: architecture / knowledge graph / flowchart / sequence / mindmap / class / ER
- **8 curated diagram themes**: tech-dark, blueprint, business-clean, xhs-soft, cyberpunk-neon, minimal-light, academic-paper, hand-drawn
- **Multi-page site mode** (`--mode site <markdown.md>`): turn a doc into a hyperlinked architecture site — main page + drill-down subpages with click-through `↗` components, breadcrumbs, cross-page theme sync
- **Mixed mode**: any of the 7 diagram types can be embedded as a slide layout inside PPT mode (best-effort theme inheritance)

---

## Powered by

- **CSS variable token system** (two parallel catalogs — `themes-diagram/` and `themes-ppt/` — kept separate so PPT decorative themes don't pollute architecture-diagram color semantics)
- **Mermaid v10** — flowchart / sequence / class / ER
- **D3 v7** — knowledge graphs (force-directed)
- **Markmap v0.17** — mindmaps (radial)
- **rough.js v4** — hand-drawn theme
- **html2canvas + jsPDF** — PNG / PDF export
- All loaded from public CDNs — no node_modules in your output

---

## Install

This is a Claude Skill. Drop the repo into a location Claude Code discovers (typically `~/.claude/skills/ai-draw/`):

```bash
git clone https://github.com/stone-yu/ai-draw-skill.git ~/.claude/skills/ai-draw
```

Restart Claude Code. The `/ai-draw` command should now be available.

---

## Quick start

### A pure 画图 request

```
/ai-draw 帮我画一个三层电商架构（接入层/服务层/数据层），内部技术分享用
```

→ recommends 3 diagram themes, asks single vs site, produces `./ai-draw-out/三层电商架构-tech-dark/index.html` and auto-opens it.

### A PPT request

```
/ai-draw 做一份产品发布会 PPT，介绍我们的新功能
```

→ asks (1) audience + 页数, (2) recommends 3 PPT themes (e.g. `corporate-clean`, `pitch-deck-vc`, `magazine-bold`), (3) recommends `product-launch` full-deck template. Then scaffolds the deck, writes 逐字稿 in `<aside class="notes">`, auto-opens.

### A multi-page site

```
/ai-draw --mode site docs/system-overview.md
```

→ reads markdown heading tree, generates `index.html` (top architecture) + one subpage per H2 (recursively for deeper headings). Drillable components are linked with `↗`; breadcrumb at top of every subpage; theme syncs across all pages via localStorage.

### Forcing a mode

```
/ai-draw --mode ppt 我想做一份周报
/ai-draw --mode single 简单画一个时序图
/ai-draw --mode site docs/<file>.md
```

---

## Subcommands

| Command | Action |
|---|---|
| `/ai-draw <需求>` | New (auto-routed to PPT / single / site) |
| `/ai-draw --mode ppt <需求>` | Force PPT mode |
| `/ai-draw --mode single <需求>` | Force single-image diagram |
| `/ai-draw --mode site <md>` | Force multi-page architecture site |
| `/ai-draw redo --style <theme>` | Swap theme on most-recent output |
| `/ai-draw add <需求>` | PPT: append a slide; site: append a subpage |
| `/ai-draw add --to <ppt-name> <slide>` | Target a specific PPT |
| `/ai-draw add --to <site> --under <parent> <component>` | Append drill-down subpage |
| `/ai-draw export png` | Render most-recent output to PNG (per-page for sites) |
| `/ai-draw list` | Show all outputs in `./ai-draw-out/` |

**Auto-open by default.** Every generation, `add`, and `redo` opens the resulting file in your default browser via `scripts/open.sh` (macOS / Linux / WSL / Windows). To disable: `--no-open` per command, or `AI_DRAW_NO_OPEN=1` in your environment.

---

## Output

Generated under `<your-cwd>/ai-draw-out/<name>-<theme>/`:

```
ai-draw-out/
├── 产品发布-corporate-clean/        # PPT mode output
│   ├── index.html                  # auto-opened (15 slides, full-deck = product-launch)
│   ├── style.css                   # scoped CSS from full-deck template
│   └── README.md                   # keyboard / theming / export
├── 三层电商架构-tech-dark/           # 画图 single mode
│   ├── index.html
│   └── README.md
├── 微服务文档-blueprint/             # 画图 site mode
│   ├── index.html
│   ├── pages/
│   │   ├── user-service.html
│   │   └── ...
│   └── README.md
└── .ai-draw-state.json              # tracks `add` / `redo` / `export` targets
```

Add `.ai-draw-out/` to your `.gitignore` — we don't write any git config for you.

---

## Verification

```bash
./scripts/check-themes.sh    # confirm every diagram theme overrides every base.css token
./scripts/render-all.sh      # render every example × every theme to test-output/
```

---

## Related projects

ai-draw is built by absorbing ideas from:

- [fireworks-tech-graph](https://github.com/yizhiyanhua-ai/fireworks-tech-graph) — knowledge graph viz inspiration (D3 force-directed); ships a Python `graphifyy` package as its CLI tool
- [architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator) — SVG arch diagram template + dark color system + export toolbar
- [html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) — entire PPT mode (36 themes / 31 layouts / 27 anim / 20 FX / 15 full-decks / speaker window / runtime) ported wholesale into ai-draw v0.3 with namespace adjustments

If you need a feature ai-draw doesn't have (e.g. fireworks-tech-graph's full Python extraction pipeline via `graphifyy`), use the upstream project directly.

---

## Versions

- **v0.1** — diagram-first design with optional PPT deck wrapper (deprecated; outputs of this era are tagged `type: "deck-legacy"` in state)
- **v0.2** — added `--mode site` (multi-page architecture sites from markdown)
- **v0.3** *(current)* — positioning shift to two equal modes: full PPT alongside 画图; ports html-ppt assets wholesale; `--mode ppt` is the new front door

## License

MIT.
