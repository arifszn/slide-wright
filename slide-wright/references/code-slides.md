# Code slides

For technical decks. Code slides need three additions to the deck-template skeleton.

1. A syntax theme `<link>` in `<head>`, close to the deck palette (atom-one-dark/-light, monokai, github):

   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css" />
   ```

2. The plugin script after `reveal.js`, with `RevealHighlight` added to `plugins` in `Reveal.initialize`:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script>
   ```

3. Restyle the `<pre>` container so it belongs to this deck, not a stock widget, while keeping the CSS contract below.

## Markup

```html
<section>
  <div class="frame">
    <h2>Slide title</h2>
    <pre><code data-trim data-noescape data-line-numbers="3-5|8-10" class="language-python">
def query(client, sql):
    return client.execute(sql)

rows = query(ch, "SELECT count() FROM events")
for r in rows:
    print(r)
    </code></pre>
  </div>
  <aside class="notes"></aside>
</section>
```

- `data-trim` strips outer whitespace. `data-noescape` keeps raw `<`, `&` in the source (or wrap the body in `<script type="text/template">…</script>`). `class="language-x"` sets the grammar.
- `data-line-numbers` shows line numbers; omit it for a plain block. Pipe-separated ranges (`"3-5|8-10|13-15"`) make each range a **fragment step** that lights as you advance, so walk the snippet a few lines at a time. `data-ln-start-from="42"` offsets the first number. Steps collapse to one PDF page via `pdfSeparateFragments: false`.

## The code-block CSS contract

When you restyle `<pre>`/`code.hljs` to fit the theme, the step animation clones and stacks the code block, so these rules are mandatory. Skipping any one causes the ghosting, stair-stepping, and heading-cover bugs:

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
  padding: 2rem 2.4rem; font-family: var(--font-mono);
}
```

- Do **not** set `white-space` (`pre-wrap`), `word-break`, or `width` on `pre code` or its `td`s — line numbers render as a `<table>` and these collapse the number column onto the code.
- Keep the snippet short enough to fit the frame — roughly ≤ 12 lines at a comfortable size. If it doesn't fit, trim the code, don't shrink the slide.
