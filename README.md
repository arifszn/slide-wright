# slide-wright

<img src="https://github.com/user-attachments/assets/3499fb20-8b35-4469-9aed-e228f8482029" alt="slide-wright" />

## How it works

1. **Tell it what you want.** A topic, rough notes, or a full outline — whatever you have.
2. **It generates a theme.** A custom color palette, typography, and a 2-slide preview in that style. It opens the preview for you.
3. **You decide.** Love it? It builds the whole deck. Want a different vibe? It generates a fresh direction and shows a new preview. Repeat until it's right.
4. **You get your deck.** A polished, self-contained presentation. Export it to PDF or PowerPoint, or deploy it to a live URL for a link that works on any device.

https://github.com/user-attachments/assets/8e3b91b6-8b25-4d2f-b665-c6df96487f83

## Examples

<table>
<tr><th colspan="2"><i>"/slide-wright Create a Q3 board update for Corvid Labs, a B2B observability SaaS"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/f414f240-8cb1-4a91-b9a7-1366e8fc0c31" alt="Q3 board update example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/fbc65739-ca60-42e7-98d2-1f0d6b34f6bf" alt="Q3 board update example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"/slide-wright Generate a presentation for ClickHouse, keep theme yellow"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/6839eba2-a228-4324-8dc0-983e235991f7" alt="ClickHouse example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/e9208b1f-c813-4a0f-b4ef-b760c011981d" alt="ClickHouse example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"/slide-wright Create a presentation on MCP with this outline: [outline]"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/645ec97e-e528-4299-a194-00dc18805f8f" alt="MCP example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/4c640b94-3e09-4bb0-b766-639f07b01d84" alt="MCP example slide 2" /></td>
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

slide-wright is a standalone skill that works in any agent supporting the `SKILL.md` format. See **[INSTALL.md](INSTALL.md)** for per-agent skills paths.

Just tell your agent to install it — paste:

```
Fetch and follow the install instructions from
https://raw.githubusercontent.com/arifszn/slide-wright/refs/heads/main/INSTALL.md
```

Or install it via npx:

```bash
npx skills add arifszn/slide-wright
```

## Usage

After installing, invoke the skill by name with what you want:

```
/slide-wright Make me a slide deck about <your topic>
```

It builds a theme and a short preview first. Approve it and it generates the full deck. You can hand it rough notes or an outline instead of a topic, and ask it to revise the design or content anytime.

A plain request without the name ("Make me a slide deck about...") also works, but apps with their own built-in slide builder may route it there instead. Naming the skill makes sure slide-wright handles it.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| F | Fullscreen |
| Esc / O | Slide overview |
| S | Speaker view with notes |
| B / . | Pause to a black screen |
| ? | Show the full list of keys |

## Export to PowerPoint

Ask the agent to export the deck as a PowerPoint file. Text comes out as editable text boxes with speaker notes; shapes, charts, and images are baked into each slide's background, so they look the same but are not editable. Fonts are not embedded, so on a machine without the deck's fonts PowerPoint substitutes similar ones. Use the PDF export when exact typography matters.

```
/slide-wright Export my deck to PowerPoint
```

Or run it yourself (needs Node 18+ and Chrome; dependencies install on first run):

```bash
node slide-wright/scripts/export-pptx.mjs deck.html
```

## Export to PDF

Just ask the agent to export the deck, and it walks you through it. To do it yourself: add `?print-pdf` to the deck URL, then open the print dialog (Cmd/Ctrl + P) and save as PDF. Choose Landscape, set margins to None, and turn on background graphics.

## Deploy to a live URL

The deck is a single self-contained HTML file, with the theme inline and the engine and fonts from a CDN, so there's no build step and no assets to bundle. Any static host will serve it.

The simplest route is to **ask the agent to deploy it**. It offers Surge, Vercel, and Netlify, walks you through the login for whichever you pick, and hands back the live URL:

```
/slide-wright Deploy my deck to a live URL
```

To do it yourself, put the deck in an empty folder as `index.html` and push that folder to any static host: GitHub Pages, Cloudflare Pages, S3, or anywhere else that serves static files.

## License

[MIT](LICENSE)
