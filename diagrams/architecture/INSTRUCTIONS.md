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

## 10. Reference examples

See `examples/` for 2-3 worked architecture diagrams in this directory.
