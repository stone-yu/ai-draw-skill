# GEMINI.md — auto-loaded by Gemini CLI

Gemini CLI loads this file at session start when ai-draw is registered as a skill. It tells Gemini's runtime how to surface the skill, how to map Claude Code tool names to Gemini equivalents, and where to look for full instructions.

## Skill summary

**ai-draw** — a 2-mode skill that generates either (a) HTML PPT presentations with 36 themes / 31 layouts / speaker mode, or (b) static architecture diagrams across 12 themes including modern SaaS / glassmorphism / Linear / neo-brutalism. Trigger keywords (中 + EN): 画 / 画图 / 架构图 / 流程图 / PPT / deck / slides / 演讲 / 分享 / draw / diagram.

Full skill spec lives in `SKILL.md`. Detailed SOP in `INTERACTION.md`. Per-diagram-type rules in `diagrams/<type>/INSTRUCTIONS.md`.

## Invocation

When user types `/ai-draw <需求>`, Gemini should activate this skill (via `activate_skill` tool) and follow the routing rules in SKILL.md:
1. Detect PPT vs diagram mode (or ask once if ambiguous)
2. Recommend 3 themes
3. Generate and auto-open the output

## Tool mapping (Claude Code → Gemini CLI)

The skill's INSTRUCTIONS describe what to do, not which tool to use. Map the operations to your Gemini CLI tools:

| Operation | Claude Code tool | Gemini CLI equivalent |
|---|---|---|
| Read a file | `Read` | `read_file` |
| Write a new file | `Write` | `write_file` |
| Edit an existing file | `Edit` | `replace_text_in_file` / `edit_file` |
| Run a shell command | `Bash` | `run_shell_command` |
| Find files | `Bash` + `find` | `run_shell_command("find ...")` |
| Search inside files | `Bash` + `grep` | `run_shell_command("grep ...")` |
| Open in browser | `Bash` running `scripts/open.sh` | `run_shell_command("./scripts/open.sh ...")` |
| Skill loading | `Skill` tool | `activate_skill` |

If your Gemini CLI install exposes different tool names (the ecosystem isn't fully stabilized as of May 2026), just match by purpose.

## What this skill needs from Gemini

Minimum:
1. Local filesystem read / write / edit (relative paths under user's cwd)
2. Shell execution (specifically: `bash`, `chrome` for PNG render — optional)
3. Browser auto-open (or graceful fallback to printing the file path)

Optional:
- Web fetch — not needed by core ai-draw workflow; only used if user provides a URL as input source

## Output convention

All outputs land under `<cwd>/ai-draw-out/<name>-<theme>/`:
```
ai-draw-out/
├── <name>-<theme>/
│   ├── index.html       # auto-opened
│   ├── README.md        # keyboard tips
│   └── (no node_modules — all assets via CDN)
└── .ai-draw-state.json  # tracks add / redo / export
```

If Gemini CLI sandboxes the filesystem, make sure `ai-draw-out/` is writable in the user's chosen project directory.

## Status

**⚠️ Best-effort, not yet end-to-end tested on Gemini CLI.** The skill is tool-agnostic at the instruction layer, so it *should* work — but the Gemini CLI skill ecosystem is still maturing. Report issues at https://github.com/stone-yu/ai-draw-skill.

## Quick sanity test

After install, ask Gemini:

```
/ai-draw 画一个三层电商架构，内部技术分享用
```

Expected sequence:
1. Gemini activates the ai-draw skill
2. Asks "single image or multi-page site?"
3. Recommends `tech-dark` / `blueprint` / `cyberpunk-neon`
4. Writes `./ai-draw-out/三层电商架构-tech-dark/index.html`
5. Opens it in default browser

If step 2 is skipped (Gemini guesses single without asking), tighten the system prompt to surface INTERACTION.md's "Step 1: ask before deciding mode" rule.

## Related

- `SKILL.md` — full skill specification (routing, modes, subcommands)
- `INTERACTION.md` — detailed conversation SOP
- `references/copilot-tools.md` — equivalent adapter for GitHub Copilot CLI
- `references/codex-tools.md` — equivalent adapter for OpenAI Codex / GPT agents
