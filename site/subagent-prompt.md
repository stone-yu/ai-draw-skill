# Subagent Prompt Template

The main controller dispatches one instance of this prompt per subpage. Replace every
`<PLACEHOLDER>` with the concrete value before sending. Do not send the template as-is.

---

## BEGIN PROMPT

You are generating ONE architecture subpage for a multi-page site built by `/ai-draw --mode site`.

### Your assignment

| Field | Value |
|---|---|
| Page slug | `<PAGE_SLUG>` |
| Page title | `<PAGE_TITLE>` |
| Output file (absolute path) | `<OUTPUT_PATH>` |
| Site ID | `<SITE_ID>` |
| Theme | `<THEME>` |
| Themes CSV (for data-themes) | `<THEMES_CSV>` |
| Page depth | `<DEPTH>` |
| Asset prefix | `<ASSET_PREFIX>` |

### Breadcrumb chain (root → this page)

```json
<BREADCRUMB_ARRAY>
```

Example shape:
```json
[
  {"title": "电商系统总览", "href": "../../index.html"},
  {"title": "User Service",  "href": "../user-service.html"}
]
```
The last element is the PARENT. This page itself is NOT in the array — it appears as
`<span>` at the end of the rendered breadcrumb.

### Children of this page (direct subpages — will be drillable components)

```json
<CHILDREN_ARRAY>
```

Example shape:
```json
[
  {"slug": "auth-module",    "title": "Auth Module"},
  {"slug": "profile-service","title": "Profile Service"}
]
```

If this array is empty, there are no drillable children — all components are regular.

### Parent page path (relative to this file's location)

```
<PARENT_PATH>
```

### Section markdown content

```markdown
<SECTION_MARKDOWN>
```

---

### Instructions

**Step 1 — Read required files (you MUST do this before writing anything):**

1. Read `diagrams/architecture/INSTRUCTIONS.md` — pay special attention to §11 (Drillable
   components) and §2–§5 (component boxes, arrows, spacing, colors).
2. Read `site/subpage-template.html` — this is the exact template you will fill.

**Step 2 — Build the breadcrumb HTML.**

Construct the breadcrumb by combining the `<BREADCRUMB_ARRAY>` entries and appending this
page's title as a `<span>`. Use this exact format:

```html
<a href="<href-of-first-entry>"><title-of-first-entry></a> ›
<a href="<href-of-next-entry>"><title-of-next-entry></a> ›
...
<span><PAGE_TITLE></span>
```

For a depth-1 page with root as only parent:
```html
<a href="../../index.html">电商系统总览</a> › <span>User Service</span>
```

For a depth-2 page:
```html
<a href="../../../index.html">电商系统总览</a> › <a href="../user-service.html">User Service</a> › <span>Auth Module</span>
```

This HTML string becomes the value of `{{BREADCRUMB}}` in the template.

**Step 3 — Design the architecture diagram.**

Use the section markdown content to understand what this page covers. Draw an architecture
diagram following `diagrams/architecture/INSTRUCTIONS.md`:

- Up to 12 components: hand-place coordinates per §2 and §5 spacing rules.
- More than 12 components: use the ELK fallback per §8.
- Use semantic color variables only (`var(--sem-*)`, `var(--bg-*)`, `var(--text-*)`) — never
  hardcode hex colors.
- Put all `<line>` arrows BEFORE component rects in the SVG (they render behind).

**Drillable components (critical):**

For every child listed in `<CHILDREN_ARRAY>`:
- Represent it as a component in the diagram.
- Wrap it in an SVG `<a xlink:href="<slug>.html">` element per §11.
- The href is relative to THIS page's file location:
  - If this page is `pages/user-service.html` (depth 1), children are at
    `user-service/<child-slug>.html`
  - If this page is `pages/user-service/auth-module.html` (depth 2), children are at
    `auth-module/<child-slug>.html`
- Add the `↗` indicator (see §11 example).

Components that do NOT appear in `<CHILDREN_ARRAY>` must NOT be wrapped in `<a>` — they are
regular non-drillable components.

**Step 4 — Fill the template.**

Replace every placeholder in `site/subpage-template.html`:

| Placeholder | Value |
|---|---|
| `{{TITLE}}` | `<PAGE_TITLE>` (fill both occurrences: `<title>` tag and `<h1>`) |
| `{{SUBTITLE}}` | Short one-line description derived from the section content |
| `{{SITE_ID}}` | `<SITE_ID>` |
| `{{THEMES_CSV}}` | `<THEMES_CSV>` |
| `{{BREADCRUMB}}` | The breadcrumb HTML built in Step 2 |
| `{{ARROWS}}` | All SVG `<line>` connection elements |
| `{{COMPONENTS}}` | All SVG component elements (drillable + regular) |
| `{{LEGEND}}` | SVG legend group per §6 |
| `{{SUMMARY_CARDS}}` | 3 `<div class="card">` blocks summarizing this section |
| `{{PARENT_PATH}}` | `<PARENT_PATH>` (for the "back" footer link) |
| `{{PARENT_TITLE}}` | Title of the parent page (last entry in breadcrumb array, or "总览" if root) |

Also replace `../../assets/` (or any relative asset path placeholder in the template) with
`<ASSET_PREFIX>/assets/`. This applies to:
- `<link rel="stylesheet" href="...base.css">`
- `<link rel="stylesheet" id="theme-link" href="...themes/<THEME>.css">`
- `<script src="...runtime.js">` etc.

**Step 5 — Write the file.**

Write the fully-filled HTML to `<OUTPUT_PATH>`. This is YOUR ONLY file write. Do not touch
any other file.

**Step 6 — Report.**

Reply with exactly:

```
DONE <OUTPUT_PATH>
```

If you encountered an error (e.g., template not found, section markdown was empty), reply with:

```
ERROR <OUTPUT_PATH> <brief reason>
```

---

### Constraints (read carefully)

- You write **exactly ONE file**: `<OUTPUT_PATH>`. Never write to index.html or any sibling page.
- Do NOT add `onclick` JavaScript to SVG elements — use only native `<a xlink:href="...">`.
- Do NOT invent child pages that are not in `<CHILDREN_ARRAY>`. Only listed children are drillable.
- Do NOT use hardcoded colors — always use CSS variables.
- Do NOT skip the breadcrumb nav — it must appear even if the chain is just one level deep.
- If section markdown is sparse, supplement with reasonable architectural assumptions, but stay
  within the spirit of the content. Do not invent services that contradict the markdown.
- Keep the generated HTML self-contained except for CDN assets — no local imports beyond what
  is already in the template.

## END PROMPT
