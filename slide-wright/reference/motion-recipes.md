# Motion recipes

Motion recipes for decks. Two layers: the **engine's** built-in slide transitions + fragments, and **custom CSS** for entrances and emphasis. Prefer engine features for navigation motion; add CSS for signature flourishes.

## Slide transitions (engine)

Set globally in `Reveal.initialize({ transition: '...' })`, override per slide with `data-transition` on a `<section>`:

| Value | Feel |
| --- | --- |
| `none` | Instant. Good for dense reading decks. |
| `fade` | Calm, editorial, professional. |
| `slide` | Default, neutral, energetic. |
| `convex` / `concave` | 3D depth, playful. Use sparingly. |
| `zoom` | High-impact, dramatic. Title/section beats only. |

```html
<section data-transition="zoom">…</section>
<section data-transition-speed="fast">…</section>
```

## Auto-animate (morph between two slides)

The strongest "designed, not stepped-through" move. Put `data-auto-animate` on two consecutive `<section>`s and the engine tweens matching elements — position, size, color, font-size — from one to the next. Unmatched elements fade. No plugin; it's core.

```html
<section data-auto-animate>
  <h1 data-id="stat" style="font-size: 3rem;">1</h1>
</section>
<section data-auto-animate>
  <h1 data-id="stat" style="font-size: 12rem;">1,000,000</h1>   <!-- grows in place -->
  <p class="fragment">rows/sec</p>
</section>
```

- Matching is automatic by content/order; pin it with a shared `data-id` when elements differ (text changing, as above) or when several could match.
- Tune per slide: `data-auto-animate-easing`, `data-auto-animate-duration`, `data-auto-animate-delay`.
- Best for: a title settling into a header, a number growing, code gaining lines, a layout reflowing. Use it on a few key beats — not every slide, or the effect goes cheap.
- In PDF export each state prints as its own page (it's two real slides), which is correct.

## Fragments (staged reveal within a slide)

Items appear one click at a time. Core of speaker-led pacing.

```html
<li class="fragment">Appears on click</li>
<p class="fragment fade-up">Slides up as it fades in</p>
<div class="fragment" data-fragment-index="2">Explicit order</div>
```

Built-in fragment styles: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-in-then-out`, `grow`, `shrink`, `highlight-current-blue`, etc. Use staggered fragments for the "one orchestrated entrance" effect — don't make every element a fragment or pacing drags.

## Custom entrance (CSS, fires when a slide becomes current)

The engine adds `.present` to the active slide. Drive entrance animation off it:

```css
.reveal .slides section.present .reveal-up {
  animation: reveal-up var(--dur) var(--ease) both;
}
/* stagger */
.present .reveal-up:nth-child(1) { animation-delay: 0.05s; }
.present .reveal-up:nth-child(2) { animation-delay: 0.15s; }
.present .reveal-up:nth-child(3) { animation-delay: 0.25s; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Code slides (highlight plugin)

For technical decks. Load the highlight plugin + a syntax theme (see `deck-template.md`). Standard reveal markup:

```html
<pre><code data-trim data-noescape data-line-numbers="3-5|8-10" class="language-python">
def query(client, sql):
    return client.execute(sql)

rows = query(ch, "SELECT count() FROM events")
for r in rows:
    print(r)
</code></pre>
```

- `data-trim` strips outer whitespace. `data-noescape` keeps raw `<`, `&` in the source (or wrap the body in `<script type="text/template">…</script>`). `class="language-x"` sets the grammar.
- `data-line-numbers` shows line numbers. Pipe-separated ranges (`"3-5|8-10|13-15"`) make each range a **fragment step** that lights as you advance — walk the snippet a few lines at a time. `data-ln-start-from="42"` offsets the first number. Steps collapse to one PDF page via `pdfSeparateFragments: false`.

**The code-block CSS contract.** When you restyle `<pre>`/`code.hljs` to fit the theme, the step animation clones and stacks the code block, so these rules are mandatory — skipping any one is what caused the ghosting/stair-stepping/heading-cover bugs:

```css
.reveal pre {
  position: relative;   /* clones anchor to <pre>; without it they anchor to the
                           absolute .frame and balloon to full-slide height */
  flex-shrink: 0;       /* in a flex frame, don't compress <pre> below the code's
                           height — that misaligns the clones */
}
.reveal pre code.hljs {
  display: block;       /* inline + a background paints one box per wrapped line = stairs */
  background: var(--bg-alt) !important;  /* opaque, so the top clone hides the rest
                                            (transparent clones bleed through = ghosting) */
  max-height: none;     /* reveal caps code at 400px by default; the cap turns the block
                           into a scroll viewport and the steps scroll out of alignment */
}
```

- Do **not** set `white-space` (`pre-wrap`), `word-break`, or `width` on `pre code` or its `td`s — line numbers render as a `<table>` and these collapse the number column onto the code.
- Keep the snippet short enough to fit the frame — roughly ≤ 12 lines at a comfortable size. If it doesn't fit, trim the code, don't shrink the slide.

## Emphasis recipes

- **Counter / stat reveal:** scale + fade a large numeral with `grow` fragment or a CSS keyframe; pair with the accent color.
- **Underline/marker draw:** animate a pseudo-element `width` or `transform: scaleX()` on the accent under a heading.
- **Background drift:** slow, subtle `background-position` or gradient-angle animation on the signature device. Keep it low-amplitude — atmosphere, not distraction.

## Big type that fills the slide (r-fit-text)

For hero numbers and one-word statement slides, `r-fit-text` auto-scales text to the slide width — no hand-tuned `font-size`, and it stays huge on any viewport. Core class, no plugin.

```html
<h1 class="r-fit-text">10×</h1>
<h2 class="r-fit-text">FASTER</h2>
```

One word or a short number per line. Don't wrap a sentence in it — it'll size to the longest line and look accidental.

## Rules

- One high-impact moment per slide beats many small ones.
- Never negate CSS functions directly (`-clamp()` is ignored) — use `calc(-1 * clamp(...))`.
- Always include reduced-motion handling:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; }
}
```
