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

For technical decks. Load the highlight plugin + a syntax theme (see `deck-template.md`), then step the highlighted lines like fragments:

```html
<pre><code data-trim data-line-numbers="1-2|4|6-9" class="language-python">
def query(client, sql):
    return client.execute(sql)

rows = query(ch, "SELECT count() FROM events")
for r in rows:
    print(r)
</code></pre>
```

- Each pipe-separated range (`"1-2|4|6-9"`) is one click step — the focused lines stay lit, the rest dim. Walk a snippet a few lines at a time instead of dumping it all at once.
- `data-ln-start-from="42"` offsets the first line number; `data-trim` strips outer whitespace; for code containing `<`, `&`, or markup, wrap the body in `<script type="text/template">…</script>`.
- The line steps are fragments, so `pdfSeparateFragments: false` already collapses them to one page in PDF export.
- Restyle the `<pre>` to the deck's palette and a real monospace face — don't leave it looking like a stock code widget.

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
