# Building a theme

There's no library to choose from. You invent the theme for each deck, inside the boardroom standard in `design-aesthetics.md`. Before writing any HTML, decide four things and write them down: the palette, the type system, the layout system, and the exhibit style.

## Start from the subject and the room

Let the topic and the audience set the feeling. A payments platform update, a hospital operations review, and a climate fund pitch should look different from each other, yet all three should look like they came from a serious organization. Pull the palette and type from the subject's own world: the company's brand, the product's UI, the industry's conventions.

## Palette

One dominant surface, one accent, and the neutrals you need. Name them as the CSS variables in `deck-template.md`. Body text meets WCAG AA on its background. Decide light or dark on purpose. Give the palette a name like "Harbor Navy" or "Paper & Signal" to use when you present it, and keep that name off the slides.

## Type system

From Google Fonts or Fontshare, loaded in the `<link>`, set as `--font-display`, `--font-body`, and optionally `--font-mono`. Directions that hold up: an editorial serif title over a clean sans body; one grotesque throughout; a sans with a mono for labels and numbers. Choose the specific families for this deck's subject, and vary them from deck to deck. Fix the scale as variables too, starting from the `deck-template.md` values (80px titles, 40px subheads, 28px body, 20px labels). Floors: body 26px, labels 18px.

## Layout system

What makes the slides read as one designed file. Fix the outer margins and a 12-column grid that every layout snaps to, and decide where titles and exhibits sit. Record the frame metrics, title placement, content density, and whether the exhibit is full-width, split, inset, or edge-to-edge. The values in `deck-template.md` are a worked example, not defaults to copy.

Recurring elements are a choice per theme, not a requirement. A deck might carry a section label, a footer with the source or company name, a page number, a rule, or nothing at all beyond the margins. Pick what suits the subject and the room, keep it consistent once chosen, and let title, section, and closing slides drop it.

## Exhibit style

How the theme draws exhibits: card radius, border vs. fill, shadow or none, arrow style, how data series use the accent and the neutrals. Every exhibit in the deck follows it. `exhibits.md` has the building blocks.

## Similarity guard

For each new deck, make at least three of these choices deliberately different from the last unrelated deck: light or dark surface, display/body font pairing, outer geometry, title placement, exhibit family, card treatment, and recurring chrome. The one constant is the boardroom standard, not a repeated template. If the first preview could be mistaken for another recent deck after removing its words, reject it and choose a different composition before showing it.

The guard operates at composition level too. Also vary at least three of these when the subject changes: step count derived from the content, horizontal versus vertical direction, card-and-arrow versus rail versus ledger rendering, accent position based on the claim, and which slide first introduces the exhibit. If another deck is in the same working area, inspect its first content slide before choosing the new composition. A fresh session does not mean a fresh visual pattern. Invent a subject-specific composition when the variants in `exhibits.md` do not fit.

## Motion

Static. Slides change with a short fade and appear complete. See `motion-recipes.md`.

## Steering a new direction

If the user gave a steer ("lighter", "more corporate", "warmer", "more product-like"), move along that axis.
