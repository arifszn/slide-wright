# open-slides

Generate animated slide decks with AI agent skill.

**[View Example →](https://open-slides.surge.sh)**

https://github.com/user-attachments/assets/2c7f77f3-06bf-4ae2-8142-5977588964fd

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

## Using the deck

- **Navigate:** arrow keys, space, or swipe.
- **Export PDF:** ask the agent to export it, or do it yourself — open the deck with `?print-pdf` at the end of the URL, then Print → Save as PDF.
- **Share online:** ask the agent to deploy it — pick Surge, Vercel, or Netlify and get a live link.
- **Customize:** the theme colors live in the `:root` CSS variables at the top of the file; fonts are in the `<link>` tag.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Arrow keys / Space | Move between slides |
| F | Fullscreen |
| Esc / O | Slide overview |
| S | Speaker view with notes |
| B / . | Pause to a black screen |
| ? | Show the full list of keys |

## Installation

### Claude Code (Plugin Marketplace)

```bash
/plugin marketplace add arifszn/open-slides
/plugin install open-slides
```

### Claude Code (Manual)

```bash
git clone https://github.com/arifszn/open-slides /tmp/open-slides-repo
cp -r /tmp/open-slides-repo/open-slides ~/.claude/skills/open-slides
rm -rf /tmp/open-slides-repo
```

### Other coding agents

Claude Code, Codex, Kimi Code, OpenCode, Gemini CLI, and similar agents all work. Send your agent this link and ask it to install the skill:

```
https://github.com/arifszn/open-slides
```

## License

See [LICENSE](LICENSE).
