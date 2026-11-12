# Building a new deck

Steps 1-4. SKILL.md has the rule behind the order (propose the look, get a yes, then build) and Step 5, the hand-off.

## Step 1 — Work out the deck, ask two things

Take whatever the user gave (a one-line topic, messy notes, a full outline) and infer the rest:

- **Purpose and audience** from the subject and how it is written. A raise, a lesson, a conference talk, and an internal update each call for a different treatment.
- **Length** from how much material there is. Don't fix a number up front.
- **Evidence**: the numbers, comparisons, and diagrams available or implied.
- **The subject's own visual language**: the object or mechanism the audience already knows. It drives the signature (`design.md`) and the exhibits (`exhibits.md`).

Then ask these two questions together, in one message, before designing anything. Use a structured choice prompt if your environment has one. Skip a question the request already answers ("give me three options", "no animation"). Add a third question only when you cannot go on without it: the angle, when the request is a single word; or a fact an exhibit cannot be drawn without (`exhibits.md`, "Numbers are drawn").

> **How many design directions do you want to compare?**
> - One (fastest)
> - Two
> - Three
> - (any other number the user gives)
>
> **Do you want animation?**
> - No, static slides
> - Yes: slides and exhibits animate in

## Step 2 — Propose the look

Read `design.md`, `deck-template.md`, and `exhibits.md`; if the user chose animation, also `motion-recipes.md`. Read each once and work from memory after that.

1. Invent as many themes as the user asked for: palette, type, layout, exhibit style, and signature. Name each for your message to the user.
2. Build a two-slide preview per theme: the real title slide for this deck (its actual title) and one real content slide with its action title and a full exhibit. Use the same two slides of content in every direction, so the user compares design, not wording. With animation chosen, the preview is animated.
3. Write each preview as one file in the working directory. One direction: `./<deck-slug>.html` (e.g. `./clickhouse.html`), the file the whole deck grows into. Several: `./<deck-slug>-a.html`, `-b`, `-c`.
4. Run `node <skill-dir>/scripts/check-deck.mjs <every preview file> --sheet "$TMPDIR/preview.png"`, fix each line it prints, then view the sheet once. It shows every direction in one image. An empty half of a slide, a title slide without its signature, or two directions that look alike are defects too: fix them before showing anything. If the script cannot run, go on without it.
5. Open every preview in the browser.

A preview reads as two real slides from the finished deck. Keep process language off the slides: no "demo", "preview", "option A", or theme name.

## Step 3 — Get a yes

Stop and ask. This is the only question in the message; hold every other question until they approve. Give each theme's name and its one-line reason.

One direction:

> "Here's the design direction, *[theme name]*. Does this look right?"
>
> - **Looks great, build it** → Step 4.
> - **Try a different direction**
> - **Adjust this one** (accent, font, lighter, bolder, more or less motion) → edit in place and show it again.

Several directions:

> "Here are the directions. Which one should I build?"
>
> - ***[theme name A]***, ***[theme name B]***, ... → Step 4 with that one.
> - **Adjust or mix** (one direction with a change, or one's colors on another's layout) → edit and show it again.
> - **None of these, try different directions**

When they ask for different directions, ask one steering question with choices invented from the subject, the audience, and what was rejected. Put **Surprise me** first and allow a custom answer. Then build new themes, as many as before unless they say otherwise, that differ from the rejected ones in palette, type, layout, and signature, not recolors. Overwrite the same preview files, editing the theme CSS and the two slides in place. Repeat until they approve.

Once a direction is chosen from several, rename its file to `./<deck-slug>.html` and delete the other preview files.

Do not build the full deck before you have a yes.

## Step 4 — Build the deck

Keep building in the approved `./<deck-slug>.html`. The two approved slides stay as they are; never regenerate them. Read `code-slides.md` before a code slide and `media.md` before images or video.

- Add slides with Edit at the `<!-- more slides -->` marker, one batch per edit. The file is never rewritten whole or read back after an edit.
- Add each layout and exhibit class to the theme CSS once and reuse it; no per-slide inline styles.
- Use the approved palette, type, layout, exhibit style, and signature throughout.
- Structure the story answer-first: the title slide, the main point or recommendation, the supporting slides, then the ask or next steps.
- Vary the exhibits (flow, mockup, chart, comparison, timeline, metric panel) and layouts (full-width, split) inside the one visual system. Section breaks and the closing slide may drop the exhibit.
- Motion follows the Step 1 answer. Static: every slide appears complete. Animated: as in the approved preview. Click-by-click builds (`class="fragment"`) only when the user asks for them; stepped code highlights are the one built-in exception.
- Put speaker notes in `<aside class="notes">` wherever the content implies something to say out loud.
- Never let a slide scroll, overflow, overlap, or drop below the type floors. Narrow regions are real constraints: flow labels wrap inside their arrow columns, and page counters stay on one line.
- Keep it one self-contained HTML file with no build step: theme CSS inline, engine from the CDN.

Once the deck is built, run `node <skill-dir>/scripts/check-deck.mjs ./<deck-slug>.html --sheet "$TMPDIR/sheet.png"` (`<skill-dir>` is the installed `slide-wright/` folder; it needs Node 18+ and Chrome). It prints one line per defect: content off the frame, clipped or overlapping text, text under 18px, fonts that did not load. Fix each and rerun until it prints `OK`. Then view the contact sheet once for what code cannot see: the canvas filled, the 16:9 frame intact, columns not running together, exhibits varied. If the script cannot run, say the visual check was skipped.

A partial deck is already a working deck; adding slides later is editing it (see "Editing a deck that already exists" in SKILL.md).
