# Exhibits

The exhibit is the visual that proves or explains a content slide's action title. Pick the type from what the claim is about, build it in HTML/CSS/SVG with the theme's variables, and draw it in the theme's exhibit style. Each content slide has one exhibit, placed in `.body` between the title and the footer.

## Pick by claim

| The claim is about... | Exhibit |
| --- | --- |
| A sequence, a money or data flow, a customer journey | **Flow**: 3-5 step cards joined by labeled arrows |
| What the product does or looks like | **Mockup**: a card, a dashboard panel, a notification, a phone frame, drawn from shapes |
| A trend, growth, or a share | **Chart**: bars, a line, or a stacked bar in SVG |
| A choice between options | **Comparison**: a table or side-by-side columns, with the recommended option in the accent |
| A few headline numbers | **Metric panel**: 2-4 figures, each with a label and a one-line context |
| Phases or a roadmap | **Timeline**: a horizontal rail with dated milestones |
| How systems connect | **Architecture**: boxes and connectors, grouped by layer |
| Prioritization or positioning | **2x2**: two labeled axes, items placed as dots or chips |

A slide with a split layout (text on the left, exhibit on the right, roughly 5/7 columns) works for mockups and metric panels. Flows, charts, tables, and timelines usually take the full width.

## Flow

```html
<div class="flow">
  <div class="step">
    <span class="lab">01 · Step name</span>
    <h3>Short verb phrase</h3>
    <p>One line on what happens here.</p>
  </div>
  <div class="arrow"><span class="lab">Handoff</span></div>
  <div class="step is-key">
    <span class="lab">02 · Step name</span>
    <h3>The step that matters</h3>
    <p>One line on why it matters.</p>
  </div>
</div>
```

```css
.flow  { display: flex; align-items: stretch; gap: 0; }
.step  { flex: 1; padding: 40px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-alt); }
.step.is-key { background: var(--accent); border-color: var(--accent); }
.step.is-key h3, .step.is-key p, .step.is-key .lab { color: var(--on-accent); }  /* base h3 color would win otherwise */
.arrow { flex: 0 0 120px; position: relative; display: grid; place-items: center; }
.arrow::before { content: ''; position: absolute; left: 12px; right: 12px; top: 50%; border-top: 2px solid var(--text-muted); }
.arrow::after  { content: ''; position: absolute; right: 12px; top: calc(50% - 6px); border: 6px solid transparent; border-left-color: var(--text-muted); border-right: 0; }
.arrow .lab    { transform: translateY(28px); }
```

## Chart

Draw with inline SVG and a `viewBox`, so it scales with the slide. Label values directly on or beside the bars and the axis categories under them, and leave out gridlines and legends where direct labels work. Color every series in a neutral and the one that proves the claim in the accent.

```html
<svg class="chart" viewBox="0 0 1200 520" role="img" aria-label="Revenue by year">
  <!-- one <g> per bar: rect, value label above, category label below -->
  <g><rect x="40"  y="300" width="160" height="180" fill="var(--text-muted)" opacity=".35"/>
     <text x="120" y="285" text-anchor="middle">$4.1M</text><text x="120" y="510" text-anchor="middle">2023</text></g>
  <g><rect x="280" y="120" width="160" height="360" fill="var(--accent)"/>
     <text x="360" y="105" text-anchor="middle">$8.6M</text><text x="360" y="510" text-anchor="middle">2024</text></g>
</svg>
```

Compute bar heights from the real numbers. Never invent data: if the user gave no figures, use a non-numeric exhibit or ask.

## Mockup

The subject's own product or artifact drawn as clean shapes, not a screenshot: an app screen or dashboard tile, a document or report page, a device frame, a card or badge, a notification with a status pill. Draw what this deck is about, using the theme's surface and accent, one soft shadow at most, and realistic content taken from the user's material. Tilt or overlap two pieces at most.

## Table

Real `<table>` markup. Header row in the label style, hairline row dividers, numbers right-aligned in tabular figures (`font-variant-numeric: tabular-nums`), and the recommended row or column tinted with the accent. Up to 6 rows and 5 columns per slide; split larger tables.

## Shared rules

- All exhibit colors, radii, and fonts come from `:root` variables.
- Text inside exhibits stays at 22px or larger, labels at 18px or larger.
- The exhibit fits inside `.body` with no clipping; shorten the content or split the slide when it does not.
