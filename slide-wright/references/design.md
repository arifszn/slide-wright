# Designing a theme

The target is a **boardroom** deck: it reads like a finished slide from a strong strategy or product team, calm and confident. It never looks like a landing page, a web demo, or a generated page.

There is no theme library. Invent the theme for the deck in front of you, from its subject and its room. A payments platform update, a hospital operations review, and a climate fund pitch should each look like their own world, and all three like a serious organization made them. A board update or a security review is quiet and dense with evidence; a product vision or a partner pitch carries more color and larger exhibits.

## Decide five things before writing HTML

**Palette.** One dominant surface, one accent, and the neutrals for text and lines, named as the `:root` variables in `deck-template.md`. Take them from the subject's world: the company's brand, the product's UI, the materials and documents of the industry. The accent points at the one thing that matters on a slide; it is not decoration. Light, dark, or a colored surface is a decision about the subject and the room. Body text meets WCAG AA.

**Type.** One family or one tight pair from Google Fonts or Fontshare, plus an optional mono for numbers and small labels. Choose families that belong to this subject, and vary them from deck to deck. Set a strict scale with real contrast, the title at least 2.5 times the body:

| Role | Start | Floor |
| --- | --- | --- |
| Title | 80px (the title slide can go to 160px) | 56px |
| Subhead | 40px | 32px |
| Body | 28px | 26px |
| Text inside exhibits | 24px | 22px |
| Labels | 20px | 18px |

**Layout.** Outer margins, a 12-column grid every slide snaps to, where the title sits, and where the exhibit sits (full-width, split, inset, or edge to edge). Text is left-aligned with equal gutters. Recurring chrome is a choice per theme: a section label, a footer with the source, a page number, a rule, or nothing. Keep it consistent once chosen; title, section, and closing slides may drop it. The values in `deck-template.md` are a worked example, not defaults.

**Exhibit style.** How this theme draws: card radius, border or fill, shadow or none, arrow style, and how data series use the accent and the neutrals. Flat surfaces and hairline rules; at most one soft shadow. Every exhibit in the deck follows it.

**Signature.** One visual idea taken from the subject that would identify the deck with its words removed: a route line for logistics, a ledger rule for finance, a contour for climate, a waveform for audio. Draw it in CSS or SVG. It appears large on the title slide and returns quietly on section breaks and in the way exhibits are drawn. One device, not a set of decorations.

## Every content slide is composed

A content slide is two things that together fill the canvas:

1. **Action title**: the slide's point as a short claim, one or two lines. "Churn fell 18% after the pricing change", not "Overview".
2. **Exhibit**: one visual that proves or explains the claim, built in HTML/CSS/SVG in the theme's colors (`exhibits.md`). Use a real image only when the content needs the real thing.

The exhibit occupies the whole space between the title and the footer, not a band under the title. One claim per slide: when a slide carries two, or its exhibit will not fit, split it. A reader of the PDF with no presenter still gets the point; add a takeaway or source line where it helps. Big words alone on the canvas belong only to section breaks and the closing slide. The title slide carries the signature.

Copy sounds like an operator wrote it: short declarative sentences, concrete nouns and numbers. Body text is one or two sentences, or three to five bullets under ten words each. "Cuts payout time from 3 days to same-day", not "unlocks seamless velocity".

## Reflexes to refuse

These are what gets picked when nothing is being chosen. Use one only when the subject gives a reason you could say out loud.

- A dark navy or slate surface with an amber, teal, or violet accent.
- Inter, Roboto, Poppins, Montserrat, Space Grotesk, or IBM Plex.
- A tiny uppercase mono label above every title.
- A title slide that is only a headline on an empty surface.
- The same row of bordered cards as the exhibit on every slide.
- A table of numbers where a drawing would show the difference.
- An exhibit in the top half with empty canvas under it.
- Gradient text, glows, glass panels, or decorative blobs.

## Several directions

When the user asked for more than one preview, each is a different answer to the same brief, told apart at thumbnail size. Across the set, differ in all four: surface (light, dark, colored), type genre (serif, grotesque, mono-led, slab), composition (where the title and exhibit sit, and the exhibit rendering), and signature. Two recolors of one layout are one direction. Give each a one-line reason tied to the subject.

## Similarity guard

A new deck must not look like the last one. Against the last unrelated deck, change at least three of: surface, font pairing, outer geometry, title placement, exhibit rendering, card treatment, recurring chrome. If another deck is in the working area, look at its first content slide before choosing. If the preview could be mistaken for it with the words removed, choose another composition before showing anything.

## Before you show it

Picture the preview projected in a boardroom, in a deck sent by a respected company. Would it pass without anyone wondering how it was made? Is the canvas filled? Does the signature read? If a slide looks like a web page or a poster, fix the composition first.

When the user steers ("lighter", "more corporate", "warmer", "more product-like"), move along that axis and keep the rest.
