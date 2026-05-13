# ai-draw-skill

A single Claude Skill that consolidates 3 open-source projects' diagramming + theming + presentation capabilities into one command:

```
/ai-draw <需求>
```

Trigger it inside Claude Code, answer 1-2 questions about style and mode, and get a self-contained HTML you can open in any browser, share, or present.

## What it makes

- **7 diagram types**: architecture / knowledge graph / flowchart / sequence / mindmap / class / ER
- **8 curated themes**: tech-dark, blueprint, business-clean, xhs-soft, cyberpunk-neon, minimal-light, academic-paper, hand-drawn
- **PPT deck mode**: multi-slide HTML with keyboard nav, presenter window (4-card layout: current preview / next preview / speaker script / timer), and PNG export
- **Multi-page site mode** *(v0.2)*: feed a markdown doc, get a hyperlinked architecture site — main page + drill-down subpages, with click-through `↗` components, breadcrumbs, and cross-page theme sync

Powered by:
- **CSS variables** for the 8-theme system
- **Mermaid v10** for flowchart / sequence / class / ER
- **D3 v7** for knowledge graphs
- **Markmap v0.17** for mindmaps
- **rough.js v4** for the hand-drawn theme
- **html2canvas + jsPDF** for PNG / PDF export
- All loaded from public CDNs (no node_modules)

## Install

This is a Claude Skill. Drop the repo into a location Claude Code discovers (typically `~/.claude/skills/ai-draw/` or as a plugin):

```bash
git clone https://github.com/stone-yu/ai-draw-skill.git ~/.claude/skills/ai-draw
```

Restart Claude Code. The `/ai-draw` command should now be available.

## Quick start

```
/ai-draw 帮我画一个三层电商架构（接入层/服务层/数据层），内部技术分享用
```

→ recommends 3 themes, asks single vs deck, produces `./ai-draw-out/三层电商架构-tech-dark/index.html`.

```
/ai-draw 做一份技术分享 PPT：微服务架构图、调用时序图、核心数据流流程图
```

→ produces a 5-slide deck with title + agenda + 3 diagrams + closing, with speaker notes on each slide.

```
/ai-draw --mode site docs/system-overview.md
```

→ reads the markdown's heading tree, generates a main architecture page + one subpage per `## H2` (recursively for deeper headings). Drillable components are linked with `↗`; breadcrumb at top of every subpage; theme toggles sync across all pages via localStorage.

## Subcommands

| Command | Action |
|---|---|
| `/ai-draw <需求>` | New diagram or deck |
| `/ai-draw --mode site <md>` | New multi-page architecture site from a markdown doc |
| `/ai-draw redo --style <theme>` | Swap theme on most-recent output (site mode applies to all pages) |
| `/ai-draw add <需求>` | Append slide to most-recent deck |
| `/ai-draw add --to <site> --under <parent> <component>` | Append a drill-down subpage to a site |
| `/ai-draw export png` | Render most-recent output to PNG (per-page for sites) |
| `/ai-draw list` | Show all outputs in `./ai-draw-out/` |

**Auto-open by default.** Every generation, `add`, and `redo` opens the resulting file in your default browser via `scripts/open.sh` (macOS / Linux / WSL / Windows). To disable, pass `--no-open` per command, or set `AI_DRAW_NO_OPEN=1` in your environment globally.

## Output

Generated under `<your-cwd>/ai-draw-out/<name>-<theme>/`:

```
ai-draw-out/
├── 三层电商架构-tech-dark/
│   ├── index.html      # auto-opened in your browser
│   └── README.md       # keyboard / theming / export instructions
└── .ai-draw-state.json # tracks recent outputs for `add` / `redo` / `export`
```

Add `.ai-draw-out/` to your `.gitignore` (we don't write any git config — this is on you).

## Verification

```bash
./scripts/check-themes.sh    # confirm every theme overrides every base.css token
./scripts/render-all.sh      # render every example × every theme to test-output/
```

## Related projects

ai-draw is built by absorbing ideas from:

- [graphify](https://github.com/yizhiyanhua-ai/fireworks-tech-graph) — knowledge graph viz inspiration (D3 force-directed)
- [architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator) — SVG arch diagram template + dark color system + export toolbar
- [html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) — slide runtime, presenter window, speaker-notes convention

If you need a feature ai-draw doesn't have (e.g. graphify's full Python extraction pipeline, or html-ppt's 36-theme catalog), use the upstream project directly.

## License

MIT.
