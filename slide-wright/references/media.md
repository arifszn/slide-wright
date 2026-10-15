# Media — images, video, backgrounds

Exhibits are CSS/SVG by default (see `exhibits.md`); use media only when the content needs the real thing. Reference a remote URL (small file, needs network) or inline base64 (offline, bloats file).

- **Inline image:** `<img src="…">`. Fit with `class="r-stretch"` (one per slide, direct child of `<section>`) or cap with `max-width:100%; max-height:70vh; object-fit:contain`.
- **Video:** `<video data-autoplay muted data-src="…">` — `data-src` lazy-loads, engine auto-pauses off-slide.
- **Full-bleed background:** attributes on `<section>` — `data-background-image="…"`, `data-background-color="#111"`, `data-background-video="…" data-background-video-muted data-background-video-loop`. Two rules make it work:
  - The default `.reveal .slides section { background: var(--bg) }` is opaque and hides the photo. Add a class (e.g. `media-bg`) and clear it: `.reveal .slides section.media-bg { background: transparent }`.
  - Put any scrim/overlay on the **background element, not `.frame`** — background media fills the whole viewport, `.frame` only the centered slide, so a frame scrim leaves a bright band in the letterbox. The engine copies the section class onto its background el: `.reveal .backgrounds .slide-background.media-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(...) }`. (Same copied class recolors chrome over a dark photo: `.media-bg .lab { color:… }`.)
