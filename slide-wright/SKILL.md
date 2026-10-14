---
name: slide-wright
description: Create beautiful web presentations from a topic, rough notes, or an outline, and edit decks afterward — adding, removing, or revising slides. Generates a custom theme and a short two-slide preview, then builds the full deck only once the user confirms the direction; edits to an existing deck skip that flow and apply in place. Use when the user wants to make slides, a presentation, a talk deck, a pitch deck, or to add/remove/change a slide in one that already exists.
---

# slide-wright

Turn a topic or rough notes into a boardroom-grade presentation: slides that read like a deck from a strong strategy or product team, delivered as a single self-contained HTML file that runs in any browser.

## The rule that defines this skill

Propose the look before you build the deck. On the first pass you never produce a finished presentation. You generate a theme, build a two-slide preview in it, and stop until the user approves the direction. Only then do you build the rest. Everything below serves that order.

A few things follow from it:

- One proposal at a time, not a menu. If the user says no, throw the direction out and try a clearly different one.
- Every theme is invented for the deck in front of you. There is no library of presets to pick from.
- Every deck meets the **boardroom** standard: each content slide has an action title and one exhibit, and it appears complete when it lands (stepped code highlights are the one exception). See `references/design-aesthetics.md`.
- The output is one HTML file with the theme CSS inline and the engine pulled from a CDN. No build step, no npm.

## The engine (keep this internal)

Decks render with reveal.js loaded from a CDN, but that is an implementation detail the user never sees. Don't name reveal.js, "reveal," or any library in conversation, in the README, or anywhere in the deck itself. The user's vocabulary is slides, themes, and design. The library name appears only inside the generated `<link>` and `<script>` tags. `references/deck-template.md` has the exact setup.

## Editing a deck that already exists

If the user points at an existing HTML deck, check whether it's built on reveal.js (look for the reveal.js `<link>`/`<script>` tags from a CDN). If it is — whether or not this skill built it — don't start over: read it, keep its theme, and make the change in place. The look is already approved, so skip the proposal and the gate. After editing, check that nothing overflows or overlaps.

If the deck is HTML but not on reveal.js (different engine, plain slides, etc.), it's outside this skill's edit path — say so rather than forcing a rewrite onto a different engine. Everything else on this page is for building a new deck.

## Step 1 — Work out the deck from the request

Don't open with a questionnaire. Take whatever the user gave — a one-line topic, messy notes, a full outline — and infer the rest:

- **Purpose and audience** from the subject and how it's written. A raise, a lesson, a conference talk, and an internal update each call for a different treatment.
- **Length** from how much material there is. A bare topic becomes a short deck; a long outline becomes more slides. Don't fix a number up front.
- **How much evidence** the deck needs: numbers, comparisons, and diagrams available or implied by the material.
- **The topic's native visual language**: identify the object or mechanism the audience already understands, then make the exhibit resemble that object. Do not use a generic four-card flow just because the source material has steps.
- **The composition decision**: choose or invent the exhibit family and its geometry from the claim. A process can be a card flow, timeline rail, vertical ladder, ledger/state rail, swimlane, decision tree, radial cycle, state machine, architecture, map, or annotated mockup. The list is not closed. Do not default slide 2 to the first flow snippet in the references.

Only ask something if the request is too thin to design from at all — a single word with no angle — and even then ask one question, not five. If the user has more to give, they usually paste it.

### Composed slides

Every content slide is self-contained: someone reading the PDF without the presenter gets the point. A short action title states the claim and one exhibit proves it; add a takeaway or source line where it helps. One claim per slide; when a slide carries two claims or its exhibit won't fit, split it. Never let a slide scroll, overflow, overlap, or shrink text below the sizes in the theme. Treat narrow layout regions as real constraints: flow labels must wrap inside their arrow columns, and page counters must stay on one line without covering source or takeaway text.

## Step 2 — Propose a look

Read `references/theme-generation.md` and `references/design-aesthetics.md`, then:

1. Invent a theme: a palette, a type system from Fontshare or Google Fonts, the layout system, and the exhibit style. Give it a name for your own use.
2. Build a two-slide preview with `references/deck-template.md` — a real title slide for this deck (its actual title, never a placeholder or a label like "demo"), and one real content slide with its action title and a full exhibit from `references/exhibits.md`. Write it as the real deck file in the working directory, named for the deck: `./<deck-slug>.html` (e.g. `./clickhouse.html`). This is the one file the whole deck grows into — there is no separate demo or scratch file.
3. Open it in the browser.

The preview has to read as two real slides from the finished deck, not a sample card. Keep all process language off the slide and out of the filename: no "demo," "preview," theme name, or "option A." The theme's name goes in your message to the user, never on a slide.

