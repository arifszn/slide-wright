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
- If colors look washed out, the user forgot **Background graphics: ON**.
- **More pages than slides?** Either the deck lacks `pdfSeparateFragments: false` (fragments split into a page each), or a slide overflows the 1080 canvas and paginates; split that slide so nothing is cut.
