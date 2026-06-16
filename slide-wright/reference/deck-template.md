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
      --accent:        /* #... */;
      --accent-2:      /* #... optional second accent */;

      /* Typography */
      --font-display:  /* 'Display Font', sans-serif */;
      --font-body:     /* 'Body Font', sans-serif */;

      /* Motion */
      --ease:          cubic-bezier(0.16, 1, 0.3, 1);
      --dur:           0.6s;
    }

    /* ===========================================
       BASE — map the engine surfaces to our theme
       =========================================== */
    .reveal { font-family: var(--font-body); color: var(--text); }
    .reveal h1, .reveal h2, .reveal h3 { font-family: var(--font-display); color: var(--text); text-transform: none; }
    .reveal-viewport, html, body { background: var(--bg); }

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
      padding: 230px 140px 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
      text-align: left;     /* undo the engine's global center; see Rules */
    }

    /* ===========================================
       SIGNATURE DEVICE — the one visual idea of this theme
       (gradient field / grid / hard color plane / texture). Define here.
       =========================================== */
    /* ... */

    /* ===========================================
       SLIDE LAYOUTS — title, section, two-column, quote, comparison, closing
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

    /* ===========================================
       MOTION — entrance + emphasis
       =========================================== */
    /* ... */
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">

      <!-- Every slide: <section> for background, inner .frame for layout.
           Put layout variant classes (title-slide, two-col, etc.) on .frame. -->

      <!-- TITLE SLIDE -->
      <section data-transition="fade">
        <div class="frame title-slide">
          <h1><!-- Real deck title --></h1>
          <p class="subtitle"><!-- subtitle / author / date --></p>
        </div>
        <aside class="notes"><!-- speaker notes for this slide --></aside>
      </section>

      <!-- CONTENT SLIDE -->
      <section>
        <div class="frame">
          <h2>Slide title</h2>
          <ul>
            <li class="fragment">Point one</li>
            <li class="fragment">Point two</li>
          </ul>
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
      controls: true,
      progress: true,
      hash: true,
      transition: 'slide',  // per-slide override via data-transition
      pdfSeparateFragments: false, // collapse fragments to one page per slide on ?print-pdf
      plugins: [ RevealNotes ],    // add RevealHighlight here when the deck has code
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
- **Fragments for staged reveals.** Use `class="fragment"` on items that should appear on click. Use `data-transition` per `<section>` for slide-change effects. See `motion-recipes.md`. Don't hand-roll a `.visible` system — the engine drives it.
- **Keep `pdfSeparateFragments: false` in `Reveal.initialize`.** Without it, every fragment step becomes its own page in `?print-pdf` export — a 3-slide deck with fragments balloons to many pages. This collapses each slide to one page.
- **Code slides** (only when the deck shows code): uncomment the highlight theme `<link>`, the `highlight.js` `<script>`, and add `RevealHighlight` to `plugins`. Mark up as `<pre><code data-trim data-noescape data-line-numbers="3-5|8-10" class="language-x">` — pipe-separated ranges step the highlight on each click (omit `data-line-numbers` for a plain block). Restyle so it belongs to the theme (never ship raw stock-widget code), but the **code-block CSS contract is mandatory**: `position: relative` + `flex-shrink: 0` on `<pre>`, and `display: block` + opaque `background` + `max-height: none` on `code.hljs`. Skipping any one causes the step clones to ghost, stair-step, or cover the heading. Keep snippets short enough to fit the frame (≈ ≤ 12 lines); trim the code rather than shrink the slide. Full recipe in `motion-recipes.md`.
- **Speaker notes** go in `<aside class="notes">` inside each slide. Press **S** for the presenter view. Keep them out of the visible slide.
- **Fonts** come from a Fontshare or Google `<link>`, not the system stack. Fill the Fontshare `f[]` param with the chosen display and body families.
- **Comments.** Every CSS section and every non-obvious slide gets a clear comment.
- **Preview vs final:** the same file is both. The preview is this skeleton with two `<section>`s; once approved, the rest of the slides are appended into that same `./<deck-slug>.html`. No separate demo file, no rebuild — the two approved slides stay byte-for-byte.
