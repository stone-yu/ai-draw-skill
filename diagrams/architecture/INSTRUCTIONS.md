# diagrams/architecture/ — INSTRUCTIONS

You are filling in `template.html` for an architecture diagram. Here are the rules.

## 1. Replace these placeholders

| Placeholder | What goes here |
|---|---|
| `{{TITLE}}` (twice) | Short diagram name, e.g. "三层电商架构" |
| `{{SUBTITLE}}` | One-line context, e.g. "2026 Q2 内部技术分享" |
| `{{ARROWS}}` | All connection `<line>` elements (see §3 below) |
| `{{COMPONENTS}}` | All component box pairs (mask + styled rect + labels; see §2 below) |
| `{{LEGEND}}` | Legend box (see §6) |
| `{{SUMMARY_CARDS}}` | 3 summary `<div class="card">` blocks (see §7) |

## 2. Component boxes (the unit of layout)

Every component is **two rects + two text elements**:

```html
<!-- 1. opaque background mask (prevents arrows from showing through) -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="var(--bg-2)"/>
<!-- 2. styled box on top (semi-transparent fill) -->
<rect x="X" y="Y" width="W" height="H" rx="6"
      fill="var(--sem-backend)" fill-opacity="0.4"
      stroke="var(--sem-backend)" stroke-width="1.5"/>
<!-- 3. main label -->
<text x="CENTER_X" y="Y+22" fill="var(--text-1)"
      font-size="12" font-weight="600" text-anchor="middle"
      font-family="var(--font-display)">UserService</text>
<!-- 4. sublabel (optional) -->
<text x="CENTER_X" y="Y+38" fill="var(--text-2)"
      font-size="9" text-anchor="middle">Spring Boot · Java 21</text>
```

Standard sizes:
- **Service / API box**: `width=160, height=60`
- **Database box**: `width=120, height=80` (taller, to feel "stacked")
- **External / generic**: `width=180, height=50`

## 3. Arrows

```html
<line x1="..." y1="..." x2="..." y2="..."
      stroke="var(--text-3)" stroke-width="1.5"
      marker-end="url(#arrowhead)"/>
```

For **dashed** auth/security flows:
```html
<line ... stroke="var(--sem-security)" stroke-dasharray="4,4" marker-end="url(#arrowhead)"/>
```

**CRITICAL:** put **all** `<line>` elements **before** the component rects in the SVG document, so they render behind boxes.

## 4. Semantic colors (always use these vars, never literals)

| Component type | CSS variable |
|---|---|
| Frontend / UI | `var(--sem-frontend)` |
| Backend / API service | `var(--sem-backend)` |
| Database / Cache / Storage | `var(--sem-db)` |
| Cloud / SaaS / Region | `var(--sem-cloud)` |
| Auth / Security | `var(--sem-security)` |
| Message bus / Kafka / MQ | `var(--sem-bus)` |
| Anything else | `var(--sem-generic)` |

## 5. Spacing (avoid overlaps)

- Min vertical gap between two stacked components: **40px**
- Inline message-bus connectors: place IN the gap, e.g. component A ends at y=130, bus at y=140 (height=20), component B starts at y=170
- Min horizontal gap: **48px**

Wrong: bus at y=160 when component B starts at y=170 (overlaps)
Right: bus at y=140, centered in the 130→170 gap

## 6. Legend placement

The legend MUST be **outside** all boundary boxes (region cluster, security group, etc.).

- Find the bottom edge of the lowest boundary
- Place the legend ≥ 20px below it
- Expand the SVG `viewBox` height if needed

```html
<g transform="translate(40, LEGEND_Y)">
  <rect width="280" height="80" rx="6" fill="var(--bg-2)" stroke="var(--border)"/>
  <text x="14" y="20" fill="var(--text-2)" font-size="10" font-weight="600">LEGEND</text>
  <rect x="14" y="32" width="14" height="14" rx="3" fill="var(--sem-frontend)" fill-opacity="0.4" stroke="var(--sem-frontend)"/>
  <text x="36" y="44" fill="var(--text-1)" font-size="11">Frontend</text>
  <!-- ... one row per used type ... -->
</g>
```

## 7. Summary cards

3 cards in a grid below the SVG. Use this structure:

```html
<div class="card" style="background:var(--bg-2);border-radius:var(--radius-lg);padding:16px;border:1px solid var(--border);">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
    <div style="width:8px;height:8px;border-radius:50%;background:var(--sem-backend);"></div>
    <h3 style="margin:0;font-size:13px;color:var(--text-1);">Backend Stack</h3>
  </div>
  <ul style="margin:0;padding-left:18px;color:var(--text-2);font-size:12px;">
    <li>Spring Boot 3.x</li>
    <li>PostgreSQL primary</li>
    <li>Redis L1 cache</li>
  </ul>
</div>
```

## 8. Hard limits and the ELK fallback

