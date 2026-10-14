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
- Every deck meets the **boardroom** standard: each content slide has an action title, one exhibit, and a takeaway inside consistent slide chrome, and it appears complete when it lands (stepped code highlights are the one exception). See `slide-wright/references/design-aesthetics.md`.
- The output is one HTML file with the theme CSS inline and the engine pulled from a CDN. No build step, no npm.

## The engine (keep this internal)

Decks render with reveal.js loaded from a CDN, but that is an implementation detail the user never sees. Don't name reveal.js, "reveal," or any library in conversation, in the README, or anywhere in the deck itself. The user's vocabulary is slides, themes, and design. The library name appears only inside the generated `<link>` and `<script>` tags. `slide-wright/references/deck-template.md` has the exact setup.

## Editing a deck that already exists

If the user points at an existing HTML deck, check whether it's built on reveal.js (look for the reveal.js `<link>`/`<script>` tags from a CDN). If it is — whether or not this skill built it — don't start over: read it, keep its theme, and make the change in place. The look is already approved, so skip the proposal and the gate. After editing, check that nothing overflows or overlaps.

If the deck is HTML but not on reveal.js (different engine, plain slides, etc.), it's outside this skill's edit path — say so rather than forcing a rewrite onto a different engine. Everything else on this page is for building a new deck.

## Step 1 — Work out the deck from the request

Don't open with a questionnaire. Take whatever the user gave — a one-line topic, messy notes, a full outline — and infer the rest:

- **Purpose and audience** from the subject and how it's written. A raise, a lesson, a conference talk, and an internal update each call for a different treatment.
- **Length** from how much material there is. A bare topic becomes a short deck; a long outline becomes more slides. Don't fix a number up front.
- **How much evidence** the deck needs: numbers, comparisons, and diagrams available or implied by the material.

Only ask something if the request is too thin to design from at all — a single word with no angle — and even then ask one question, not five. If the user has more to give, they usually paste it.

### Composed slides

Every content slide is self-contained: someone reading the PDF without the presenter gets the point. A short action title states the claim, one exhibit proves it, and a takeaway line says what it means. One claim per slide; when a slide carries two claims or its exhibit won't fit, split it. Never let a slide scroll, overflow, overlap, or shrink text below the sizes in the theme.

## Step 2 — Propose a look

Read `slide-wright/references/theme-generation.md` and `slide-wright/references/design-aesthetics.md`, then:

1. Invent a theme: a palette, a type system from Fontshare or Google Fonts, the slide chrome, and the exhibit style. Give it a name for your own use.
2. Build a two-slide preview with `slide-wright/references/deck-template.md` — a real title slide for this deck (its actual title, never a placeholder or a label like "demo"), and one real content slide with its chrome, action title, a full exhibit from `slide-wright/references/exhibits.md`, and takeaway. Write it as the real deck file in the working directory, named for the deck: `./<deck-slug>.html` (e.g. `./clickhouse.html`). This is the one file the whole deck grows into — there is no separate demo or scratch file.
3. Open it in the browser.

The preview has to read as two real slides from the finished deck, not a sample card. Keep all process language off the slide and out of the filename: no "demo," "preview," theme name, or "option A." The theme's name goes in your message to the user, never on a slide.

## Step 3 — Get a yes

Stop and ask (use a structured prompt if the environment has one):

> "Here's the design direction — *[theme name]*. Does this look right, or want a different direction?"
>
> - **Looks great — build it** → go to Step 4.
> - **Try a different direction** → start over with a new theme.
> - **Adjust this one** (different accent / font / lighter / bolder) → tweak and show it again.

If they want a different direction, optionally ask one steering question ("lighter or darker, more corporate or more product-like?"), then build a genuinely new theme — different palette, type, chrome, and exhibit style — and a fresh two-slide preview, overwriting the same `./<deck-slug>.html`. Don't just recolor the rejected one. Repeat until they approve.

Do not build the full deck before you have a yes.

## Step 4 — Build the deck

Keep building in the **same** `./<deck-slug>.html` the user just approved. The two approved slides stay as they are — append the rest around them; never regenerate them from scratch (that reintroduces drift the user already signed off against). Read `slide-wright/references/exhibits.md` for exhibit patterns; read `slide-wright/references/motion-recipes.md` only for code slides or when the user asks for animation.

- Use the exact approved palette, type system, chrome, and exhibit style throughout.
- Structure the story answer-first: the title slide, then the main point or recommendation, then the supporting slides, then the ask or next steps.
- Vary the *exhibits* (flow, mockup, chart, comparison, timeline, metric panel) and layouts (full-width, split) while keeping the one visual system. Section breaks and the closing slide may drop the exhibit.
- Every content slide has its action title, one exhibit, and takeaway. If a slide overflows, split it.
- Put speaker notes in `<aside class="notes">` wherever the content implies something to say out loud.
- Keep it one self-contained HTML file: theme CSS inline, engine from the CDN, a clear comment on each section.

If the user only wants part of the deck for now, that's fine — the file is already a working deck. Adding more slides later is just editing it (see "Editing a deck that already exists").

Once the deck is built, look at it in a real browser render: every slide complete on arrival, chrome on every content slide, the canvas filled, no overflow, no overlapping panels, the 16:9 frame intact, fonts actually loaded. A `scrollHeight` check isn't enough on its own — panels can cover each other without overflowing.

## Step 5 — Hand it off

1. Open the finished deck.
2. Say where it lives, the theme name, and the slide count.
3. Tell the user how to drive it: arrow keys, space, or swipe to move; **F** for fullscreen, **Esc** or **O** for the slide overview, **S** for the speaker view with notes, **?** for the full key list; add `?print-pdf` to the URL and print to save a PDF (`slide-wright/references/export-pdf.md` has the steps); theme colors live in the `:root` variables, fonts in the `<link>`.
4. Offer the obvious next moves: revise the content, change the theme, export a PDF, or **deploy to a live URL** to share it. If they want to deploy, read `slide-wright/references/deploy.md` and let them pick the host (Surge, Vercel, or Netlify) — don't assume one.

## Reference files

Read these as you reach them, not all at once:

- `slide-wright/references/design-aesthetics.md` — what makes a deck look designed (Step 2)
- `slide-wright/references/theme-generation.md` — the procedure for inventing a theme (Step 2)
- `slide-wright/references/deck-template.md` — the HTML skeleton, slide chrome, and engine setup (Steps 2 and 4)
- `slide-wright/references/exhibits.md`: choosing and building the visual on each content slide (Steps 2 and 4)
- `slide-wright/references/motion-recipes.md` — code slides, and animation when the user asks for it (Step 4)
- `slide-wright/references/export-pdf.md` — saving a deck as a PDF (Step 5)
- `slide-wright/references/deploy.md` — publishing the deck to a live URL (Step 5)
