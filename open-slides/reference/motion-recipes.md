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

- One high-impact moment per slide beats many small ones.
- Never negate CSS functions directly (`-clamp()` is ignored) — use `calc(-1 * clamp(...))`.
- Always include reduced-motion handling:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; }
}
```
