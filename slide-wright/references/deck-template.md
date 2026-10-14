# Deck template

The HTML skeleton for every deck — preview and final are the same file. One self-contained file. The presentation engine loads from a CDN; **its name appears only in these tags, never in user-facing copy.** All visual identity comes from the inline `:root` variables and the custom slide CSS you generate — never from a stock engine theme.

Pin this engine version: **`reveal.js@5.1.0`**.

## Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><!-- DECK TITLE --></title>

  <!-- Engine core + reset (no stock theme — our theme is inline below) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />

  <!-- Fonts: load a real web-font pair through a Fontshare or Google link; don't fall back to the system stack -->
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=<!-- DISPLAY+BODY -->&display=swap" />

  <!-- ONLY for decks with code slides. Load a syntax theme close to the deck palette
       (atom-one-dark/-light, monokai, github), then restyle the <pre> container below
       so it reads as part of THIS deck, not a stock widget. Omit entirely if no code. -->
  <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css" /> -->

  <style>
    /* ===========================================
       THEME — generated per deck. Edit these to restyle everything.
       =========================================== */
    :root {
      /* Palette */
      --bg:            /* #... */;
      --bg-alt:        /* #... (gradient stop / section bg) */;
      --text:          /* #... primary text */;
      --text-muted:    /* #... secondary text */;
      --line:          /* #... rules, borders, dividers */;
      --accent:        /* #... */;
      --accent-2:      /* #... optional second data series */;
      --on-accent:     /* #... text on accent fills, meets AA */;

      /* Typography */
      --font-display:  /* 'Title Font', serif */;
      --font-body:     /* 'Body Font', sans-serif */;
      --font-mono:     /* 'Mono Font', monospace (optional, labels and numbers) */;
      --fs-title:      80px;
      --fs-sub:        40px;
      --fs-body:       28px;
      --fs-label:      20px;

      /* Exhibit style */
      --radius:        /* 0 | 8px | 16px */;
    }

    /* ===========================================
       BASE — map the engine surfaces to our theme
       =========================================== */
    .reveal { font-family: var(--font-body); color: var(--text); }
    .reveal h1, .reveal h2, .reveal h3 { font-family: var(--font-display); color: var(--text); text-transform: none; }
    .reveal-viewport, html, body { background: var(--bg); }
    /* Progress bar and (if enabled) arrows take the theme's colors: the engine
       defaults are a white bar and black arrows, which vanish on some backgrounds */
    .reveal .progress { color: var(--accent); }
    .reveal .controls { color: var(--accent); }

    /* Slides are authored on a 1920x1080 canvas (init uses center:false).
       The <section> carries ONLY the background. All layout lives in an inner
       .frame wrapper — see below.
       Per-slide background variants (e.g. a dark closing) MUST match the base
       selector's specificity or they lose to it. Use `.reveal .slides section.ink`,
       NOT a bare `section.ink`. Section backgrounds print correctly in PDF export. */
    .reveal .slides section { height: 1080px; overflow: hidden; background: var(--bg); }
    /* overflow:hidden is a print guard: in ?print-pdf the engine paginates any content
       taller than the 1080 canvas onto EXTRA pages, so one overflowing slide silently
       becomes two or three in the PDF. Clipping at the slide bound stops phantom pages —
       but it's a backstop, not a license to overflow: fix the slide so nothing is cut. */
    /* .reveal .slides section.ink { background: var(--text); }  <- example variant */

    /* .frame = the layout box for every slide. Fills the slide (inset:0) and owns
       padding + flex. CRITICAL: do the padding here, NOT on <section>. In PDF export
       (?print-pdf) the engine forces `section { padding:0 }`, which would let content
       slide into the top/left edge and overlap fixed labels. A child wrapper is immune
       to that reset, so the same layout holds on screen AND in the exported PDF.
       The top padding also leaves room for any fixed labels/rules near the edges. */
     .frame {
      position: absolute;
      inset: 0;
      padding: 72px 120px 64px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;  /* top-anchored: content fills down from the title */
      gap: 40px;
      box-sizing: border-box;
       text-align: left;     /* undo the engine's global center; see Rules */
     }
     /* These padding and gap values are one working example, not a required
        deck-wide coordinate system. Choose frame metrics for the subject and
        theme; copying them unchanged is a composition reuse. */

    /* ===========================================
       RECURRING ELEMENTS (optional, per theme): a header and/or footer inside
       .frame, so they survive PDF export. Keep, restyle, or delete them.
       =========================================== */
    .chrome-head { display: flex; align-items: center; gap: 24px; font-size: var(--fs-label); color: var(--text-muted); }
    .chrome-head .rule { flex: 1; border-top: 1px solid var(--line); }
    .chrome-foot { display: flex; justify-content: space-between; align-items: baseline; gap: 40px;
                   font-size: var(--fs-label); color: var(--text-muted); }
    .chrome-foot > * { min-width: 0; }
    .chrome-foot .takeaway { flex: 1 1 auto; min-width: 0; font-size: var(--fs-body); color: var(--text);
                             overflow-wrap: break-word; }
    .chrome-foot .source { flex: 0 1 30%; overflow-wrap: anywhere; }
    .chrome-foot [data-page] { flex: 0 0 auto; white-space: nowrap; }
    .body { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; }
    .action-title { font-size: var(--fs-title); line-height: 1.08; max-width: 1500px; margin: 0; }

    /* ===========================================
       SLIDE LAYOUTS — title, section, content (full-width exhibit),
       split (text + exhibit), comparison, closing
       =========================================== */
    .title-slide { justify-content: space-between; }  /* label top, title middle, meta bottom */
    /* ... */

    /* ===========================================
       EXHIBITS: flow, mockup, chart, table... (see exhibits.md)
       =========================================== */
    /* ... */

    /* ===========================================
       CODE — only for decks with code slides. Restyle freely, but keep this
       contract or the line-step clones ghost / stair-step / cover the heading.
       =========================================== */
    /* .reveal pre {
         position: relative;   restyle to taste, but keep these two:
         flex-shrink: 0;       (clones anchor here; don't let a flex frame shrink it)
       }
       .reveal pre code.hljs {
         display: block;                        (inline + bg = one box per line = stairs)
         background: var(--bg-alt) !important;  (opaque, else stacked clones bleed through)
         max-height: none;                      (drop reveal's 400px cap = no scroll misalign)
         padding: 2rem 2.4rem; font-family: var(--font-mono);
       } */
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">

      <!-- Every slide: <section> for background, inner .frame for layout.
           Put layout variant classes (title-slide, two-col, etc.) on .frame. -->

      <!-- TITLE SLIDE -->
      <section>
        <div class="frame title-slide">
          <h1><!-- Real deck title --></h1>
          <p class="subtitle"><!-- subtitle / presenter / date --></p>
        </div>
        <aside class="notes"><!-- speaker notes for this slide --></aside>
      </section>

      <!-- CONTENT SLIDE: action title and one exhibit, visible at once.
           The header and footer are optional; keep only what the theme uses. -->
      <section>
        <div class="frame">
          <header class="chrome-head">
            <span class="section-label">02 · Section name</span>
            <span class="rule"></span>
          </header>
          <h2 class="action-title">The slide's point, stated as a short claim.</h2>
          <div class="body">
            <!-- one exhibit from exhibits.md -->
          </div>
          <footer class="chrome-foot">
            <p class="takeaway"><!-- optional takeaway or source line --></p>
            <span class="source"><!-- Source: ... (data slides) --></span>
          </footer>
        </div>
        <aside class="notes"><!-- talking points --></aside>
      </section>

      <!-- CODE SLIDE (only when the deck shows code). data-line-numbers shows line
           numbers; pipe-separated ranges ("3-5|8-10") step the highlight on each
           click. Use data-noescape (or a <script type="text/template"> body) for raw
           < & in the code. The code-block CSS contract in motion-recipes.md is
           mandatory when you restyle the block. -->
      <!--
      <section>
        <div class="frame">
          <h2>Slide title</h2>
          <pre><code data-trim data-noescape data-line-numbers="1|3-5" class="language-sql">
