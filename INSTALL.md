# Installing slide-wright-skill

slide-wright is a single **standalone skill**: one folder, `slide-wright-skill/`, with a `SKILL.md` at its root (its `name` matches the folder, as the spec requires). Every agent loads that exact folder — only the parent *skills directory* changes from tool to tool.

So installation is always the same three steps: **clone → copy the `slide-wright-skill/` folder into your agent's skills directory → clean up.**

---

## Claude Code

### Plugin marketplace (recommended)

```bash
/plugin marketplace add arifszn/slide-wright-skill
/plugin install slide-wright-skill
```

### Standalone skill

Use the template below with `DEST=~/.claude/skills` (global) or `DEST=.claude/skills` (this project only).

---

## Every other agent — one template

Pick your agent's skills directory from the table, set it as `DEST`, and run:

```bash
DEST=~/.claude/skills   # ← change this line per the table below
git clone --depth 1 https://github.com/arifszn/slide-wright-skill /tmp/slide-wright-skill-repo
mkdir -p "$DEST"
cp -r /tmp/slide-wright-skill-repo/slide-wright-skill "$DEST/slide-wright-skill"
rm -rf /tmp/slide-wright-skill-repo
```

| Agent | Global / user `DEST` | Project / workspace `DEST` |
| --- | --- | --- |
| **Claude Code** | `~/.claude/skills` | `.claude/skills` |
| **OpenCode** | `~/.config/opencode/skills` | `.opencode/skills` |
| **Codex** | `~/.agents/skills` | `.agents/skills` |
| **Antigravity** | `~/.gemini/config/skills` | `.agents/skills` |
| **Gemini CLI / Cursor / Windsurf / Kimi / others** | see your agent's skills docs | `.agents/skills` |

Notes:

- **OpenCode** also auto-discovers `~/.claude/skills` and `.claude/skills` — a Claude install is picked up with no extra step.
- **Codex** scans `.agents/skills` from the current directory up to the repo root, so a project install at `.agents/skills` is visible across the whole repo.
- `.agents/skills` is the closest thing to a cross-agent standard — when in doubt, use it.

After copying, restart or reload your agent so it rescans its skills directory.

---

## Verify

Ask your agent to make a deck ("create a 3-slide presentation about …"). If the skill loaded, it generates a custom theme and a short preview before building the full deck.
