# Deck template

The skeleton for every deck; the preview and the final deck are the same file. Engine version is pinned: `reveal.js@5.1.0`. The comments below explain the skeleton to you; leave them out of the deck you write, apart from one short comment per CSS section.

## Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><!-- DECK TITLE --></title>

  <!-- Engine core + reset; no stock theme -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />

  <!-- Fonts: a real web-font pair from Fontshare or Google Fonts, never the system stack -->
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=<!-- DISPLAY+BODY -->&display=swap" />

  <!-- Code slides add a highlight theme <link> here: see code-slides.md -->

  <style>
    /* THEME: generated per deck */
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

      /* Typography (scale and floors: design.md) */
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

    /* BASE: map the engine surfaces to the theme */
    .reveal { font-family: var(--font-body); color: var(--text); }
    .reveal h1, .reveal h2, .reveal h3 { font-family: var(--font-display); color: var(--text); text-transform: none; }
    .reveal-viewport, html, body { background: var(--bg); }
    /* the engine's white bar and black arrows vanish on some backgrounds */
    .reveal .progress { color: var(--accent); }
    .reveal .controls { color: var(--accent); }

    /* <section> carries only the background; layout lives in .frame. A background
       variant needs this specificity: `.reveal .slides section.ink`, not `section.ink`.
       overflow:hidden guards ?print-pdf against extra pages; it is not a license to overflow. */
    .reveal .slides section { height: 1080px; overflow: hidden; background: var(--bg); }

    /* .frame owns padding and flex. Padding must not go on <section>:
       ?print-pdf forces `section { padding:0 }`. */
    .frame {
      position: absolute;
      inset: 0;
      padding: 72px 120px 64px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;  /* top-anchored */
      gap: 40px;
      box-sizing: border-box;
      text-align: left;             /* undo the engine's global center */
    }

    /* RECURRING ELEMENTS (optional): header and footer inside .frame. Keep, restyle, or delete. */
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

    /* LAYOUTS: title, section, content (full-width exhibit), split, comparison, closing */
    .title-slide { justify-content: space-between; }  /* plus the theme's signature, drawn large */
    /* ... */

    /* EXHIBITS: see exhibits.md */
    /* ... */
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">

      <!-- Layout variant classes (title-slide, split, ...) go on .frame -->

      <!-- TITLE SLIDE -->
      <section>
        <div class="frame title-slide">
          <h1><!-- Real deck title --></h1>
          <p class="subtitle"><!-- subtitle / presenter / date --></p>
        </div>
        <aside class="notes"><!-- speaker notes for this slide --></aside>
      </section>

      <!-- CONTENT SLIDE: action title and one exhibit. Header and footer only if the theme uses them. -->
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
          <footer class="chrome-foot">  <!-- drop any child the slide does not use -->
            <p class="takeaway"><!-- takeaway --></p>
            <span class="source"><!-- Source: ... (data slides) --></span>
          </footer>
        </div>
        <aside class="notes"><!-- talking points --></aside>
      </section>

      <!-- more slides -->

    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>
  <script>
    Reveal.initialize({
      width: 1920,
      height: 1080,
      margin: 0,            // the theme controls padding
      center: false,        // slides are authored full-bleed; no vertical auto-centering
      controls: false,      // arrows on only if the user asks
      progress: true,
      hash: true,
      transition: 'fade',
      transitionSpeed: 'fast',
      pdfSeparateFragments: false, // one PDF page per slide
      plugins: [ RevealNotes ],
    });

    // Page numbers: any element with data-page gets "02 / 09" from slide order
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

- **No stock theme.** Load `reset.css` + `reveal.css` only; all identity is in the inline `:root` variables and the slide CSS you write.
- **Linear deck only.** Every slide is a direct child `<section>` of `.slides`. No nested `<section>`s (vertical stacks) and no Markdown plugin.
- **Recurring elements live inside `.frame`.** If the theme uses a header or footer, put the header first, the footer last, and `.body` between them with `flex: 1`. If it shows page numbers, mark the element with `data-page` and let the script fill it.
- **Code slides:** setup, markup, and the mandatory code-block CSS contract are in `code-slides.md`.
- **Media** (images, video, backgrounds): `media.md`. **Animation:** `motion-recipes.md`.
