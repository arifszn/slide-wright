---
name: slide-wright
description: Create beautiful, animated web presentations from a topic, rough notes, or an outline, and edit decks afterward — adding, removing, or revising slides. Generates a custom theme and a short two-slide preview, then builds the full deck only once the user confirms the direction; edits to an existing deck skip that flow and apply in place. Use when the user wants to make slides, a presentation, a talk deck, a pitch deck, or to add/remove/change a slide in one that already exists.
---

# slide-wright

Turn a topic or rough notes into a polished, animated web presentation — a single self-contained HTML file that runs in any browser.

## The rule that defines this skill

Propose the look before you build the deck. On the first pass you never produce a finished presentation. You generate a theme, build a two-slide preview in it, and stop until the user approves the direction. Only then do you build the rest. Everything below serves that order.

A few things follow from it:

- One proposal at a time, not a menu. If the user says no, throw the direction out and try a clearly different one.
- Every theme is invented for the deck in front of you. There is no library of presets to pick from.
- Aim for a deck that looks deliberately designed, not averaged. See `references/design-aesthetics.md`.
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
- **How dense** each slide should be (see below).

Only ask something if the request is too thin to design from at all — a single word with no angle — and even then ask one question, not five. If the user has more to give, they usually paste it.

### How dense should the slides be?

This is one judgment call that shapes type size, word count, and slide count for the whole deck. Place the deck between two extremes:

- A deck **made to be spoken over** carries one idea per slide, large type, plenty of air, a few words. More slides, each lighter. Talks, keynotes, anything presented live.
- A deck **made to be read alone** is self-contained: structured grids and tables, captions, more words per slide, tighter but still deliberate spacing. Reports, handouts, async review.

Most decks lean one way. Pick the nearer extreme instead of splitting the difference. Either way, never let a slide scroll, overflow, overlap, or shrink text below comfortable reading — if it won't fit, split it across more slides.

## Step 2 — Propose a look

Read `references/theme-generation.md` and `references/design-aesthetics.md`, then:

1. Invent a theme: a palette, a display/body type pairing from Fontshare or Google Fonts, a layout grammar, and one recurring visual device. Give it a name for your own use.
2. Build a two-slide preview with `references/deck-template.md` — a real title slide for this deck (its actual title, never a placeholder or a label like "demo"), and one content slide in the layout the deck will lean on. Write it as the real deck file in the working directory, named for the deck: `./<deck-slug>.html` (e.g. `./clickhouse.html`). This is the one file the whole deck grows into — there is no separate demo or scratch file.
3. Open it in the browser.

The preview has to read as two real slides from the finished deck, not a sample card. Keep all process language off the slide and out of the filename: no "demo," "preview," theme name, or "option A." The theme's name goes in your message to the user, never on a slide.

## Step 3 — Get a yes

Stop and ask (use a structured prompt if the environment has one):

> "Here's the design direction — *[theme name]*. Does this look right, or want a different direction?"
>
> - **Looks great — build it** → go to Step 4.
> - **Try a different direction** → start over with a new theme.
> - **Adjust this one** (different accent / font / lighter / bolder) → tweak and show it again.

If they want a different direction, optionally ask one steering question ("warmer or cooler, bolder or calmer?"), then build a genuinely new theme — different palette, type, and device — and a fresh two-slide preview, overwriting the same `./<deck-slug>.html`. Don't just recolor the rejected one. Repeat until they approve.

Do not build the full deck before you have a yes.

## Step 4 — Build the deck

Keep building in the **same** `./<deck-slug>.html` the user just approved. The two approved slides stay as they are — append the rest around them; never regenerate them from scratch (that reintroduces drift the user already signed off against). Read `references/motion-recipes.md` for the transition and reveal patterns.

- Use the exact approved palette, fonts, spacing, and device throughout. Don't let the style drift partway through.
- Vary the *layouts* — title, section break, two-column, quote, comparison, closing — while keeping the one visual system.
- Match the density you settled on: spoken-over decks get more slides with less on each; read-alone decks get structured, self-contained slides. If a slide overflows, split it.
- Put speaker notes in `<aside class="notes">` wherever the content implies something to say out loud.
- Keep it one self-contained HTML file: theme CSS inline, engine from the CDN, a clear comment on each section.

If the user only wants part of the deck for now, that's fine — the file is already a working deck. Adding more slides later is just editing it (see "Editing a deck that already exists").

Once the deck is built, look at it in a real browser render: no overflow, no overlapping panels, the 16:9 frame intact, fonts actually loaded. A `scrollHeight` check isn't enough on its own — panels can cover each other without overflowing.

## Step 5 — Hand it off

1. Open the finished deck.
2. Say where it lives, the theme name, and the slide count.
3. Tell the user how to drive it: arrow keys, space, or swipe to move; **F** for fullscreen, **Esc** or **O** for the slide overview, **S** for the speaker view with notes, **?** for the full key list; add `?print-pdf` to the URL and print to save a PDF (`references/export-pdf.md` has the steps); theme colors live in the `:root` variables, fonts in the `<link>`.
4. Offer the obvious next moves: revise the content, change the theme, export a PDF, or **deploy to a live URL** to share it. If they want to deploy, read `references/deploy.md` and let them pick the host (Surge, Vercel, or Netlify) — don't assume one.

## Reference files

Read these as you reach them, not all at once:

- `references/design-aesthetics.md` — what makes a deck look designed (Step 2)
- `references/theme-generation.md` — the procedure for inventing a theme (Step 2)
- `references/deck-template.md` — the HTML skeleton and engine setup (Steps 2 and 4)
- `references/motion-recipes.md` — transitions and reveals (Step 4)
- `references/export-pdf.md` — saving a deck as a PDF (Step 5)
- `references/deploy.md` — publishing the deck to a live URL (Step 5)