SELECT count() FROM events WHERE ts > now() - INTERVAL 1 DAY
          </code></pre>
        </div>
        <aside class="notes"></aside>
      </section>
      -->

      <!-- more <section> slides... -->

    </div>
  </div>

  <!-- Engine + plugins.
       PDF export (?print-pdf) is handled by the engine core — no extra print CSS needed. -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>
  <!-- ONLY for decks with code slides (pairs with the highlight theme <link> above): -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script> -->
  <script>
    Reveal.initialize({
      width: 1920,
      height: 1080,
      margin: 0,            // theme controls padding; no engine letterbox margin
      center: false,        // we author full-bleed at 1920x1080; do NOT vertically auto-center
      controls: false,      // arrows off by default; turn on if the user asks
      progress: true,
      hash: true,
      transition: 'fade',
      transitionSpeed: 'fast',
      pdfSeparateFragments: false, // collapse fragments to one page per slide on ?print-pdf
      plugins: [ RevealNotes ],    // add RevealHighlight here when the deck has code
    });

    // Optional page numbers: any element with data-page gets "02 / 09", filled
    // from slide order so it stays correct when slides change.
    Reveal.on('ready', () => {
      const slides = Reveal.getSlides();
      const pad = n => String(n).padStart(2, '0');
      slides.forEach((s, i) => s.querySelectorAll('[data-page]')
        .forEach(el => { el.textContent = `${pad(i + 1)} / ${pad(slides.length)}`; }));
    });
  </script>
