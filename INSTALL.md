# Installing slide-wright

slide-wright is a single **standalone skill**: one folder, `slide-wright/`, with a `SKILL.md` at its root (its `name` matches the folder, as the spec requires). Every agent loads that exact folder — only the parent *skills directory* changes from tool to tool.

So installation is always the same three steps: **clone → copy the `slide-wright/` folder into your agent's skills directory → clean up.**

---

## Claude Code

### Plugin marketplace (recommended)

1. Register the marketplace:

   ```bash
   /plugin marketplace add arifszn/slide-wright
   ```

2. Install the plugin from this marketplace:

   ```bash
   /plugin install slide-wright
   ```

### Standalone skill

Not using the plugin? Use the template below.

---

## Every other agent — one template

Pick your agent's skills directory from the table, set it as `DEST`, and run:

```bash
DEST=~/.claude/skills   # ← change this line per the table below
git clone --depth 1 https://github.com/arifszn/slide-wright /tmp/slide-wright-repo
mkdir -p "$DEST"
cp -r /tmp/slide-wright-repo/slide-wright "$DEST/slide-wright"
rm -rf /tmp/slide-wright-repo
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

Ask your agent **"what skills do you have?"** — `slide-wright` should appear in the list. If it does, it's loaded and ready.
