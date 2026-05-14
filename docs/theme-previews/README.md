# Theme previews — canonical example & add-a-theme workflow

This directory holds **one PNG per `themes-diagram/` theme**, all rendered from a **single frozen example** so themes can be compared side-by-side. The PNGs are referenced from the top-level README's Themes table.

---

## The canonical example (DO NOT modify casually)

**File**: [`diagrams/architecture/examples/ai-app-stack-showcase.html`](../../diagrams/architecture/examples/ai-app-stack-showcase.html)

**Topic**: Modern AI App Stack · Data → Model → Pipeline · 3-piece blueprint

**Why this one?** It was chosen as the showcase baseline because it:
- Uses a **3-column layout** (left list / middle dual-card / right pipeline) — exercises horizontal arrangement
- Contains **icon-badged list items**, **multi-color sub-cards**, **pill section headers**, **decorative title**, **gradient CTA**, **dashed callouts**, and a **bottom summary band** — exercises every visual primitive saas-modern / glassmorphism / etc. were designed for
- Covers **all 7 semantic colors** (`--sem-frontend / --sem-backend / --sem-db / --sem-cloud / --sem-security / --sem-bus` + accents) — every theme's palette gets stressed
- Has **neutral / industry-recognized content** (AI app architecture) — no tie-in to a specific user / product

**Don't edit it** unless you're willing to re-render and audit all 12 themes. Consistency across themes depends on the example being frozen.

If you want to add a different example for special purposes (e.g. a class-diagram showcase, a sequence-diagram showcase), add a new file alongside it — don't replace this one.

---

## Coverage matrix

The canonical example uses the following tokens. New themes must define each (the strict check in `scripts/check-themes.sh` enforces this).

| Token group | Example usage in showcase |
|---|---|
| `--bg`, `--bg-2`, `--border` | Page bg, big card surfaces, card outlines |
| `--text-1`, `--text-2`, `--text-3` | Primary headings, secondary labels, dashed separator |
| `--accent`, `--accent-2` | Section header pills, forward arrows, summary band, CTA |
| `--sem-frontend` | iOS app card / Query Input step / 业务数据库 badge |
| `--sem-backend` | Order/User Services / LLM step / 用户对话日志 badge |
| `--sem-db` | PostgreSQL/Redis / RAG Retrieval step / 搜索点击流 badge |
| `--sem-cloud` | CDN/S3/BigQuery / Re-rank step / 实时事件 badge |
| `--sem-security` | WAF/Auth / Safety step / PII 脱敏 badge |
| `--sem-bus` | Kafka bus / Eval step / 多模态语料 badge |
| `--sem-generic` | External Stripe / dashed connections |
| `--grid` | Background grid pattern |
| `--radius`, `--radius-lg` | Card rounding (inner / outer) |
| `--shadow` | Drop shadow on the diagram wrapper |
| `--font-display`, `--font-body` | Title vs body typography |
| `--mermaid-flavor` | Built-in dark/neutral for mermaid-based examples |

---

## Adding a new theme — checklist

Follow this exact sequence. Each step is small; the rule is **don't skip the README table**.

### 1. Write the theme CSS

```bash
# Create the theme file
$ touch assets/themes-diagram/<new-theme>.css
```

Override **every** token from `assets/base.css`. Use existing themes as references — `business-clean.css` for light, `tech-dark.css` for dark.

### 2. Verify token coverage

```bash
$ bash scripts/check-themes.sh
```

Output must end with `✓ <new-theme>.css` (and all other themes still passing). If any token is missing, the script lists which.

### 3. Add to render-previews + render-all

Append your theme name to the `THEMES=(...)` array in both:
- `scripts/render-previews.sh`
- `scripts/render-all.sh`

### 4. Generate the preview PNG

```bash
$ bash scripts/render-previews.sh
```

Look for `✓ <new-theme>` in the output. The PNG lands at `docs/theme-previews/<new-theme>.png`.

Open the PNG and eyeball it. If contrast / readability looks bad, iterate on the CSS and re-run.

### 5. Register in `references/themes.md`

Four updates here:
- **Count** at top: `(N → N+1 个)`
- **Recommendation table** (一、画图模式主题): add a row mapping user keywords to your theme as top pick
- **One-liner description** in the bulleted list under the recommendation table
- **Compatibility matrix** (兼容性提示矩阵): add a row marking your theme × each diagram type (✅ / ⚠️ / ⭐)
- **Display alias table** (画图主题显式覆盖关键词): map alternate names users might type

### 6. Update counts everywhere

Search-and-replace the old count to N+1 in:
- `SKILL.md` — 3 occurrences (`9 themes-diagram`, `9 themes-diagram + 36 themes-ppt`, `9 个画图主题`)
- `site/INSTRUCTIONS.md` — 1 occurrence (`Cycle all 9 themes`)
- `docs/theme-previews/README.md` — this file's coverage matrix mentions count? (none currently, but keep an eye)

### 7. **Update the README themes table** ⚠️ DON'T SKIP THIS

In top-level `README.md`, under `### 画图模式 (N themes-diagram)`, add a row:

```markdown
| `<new-theme>` | <img src="docs/theme-previews/<new-theme>.png" width="320"> | <一句话定位 — 颜色 + 字体 + 适用场景> |
```

And update the section heading count `(N themes-diagram)` → `(N+1 themes-diagram)`.

### 8. Commit & push

```bash
$ git add assets/themes-diagram/<new-theme>.css \
          docs/theme-previews/<new-theme>.png \
          references/themes.md \
          SKILL.md \
          site/INSTRUCTIONS.md \
          scripts/render-previews.sh \
          scripts/render-all.sh \
          README.md
$ git commit -m "feat(theme): add <new-theme> — <one-line description>"
$ git push
```

---

## Re-rendering all 12 themes (when needed)

```bash
$ bash scripts/render-previews.sh           # → docs/theme-previews/*.png
$ bash scripts/render-all.sh                # → test-output/<example>/<theme>.png (gitignored)
```

The first script regenerates the README thumbnails. The second renders every example × every theme for a full eyeball pass before tagging a release.

---

## File inventory

```
docs/theme-previews/
├── README.md                  # this file
├── academic-paper.png
├── blueprint.png
├── business-clean.png
├── cyberpunk-neon.png
├── glassmorphism.png
├── hand-drawn.png
├── linear-mode.png
├── minimal-light.png
├── neo-brutalism.png
├── saas-modern.png
├── tech-dark.png
└── xhs-soft.png
```

All PNGs are **3200×2000** (rendered at 2x device-scale-factor for Retina-sharp display) at ~250KB-900KB each. Total ~6.8MB — still acceptable for a `docs/` directory, and the trade-off is worth it: at 1x density the previews looked soft when clicked-through to full size.

If you want to revert to 1x for size savings, remove `--force-device-scale-factor=2` from `scripts/render.sh`.
