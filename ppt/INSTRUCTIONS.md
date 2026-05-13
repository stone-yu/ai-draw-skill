# ppt/ — INSTRUCTIONS

You are building a deck (single HTML file with multiple `<section class="slide">`). Use `deck-template.html` as the shell.

## Replace placeholders

| Placeholder | What goes here |
|---|---|
| `{{DECK_TITLE}}` | Deck title (shows in browser tab) |
| `{{THEMES_CSV}}` | The 3 recommended themes, comma-separated, e.g. `tech-dark,blueprint,cyberpunk-neon` |
| `{{INITIAL_THEME}}` | The user's pick (the ⭐ recommended or whatever they chose) |
| `{{SLIDES}}` | All `<section class="slide">` blocks (see §2) |

## 1. Slide layout templates

### Title slide

```html
<section class="slide layout-title is-active">
  <h1>{{DECK_TITLE}}</h1>
  <p class="subtitle">{{ONELINE_CONTEXT}}</p>
  <aside class="notes">{{TITLE_SCRIPT}}</aside>
</section>
```

### Agenda slide (auto-generated when there are 2+ diagrams)

```html
<section class="slide layout-agenda">
  <h2>今天讲 {{N}} 件事</h2>
  <ol>
    <li>{{topic1}}</li>
    <li>{{topic2}}</li>
    <li>{{topic3}}</li>
  </ol>
  <aside class="notes">{{AGENDA_SCRIPT}}</aside>
</section>
```

### Diagram slide (one per diagram in the deck)

```html
<section class="slide layout-diagram" data-diagram-type="architecture">
  <h3>① {{DIAGRAM_TITLE}}</h3>
  <!-- Drop in the SVG / mermaid / Markmap container — same as you'd put in a single-image template -->
  <svg viewBox="..." style="max-height:70vh;">...</svg>
  <aside class="notes">{{DIAGRAM_SCRIPT}}</aside>
</section>
```

### Closing slide

```html
<section class="slide layout-closing">
  <h1>Q&A</h1>
  <p class="subtitle">谢谢</p>
  <aside class="notes">{{CLOSING_SCRIPT}}</aside>
</section>
```

## 2. Standard deck composition

| User scenario | Slides to generate |
|---|---|
| 1 diagram + user opted into deck | Title + Diagram + Closing-summary (3 slides) |
| 2+ diagrams (multi-diagram request) | Title + Agenda + N×Diagram + Closing (2+N+1 slides) |
| `--no-chrome` flag set | Title + N×Diagram (skip Agenda + Closing) |

## 3. Speaker-script rules (default ON; `--no-notes` skips)

Write 150-300 words of `<aside class="notes">` per slide. Three rules:

1. **Not a script — signals.** Bold the core word per beat. Each transition phrase on its own line.
2. **150-300 words per slide.** That's 2-3 minutes of speaking pace.
3. **Spoken Chinese, not written.** "因此" → "所以"; "该方案" → "这个方案"; "进行讨论" → "聊聊"

Notes are hidden by default (`.notes { display: none; }` in base.css). The `S` key opens the speaker window where they appear in the SCRIPT card.

## 4. The `add` command — appending a new slide

When the user runs `/ai-draw add <new diagram>`:

1. Read `./ai-draw-out/.ai-draw-state.json` to find the target deck (most-recent unless `--to <name>`)
2. Load that deck's `index.html`
3. Generate the new diagram slide (per §1 "Diagram slide" template)
4. Insert it **before** the closing slide (or at the end if no closing)
5. If an Agenda slide exists, append a new `<li>` to its `<ol>`
6. Update the `slides` array in `.ai-draw-state.json`
7. Save and tell the user the slide number assigned

## 5. Theme stays put

`add` operations preserve the deck's existing theme. The user can run `/ai-draw redo --style <name>` afterward if they want to switch.
