# Building a theme

There's no library to choose from — you invent the theme for each deck. Before writing any HTML, decide four things and write them down: the palette, the type pairing, the one recurring device, and how motion behaves. `design-aesthetics.md` covers the judgment behind these; this is the procedure.

## Start from the subject, not a template

Let the actual topic and occasion set the feeling. Money on the line wants contrast and confidence; a lesson wants warmth and clarity; an internal report wants restraint and structure. Don't stop at the category, though — a coral-reef talk, a fintech raise, and a retro-games postmortem are all "a deck" and should look nothing alike. The subject is the richest source of a distinctive look, so mine it before reaching for anything generic.

## Palette

Choose a committed set, not an even spread: one dominant surface, one decisive accent, and only the neutrals you need for text. Write them as CSS variables — `--bg`, an optional `--bg-alt`, `--text`, `--text-muted`, `--accent`, an optional `--accent-2`. Keep body text comfortably readable on its background (aim for about WCAG AA). Decide light or dark on purpose. Give the palette a name like "Ink & Ember" or "Cold Cobalt" to use when you present it, and never put that name on a slide.

## Type

One display face with personality, one quiet body face, both from Fontshare or Google Fonts, set as `--font-display` and `--font-body` and loaded in the `<link>`. Skip system fonts and the default sans every tool gravitates toward. Directions that tend to hold up: a heavy condensed face over a humanist body; an editorial serif over a plain grotesque; a geometric or monospace display for technical material. Treat those as starting points, not a fixed menu.

## The recurring device

Pick the single visual idea that shows up across slide types and makes them read as a set: a gradient field, a visible grid, color planes meeting at hard angles, oversized numerals, a rule system, a grain. Commit to it and repeat it.

## Motion

One orchestrated entrance per slide rather than scattered effects, a consistent slide transition you override only when the change means something, and restraint everywhere else. Save the big moments for titles, section breaks, and a key number. Always honor reduced-motion. `motion-recipes.md` has the patterns.

## Iterating after a rejected preview

A rejection means change direction, not tint. Replace all four decisions — palette, type, device, and motion feel — so the next preview is a genuinely different proposal instead of the same design recolored. If the user gave a steer ("warmer", "calmer", "bolder", "more editorial"), make that the axis you move along.
