# Building a theme

There's no library to choose from. You invent the theme for each deck, inside the boardroom standard in `design-aesthetics.md`. Before writing any HTML, decide four things and write them down: the palette, the type system, the layout system, and the exhibit style.

Before choosing a layout, identify the topic's native visual language: a payment lifecycle may want ledger rows, settlement states, or a transaction rail; a game round may want a tactical map, timer, or economy board. Do not translate every sequence into the same four cards joined by arrows. Choose the exhibit that explains the subject's mechanism, not only its chronology.

## Start from the subject and the room

Let the topic and the audience set the feeling. A payments platform update, a hospital operations review, and a climate fund pitch should look different from each other, yet all three should look like they came from a serious organization. Pull the palette and type from the subject's own world: the company's brand, the product's UI, the industry's conventions.

## Palette

One dominant surface, one accent, and the neutrals you need. Write them as CSS variables: `--bg`, `--bg-alt` (cards and panels), `--text`, `--text-muted`, `--line` (rules and borders), `--accent`, and optionally `--accent-2` for a second data series. Body text meets WCAG AA on its background. Decide light or dark on purpose. Give the palette a name like "Harbor Navy" or "Paper & Signal" to use when you present it, and keep that name off the slides.

## Type system

From Google Fonts or Fontshare, loaded in the `<link>`, set as `--font-display`, `--font-body`, and optionally `--font-mono`. Directions that hold up: an editorial serif title over a clean sans body; one grotesque throughout; a sans with a mono for labels and numbers. Choose the specific families for this deck's subject, and vary them from deck to deck. Fix the scale as variables too: roughly 72-88px titles, 40px subheads, 28px body, 18-20px labels.

## Layout system

What makes the slides read as one designed file. Fix the outer margins and a 12-column grid that every layout snaps to, and decide where titles and exhibits sit. Record the frame metrics, title placement, content density, and whether the exhibit is full-width, split, inset, or edge-to-edge. The values in `deck-template.md` are a worked example, not defaults to copy.

Recurring elements are a choice per theme, not a requirement. A deck might carry a section label, a footer with the source or company name, a page number, a rule, or nothing at all beyond the margins. Pick what suits the subject and the room, keep it consistent once chosen, and let title, section, and closing slides drop it.

## Exhibit style

How the theme draws exhibits: card radius (0, 8, or 16px), border vs. fill, shadow or none, arrow style, how data series use the accent and the neutrals. Every exhibit in the deck follows it. `exhibits.md` has the building blocks.

## Similarity guard

For each new deck, make at least three of these choices deliberately different from the last unrelated deck: light or dark surface, display/body font pairing, outer geometry, title placement, exhibit family, card treatment, and recurring chrome. The one constant is the boardroom standard, not a repeated template. If the first preview could be mistaken for another recent deck after removing its words, reject it and choose a different composition before showing it.

The guard must operate at composition level, not only theme level. Also vary at least three of these when the subject changes: step count derived from the content, horizontal versus vertical direction, card-and-arrow versus rail versus ledger rendering, accent position based on the claim, and which slide first introduces the exhibit. If another deck is available in the same working area, inspect its first content slide before choosing the new composition. Do not assume a fresh session means a fresh visual pattern. The listed variants are prompts, not a closed library: invent a new subject-specific composition when they do not fit, rather than falling back to the canonical flow.

## Motion

Static. Slides change with a short fade and appear complete. See `motion-recipes.md`.

## Iterating after a rejected preview

A rejection means change direction, not tint. Replace the palette, type system, layout system, and exhibit style together so the next preview is a genuinely different proposal. If the user gave a steer ("lighter", "more corporate", "warmer", "more product-like"), move along that axis.
