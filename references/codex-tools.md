# ai-draw on OpenAI Codex / GPT (function-calling)

Adapter notes for using **ai-draw** with OpenAI's Codex CLI, GPT-4/5 via function-calling agents (e.g. via the OpenAI Agents SDK, Cursor Composer, Aider, etc.). Read this when the host is an OpenAI-flavored agent rather than Claude Code.

## Status

**⚠️ Best-effort, not yet end-to-end tested.** OpenAI ecosystems don't have a native "Skill" loading mechanism analogous to Claude Code, so you'll need to wire the skill in manually. The INSTRUCTIONS are tool-agnostic enough that any function-calling agent with file-IO + shell can drive the flow.

## Invocation — no native Skill mechanism

Unlike Claude Code / Copilot CLI / Gemini CLI, GPT-based agents don't auto-discover SKILL.md. You have two options:

### Option A — Load SKILL.md into system prompt

Concatenate the contents of `SKILL.md` into your agent's system prompt at session start. The agent then handles `/ai-draw <需求>` by parsing the slash command itself and following the routing rules.

Pros: works with any GPT-based agent that accepts a custom system prompt.
Cons: ~10 KB of context budget burned per session.

### Option B — Lazy-load via a function tool

Expose a `load_skill(name)` tool that reads `skills/<name>/SKILL.md` and inserts its content into the conversation. The agent calls this when it sees `/ai-draw`.

Pros: cheaper at idle.
Cons: needs you to implement the tool.

## Tool-name equivalents

The skill's INSTRUCTIONS describe what the agent needs to do (verbs, not tool names). Map them to your OpenAI agent's tools:

| What the skill needs to do | Claude Code | OpenAI function-calling typical |
|---|---|---|
| Read a file's contents | `Read` | `read_file(path)` |
| Write a new file | `Write` | `write_file(path, content)` |
| Edit an existing file | `Edit` | `apply_diff(path, old, new)` or `str_replace(path, ...)` |
| Run a shell command | `Bash` | `run_command(command)` / `execute(cmd)` |
| Glob / find files | `Bash` + `find` | `run_command("find ...")` |
| Search inside files | `Bash` + `grep` | `run_command("grep ...")` |
| Open a file in browser | `Bash` running `scripts/open.sh` | `run_command("./scripts/open.sh <path>")` |

If your agent only has `read_file` + `write_file` + `run_command`, that's enough — `Edit` operations can be approximated by reading the file, mutating in memory, and writing back.

## What ai-draw needs from the platform

Same minimum primitive set as the Copilot adapter (see `copilot-tools.md`):

1. File read
2. File write
3. File edit (or read+write)
4. Shell command (to run `scripts/new.sh` / `scripts/open.sh`)
5. Some way to load SKILL.md content into the agent context

## Output path

GPT agents typically run in the user's current directory. Outputs land under `<cwd>/ai-draw-out/` and state tracking via `<cwd>/ai-draw-out/.ai-draw-state.json` — same as Claude Code.

If your agent sandboxes the filesystem, make sure `ai-draw-out/` is writable. If your agent doesn't have local filesystem access at all (pure API), ai-draw won't work without an additional shim that translates `write_file` calls into uploads to wherever you want the output to land.

## Known caveats

- **GPT-4/5 may need more explicit hand-holding** — Claude is better at following multi-step SOP files like INTERACTION.md. If GPT skips the 3-question PPT opening or auto-routes without confirming ambiguity, add explicit reminders in your system prompt.
- **PNG export via `scripts/render.sh`** requires Chrome / Chromium and a writable filesystem.
- **Chinese-English bilingual prompts**: the SKILL.md mixes 中文 + English. GPT models handle this fine, but if you only need English UX, you can fork SKILL.md to be English-only.

## Sanity check on a GPT agent

After wiring SKILL.md into your agent's context, run:

```
/ai-draw a simple 3-tier architecture for an internal tech share
```

Expected: agent asks single vs site → recommends 3 themes → writes `./ai-draw-out/<name>-tech-dark/index.html` → opens it.

If the agent doesn't ask the right clarifying questions, your system prompt is probably not surfacing INTERACTION.md's flow. Re-check that the SOP files (INTERACTION.md, INSTRUCTIONS files under diagrams/) are reachable.
