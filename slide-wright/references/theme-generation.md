# Building a theme

There's no library to choose from. You invent the theme for each deck, inside the boardroom standard in `design-aesthetics.md`. Before writing any HTML, decide four things and write them down: the palette, the type system, the slide chrome, and the exhibit style.

## Start from the subject and the room

Let the topic and the audience set the feeling. A payments platform update, a hospital operations review, and a climate fund pitch should look different from each other, yet all three should look like they came from a serious organization. Pull the palette and type from the subject's own world: the company's brand, the product's UI, the industry's conventions.

## Palette

One dominant surface, one accent, and the neutrals you need. Write them as CSS variables: `--bg`, `--bg-alt` (cards and panels), `--text`, `--text-muted`, `--line` (rules and borders), `--accent`, and optionally `--accent-2` for a second data series. Body text meets WCAG AA on its background. Decide light or dark on purpose. Give the palette a name like "Harbor Navy" or "Paper & Signal" to use when you present it, and keep that name off the slides.

## Type system

From Google Fonts or Fontshare, loaded in the `<link>`, set as `--font-display`, `--font-body`, and optionally `--font-mono`. Directions that hold up: an editorial serif title over a clean sans body; one grotesque throughout; a sans with a mono for labels and numbers. Choose the specific families for this deck's subject, and vary them from deck to deck. Fix the scale as variables too: roughly 72-88px titles, 40px subheads, 28px body, 18-20px labels.

## Slide chrome

The frame every content slide sits in. This is what makes the deck read as one designed file. Define:

- **Header:** a section label on the left (for example "02 · Market"), an optional hairline rule, and the page number on the right ("02 / 09").
- **Footer:** the takeaway line or the source note, and optionally the company or deck name.
- **Margins and grid:** fixed outer margins and a 12-column grid that every layout snaps to.

Its look belongs to the theme: a small accent square before the label, a full-width rule, mono uppercase labels, or a quiet sans with no rule at all. Title, section, and closing slides may use a lighter version of the chrome.

## Exhibit style

How the theme draws exhibits: card radius (0, 8, or 16px), border vs. fill, shadow or none, arrow style, how data series use the accent and the neutrals. Every exhibit in the deck follows it. `exhibits.md` has the building blocks.

## Motion

Static. Slides change with a short fade and appear complete. See `motion-recipes.md`.

## Iterating after a rejected preview

A rejection means change direction, not tint. Replace the palette, type system, chrome, and exhibit style together so the next preview is a genuinely different proposal. If the user gave a steer ("lighter", "more corporate", "warmer", "more product-like"), move along that axis.
