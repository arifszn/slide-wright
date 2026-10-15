# Building a new deck

Steps 1-4 of the new-deck flow. SKILL.md has the rule that defines the order (propose the look, get a yes, then build) and Step 5, the hand-off.

## Step 1 — Work out the deck from the request

Don't open with a questionnaire. Take whatever the user gave — a one-line topic, messy notes, a full outline — and infer the rest:

- **Purpose and audience** from the subject and how it's written. A raise, a lesson, a conference talk, and an internal update each call for a different treatment.
- **Length** from how much material there is. A bare topic becomes a short deck; a long outline becomes more slides. Don't fix a number up front.
- **How much evidence** the deck needs: numbers, comparisons, and diagrams available or implied by the material.
- **The topic's native visual language and exhibit family**: choose the exhibit from the object or mechanism the audience already understands, and build it fresh instead of copying the first flow snippet. `exhibits.md` lists the families.

Only ask something if the request is too thin to design from at all — a single word with no angle — and even then ask one question, not five. If the user has more to give, they usually paste it.

### Composed slides

Every content slide is self-contained: someone reading the PDF without the presenter gets the point. Add a takeaway or source line where it helps. One claim per slide; when a slide carries two claims or its exhibit won't fit, split it. Never let a slide scroll, overflow, overlap, or shrink text below the sizes in the theme. Treat narrow layout regions as real constraints: flow labels must wrap inside their arrow columns, and page counters must stay on one line without covering source or takeaway text.

## Step 2 — Propose a look

Read `theme-generation.md` and `design-aesthetics.md`. Apply the similarity guard in `theme-generation.md` before you show the preview, then:

1. Invent a theme: a palette, a type system from Fontshare or Google Fonts, the layout system, and the exhibit style. Give it a name for your own use.
2. Build a two-slide preview with `deck-template.md` — a real title slide for this deck (its actual title, never a placeholder or a label like "demo"), and one real content slide with its action title and a full exhibit from `exhibits.md`. Write it as the real deck file in the working directory, named for the deck: `./<deck-slug>.html` (e.g. `./clickhouse.html`). This is the one file the whole deck grows into — there is no separate demo or scratch file.
3. Open it in the browser.

The preview has to read as two real slides from the finished deck, not a sample card. Keep all process language off the slide and out of the filename: no "demo," "preview," theme name, or "option A." The theme's name goes in your message to the user, never on a slide.

## Step 3 — Get a yes

Stop and ask. This is the only question in the message. If your environment has a structured question or choice prompt, use it with these three options. If not, write them as a plain list. Hold every other question (file names, extra slides, scope) until they approve.

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

On a rejected preview, edit the theme CSS and the two slides in place in that file, and work from the references already read instead of re-reading them.

## Step 4 — Build the deck

Keep building in the **same** `./<deck-slug>.html` the user just approved. The two approved slides stay as they are — append the rest around them; never regenerate them from scratch (that reintroduces drift the user already signed off against). Read `exhibits.md` for exhibit patterns. Read `code-slides.md` for code slides and `motion-recipes.md` when the user asks for animation. Read `media.md` for images, video, or background media.

- Add the rest of the slides with Edit at the `<!-- more slides -->` marker, one batch of slides per edit; the file is never rewritten whole.
- Use the exact approved palette, type system, layout system, and exhibit style throughout.
- Structure the story answer-first: the title slide, then the main point or recommendation, then the supporting slides, then the ask or next steps.
- Vary the *exhibits* (flow, mockup, chart, comparison, timeline, metric panel) and layouts (full-width, split) while keeping the one visual system. Section breaks and the closing slide may drop the exhibit.
- Every content slide has an action title and one exhibit (`design-aesthetics.md`), and appears complete when it lands; click-by-click builds (`class="fragment"`) only when the user asks, and stepped code highlights are the one built-in exception. If a slide overflows, split it.
- Put speaker notes in `<aside class="notes">` wherever the content implies something to say out loud.
- Keep it one self-contained HTML file with no build step: theme CSS inline, engine from the CDN, a clear comment on each section.

A partial deck is already a working deck; adding slides later is editing it (see "Editing a deck that already exists" in SKILL.md).

Once the deck is built, run `node <skill-dir>/scripts/check-deck.mjs ./<deck-slug>.html --sheet "$TMPDIR/sheet.png"` (`<skill-dir>` is the installed `slide-wright/` folder; it needs Node 18+ and Chrome, like the PowerPoint export). It prints one line per defect: content off the frame, clipped or overlapping text, text under 18px, fonts that did not load. Fix each and rerun until it prints `OK`. Then view the contact sheet once, as a single image, for what code cannot see: every slide complete on arrival, the canvas filled, the 16:9 frame intact, columns not running together. If the script cannot run, say the visual check was skipped.
