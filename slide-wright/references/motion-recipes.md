# Motion recipes

## Default: static slides

A boardroom deck moves like a well-run PowerPoint: the slide changes with a short fade (set in the template's `Reveal.initialize`) and arrives complete. Build every slide this way.

This file is for when the user asks for builds or animation (fragments, auto-animate, entrance animations, emphasis effects). The final state of each slide is still a complete, composed slide. Code slides are in `code-slides.md`.

## Auto-animate (morph between two slides)

On request only. Put `data-auto-animate` on two consecutive `<section>`s and the engine tweens matching elements — position, size, color, font-size — from one to the next. Unmatched elements fade. No plugin; it's core.

```html
<section data-auto-animate><h1 data-id="stat" style="font-size: 3rem;">1</h1></section>
<section data-auto-animate><h1 data-id="stat" style="font-size: 12rem;">1,000,000</h1></section>
```

- Matching is automatic by content/order; pin it with a shared `data-id` when elements differ (text changing, as above) or when several could match.
- Tune per slide: `data-auto-animate-easing`, `data-auto-animate-duration`, `data-auto-animate-delay`.
- Best for: a title settling into a header, a number growing, code gaining lines, a layout reflowing. Use it on a few key beats — not every slide, or the effect goes cheap.

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

## Emphasis recipes

- **Counter / stat reveal:** scale + fade a large numeral with `grow` fragment or a CSS keyframe; pair with the accent color.
- **Underline/marker draw:** animate a pseudo-element `width` or `transform: scaleX()` on the accent under a heading.
- **Background drift:** slow, subtle `background-position` or gradient-angle animation on the signature device. Keep it low-amplitude — atmosphere, not distraction.

## Rules

- When the user asks for animation, one moment per slide beats many small ones.
- Always include reduced-motion handling:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; }
}
```
