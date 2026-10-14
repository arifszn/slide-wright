# Boardroom-grade, not web-generated

The target is a **boardroom** deck: it reads like a finished slide from a strong strategy or product team, calm and confident. It should never look like a landing page, a web demo, or a generated page.

Every deck still gets its own theme. What stays constant is the craft below.

## Every content slide is composed

A content slide has three parts, and together they fill the canvas:

1. **Action title**: the slide's point as a short claim, one or two lines. "Churn fell 18% after the pricing change." Avoid topic labels like "Overview" or "Why it's fast".
2. **Exhibit**: one visual that proves or explains the claim (see `exhibits.md`).
3. **Takeaway**: one sentence at the bottom that says what it means for the audience, or a source line for data.

The slide sits inside the theme's **slide chrome** (header and footer, defined in `theme-generation.md`). Top-anchored, gridded, edge to edge within the margins. Big words alone in the middle of an empty canvas belong only to the title slide, section breaks, and the closing slide.

## Exhibits carry the slide

Executives scan, they do not read. The exhibit does most of the work: a flow with labeled arrows, a product mockup built from shapes, a chart, a comparison table, a timeline, a metric panel, an architecture diagram. Build exhibits in HTML/CSS/SVG in the theme's colors so they look like they were drawn in the same tool as the rest of the slide. Use a real image only when the content needs the real thing (a product screenshot, a logo, a photo of the actual hardware).

## Restraint reads as confidence

- **Color:** one dominant surface, one accent, and the neutrals for text and lines. Use the accent to point at the one thing that matters on the slide. Light or dark is a per-deck decision based on the subject and the room.
- **Type:** one family or one tight pair, set in a strict scale: title, subhead, body, label. A refined serif or a clean grotesque for titles, a highly legible sans for body, and optionally a mono for small labels and numbers. Body text stays at 26px or larger on the 1920x1080 canvas.
- **Depth:** flat surfaces, hairline rules, and at most a soft shadow on cards or a subtle gradient on the background. Keep every effect quiet enough that nobody would comment on it.
- **Alignment:** left-aligned text on a visible grid, with equal gutters and consistent margins on every slide.

## Copy sounds like an operator wrote it

Short declarative sentences. Concrete nouns and numbers. Body text on a slide is one or two sentences, or three to five bullets of under ten words each. Plain words over marketing words: "cuts payout time from 3 days to same-day" over "unlocks seamless velocity".

## Match the room

A board update, a QBR, or a security review is quiet and dense with evidence. A product vision or a partner pitch can carry more color and larger exhibits. Both use the same composed slide structure.

## The honest check

Before you show a preview, picture it projected in a boardroom, in a deck sent by a respected company. Would the slide pass without anyone wondering how it was made? Does every content slide have a claim, an exhibit, and a takeaway? If any slide looks like a web page or a poster, fix the composition before showing it.
