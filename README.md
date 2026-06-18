# slide-wright

AI agent skill to generate beautiful, unique slide decks with reveal.js - new design for every prompt.

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

## Examples

<table>
<tr><th colspan="2">"Generate a presentation for ClickHouse, keep theme yellow"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/15774809-cd91-4829-9520-0e722557f947" alt="ClickHouse example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/6b639629-b690-4e9a-945c-01ae0acdbb7f" alt="ClickHouse example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2">"Make me a sales pitch deck for Lumen, a smart home energy monitor"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/490886dd-35bc-4cff-bad6-8487094b3797" alt="Sales pitch example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/e513e098-8352-43d5-8a98-7ac8a8330c18" alt="Sales pitch example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2">"Create me a deck for our Q3 revenue review"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/e12f4d4b-f8e0-4028-9b57-dbb638a6aa3a" alt="Q3 revenue review example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/8c984fb8-10ed-478e-b66b-dd1880c97a0e" alt="Q3 revenue review example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2">"Make me a deck announcing our new feature, keep the design minimal"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/e1dd50ca-d665-49db-9b80-01ed7fee848c" alt="Minimalist example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/eba26a6a-d398-4abc-9bd5-8e3f9737c529" alt="Minimalist example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2">"Create a presentation on MCP with this outline: [outline]"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/a3c20e18-e71d-4771-a9a9-c16e3b6d70c1" alt="MCP example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/9720c1c8-6394-41a3-92c4-929d4d3e3384" alt="MCP example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2">"Make me a deck pitching a Mars colony, keep it futuristic"</th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/e10d7839-5059-4c62-8973-992dab38c91d" alt="Futuristic example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/07cb6523-3966-4f04-88a1-e12fe71540bc" alt="Futuristic example slide 2" /></td>
</tr>
</table>

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

## Usage

After installing, tell your agent what you want:

```
Make me a slide deck about <your topic>
```

It builds a theme and a short preview first. Approve it and it generates the full deck. You can hand it rough notes or an outline instead of a topic, and ask it to revise the design or content anytime.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| F | Fullscreen |
| Esc / O | Slide overview |
| S | Speaker view with notes |
| B / . | Pause to a black screen |
| ? | Show the full list of keys |

## Export to PDF

Just ask the agent to export the deck, and it walks you through it. To do it yourself: add `?print-pdf` to the deck URL, then open the print dialog (Cmd/Ctrl + P) and save as PDF. Choose Landscape, set margins to None, and turn on background graphics.

## License

[MIT](LICENSE)
