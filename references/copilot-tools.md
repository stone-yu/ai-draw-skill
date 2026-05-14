# ai-draw on GitHub Copilot CLI

Adapter notes for using **ai-draw** inside [GitHub Copilot CLI](https://github.com/github/gh-copilot) (`copilot` / `gh copilot agent`). Read this when the host platform is Copilot CLI rather than Claude Code.

## Status

**⚠️ Best-effort, not yet end-to-end tested.** The skill's INSTRUCTIONS are tool-agnostic (use generic verbs like "read the file" / "run the script") so the mapping below should work, but you may hit Copilot-specific quirks. Open an issue at https://github.com/stone-yu/ai-draw-skill if you find one.

## Invocation

Copilot CLI auto-discovers skills from installed plugins. Once ai-draw is installed (drop the repo at `~/.copilot/skills/ai-draw/` or wherever Copilot picks up local skills), users can trigger it the same way as Claude Code:

```
/ai-draw <需求>
```

Copilot's `skill` tool is functionally equivalent to Claude Code's `Skill` tool — it loads SKILL.md and presents it back to the model.

## Tool-name equivalents

The skill's INSTRUCTIONS don't hard-code tool names, but if you ever need to map Claude Code names to Copilot CLI calls:

| What the skill needs to do | Claude Code | Copilot CLI |
|---|---|---|
| Read a file's contents | `Read` | `str_replace_editor` with `command=view` |
| Write a new file | `Write` | `str_replace_editor` with `command=create` |
| Edit an existing file | `Edit` | `str_replace_editor` with `command=str_replace` |
| Run a shell command | `Bash` | `bash` |
| Glob / grep / find files | `Bash` + `grep` / `find` | `bash` + `grep` / `find` |
| Open a file in browser | `Bash` running `scripts/open.sh` | `bash` running `scripts/open.sh` |
| Web search (not used by ai-draw itself) | `WebSearch` | (skip — not needed) |
| Web fetch (not used by ai-draw itself) | `WebFetch` | (skip — not needed) |

## What ai-draw needs from the platform

Minimum primitive set (any platform with these can run ai-draw):

1. **File read** — to inspect templates, themes.md, current outputs
2. **File write** — to create `./ai-draw-out/<dir>/index.html` and state.json
3. **File edit** — for `redo` / `add` flows (sed-swap theme link, append slide section)
4. **Shell command** — to run `scripts/new.sh` (creates output dir), `scripts/open.sh` (browser launch), and optionally `scripts/render.sh` (Chrome headless PNG export)
5. **Skill loading** — to inject SKILL.md / INSTRUCTIONS into agent context

If your host platform has these primitives, ai-draw should work.

## Output path

Copilot CLI runs in whatever the user's current directory is. Outputs land under `<cwd>/ai-draw-out/` just like Claude Code. State tracking via `<cwd>/ai-draw-out/.ai-draw-state.json`.

## Known caveats

- **PNG export via `scripts/render.sh`** requires Chrome / Chromium installed locally. Same as on Claude Code. Not Copilot-specific.
- **`backdrop-filter` in glassmorphism theme** rendered via html2canvas (the in-browser ⋯ export toolbar) may look slightly different on different Chromium versions. Cosmetic only.
- **State file location**: if Copilot CLI sandboxes the working directory, make sure `ai-draw-out/` is writable.

## Sanity check on Copilot CLI

After install, run:

```
/ai-draw 画一个简单的三层架构，技术分享用
```

Expected: agent loads SKILL.md → asks single vs site → recommends 3 themes → generates `./ai-draw-out/<name>-tech-dark/index.html` → opens it in browser.

If anything in that flow fails, the issue is almost certainly in the platform's primitive (file write or browser launch), not in the skill.
