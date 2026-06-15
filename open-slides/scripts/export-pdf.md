# Export to PDF

The deck exports to PDF straight from the browser — no extra tools, no automation dependency. The deck engine switches into a print layout automatically when the URL has the `?print-pdf` flag.

## Steps

1. Open the deck with the print flag appended to the URL:

   ```
   file:///path/to/deck.html?print-pdf
   ```

   (Or `http://localhost:8000/deck.html?print-pdf` if served.)

2. Open the browser print dialog (**Cmd/Ctrl + P**).

3. Set:
   - **Destination:** Save as PDF
   - **Layout:** Landscape
   - **Margins:** None
   - **Background graphics:** ON (so theme colors/backgrounds render)

4. Save. Each slide becomes one full-bleed page.

## Notes

- Animations and fragments are flattened to their final state — the PDF is a static snapshot. Expected; mention it so the user isn't surprised.
- Fragments: by default each fragment step can expand into extra pages. To collapse all fragments onto one page per slide, the deck can be initialized with `pdfSeparateFragments: false` (already a sensible default for handout-style export).
- If colors look washed out, the user forgot **Background graphics: ON**.
- **More pages than slides?** Two causes. (1) Fragments split into a page each — the deck template sets `pdfSeparateFragments: false` to collapse them; a deck missing that line will inflate. (2) A slide whose content overflows the 1080 canvas paginates onto extra pages; the template clips with `overflow:hidden` on the section, but the real fix is to split the overflowing slide so nothing is cut.

## One-line summary to give the user

> "To save a PDF: open the deck with `?print-pdf` at the end of the URL, then Print → Save as PDF (Landscape, margins None, Background graphics on)."
