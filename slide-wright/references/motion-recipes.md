# Motion recipes

Read this when the user chose animation in Step 1, or asks for it later. Otherwise slides are static: they change with the short fade set in `Reveal.initialize` and arrive complete.

## What an animated deck does

- **Slides arrive in order.** The title lands first, then the exhibit, in under a second in total.
- **Exhibits animate their meaning.** Bars grow from the baseline, a line draws left to right, flow steps light in sequence, a number counts to its value. Motion that explains the claim, never motion for its own sake.
- **The signature may move slowly** on the title slide: low amplitude, atmosphere only.
- **A few key beats morph** between two slides with auto-animate.
- **No extra clicks.** Everything plays on arrival. Click-by-click builds (fragments) only when the user asks for them.

One moment per slide beats many small ones. Keep durations between 300ms and 900ms, with one easing curve for the whole deck.

## The contract: the resting state is the finished slide

Write the CSS so a slide with no animation running is complete. Trigger animation from `.present`, which the engine adds to the current slide, and write keyframes with a `from` only. PDF and PowerPoint exports, the slide overview, and reduced-motion viewers then all get the finished slide.

```css
:root { --dur: 600ms; --ease: cubic-bezier(.2, .7, .2, 1); }

@keyframes rise { from { opacity: 0; transform: translateY(24px); } }
.reveal .slides section.present .rise { animation: rise var(--dur) var(--ease) backwards; }
.present .rise:nth-child(2) { animation-delay: .1s; }
.present .rise:nth-child(3) { animation-delay: .2s; }

/* Bars grow from the baseline (SVG rect or div) */
@keyframes grow { from { transform: scaleY(0); } }
.present .bar { transform-box: fill-box; transform-origin: bottom; animation: grow var(--dur) var(--ease) backwards; }

/* A line draws itself: put pathLength="1" on the <path> */
@keyframes draw { from { stroke-dashoffset: 1; } }
.present .draw { stroke-dasharray: 1; animation: draw 900ms var(--ease) backwards; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Stagger with `animation-delay`, set per element with a custom property (`style="--i:2"` and `animation-delay: calc(var(--i) * 80ms)`) when `nth-child` does not fit.

## Auto-animate (morph between two slides)

Put `data-auto-animate` on two consecutive `<section>`s and the engine tweens matching elements (position, size, color, font size) from one to the next. Unmatched elements fade. It is in the engine core.

```html
<section data-auto-animate><h1 data-id="stat" style="font-size: 3rem;">1</h1></section>
<section data-auto-animate><h1 data-id="stat" style="font-size: 12rem;">1,000,000</h1></section>
```

- Matching is automatic by content and order; pin it with a shared `data-id` when the text changes or several elements could match.
- Tune per slide with `data-auto-animate-easing`, `data-auto-animate-duration`, `data-auto-animate-delay`.
- Use it for a title settling into a header, a number growing, a layout reflowing. A few beats per deck.

## Fragments (click-by-click, on request)

```html
<li class="fragment">Appears on click</li>
<p class="fragment fade-up">Slides up as it fades in</p>
<div class="fragment" data-fragment-index="2">Explicit order</div>
```

Built-in styles include `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-in-then-out`, `grow`, `shrink`, and `highlight-current-blue`. Every fragment is one more click for the presenter, so stage a few steps, not every element.
