# Export to PowerPoint

Run the exporter script. It opens the deck in a headless browser and writes a `.pptx` with, per slide:

- a full-slide background picture: the slide as rendered, with the text that became text boxes hidden
- native, editable text boxes on top (font, size, colour, bold/italic/underline, alignment, letter-spacing, line spacing, links, inline code chips as highlighted text)
- local video files (`.mp4`, `.m4v`, `.mov`), embedded where they sit and playable on click
- the speaker notes

Shapes, cards, charts, SVG and images stay part of the background picture, so they look identical but are not editable. Say so when handing the file over.

## Run it

```bash
node <skill-dir>/scripts/export-pptx.mjs ./deck.html              # writes ./deck.pptx
node <skill-dir>/scripts/export-pptx.mjs ./deck.html -o out.pptx
```

`<skill-dir>` is the installed `slide-wright/` folder, the one holding `references/` and `scripts/`. Needs Node 18+. The first run installs `pptxgenjs` and `playwright-core` into `~/.cache/slide-wright/export-pptx` (override with `SLIDE_WRIGHT_CACHE`) and uses the installed Chrome, downloading Chromium only when there is none. Nothing is added to the user's project.

Options: `--scale 2` renders the background pictures at 2x (sharper when projected, larger file); `--timeout <ms>` waits longer for a slow deck to load; `--debug-dir <dir>` also writes each slide as PNG, with and without text hidden.

The script prints the `.pptx` path on stdout. Stderr has one line per slide (text boxes, videos, and the text left in the picture with the reason), then the totals and the fonts used.

## What to tell the user

- Slide count and output path.
- **Fonts:** the deck's web fonts are not embedded in a `.pptx`. On a machine without them PowerPoint substitutes a similar font, so line breaks can move and tightly letter-spaced headings look cramped. Offer to install the fonts (named in the script output), or point to the PDF export when exact typography matters.
- Inline chips with a flat background (code pills, highlights) become highlighted text and lose their rounded corners.
- **Videos:** embedded ones play on click and make the file larger. One left as a still (remote source or another format; the log says which) shows a single frame.
- Animations and click-by-click builds are flattened: each slide is exported in its final state.
- Text the exporter cannot place faithfully stays in the picture. Report it from the log, by its reason, not by guessing: `svg` (diagram text), `inline-box` (a chip with a border, gradient or its own box inside a sentence), `gradient-text`, `text-shadow`, `transform` (rotated or scaled), `vertical-text`, `clipped`, `covered`, `hidden-inline`, `filter`, `blend`.
- Slides marked `data-visibility="hidden"` are skipped, as in the PDF.
- Text placement was checked against LibreOffice renders, not PowerPoint itself. Ask the user to open the file in PowerPoint once and report any text that sits visibly off.

## If it fails

- "No ready reveal.js instance": the file is not a reveal.js deck, or the CDN was unreachable.
- Browser start failure: install Google Chrome, or run `npx playwright-core install chromium`.
- Text appears twice in PowerPoint: an exporter bug, not a deck problem. Re-run with `--debug-dir`, compare `slide-N.png` with `slide-N.ref.png`, and report it.