## Step 3 — Get a yes

Stop and ask (use a structured prompt if the environment has one):

> "Here's the design direction — *[theme name]*. Does this look right, or want a different direction?"
>
> - **Looks great — build it** → go to Step 4.
> - **Try a different direction** → choose a new direction.
> - **Adjust this one** (different accent / font / lighter / bolder) → tweak and show it again.

If they choose **Try a different direction**, ask one steering question with a short, topic-specific set of directions. Invent the choices from the subject, audience, and rejected preview; do not reuse a fixed list from this skill. Put **Surprise me** first, followed by the contextual directions, and allow a custom answer.

> What should the next direction feel like?
>
> - Surprise me
> - [A subject-specific direction]
> - [Another subject-specific direction]
> - [Optional custom direction]

If they choose **Surprise me**, make a radically different, subject-led departure yourself. Then build a genuinely new theme — different palette, type, layout, composition, and exhibit style — and a fresh two-slide preview, overwriting the same `./<deck-slug>.html`. Don't just recolor the rejected one. Repeat until they approve.

Do not build the full deck before you have a yes.

## Step 4 — Build the deck

Keep building in the **same** `./<deck-slug>.html` the user just approved. The two approved slides stay as they are — append the rest around them; never regenerate them from scratch (that reintroduces drift the user already signed off against). Read `references/exhibits.md` for exhibit patterns; read `references/motion-recipes.md` only for code slides or when the user asks for animation.

- Use the exact approved palette, type system, layout system, and exhibit style throughout.
- Do not reuse the same composition for unrelated topics. Before finalizing the preview, deliberately vary at least three of: light/dark surface, font pairing, title placement, outer geometry, exhibit family, card treatment, and recurring chrome. A sequence may use a flow, but it may also need a timeline, state rail, architecture, map, ledger, or annotated mockup.
- Apply the guard to structure, not just styling: vary at least three of step count, horizontal versus vertical direction, flow rendering, accent position, and the slide position where the exhibit first appears. If another deck is available in the working area, inspect its first content slide before choosing this one. If no listed exhibit fits, invent a topic-native composition with its own geometry and visual grammar; do not fall back to the canonical four-card flow.
- Structure the story answer-first: the title slide, then the main point or recommendation, then the supporting slides, then the ask or next steps.
- Vary the *exhibits* (flow, mockup, chart, comparison, timeline, metric panel) and layouts (full-width, split) while keeping the one visual system. Section breaks and the closing slide may drop the exhibit.
- Every content slide has its action title and one exhibit. If a slide overflows, split it.
- Put speaker notes in `<aside class="notes">` wherever the content implies something to say out loud.
- Keep it one self-contained HTML file: theme CSS inline, engine from the CDN, a clear comment on each section.

If the user only wants part of the deck for now, that's fine — the file is already a working deck. Adding more slides later is just editing it (see "Editing a deck that already exists").

Once the deck is built, look at it in a real browser render: every slide complete on arrival, the canvas filled, no overflow, no overlapping panels, the 16:9 frame intact, fonts actually loaded. A `scrollHeight` check isn't enough on its own — panels can cover each other without overflowing.

## Step 5 — Hand it off

1. Open the finished deck.
2. Say where it lives, the theme name, and the slide count.
3. Tell the user how to drive it: arrow keys, space, or swipe to move; **F** for fullscreen, **Esc** or **O** for the slide overview, **S** for the speaker view with notes, **?** for the full key list; add `?print-pdf` to the URL and print to save a PDF (`references/export-pdf.md` has the steps); theme colors live in the `:root` variables, fonts in the `<link>`.
4. Offer the obvious next moves: revise the content, change the theme, export a PDF, export a PowerPoint file (`references/export-pptx.md`), or **deploy to a live URL** to share it. If they want to deploy, read `references/deploy.md` and let them pick the host (Surge, Vercel, or Netlify) — don't assume one.

## Reference files

Read these as you reach them, not all at once:

- `references/design-aesthetics.md` — what makes a deck look designed (Step 2)
- `references/theme-generation.md` — the procedure for inventing a theme (Step 2)
- `references/deck-template.md` — the HTML skeleton, layout, and engine setup (Steps 2 and 4)
- `references/exhibits.md`: choosing and building the visual on each content slide (Steps 2 and 4)
- `references/motion-recipes.md` — code slides, and animation when the user asks for it (Step 4)
- `references/export-pdf.md` — saving a deck as a PDF (Step 5)
- `references/export-pptx.md`: exporting a deck to PowerPoint with editable text (Step 5)
- `references/deploy.md` — publishing the deck to a live URL (Step 5)
