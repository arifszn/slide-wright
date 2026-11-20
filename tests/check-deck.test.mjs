// Tests for slide-wright/scripts/check-deck.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkDeck } from '../slide-wright/scripts/check-deck.mjs';
import { offlineRoute } from './lib/offline.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'sw-check-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

// basic.html has one deliberately clipped sentence (slide 6); everything else is clean.
test('clean deck: only the deliberately clipped sentence is reported, contact sheet written', async () => {
  const sheet = join(tmp, 'sheet.png');
  const r = await checkDeck({ input: join(here, 'fixtures/basic.html'), sheet, route: offlineRoute() });
  assert.ok(r.slides > 0);
  assert.deepEqual(r.defects, ['slide 6: clipped content: p']);
  assert.ok(existsSync(sheet));
});

test('broken deck: reports off-frame and undersized text per slide', async () => {
  const html = readFileSync(join(here, 'fixtures/basic.html'), 'utf8').replace('<h2 class="action-title">', '<h2 class="action-title" style="position:relative;left:1200px;font-size:12px">');
  const input = join(tmp, 'broken.html');
  writeFileSync(input, html);
  const r = await checkDeck({ input, route: offlineRoute() });
  assert.ok(r.defects.some((d) => /^slide \d+: outside frame/.test(d)), r.defects.join('\n'));
  assert.ok(r.defects.some((d) => /below 18px/.test(d)), r.defects.join('\n'));
});

test('animated deck: entrance animations are finished and looping ones stopped before the checks run', async () => {
  const css = '<style>@keyframes sw-in { from { transform: translateX(3000px); } } .reveal .slides section.present .action-title { animation: sw-in 20s backwards; } .reveal .slides section.present .title-slide h1 { animation: sw-in 20s infinite alternate; }</style></head>';
  const input = join(tmp, 'animated.html');
  writeFileSync(input, readFileSync(join(here, 'fixtures/basic.html'), 'utf8').replace('</head>', css));
  const r = await checkDeck({ input, route: offlineRoute() });
  assert.deepEqual(r.defects, ['slide 6: clipped content: p']);
});

test('stepped code highlights are not reported as overlapping text', async () => {
  const r = await checkDeck({ input: join(here, 'fixtures/code.html'), route: offlineRoute() });
  assert.deepEqual(r.defects, []);
});

test('several decks: one sheet, defects carry the file name', async () => {
  const sheet = join(tmp, 'both.png');
  const r = await checkDeck({ input: [join(here, 'fixtures/code.html'), join(here, 'fixtures/basic.html')], sheet, route: offlineRoute() });
  assert.deepEqual(r.defects, ['basic.html: slide 6: clipped content: p']);
  assert.ok(existsSync(sheet));
});

// The title slide of basic.html, with its signature replaced by `sig` (markup) and `css`.
async function titleDefects(name, sig, css = '') {
  const svg = /\s*<svg class="sig"[\s\S]*?<\/svg>/;
  let html = readFileSync(join(here, 'fixtures/basic.html'), 'utf8');
  assert.match(html, svg);
  html = html.replace(svg, sig).replace('</head>', `<style>${css}</style></head>`);
  const input = join(tmp, `${name}.html`);
  writeFileSync(input, html);
  const r = await checkDeck({ input, route: offlineRoute() });
  return r.defects.filter((d) => d.startsWith('slide 1:'));
}

test('title slide: a headline on an empty surface is reported as a missing signature', async () => {
  const d = await titleDefects('bare', '');
  assert.equal(d.length, 1, d.join('\n'));
  assert.match(d[0], /^slide 1: no signature on the title slide: its largest visual covers 0% of the slide/);
});

test('title slide: a hairline rule, a small logo, or a full-slide plain fill is not a signature', async () => {
  for (const [name, sig, css] of [
    ['rule', '<div class="rule"></div>', '.rule { width: 1400px; height: 120px; border-top: 2px solid var(--accent); }'],
    ['logo', '<div class="logo"></div>', '.logo { width: 120px; height: 120px; background: var(--accent); border-radius: 50%; }'],
    ['surface', '<div class="wash"></div>', '.wash { position: absolute; inset: 0; background: var(--ink); z-index: -1; }'],
  ]) {
    const d = await titleDefects(name, sig, css);
    assert.equal(d.length, 1, `${name}: ${d.join('\n')}`);
  }
});

test('title slide: a large shape, a CSS-drawn pseudo-element, a drawn table, or a background image is a signature', async () => {
  const rows = Array.from({ length: 5 }, (_, i) => `<div class="row"><span>#40${i}</span></div>`).join('');
  for (const [name, sig, css] of [
    ['shape', '<div class="bar"></div>', '.bar { position: absolute; right: 0; top: 0; width: 300px; height: 1080px; background: var(--accent); }'],
    ['pseudo', '<div class="ring"></div>', '.ring::after { content: ""; position: absolute; right: 160px; top: 260px; width: 420px; height: 420px; border: 6px solid var(--accent); border-radius: 50%; }'],
    ['table', `<div class="ledger">${rows}</div>`, '.ledger { width: 1200px; } .row { height: 56px; border-bottom: 1px solid var(--line); font-size: 24px; }'],
  ]) {
    assert.deepEqual(await titleDefects(name, sig, css), [], name);
  }
  const html = readFileSync(join(here, 'fixtures/basic.html'), 'utf8')
    .replace(/\s*<svg class="sig"[\s\S]*?<\/svg>/, '')
    .replace('<section><div class="frame title-slide">', '<section data-background-gradient="linear-gradient(135deg, #12263A, #C2410C)"><div class="frame title-slide">');
  const input = join(tmp, 'background.html');
  writeFileSync(input, html);
  const r = await checkDeck({ input, route: offlineRoute() });
  assert.deepEqual(r.defects.filter((d) => d.startsWith('slide 1:')), []);
});