</body>
</html>
```

## Rules

- **No stock theme.** Load `reset.css` + `reveal.css` only. Do not load `theme/black.css` etc. — they read as generic. All identity is in the inline `<style>`.
- **Text aligns left by default.** The engine globally sets `.reveal .slides { text-align:center }`. The `.frame` box resets it to `left`. For a centered layout (title slide, full-bleed quote), put `text-align:center` back on that layout's `.frame` variant — don't rely on the engine default.
- **Linear deck only — no vertical/nested slides.** Keep every slide as a direct child `<section>` of `.slides`. Don't nest `<section>`s (the engine's vertical stacks) and don't use the Markdown plugin — both fight the hand-built HTML/CSS and break the straight-line narration the deck is designed around.
- **Canvas is 1920×1080.** Author slide content at that size; the engine scales the whole slide uniformly to the viewport (handles phones too). Do not write responsive breakpoints to reflow slide content.
- **Slides appear complete.** Every element is visible as the slide lands. Click-by-click builds (`class="fragment"`) happen only when the user asks for them; `motion-recipes.md` covers that case.
- **Recurring elements live inside `.frame`.** If the theme uses a header or footer, put the header first, the footer last, and `.body` between them with `flex: 1`. If it shows page numbers, mark the element with `data-page` and let the script fill it.
- **Keep `pdfSeparateFragments: false` in `Reveal.initialize`.** Without it, every fragment step becomes its own page in `?print-pdf` export — a 3-slide deck with fragments balloons to many pages. This collapses each slide to one page.
- **Code slides** (only when the deck shows code): uncomment the highlight theme `<link>`, the `highlight.js` `<script>`, and add `RevealHighlight` to `plugins`. Mark up as `<pre><code data-trim data-noescape data-line-numbers="3-5|8-10" class="language-x">` — pipe-separated ranges step the highlight on each click (omit `data-line-numbers` for a plain block). Restyle so it belongs to the theme (never ship raw stock-widget code), but the **code-block CSS contract is mandatory**: `position: relative` + `flex-shrink: 0` on `<pre>`, and `display: block` + opaque `background` + `max-height: none` on `code.hljs`. Skipping any one causes the step clones to ghost, stair-step, or cover the heading. Keep snippets short enough to fit the frame (≈ ≤ 12 lines); trim the code rather than shrink the slide. Full recipe in `motion-recipes.md`.
- **Speaker notes** go in `<aside class="notes">` inside each slide. Press **S** for the presenter view. Keep them out of the visible slide.
- **Fonts** come from a Fontshare or Google `<link>`, not the system stack. Fill the Fontshare `f[]` param with the chosen display and body families.
- **Comments.** Every CSS section and every non-obvious slide gets a clear comment.
- **Preview vs final:** the same file is both. The preview is this skeleton with two `<section>`s; once approved, the rest of the slides are appended into that same `./<deck-slug>.html`. No separate demo file, no rebuild — the two approved slides stay byte-for-byte.

## Media — images, video, backgrounds

Exhibits are CSS/SVG by default (see `exhibits.md`); use media only when the content needs the real thing. Reference a remote URL (small file, needs network) or inline base64 (offline, bloats file).

- **Inline image:** `<img src="…">`. Fit with `class="r-stretch"` (one per slide, direct child of `<section>`) or cap with `max-width:100%; max-height:70vh; object-fit:contain`.
- **Video:** `<video data-autoplay muted data-src="…">` — `data-src` lazy-loads, engine auto-pauses off-slide.
- **Full-bleed background:** attributes on `<section>` — `data-background-image="…"`, `data-background-color="#111"`, `data-background-video="…" data-background-video-muted data-background-video-loop`. Two rules make it work:
  - The default `.reveal .slides section { background: var(--bg) }` is opaque and hides the photo. Add a class (e.g. `media-bg`) and clear it: `.reveal .slides section.media-bg { background: transparent }`.
  - Put any scrim/overlay on the **background element, not `.frame`** — background media fills the whole viewport, `.frame` only the centered slide, so a frame scrim leaves a bright band in the letterbox. The engine copies the section class onto its background el: `.reveal .backgrounds .slide-background.media-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(...) }`. (Same copied class recolors chrome over a dark photo: `.media-bg .lab { color:… }`.)