- **Up to 12 components**: hand-place coordinates per the rules above.
- **More than 12 components**: do NOT try to hand-place. Output an ELK-friendly JSON instead and let the runtime layout it.
  - Replace `{{ARROWS}}` and `{{COMPONENTS}}` with a single `<g id="elk-target"></g>` and a `<script>` block:

  ```html
  <script src="https://cdn.jsdelivr.net/npm/elkjs@0.9/lib/elk.bundled.js"></script>
  <script>
    const elkData = {
      id: "root",
      layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.spacing.nodeNode': '40' },
      children: [
        { id: "user-svc", width: 160, height: 60, labels: [{ text: "UserService" }] },
        // ... one entry per component
      ],
      edges: [
        { id: "e1", sources: ["user-svc"], targets: ["order-svc"] },
        // ...
      ],
    };
    new ELK().layout(elkData).then(g => renderELK(g));
    // renderELK fn lives in this template — it walks `g.children` and `g.edges`
    // emitting the same mask+styled rect pattern as §2 and §3 above
  </script>
  ```

- **More than 25 components**: stop and tell the user "this diagram has too many components — consider splitting it into multiple diagrams (e.g. by layer or domain)".

## 9. Theme awareness

You do NOT need to know the user's theme — all colors come from CSS variables. The SAME SVG works for tech-dark / blueprint / xhs-soft / etc. Just stick to `var(--sem-*)`, `var(--bg-*)`, `var(--text-*)`.

**Exception**: when the chosen theme is `saas-modern`, the default `rect + text` pattern reads "too spartan" — load `saas-modern-preset.md` from this directory for the richer "GPT Image / SaaS product page" component patterns (icon badges, multi-color sub-cards, pill headers, decorative title, gradient CTAs). See §12 below.

## 10. Reference examples

See `examples/` for 2-3 worked architecture diagrams in this directory.

## 11. Drillable components (site mode only)

When generating a page that belongs to a site (`/ai-draw --mode site`), some components are **drillable** — clicking them navigates to a child page. Wrap those (and ONLY those) components in an SVG `<a xlink:href="...">` element, and add a small `↗` indicator in the upper-right corner.

```html
<!-- Regular (non-drillable) component: leave as-is -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="var(--bg-2)"/>
<rect x="X" y="Y" width="W" height="H" rx="6"
      fill="var(--sem-backend)" fill-opacity="0.4"
      stroke="var(--sem-backend)" stroke-width="1.5"/>
<text x="CENTER_X" y="Y+22" ...>UserService</text>
<text x="CENTER_X" y="Y+38" ...>spring-boot</text>

<!-- Drillable component: wrap in <a>, add ↗ indicator -->
<a xlink:href="pages/order-service.html">
  <rect x="X" y="Y" width="W" height="H" rx="6" fill="var(--bg-2)"/>
  <rect x="X" y="Y" width="W" height="H" rx="6"
        fill="var(--sem-backend)" fill-opacity="0.4"
        stroke="var(--sem-backend)" stroke-width="1.5"/>
  <text x="CENTER_X" y="Y+22" ...>OrderService</text>
  <text x="CENTER_X" y="Y+38" ...>spring-boot</text>
  <!-- Drill indicator -->
  <text x="X+W-10" y="Y+16" fill="var(--accent)" font-size="14"
        text-anchor="end" font-weight="700" style="cursor:pointer;">↗</text>
</a>
```

### Rules

1. **Path resolution**: `xlink:href` is **relative to the current page's directory**.
   - From `index.html`, children at depth 1 → `pages/<slug>.html`
   - From `pages/user-service.html`, children at depth 2 → `user-service/<slug>.html`
2. Only wrap components that **actually have a child page** in the site tree. Non-drillable components stay as-is.
3. The `↗` indicator must use `var(--accent)` so it adapts to every theme.
4. Do NOT add `onclick` JS — the SVG native `<a>` element handles navigation in all modern browsers.
5. Hover state is automatic: browsers add `cursor: pointer` to `<a>` content.

## 12. saas-modern visual richness preset

When `data-themes` includes `saas-modern` as primary (or the user mentioned "SaaS / 产品页 / 营销信息图 / GPT image"), §1-7's default `rect + text` pattern reads as too spartan. Load and apply the richer component patterns from **`saas-modern-preset.md`** in this directory.

### Key principles (full details in preset file)

1. **Pastel palette table** — 8 (deep, pastel) color pairs; rotate through ≥ 4 for sibling items
2. **Icon badges** replace plain bullets — 32×32 pastel rounded-rect + emoji on every list item
3. **Section header pills** — filled rounded pills instead of plain text headings
4. **Decorative title** — title text flanked by left/right gradient lines + dots
5. **Big rounded section cards** (`rx=22`) with pastel fill — group content within a column
6. **Multi-color sub-cards** — peer entities in a row each get a different color
7. **Cross-column arrows with pill labels** — gradient stroke + small pill above + descriptor below
8. **Dashed-border callout** for definitions/rules; **gradient CTA box** for emphasis
9. **Bottom summary band** (optional) — full-width gradient bar with the punchline
10. **Required `<defs>`** — saas-modern needs a specific gradient + filter set; preset file lists them

### Anti-patterns (must avoid)

- ❌ Single-color throughout (defeats "multi-color SaaS" feel)
- ❌ `<circle r=6>` bullets (every list item needs an emoji badge)
- ❌ All sub-cards identical color (peers must visually differentiate)
- ❌ Mixing saas-modern preset with tech-dark/blueprint/etc. — preset is saas-modern-only

### Partial application

For `business-clean` theme: apply only icon badges (§2) and header pills (§3) from the preset, not the gradients/CTAs. For `class` / `er` diagram types: do NOT apply this preset (too structured for badges).

See `saas-modern-preset.md` for code snippets and the full pattern library.
