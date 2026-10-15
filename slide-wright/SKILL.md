---
name: slide-wright
description: Create beautiful web presentations from a topic, rough notes, or an outline, and edit decks afterward — adding, removing, or revising slides. Generates a custom theme and a short two-slide preview, then builds the full deck only once the user confirms the direction; edits to an existing deck skip that flow and apply in place. Use when the user wants to make slides, a presentation, a talk deck, a pitch deck, or to add/remove/change a slide in one that already exists.
---

# slide-wright

Turn a topic or rough notes into a boardroom-grade presentation: slides that read like a deck from a strong strategy or product team, delivered as a single self-contained HTML file that runs in any browser.


## The rule that defines this skill

Propose the look before you build the deck. On the first pass you never produce a finished presentation. You generate a theme, build a two-slide preview in it, and stop until the user approves the direction. Only then do you build the rest.

One proposal at a time, not a menu. If the user says no, throw the direction out and try a clearly different one. Every theme is invented for the deck in front of you; there is no library of presets.

**New deck: read `references/new-deck.md` first.** It holds Steps 1-4 (work out the deck, propose a look, get a yes, build) and the exact approval gate.

## The engine (keep this internal)

Decks render with reveal.js loaded from a CDN, but that is an implementation detail the user never sees. Talk about slides, themes, and design; the library name appears only inside the generated `<link>` and `<script>` tags. `references/deck-template.md` has the exact setup.

## Editing a deck that already exists

If the user points at an existing HTML deck, check whether it's built on reveal.js (look for the reveal.js `<link>`/`<script>` tags from a CDN). If it is — whether or not this skill built it — don't start over: read it, keep its theme, and make the change in place. The look is already approved, so skip the proposal and the gate. After editing, run `node <skill-dir>/scripts/check-deck.mjs <deck.html>` and fix every line it prints (`references/new-deck.md` has the details).

No reference files are needed for an edit, unless you add a new exhibit type (read `references/exhibits.md`) or code or animation (read `references/code-slides.md` or `references/motion-recipes.md`).

If the deck is HTML but not on reveal.js (different engine, plain slides, etc.), it's outside this skill's edit path — say so rather than forcing a rewrite onto a different engine. Everything else here is for building a new deck.

## Step 5 — Hand it off

1. Open the finished deck.
2. Say where it lives, the theme name, and the slide count.
3. Tell the user how to drive it: arrow keys, space, or swipe to move; **F** for fullscreen, **Esc** or **O** for the slide overview, **S** for the speaker view with notes; add `?print-pdf` to the URL and print to save a PDF (`references/export-pdf.md` has the steps); theme colors live in the `:root` variables, fonts in the `<link>`.
4. Offer the obvious next moves: revise the content, change the theme, export a PDF, export a PowerPoint file (`references/export-pptx.md`), or **deploy to a live URL** to share it. If they want to deploy, read `references/deploy.md` and let them pick the host (Surge, Vercel, or Netlify) — don't assume one.

## Reference files

Read these as you reach them, not all at once:

- `references/new-deck.md` — Steps 1-4 for a new deck: work out the deck, propose a look, get a yes, build
- `references/design-aesthetics.md` — what makes a deck look designed (Step 2)
- `references/theme-generation.md` — the procedure for inventing a theme (Step 2)
- `references/deck-template.md` — the HTML skeleton, layout, and engine setup (Steps 2 and 4)
- `references/exhibits.md` — choosing and building the visual on each content slide (Steps 2 and 4)
- `references/code-slides.md` — code slides and their markup contract (Step 4)
- `references/motion-recipes.md` — animation, when the user asks for it (Step 4)
- `references/media.md` — images and video in slides (Step 4)
- `references/export-pdf.md` — saving a deck as a PDF (Step 5)
- `references/export-pptx.md` — exporting a deck to PowerPoint with editable text (Step 5)
- `references/deploy.md` — publishing the deck to a live URL (Step 5)
