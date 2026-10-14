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
import { validatePptx } from './lib/validate-ooxml.mjs';

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
    const runs = [...xml.matchAll(/<a:t(?: [^>]*)?>([^<]*)<\/a:t>/g)].map((m) => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    // pptxgenjs writes a notes page for every slide (with only a slide-number field when empty), so "has notes" means non-empty text
    const noteText = notesXml ? [...notesXml.replace(/<a:fld[\s\S]*?<\/a:fld>/g, '').matchAll(/<a:t(?: [^>]*)?>([^<]*)<\/a:t>/g)].map((m) => m[1]).join('\n') : '';
    const notes = noteText.trim() ? noteText : null;
    slides.push({ xml, runs, text: runs.join(' '), notes, bgPng });
  }
  return { zip, slides };
}


// Converts the pptx with LibreOffice and checks that, for every extracted box, the rendered
// text sits where the HTML put it (ink centroid) and is neither missing nor duplicated (ink amount).
function renderCheck(m, dbg, name, maxDrift = 14) {
  const out = join(tmp, `lo-${name}`);
  execFileSync(SOFFICE, ['--headless', '--convert-to', 'pdf', '--outdir', out, m.output], { stdio: 'ignore', timeout: 120000 });
  execFileSync('pdftoppm', ['-r', '144', '-png', join(out, `${name}.pdf`), join(out, 'p')]);
  const pages = readdirSync(out).filter((f) => f.endsWith('.png')).sort();
  assert.equal(pages.length, m.slides.length);
  let worst = 0;
  for (const [i, s] of m.slides.entries()) {
    const lo = decode(join(out, pages[i]));
    assert.deepEqual([lo.width, lo.height], [1920, 1080]);
    const ref = decode(join(dbg, `slide-${i + 1}.ref.png`));
    for (const b of s.blocks) {
      const rect = { x: b.x, y: b.y - 12, w: b.w - 12, h: b.h + 24 }; // right edge trimmed: boxes carry width slack
      const a = ink(ref, rect), c = ink(lo, rect);
      const label = `slide ${i + 1} "${b.runs.find((r) => r.text).text.slice(0, 30)}"`;
      const dx = Math.abs(a.cx - c.cx), dy = Math.abs(a.cy - c.cy), ratio = c.count / a.count;
      worst = Math.max(worst, dx, dy);
      assert.ok(dx <= maxDrift, `${label}: horizontal drift ${dx.toFixed(1)}px`);
      assert.ok(dy <= maxDrift, `${label}: vertical drift ${dy.toFixed(1)}px`);
      assert.ok(ratio > 0.6 && ratio < 1.6, `${label}: ink ratio ${ratio.toFixed(2)} (missing or duplicated text?)`);
    }
  }
  console.log(`    ${name}: worst drift ${worst.toFixed(1)}px`);
}

