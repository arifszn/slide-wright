# slide-wright

AI agent skill to generate beautiful, unique slide decks with reveal.js - new design for every prompt.

**[View Example →](https://slidewright.netlify.app)**

https://github.com/user-attachments/assets/90959d0c-6c2e-4a7a-ab88-4a40a5ba06ac

## How it works

1. **Tell it what you want.** A topic, rough notes, or a full outline — whatever you have.
2. **It generates a theme.** A custom color palette, typography, and a 2-slide preview in that style. It opens the preview for you.
3. **You decide.** Love it? It builds the whole deck. Want a different vibe? It generates a fresh direction and shows a new preview. Repeat until it's right.
4. **You get your deck.** A polished, self-contained presentation. Export it to PDF, or deploy it to a live URL for a link that works on any device.

## Examples

<table>
<tr><th colspan="2"><i>"Generate a presentation for ClickHouse, keep theme yellow"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/6839eba2-a228-4324-8dc0-983e235991f7" alt="ClickHouse example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/e9208b1f-c813-4a0f-b4ef-b760c011981d" alt="ClickHouse example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"Make me a sales pitch deck for Lumen, a smart home energy monitor"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/cd2b8874-2f25-4c2a-89f9-6461a1d7f719" alt="Sales pitch example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/59439144-cb8f-4d44-b63d-4047b39b12b9" alt="Sales pitch example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"Create me a deck for our Q3 revenue review"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/469e720a-92bd-4a2a-af1d-1082f8d0909a" alt="Q3 revenue review example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/1581609f-7dc5-4634-858e-51823b737bca" alt="Q3 revenue review example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"Make me a deck announcing our new feature [placeholder], keep the design minimal"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/c7a20136-2325-417e-b2ce-63651b0b1db7" alt="Minimalist example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/6f85a9bb-9e0f-4f55-ae39-97f4ec52fedd" alt="Minimalist example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"Create a presentation on MCP with this outline: [outline]"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/3b22a39f-f3a5-49bd-b48a-e1c0b4e1e244" alt="MCP example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/a02afce3-4abc-4b20-8078-9b93d58f5f48" alt="MCP example slide 2" /></td>
</tr>
</table>

<table>
<tr><th colspan="2"><i>"Make me a deck pitching a Mars colony, keep it futuristic"</i></th></tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/ab8691c2-1216-4b88-b702-9fec97b19a5d" alt="Futuristic example slide 1" /></td>
<td><img src="https://github.com/user-attachments/assets/2f4275c1-72e1-4cf0-9c34-2e91284e666b" alt="Futuristic example slide 2" /></td>
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
