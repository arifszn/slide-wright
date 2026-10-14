// Tests for slide-wright/scripts/export-pptx.mjs
//   node --test tests/
// Needs Chrome (or Chromium) and, for the render tests, LibreOffice (soffice) + pdftoppm.
// reveal.js is served from a local copy, so no network is needed after the first dependency install.
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportDeck } from '../slide-wright/scripts/export-pptx.mjs';
import { ensureDeps } from '../slide-wright/scripts/lib/deps.mjs';
import { offlineRoute, TEST_DEPS } from './lib/offline.mjs';
import { decode, ink } from './lib/pixels.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const JSZip = ensureDeps(TEST_DEPS)('jszip');
const SOFFICE = ['/Applications/LibreOffice.app/Contents/MacOS/soffice', '/usr/bin/soffice', '/usr/local/bin/soffice'].find(existsSync) || 'soffice';
const hasBin = (cmd, args) => spawnSync(cmd, args, { stdio: 'ignore' }).status === 0;
const canRender = hasBin(SOFFICE, ['--version']) && hasBin('pdftoppm', ['-v']);

const tmp = mkdtempSync(join(tmpdir(), 'sw-pptx-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

// ---- helpers -------------------------------------------------------------------------
async function openPptx(file) {
  const zip = await JSZip.loadAsync(readFileSync(file));
  const text = (p) => zip.file(p).async('string');
  const slideNames = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const slides = [];
  for (const name of slideNames) {
    const n = name.match(/slide(\d+)\.xml/)[1];
    const xml = await text(name);
    const rels = await text(`ppt/slides/_rels/slide${n}.xml.rels`);
    const notesTarget = rels.match(/Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/);
    const notesXml = notesTarget ? await text(`ppt/notesSlides/${notesTarget[1]}`) : null;
    const bg = xml.match(/<p:bg>[\s\S]*?<a:blip r:embed="(rId\d+)"/);
    let bgPng = null;
    if (bg) {
      const target = rels.match(new RegExp(`Id="${bg[1]}"[^>]*Target="\\.\\./media/([^"]+)"|Target="\\.\\./media/([^"]+)"[^>]*Id="${bg[1]}"`));
      bgPng = target && (await zip.file(`ppt/media/${target[1] || target[2]}`).async('nodebuffer'));
    }
    const runs = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    // pptxgenjs writes a notes page for every slide (with only a slide-number field when empty), so "has notes" means non-empty text
    const noteText = notesXml ? [...notesXml.replace(/<a:fld[\s\S]*?<\/a:fld>/g, '').matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join('\n') : '';
    const notes = noteText.trim() ? noteText : null;
    slides.push({ xml, runs, text: runs.join(' '), notes, bgPng });
  }
  return { zip, slides };
}

// ---- basic deck ----------------------------------------------------------------------
describe('basic deck', () => {
  let m, pptx, dbg;
  before(async () => {
    dbg = join(tmp, 'dbg');
    m = await exportDeck({ input: join(here, 'fixtures/basic.html'), output: join(tmp, 'basic.pptx'), debugDir: dbg, route: offlineRoute() });
    pptx = await openPptx(m.output);
  });

  test('one pptx slide per deck slide, 16:9', async () => {
    assert.equal(pptx.slides.length, 8);
    const pres = await pptx.zip.file('ppt/presentation.xml').async('string');
    const sz = pres.match(/<p:sldSz cx="(\d+)" cy="(\d+)"/);
    assert.ok(Math.abs(sz[1] / sz[2] - 16 / 9) < 0.002);
  });

  test('every slide has exactly one full-bleed background picture at deck resolution', () => {
    for (const [i, s] of pptx.slides.entries()) {
      assert.ok(s.bgPng, `slide ${i + 1} has no background picture`);
      const png = decode(s.bgPng);
      assert.deepEqual([png.width, png.height], [1920, 1080], `slide ${i + 1} picture size`);
      assert.equal((s.xml.match(/<p:pic>/g) || []).length, 0, `slide ${i + 1} should not use floating pictures`);
    }
  });

  test('text is present as native runs', () => {
    const must = [
      [0, ['Q3 BOARD UPDATE', 'Revenue grew 42% while burn fell', 'Corvid Labs · October 2026']],
      [1, ['Self-serve pays for itself in', 'nine', '01 · TRIAL', 'First alert', 'real data', 'Source: internal billing export', '02 / 08']],
      [2, ['What changes next quarter']],
      [3, ['SEGMENT', 'Enterprise', '$9.8M', '78%']],
      [4, ['Growth is compounding', 'Bookings up 42%', 'Burn multiple down to 1.1']],
      [6, ['One query answers it', 'SELECT account, count() AS alerts', 'GROUP BY account']],
    ];
    for (const [i, strs] of must) for (const s of strs) assert.ok(pptx.slides[i].text.includes(s), `slide ${i + 1} missing "${s}"; has: ${pptx.slides[i].text}`);
  });

  test('all fragments are exported (final state)', () => {
    for (const s of ['Approve the hiring plan', 'Endorse the pricing change', 'Intro two enterprise buyers']) assert.ok(pptx.slides[7].text.includes(s), s);
  });

  test('code slide: only the final line-step is exported, no stacked duplicates', () => {
    const n = (pptx.slides[6].text.match(/SELECT account/g) || []).length;
    assert.equal(n, 1);
  });

  test('text that cannot be placed faithfully stays in the image, never duplicated or lost', () => {
    const s5 = pptx.slides[4].text, s6 = pptx.slides[5].text;
    assert.ok(!/Q1|Q2|Q3/.test(s5), 'SVG text must not become a text box');
    for (const s of ['Gradient headline', 'Rotated text', 'This sentence is far too long', 'Shadowed line']) assert.ok(!s6.includes(s), `"${s}" should stay in the raster`);
    assert.ok(s6.includes('pill'));
    // ...and it really is in the raster: the slide-6 background must still contain ink where those lines are
    const bg = decode(pptx.slides[5].bgPng);
    assert.ok(ink(bg, { x: 100, y: 60, w: 900, h: 120 }).count > 5000, 'gradient headline missing from raster');
    assert.ok(ink(bg, { x: 100, y: 280, w: 700, h: 110 }).count > 1000, 'rotated text missing from raster');
  });

  test('transformations: uppercase applied, letter-spacing, sizes in points, no # in colours', () => {
    assert.ok(pptx.slides[0].runs.includes('Q3 BOARD UPDATE'));
    assert.match(pptx.slides[0].xml, /spc="200"/); // 4px at 1920px = 2pt
    assert.match(pptx.slides[1].xml, /sz="3400"/); // 68px title -> 34pt
    for (const s of pptx.slides) assert.doesNotMatch(s.xml, /srgbClr val="#/);
  });

  test('colour on dark section variant is the light text colour', () => {
    assert.match(pptx.slides[2].xml, /srgbClr val="F4EFE6"/);
  });

  test('speaker notes exist exactly where the deck has them', () => {
    const has = pptx.slides.map((s) => s.notes !== null);
    assert.deepEqual(has, [true, false, true, false, false, false, true, true]);
    assert.match(pptx.slides[0].notes, /Open with the headline number\.\s*Pause for questions\./);
    assert.equal(pptx.slides[2].notes.trim(), 'Transition to the plan.');
  });

  test('presentation title comes from the deck <title>', async () => {
    const core = await pptx.zip.file('docProps/core.xml').async('string');
    assert.match(core, /<dc:title>Fixture Deck<\/dc:title>/);
  });

  test('no ghost text: the raster is text-free inside every extracted box', () => {
    for (const [i, s] of m.slides.entries()) {
      const bg = decode(join(dbg, `slide-${i + 1}.png`));
      for (const b of s.blocks) {
        const r = ink(bg, { x: b.x + 10, y: b.y + 10, w: b.w - 20, h: b.h - 20 }); // inset: boxes can overhang their container by the width slack
        assert.ok(r.count / r.total < 0.002, `slide ${i + 1} "${b.runs[0].text}" still has ${r.count} ink pixels in the raster`);
      }
    }
  });

  test('control: the same check does catch text when it is NOT hidden', () => {
    const ref = decode(join(dbg, 'slide-1.ref.png'));
    const b = m.slides[0].blocks[1]; // the h1
    const r = ink(ref, { x: b.x, y: b.y, w: b.w, h: b.h });
    assert.ok(r.count / r.total > 0.02);
  });

  test('the raster embedded in the pptx equals the debug raster', () => {
    assert.ok(decode(pptx.slides[1].bgPng).data.equals(decode(join(dbg, 'slide-2.png')).data));
  });

  test('reports the fonts it used', () => {
    assert.ok(m.fonts.includes('Georgia') && m.fonts.includes('Arial'));
  });

  test('renders in LibreOffice and text lands where the HTML put it', { skip: !canRender && 'soffice/pdftoppm not available' }, () => {
    const out = join(tmp, 'lo');
    execFileSync(SOFFICE, ['--headless', '--convert-to', 'pdf', '--outdir', out, m.output], { stdio: 'ignore', timeout: 120000 });
    execFileSync('pdftoppm', ['-r', '144', '-png', join(out, 'basic.pdf'), join(out, 'p')]);
    const pages = readdirSync(out).filter((f) => f.endsWith('.png')).sort();
    assert.equal(pages.length, 8);
    const worst = [];
    for (const [i, s] of m.slides.entries()) {
      const lo = decode(join(out, pages[i]));
      assert.deepEqual([lo.width, lo.height], [1920, 1080]);
      const ref = decode(join(dbg, `slide-${i + 1}.ref.png`));
      for (const b of s.blocks) {
        const rect = { x: b.x, y: b.y - 12, w: b.w - 12, h: b.h + 24 }; // right edge trimmed: boxes carry width slack
        const a = ink(ref, rect), c = ink(lo, rect);
        const label = `slide ${i + 1} "${b.runs.find((r) => r.text).text.slice(0, 30)}"`;
        const dx = Math.abs(a.cx - c.cx), dy = Math.abs(a.cy - c.cy), ratio = c.count / a.count;
        worst.push({ label, dx, dy, ratio });
        assert.ok(dx <= 14, `${label}: horizontal drift ${dx.toFixed(1)}px`);
        assert.ok(dy <= 14, `${label}: vertical drift ${dy.toFixed(1)}px`);
        assert.ok(ratio > 0.6 && ratio < 1.6, `${label}: ink ratio ${ratio.toFixed(2)} (missing or duplicated text?)`);
      }
    }
    console.log('    worst drift px:', Math.max(...worst.map((w) => Math.max(w.dx, w.dy))).toFixed(1));
  });
});

// ---- edge cases ----------------------------------------------------------------------
describe('edge cases', () => {
  let m, pptx;
  before(async () => {
    m = await exportDeck({ input: join(here, 'fixtures/edge.html'), output: join(tmp, 'edge.pptx'), route: offlineRoute() });
    pptx = await openPptx(m.output);
  });

  test('data-visibility="hidden" slides are skipped, like in the PDF export', () => {
    assert.equal(pptx.slides.length, 2);
    assert.ok(!pptx.slides.some((s) => s.text.includes('HIDDEN SLIDE')));
  });

  test('data-notes attribute becomes speaker notes', () => {
    assert.equal(pptx.slides[0].notes.trim(), 'Notes from the attribute.');
    assert.equal(pptx.slides[1].notes, null);
  });

  test('<br> splits paragraphs; capitalize, whitespace and entities are handled', () => {
    const t = pptx.slides[0].runs;
    assert.ok(t.includes('Line one') && t.includes('Line two after a break'));
    assert.ok(t.includes('Capitalize Every Word Here'));
    assert.ok(t.some((r) => r.includes('an ampersand')) || pptx.slides[0].text.includes('& an ampersand'));
    assert.ok(t.some((r) => r.startsWith('  preserved   spacing') || r.includes('preserved   spacing')));
  });

  test('alignment, opacity, bold/italic/underline map to run properties', () => {
    const x = pptx.slides[0].xml;
    assert.match(x, /algn="r"/);
    assert.match(x, /alpha val="40000"/); // opacity .4
    assert.match(x, /b="1"/);
    assert.match(x, /i="1"/);
    assert.match(x, /u="sng"/);
  });
});

// ---- failure modes -------------------------------------------------------------------
describe('failure modes', () => {
  test('a non-deck HTML file fails with a clear message', async () => {
    const f = join(tmp, 'plain.html');
    (await import('node:fs')).writeFileSync(f, '<html><body><h1>hi</h1></body></html>');
    await assert.rejects(exportDeck({ input: f, output: join(tmp, 'plain.pptx'), timeout: 1500 }), /does not look like a slide-wright deck/);
  });
});
