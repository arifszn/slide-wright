#!/usr/bin/env node
// Check a slide-wright deck in headless Chrome and print one line per defect.
//
//   node check-deck.mjs deck.html [--sheet sheet.png]
//
// Per slide it reports: content outside the slide frame, clipped or scrolling text, overlapping
// text blocks, text below the size floor, and web fonts that did not load. With --sheet it also
// writes one contact-sheet PNG of all slides (fragments shown) for a single visual look.
// Exit code 1 when any defect is found, 2 when the deck cannot be loaded.
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { ensureDeps } from './lib/deps.mjs';

const FLOOR_PX = 18; // smallest text the skill allows (labels)

async function launch(chromium) {
  let err;
  for (const opts of [{ channel: 'chrome' }, {}]) {
    try { return await chromium.launch(opts); } catch (e) { err = e; }
  }
  throw new Error(`Could not start a browser: ${err && err.message}`);
}

// Runs in the page for the current slide. Returns a list of defect strings.
function inspectSlide(floor) {
  const cur = Reveal.getCurrentSlide();
  cur.querySelectorAll('.fragment').forEach((f) => f.classList.add('visible'));
  const frame = cur.getBoundingClientRect();
  const label = (el) => (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase());
  const out = [];
  const textEls = [];
  for (const el of cur.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
    if (r.right > frame.right + 2 || r.bottom > frame.bottom + 2 || r.left < frame.left - 2 || r.top < frame.top - 2) out.push(`outside frame: ${label(el)}`);
    if ((el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) && /hidden|auto|scroll/.test(cs.overflow + cs.overflowX + cs.overflowY) && el.clientHeight) out.push(`clipped content: ${label(el)}`);
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      textEls.push({ el, r });
      const fs = parseFloat(cs.fontSize) * (frame.width / (Reveal.getConfig().width || 1920));
      if (fs < floor - 0.5) out.push(`text ${fs.toFixed(0)}px below ${floor}px: ${label(el)} "${el.textContent.trim().slice(0, 24)}"`);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (fam && !/^(serif|sans-serif|monospace|system-ui|ui-)/.test(fam) && !(document.fonts.check(`16px "${fam}"`) || [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam && f.status === 'loaded'))) out.push(`font not loaded: ${fam}`);
    }
  }
  for (let i = 0; i < textEls.length; i++) {
    for (let j = i + 1; j < textEls.length; j++) {
      const a = textEls[i], b = textEls[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 4 && h > 4) out.push(`overlap: ${label(a.el)} "${a.el.textContent.trim().slice(0, 18)}" x ${label(b.el)} "${b.el.textContent.trim().slice(0, 18)}"`);
    }
  }
  return [...new Set(out)];
}

/**
 * @param {object} o
 * @param {string} o.input   path to the deck .html
 * @param {string} [o.sheet] write a contact-sheet PNG here
 * @param {(page) => Promise<void>} [o.route] request-routing hook (tests serve the CDN offline)
 * @returns {Promise<{slides: number, defects: string[]}>} defects read "slide N: ..."
 */
export async function checkDeck({ input, sheet, route }) {
  const req = ensureDeps();
  const { chromium } = req('playwright-core');
  const browser = await launch(chromium);
  const defects = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    if (route) await route(page);
    await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.Reveal && Reveal.isReady && Reveal.isReady(), null, { timeout: 30000 }).catch(() => {
      throw new Error('No ready reveal.js instance. Not a reveal.js deck, or the engine could not load from its CDN.');
    });
    const cfg = await page.evaluate(() => { const c = Reveal.getConfig(); return { w: c.width, h: c.height }; });
    await page.setViewportSize({ width: cfg.w, height: cfg.h });
    await page.evaluate(async () => {
      Reveal.configure({ transition: 'none', backgroundTransition: 'none', controls: false, progress: false, slideNumber: false, autoSlide: 0 });
      Reveal.layout();
      await document.fonts.ready;
    });
    const n = await page.evaluate(() => Reveal.getSlides().filter((s) => !s.querySelector('section')).length);
    const shots = [];
    for (let i = 0; i < n; i++) {
      await page.evaluate((i) => {
        const s = Reveal.getSlides().filter((x) => !x.querySelector('section'))[i];
        const idx = Reveal.getIndices(s);
        Reveal.slide(idx.h, idx.v);
      }, i);
      await page.waitForTimeout(150);
      for (const d of await page.evaluate(inspectSlide, FLOOR_PX)) defects.push(`slide ${i + 1}: ${d}`);
      if (sheet) shots.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
    }
    if (sheet) {
      const cols = 3, w = 640, h = Math.round((w * cfg.h) / cfg.w);
      const sp = await ctx.newPage();
      await sp.setViewportSize({ width: cols * w, height: Math.ceil(n / cols) * h });
      await sp.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},${w}px)">${shots.map((b) => `<img style="width:${w}px;height:${h}px" src="data:image/jpeg;base64,${b}">`).join('')}</body>`);
      writeFileSync(resolve(sheet), await sp.screenshot({ fullPage: true }));
    }
    return { slides: n, defects };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const sheetIdx = args.indexOf('--sheet');
  const sheet = sheetIdx >= 0 ? args[sheetIdx + 1] : null;
  const input = args.find((a, i) => !a.startsWith('--') && !(sheetIdx >= 0 && i === sheetIdx + 1));
  if (!input) { console.error('usage: node check-deck.mjs deck.html [--sheet sheet.png]'); process.exit(2); }
  try {
    const { slides, defects } = await checkDeck({ input, sheet });
    for (const d of defects) console.log(d);
    if (sheet) console.log(`contact sheet: ${resolve(sheet)}`);
    console.log(defects.length ? `${defects.length} defect(s) in ${slides} slides` : `OK: ${slides} slides, no defects`);
    process.exit(defects.length ? 1 : 0);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}
