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

`<skill-dir>` is the installed `slide-wright/` folder, the one holding `references/` and `scripts/`. Needs Node 18+ and network access (the deck engine and fonts load from a CDN). The first run installs `pptxgenjs` and `playwright-core` into `~/.cache/slide-wright/export-pptx` (override with `SLIDE_WRIGHT_CACHE`) and uses the installed Chrome, downloading Chromium only when there is none. Nothing is added to the user's project.

Options: `--scale 2` renders the background pictures at 2x (sharper when projected, larger file); `--debug-dir <dir>` also writes each slide as PNG, with and without text hidden.

The script prints the `.pptx` path on stdout; progress and the list of fonts used go to stderr.

## What to tell the user

- Slide count and output path.
- **Fonts:** the deck's web fonts are not embedded in a `.pptx`. On a machine without them PowerPoint substitutes a similar font, so line breaks can move. Offer to install the fonts (named in the script output), or point to the PDF export when exact typography matters.
- Display headings with tight negative letter-spacing look cramped when the font is substituted by a narrower one. Installing the deck's fonts fixes it.
- Padding and backgrounds on inline chips (code pills, highlights) stay in the picture; the text after a chip can sit a few pixels left of where it was.
- Animations and click-by-click builds are flattened: each slide is exported in its final state.
- Text the exporter cannot place faithfully stays in the picture instead of becoming a text box: SVG text, gradient or outlined text, rotated or scaled text, clipped or ellipsised text, and lines that mix inline badges or pills with text. The per-slide log counts these.
- Slides marked `data-visibility="hidden"` are skipped, as in the PDF.
- Text placement was checked against LibreOffice renders, not PowerPoint itself. Ask the user to open the file in PowerPoint once and report any text that sits visibly off.

## If it fails

- "does not look like a slide-wright deck": the file is not one of this skill's decks, or the CDN was unreachable.
- Browser start failure: install Google Chrome, or run `npx playwright-core install chromium`.
- Text appears twice in PowerPoint: an exporter bug, not a deck problem. Re-run with `--debug-dir`, compare `slide-N.png` with `slide-N.ref.png`, and report it.

## Verifying a change to the exporter

`npm test` from the repository root exports four fixture decks (the web-font one needs network and skips offline). It checks:

- slide count, one picture per slide, text, notes, no duplicated text
- package validity: every part has a content type, relationships resolve, ids are unique, colours are 6-digit hex, no stray whitespace issues (`tests/lib/validate-ooxml.mjs`, itself tested against 17 deliberately broken packages)
- with LibreOffice and `pdftoppm` installed, that rendered text lands within a few pixels of where the HTML put it

The validator is structural, not a full schema validation. `scripts/lib/package.mjs` fixes two things pptxgenjs gets wrong (dangling content-type overrides, missing `xml:space`) and leaves the child order of `<p:presentation>` alone: PowerPoint needs it as pptxgenjs writes it.
