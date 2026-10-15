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

  <!-- Code slides add a highlight theme <link> here: see code-slides.md -->

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

    /* 1920x1080 canvas (init uses center:false). <section> carries ONLY the background;
       layout lives in the inner .frame. Per-slide background variants must match this
       selector's specificity: `.reveal .slides section.ink`, not a bare `section.ink`.
       overflow:hidden is a print-pdf guard against phantom extra pages, not a license
       to overflow: fix the slide so nothing is cut. */
    .reveal .slides section { height: 1080px; overflow: hidden; background: var(--bg); }
    /* .reveal .slides section.ink { background: var(--text); }  <- example variant */

    /* .frame = the layout box for every slide; owns padding + flex. CRITICAL: padding
       goes here, NOT on <section>: ?print-pdf forces `section { padding:0 }`, which
       would push content into the edges. The same layout then holds on screen and in PDF. */
     .frame {
      position: absolute;
      inset: 0;
      padding: 72px 120px 64px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;  /* top-anchored: content fills down from the title */
      gap: 40px;
      box-sizing: border-box;
       text-align: left;     /* undo the engine's global center; centered layouts set it on their .frame variant */
     }

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

    /* CODE slides only: add the code-block CSS contract from code-slides.md */
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

      <!-- Code slides: markup in code-slides.md -->

      <!-- more slides -->

    </div>
  </div>

  <!-- Engine + plugins.
       PDF export (?print-pdf) is handled by the engine core — no extra print CSS needed. -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>
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
      plugins: [ RevealNotes ],    // code slides: see code-slides.md
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

- **No stock theme.** Load `reset.css` + `reveal.css` only; all identity is in the inline `<style>`.
- **Linear deck only — no vertical/nested slides.** Keep every slide as a direct child `<section>` of `.slides`. Don't nest `<section>`s (the engine's vertical stacks) and don't use the Markdown plugin — both fight the hand-built HTML/CSS and break the straight-line narration the deck is designed around.
- **Recurring elements live inside `.frame`.** If the theme uses a header or footer, put the header first, the footer last, and `.body` between them with `flex: 1`. If it shows page numbers, mark the element with `data-page` and let the script fill it.
- **Keep `pdfSeparateFragments: false` in `Reveal.initialize`.** Without it, every fragment step becomes its own page in `?print-pdf`.
- **Code slides:** setup, markup, and the mandatory code-block CSS contract are in `code-slides.md`.
- **Media** (images, video, backgrounds): `media.md`.
