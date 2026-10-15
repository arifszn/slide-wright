# Export to PowerPoint

Run the exporter script. It opens the deck in a headless browser and writes a `.pptx` with, per slide:

- a full-slide background picture: the slide as rendered, with the text that became text boxes hidden
- native, editable text boxes on top (font, size, colour, bold/italic/underline, alignment, letter-spacing, line spacing)
- the speaker notes

Shapes, cards, charts, SVG and images stay part of the background picture, so they look identical but are not editable. Say so when handing the file over.

## Run it

```bash
node <skill-dir>/scripts/export-pptx.mjs ./deck.html              # writes ./deck.pptx
node <skill-dir>/scripts/export-pptx.mjs ./deck.html -o out.pptx
```

`<skill-dir>` is the installed `slide-wright/` folder, the one holding `references/` and `scripts/`. Needs Node 18+. The first run installs `pptxgenjs` and `playwright-core` into `~/.cache/slide-wright/export-pptx` (override with `SLIDE_WRIGHT_CACHE`) and uses the installed Chrome, downloading Chromium only when there is none. Nothing is added to the user's project.

Options: `--scale 2` renders the background pictures at 2x (sharper when projected, larger file); `--debug-dir <dir>` also writes each slide as PNG, with and without text hidden.

The script prints the `.pptx` path on stdout; progress and the list of fonts used go to stderr.

## What to tell the user

- Slide count and output path.
- **Fonts:** the deck's web fonts are not embedded in a `.pptx`. On a machine without them PowerPoint substitutes a similar font, so line breaks can move and tightly letter-spaced headings look cramped. Offer to install the fonts (named in the script output), or point to the PDF export when exact typography matters.
- Padding and backgrounds on inline chips (code pills, highlights) stay in the picture; the text after a chip can sit a few pixels left of where it was.
- Animations and click-by-click builds are flattened: each slide is exported in its final state.
- Text the exporter cannot place faithfully (SVG, gradient, outlined, rotated, scaled, clipped, or badge-mixed text) stays in the picture. The per-slide log counts these.
- Slides marked `data-visibility="hidden"` are skipped, as in the PDF.
- Text placement was checked against LibreOffice renders, not PowerPoint itself. Ask the user to open the file in PowerPoint once and report any text that sits visibly off.

## If it fails

- "No ready reveal.js instance": the file is not a reveal.js deck, or the CDN was unreachable.
- Browser start failure: install Google Chrome, or run `npx playwright-core install chromium`.
- Text appears twice in PowerPoint: an exporter bug, not a deck problem. Re-run with `--debug-dir`, compare `slide-N.png` with `slide-N.ref.png`, and report it.
