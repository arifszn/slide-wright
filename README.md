# slide-wright

Generate beautiful, unique slide decks with AI agent skill.

**[View Example →](https://slidewright.netlify.app)**

https://github.com/user-attachments/assets/90959d0c-6c2e-4a7a-ab88-4a40a5ba06ac

## How it works

1. **Tell it what you want.** A topic, rough notes, or a full outline — whatever you have.
2. **It generates a theme.** A custom color palette, typography, and a 2-slide preview in that style. It opens the preview for you.
3. **You decide.** Love it? It builds the whole deck. Want a different vibe? It generates a fresh direction and shows a new preview. Repeat until it's right.
4. **You get your deck.** A polished, self-contained presentation, ready to present, share, or export.

## Features

- **Confirm before you build** — a short preview lets you confirm the theme before the full deck is generated.
- **Custom themes every time** — a fresh palette, fonts, and layout system designed for *your* topic. No recycled templates.
- **Distinctive by default** — deliberately avoids generic fonts and cliché palettes.
- **One self-contained file** — share it, host it anywhere, no dependencies to install.
- **Present like a pro** — keyboard/touch navigation and a speaker view with private notes (press **S**).
- **Export to PDF** — a static handout straight from the browser.
- **Deploy to a live URL** — publish to a free static host (Surge, Vercel, or Netlify) and share a link that works on any device.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| F | Fullscreen |
| Esc / O | Slide overview |
| S | Speaker view with notes |
| B / . | Pause to a black screen |
| ? | Show the full list of keys |

## Installation

### Claude Code (Plugin Marketplace)

1. Register the marketplace:

   ```bash
   /plugin marketplace add arifszn/slide-wright
   ```

2. Install the plugin from this marketplace:

   ```bash
   /plugin install slide-wright
   ```

### Other agents (Codex, OpenCode, Antigravity, Gemini, Cursor, …)

slide-wright is a standalone skill that works in any agent supporting the `SKILL.md` format. See **[INSTALL.md](INSTALL.md)** for per-agent skills paths and copy-paste commands.

Or just tell your agent to install it — paste:

```
Fetch and follow the install instructions from
https://raw.githubusercontent.com/arifszn/slide-wright/refs/heads/main/INSTALL.md
```

## License

[MIT](LICENSE)