// ---- basic deck ----------------------------------------------------------------------
describe('basic deck', () => {
  let m, pptx, dbg;
  before(async () => {
    dbg = join(tmp, 'dbg');
    m = await exportDeck({ input: join(here, 'fixtures/basic.html'), output: join(tmp, 'basic.pptx'), debugDir: dbg, route: offlineRoute() });
    pptx = await openPptx(m.output);
  });

  test('package is structurally valid (relationships, content types, colours, ids)', async () => {
    assert.deepEqual(await validatePptx(readFileSync(m.output)), []);
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

  test('plain code block: exported once', () => {
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
    renderCheck(m, dbg, 'basic');
  });
});


// ---- stepped code ----------------------------------------------------------------------
describe('stepped code slide', () => {
  let m, pptx, dbg;
  before(async () => {
    dbg = join(tmp, 'dbg-code');
    m = await exportDeck({ input: join(here, 'fixtures/code.html'), output: join(tmp, 'code.pptx'), debugDir: dbg, route: offlineRoute() });
    pptx = await openPptx(m.output);
  });

  test('package is structurally valid', async () => {
    assert.deepEqual(await validatePptx(readFileSync(m.output)), []);
  });

  test('each code line is exported once: the stacked step clones are skipped as covered', () => {
    for (const line of ['SELECT', 'FROM', 'WHERE', 'GROUP']) {
      const n = pptx.slides[0].runs.filter((r) => r.startsWith(line)).length;
      assert.equal(n, 1, `${line} appears ${n} times`);
    }
    assert.ok(m.slides[0].skippedText.some((t) => t.startsWith('covered:')), 'test is vacuous if no clones were covered');
  });

  test('indented code line: the box starts where the indentation starts (no doubled indent)', () => {
    const joined = (x) => x.runs.map((r) => r.text || '').join('');
    const b = m.slides[0].blocks.find((x) => joined(x).includes("account != 'internal'"));
    const plain = m.slides[0].blocks.find((x) => x.runs.some((r) => r.text && r.text.startsWith('GROUP')));
    assert.ok(Math.abs(b.x - plain.x) < 3, `indented box at ${b.x}, plain line at ${plain.x}`);
    assert.match(b.runs[0].text, /^ {6}/);
  });

  test('final step: the highlighted lines are opaque, the dimmed lines carry transparency', () => {
    const alphas = [...pptx.slides[0].xml.matchAll(/<a:alpha val="(\d+)"\/>/g)].map((x) => +x[1]);
    assert.ok(alphas.length >= 2 && alphas.every((a) => a === 40000), `alphas: ${alphas}`);
  });

  test('no ghost text', () => {
    const bg = decode(join(dbg, 'slide-1.png'));
    for (const b of m.slides[0].blocks) {
      const r = ink(bg, { x: b.x + 10, y: b.y + 10, w: b.w - 20, h: b.h - 20 });
      assert.ok(r.count / r.total < 0.002, `"${b.runs[0].text}" has ${r.count} ink pixels left`);
    }
  });

  test('renders in LibreOffice with text in place', { skip: !canRender && 'soffice/pdftoppm not available' }, () => {
    renderCheck(m, dbg, 'code');
  });
});


// ---- real web fonts (needs network; skipped offline) -------------------------------------
const online = await fetch('https://api.fontshare.com/v2/css?f[]=satoshi@400&display=swap', { signal: AbortSignal.timeout(8000) }).then((r) => r.ok, () => false);

describe('web fonts and template chrome', { skip: !online && 'Fontshare not reachable' }, () => {
  let m, pptx, dbg;
  before(async () => {
    dbg = join(tmp, 'dbg-fonts');
    m = await exportDeck({ input: join(here, 'fixtures/webfonts.html'), output: join(tmp, 'webfonts.pptx'), debugDir: dbg, route: offlineRoute({ allowFonts: true }) });
    pptx = await openPptx(m.output);
  });

  test('package is structurally valid', async () => {
    assert.deepEqual(await validatePptx(readFileSync(m.output)), []);
  });

  test('web fonts were loaded before the screenshot, and the text boxes name them', () => {
    assert.ok(m.loadedFonts.includes('General Sans') && m.loadedFonts.includes('Satoshi'), `loaded: ${m.loadedFonts}`);
    assert.ok(m.fonts.includes('General Sans') && m.fonts.includes('Satoshi'), `used: ${m.fonts}`);
    assert.match(pptx.slides[0].xml, /typeface="General Sans"/);
    assert.match(pptx.slides[0].xml, /typeface="Satoshi"/);
  });

  test('title, labels, footer, and the data-page counter are extracted', () => {
    const t = pptx.slides[0].runs;
    for (const s of ['02 · Customer journey', 'Activation happens inside the first day', 'First alert fires', 'Day-one activation predicts expansion.', '01 / 01']) assert.ok(t.includes(s), `missing "${s}"; have ${JSON.stringify(t)}`);
  });

  test('arrow labels (pure translateY) are extracted; the CSS arrow itself stays in the raster', () => {
    assert.ok(pptx.slides[0].runs.includes('HANDOFF') && pptx.slides[0].runs.includes('INVITE'));
    const bg = decode(pptx.slides[0].bgPng);
    assert.ok(ink(bg, { x: 700, y: 540, w: 100, h: 30 }, 40).count > 50, 'arrow line missing from the raster');
  });

  test('no ghost text with web fonts', () => {
    const bg = decode(join(dbg, 'slide-1.png'));
    for (const b of m.slides[0].blocks) {
      const r = ink(bg, { x: b.x + 10, y: b.y + 10, w: b.w - 20, h: b.h - 20 });
      assert.ok(r.count / r.total < 0.002, `"${b.runs[0].text}" has ${r.count} ink pixels left`);
    }
  });
});

// ---- edge cases ----------------------------------------------------------------------
describe('edge cases', () => {
  let m, pptx, dbg;
  before(async () => {
    dbg = join(tmp, 'dbg-edge');
    m = await exportDeck({ input: join(here, 'fixtures/edge.html'), output: join(tmp, 'edge.pptx'), debugDir: dbg, route: offlineRoute() });
    pptx = await openPptx(m.output);
  });

  test('package is structurally valid, including runs with leading/trailing spaces', async () => {
    assert.deepEqual(await validatePptx(readFileSync(m.output)), []);
    assert.match(pptx.slides[0].xml, /<a:t xml:space="preserve">\s+preserved/);
  });

  test('data-visibility="hidden" slides are skipped, like in the PDF export', () => {
    assert.equal(pptx.slides.length, 2);
    assert.ok(!pptx.slides.some((s) => s.text.includes('HIDDEN SLIDE')));
  });

  test('mixed font sizes on one line (inline code) stay one line; wrapped ones get a sane pitch', () => {
    const blocks = m.slides[0].blocks;
    const one = blocks.find((b) => b.runs.some((r) => r.text && r.text.startsWith('Each class')));
    assert.equal(one.wrap, false);
    assert.equal(one.lineSpacingPx, null, 'a single visual line must not get exact line spacing');
    const two = blocks.find((b) => b.runs.some((r) => r.text && r.text.startsWith('A longer sentence')));
    assert.equal(two.wrap, true);
    assert.ok(two.lineSpacingPx > 44 && two.lineSpacingPx < 100, `pitch ${two.lineSpacingPx}px for 44px text`);
    const spcs = [...pptx.slides[0].xml.matchAll(/<a:spcPts val="(\d+)"/g)].map((x) => +x[1]);
    assert.ok(spcs.every((v) => v >= 1500), `implausibly small line spacing in XML: ${spcs}`);
  });

  test('one <a:pPr> per paragraph', () => {
    for (const para of pptx.slides[0].xml.match(/<a:p>[\s\S]*?<\/a:p>/g)) assert.ok((para.match(/<a:pPr[\s>\/]/g) || []).length <= 1);
  });

  test('renders in LibreOffice with all text visible and in place', { skip: !canRender && 'soffice/pdftoppm not available' }, () => {
    // 24px: inline code chips carry horizontal padding that a text run cannot reproduce, so text after a chip shifts left
    renderCheck(m, dbg, 'edge', 24);
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


// ---- the validator itself: it must flag each defect it claims to catch ---------------------
describe('ooxml validator', () => {
  let good;
  before(async () => {
    const m = await exportDeck({ input: join(here, 'fixtures/edge.html'), output: join(tmp, 'val-src.pptx'), route: offlineRoute() });
    good = readFileSync(m.output);
  });

  // apply `edit` to the package, return the validator's verdict
  async function broken(edit) {
    const zip = await JSZip.loadAsync(good);
    await edit(zip);
    return validatePptx(await zip.generateAsync({ type: 'nodebuffer' }));
  }
  const patch = (name, fn) => async (zip) => zip.file(name, fn(await zip.file(name).async('string')));

  test('control: the untouched export is valid', async () => {
    assert.deepEqual(await validatePptx(good), []);
  });

  const cases = [
    ['colour with #', patch('ppt/slides/slide1.xml', (x) => x.replace(/srgbClr val="([0-9A-F]{6})"/, 'srgbClr val="#$1"')), /invalid colour/],
    ['8-digit colour (alpha baked into hex)', patch('ppt/slides/slide1.xml', (x) => x.replace(/srgbClr val="([0-9A-F]{6})"/, 'srgbClr val="$100"')), /invalid colour/],
    ['alpha out of range', patch('ppt/slides/slide1.xml', (x) => x.replace(/<a:alpha val="\d+"\/>/, '<a:alpha val="250000"/>')), /alpha/],
    ['font size out of range', patch('ppt/slides/slide1.xml', (x) => x.replace(/ sz="\d+"/, ' sz="5"')), /font size/],
    ['unknown alignment', patch('ppt/slides/slide1.xml', (x) => x.replace(/algn="l"/, 'algn="left"')), /alignment/],
    ['duplicate shape ids', patch('ppt/slides/slide1.xml', (x) => x.replace(/<p:cNvPr id="3"/, '<p:cNvPr id="2"')), /duplicate shape ids/],
    ['dangling relationship id in a slide', patch('ppt/slides/slide1.xml', (x) => x.replace(/r:embed="rId\d+"/, 'r:embed="rId99"')), /not declared/],
    ['truncated XML', patch('ppt/slides/slide2.xml', (x) => x.slice(0, x.length - 40)), /not well-formed/],
    ['missing leading-space preserve flag', patch('ppt/slides/slide1.xml', (x) => x.replace('<a:t xml:space="preserve">', '<a:t>')), /xml:space/],
    ['shape completely off-slide', patch('ppt/slides/slide1.xml', (x) => x.replace(/<a:off x="\d+" y="\d+"\/>(<a:ext cx="[1-9])/, '<a:off x="99999999" y="0"/>$1')), /outside the slide/],
    ['part without a content type', patch('[Content_Types].xml', (x) => x.replace(/<Override[^>]*PartName="\/ppt\/slides\/slide2.xml"[^>]*\/>/, '')), /no content type/],
    ['content-type override for a missing part', patch('[Content_Types].xml', (x) => x.replace('</Types>', '<Override PartName="/ppt/slideMasters/slideMaster9.xml" ContentType="x"/></Types>')), /not in the package/],
    ['relationship to a missing part', async (zip) => { const f = Object.keys(zip.files).find((n) => /ppt\/media\/.*\.png$/.test(n)); zip.remove(f); }, /not in the package/],
    ['slide not listed in sldIdLst', patch('ppt/presentation.xml', (x) => x.replace(/<p:sldId [^>]*\/>/, '')), /not in <p:sldIdLst>/],
    ['duplicate slide ids', patch('ppt/presentation.xml', (x) => x.replace(/(<p:sldId id=")257"/, '$1256"')), /duplicate slide ids/],
    ['notes page without notes master link', patch('ppt/notesSlides/_rels/notesSlide1.xml.rels', (x) => x.replace(/<Relationship [^>]*notesMaster[^>]*\/>/, '')), /notes master/],
    ['corrupt image', async (zip) => { const f = Object.keys(zip.files).find((n) => /ppt\/media\/.*\.png$/.test(n)); zip.file(f, Buffer.from('not a png at all')); }, /not a PNG/],
  ];
  for (const [name, edit, expected] of cases) {
    test(`flags: ${name}`, async () => {
      const errs = await broken(edit);
      assert.ok(errs.some((e) => expected.test(e)), `expected ${expected}, got ${JSON.stringify(errs)}`);
    });
  }

  test('does not flag pptxgenjs\'s unusual child order in <p:presentation> (PowerPoint needs it as written)', async () => {
    const pres = (await JSZip.loadAsync(good)).file('ppt/presentation.xml');
    const xml = await pres.async('string');
    assert.ok(xml.indexOf('<p:sldIdLst>') < xml.indexOf('<p:notesMasterIdLst>'), 'premise: pptxgenjs order changed; revisit finalizePackage');
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
