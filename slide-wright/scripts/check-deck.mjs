#!/usr/bin/env node
// Check a slide-wright deck in headless Chrome and print one line per defect.
//
//   node check-deck.mjs deck.html [more.html ...] [--sheet sheet.png]
//
// Per slide it reports: content outside the slide frame, clipped or scrolling text, overlapping
// text blocks, text below the size floor, and web fonts that did not load. On the title slide it
// also reports a missing signature: no shape, image or SVG large enough to read. With --sheet it also
// writes one contact-sheet PNG of all slides (fragments shown, animations finished) for a single
// visual look. Several decks go into one sheet, one deck per row block, in the order given.
// Exit code 1 when any defect is found, 2 when the deck cannot be loaded.
import { resolve, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { ensureDeps } from './lib/deps.mjs';

const FLOOR_PX = 18; // smallest text the skill allows (labels)
const SIGNATURE_MIN = 0.04; // smallest share of the title slide the largest visual may cover

async function launch(chromium) {
  let err;
  for (const opts of [{ channel: 'chrome' }, {}]) {
    try { return await chromium.launch(opts); } catch (e) { err = e; }
  }
  throw new Error(`Could not start a browser: ${err && err.message}`);
}

// Runs in the page for the current slide. Returns a list of defect strings.
// `signatureMin` is set on the first slide only: the share of the slide the signature must cover.
function inspectSlide({ floor, signatureMin }) {
  const cur = Reveal.getCurrentSlide();
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
  // The title slide carries the signature, drawn large (design.md). Measure the largest visual
  // outside the title block: an image, SVG, canvas or video, a box or pseudo-element that paints a
  // fill, gradient or border, or a block of such parts (a drawn table, a grid). A plain fill over
  // most of the slide is the surface, not a signature.
  if (signatureMin && cur.querySelector('.title-slide, h1')) {
    const heading = cur.querySelector('h1') || cur.querySelector('h2');
    const area = frame.width * frame.height;
    const inFrame = (r) => Math.max(0, Math.min(r.right, frame.right) - Math.max(r.left, frame.left)) * Math.max(0, Math.min(r.bottom, frame.bottom) - Math.max(r.top, frame.top));
    const alpha = (c) => {
      const m = /rgba?\(([^)]*)\)/.exec(c);
      if (!m) return c === 'transparent' ? 0 : 1;
      const p = m[1].split(/[\s,/]+/).filter(Boolean);
      return p.length > 3 ? parseFloat(p[3]) : 1;
    };
    const SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    const border = (cs, side) => (alpha(cs[`border${side}Color`]) > 0 && cs[`border${side}Style`] !== 'none' ? parseFloat(cs[`border${side}Width`]) || 0 : 0);
    const filled = (cs) => cs.backgroundImage !== 'none' || alpha(cs.backgroundColor) > 0;
    const paints = (cs) => filled(cs) || SIDES.some((side) => border(cs, side) > 0);
    // The area a box draws: all of it when filled or outlined on every side, else only its rules.
    const drawnArea = (cs, w, h) => {
      if (filled(cs) || SIDES.every((side) => border(cs, side) > 0)) return w * h;
      return (border(cs, 'Top') + border(cs, 'Bottom')) * w + (border(cs, 'Left') + border(cs, 'Right')) * h;
    };
    const shown = (cs) => cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
    const MEDIA = /^(svg|img|canvas|video|picture|object|iframe)$/i;
    const els = [...cur.querySelectorAll('*')].filter((el) => !el.ownerSVGElement && !el.closest('aside.notes') && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));
    const drawn = new Set(els.filter((el) => MEDIA.test(el.tagName) || paints(getComputedStyle(el))));
    const bg = Reveal.getSlideBackground(cur);
    let best = bg && (bg.querySelector('img, video, iframe') || [bg, ...bg.querySelectorAll('*')].some((e) => getComputedStyle(e).backgroundImage !== 'none')) ? area : 0;
    for (const el of els) {
      if (heading && el.contains(heading)) continue;
      const cs = getComputedStyle(el);
      if (drawn.has(el)) {
        const r = el.getBoundingClientRect();
        const a = MEDIA.test(el.tagName) ? inFrame(r) : Math.min(inFrame(r), drawnArea(cs, r.width, r.height));
        if (a < area * 0.9 || MEDIA.test(el.tagName) || cs.backgroundImage !== 'none') best = Math.max(best, a);
      }
      // A block of drawn parts counts as the sum of their areas, or, with three parts or more (the
      // rows of a drawn table, a grid), as the box around them. An icon beside a caption does not
      // grow to the caption's box.
      let sum = 0, n = 0, l = Infinity, t = Infinity, rt = -Infinity, b = -Infinity;
      for (const d of el.querySelectorAll('*')) {
        if (!drawn.has(d) || (heading && d.contains(heading))) continue;
        let up = d.parentElement;
        while (up && up !== el && !drawn.has(up)) up = up.parentElement;
        if (up !== el) continue;
        const r = d.getBoundingClientRect();
        sum += MEDIA.test(d.tagName) ? inFrame(r) : Math.min(inFrame(r), drawnArea(getComputedStyle(d), r.width, r.height));
        n++; l = Math.min(l, r.left); t = Math.min(t, r.top); rt = Math.max(rt, r.right); b = Math.max(b, r.bottom);
      }
      const box = n >= 3 ? inFrame({ left: l, top: t, right: rt, bottom: b }) : 0;
      best = Math.max(best, Math.min(Math.max(sum, box), area * 0.9));
      for (const pseudo of ['::before', '::after']) {
        const ps = getComputedStyle(el, pseudo);
        if (ps.content === 'none' || !shown(ps) || !paints(ps)) continue;
        const a = Math.min(drawnArea(ps, parseFloat(ps.width) || 0, parseFloat(ps.height) || 0), area);
        if (a < area * 0.9 || ps.backgroundImage !== 'none') best = Math.max(best, a);
      }
    }
    if (best < area * signatureMin) out.push(`no signature on the title slide: its largest visual covers ${Math.round((best / area) * 100)}% of the slide, draw the signature over at least ${Math.round(signatureMin * 100)}%, as a recognizable object or mark from the subject, not an abstract diagram`);
  }
  return [...new Set(out)];
}

/**
 * @param {object} o
 * @param {string|string[]} o.input  path to the deck .html, or several
 * @param {string} [o.sheet] write a contact-sheet PNG here
 * @param {(page) => Promise<void>} [o.route] request-routing hook (tests serve the CDN offline)
 * @returns {Promise<{slides: number, defects: string[]}>} defects read "slide N: ...",
 *   prefixed with the file name when several decks are checked
 */
export async function checkDeck({ input, sheet, route }) {
  const req = ensureDeps();
  const { chromium } = req('playwright-core');
  const browser = await launch(chromium);
  const inputs = [].concat(input);
  const defects = [];
  const decks = []; // per deck: { shots, w, h }
  let total = 0;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    for (const file of inputs) {
    const tag = inputs.length > 1 ? `${basename(file)}: ` : '';
    const page = await ctx.newPage();
    if (route) await route(page);
    await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.Reveal && Reveal.isReady && Reveal.isReady(), null, { timeout: 30000 }).catch(() => {
      throw new Error(tag + 'No ready reveal.js instance. Not a reveal.js deck, or the engine could not load from its CDN.');
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
      // Show every build step and jump entrance animations to their end state, so the checks
      // and the contact sheet see the finished slide, not a half-faded one.
      await page.evaluate(async () => {
        // Stepped code highlights are stacked clones of one block: leave those on their first step.
        Reveal.getCurrentSlide().querySelectorAll('.fragment:not(pre > code)').forEach((f) => f.classList.add('visible'));
        const frame = () => new Promise((r) => requestAnimationFrame(r));
        await frame(); await frame();
        // A looping animation has no end to jump to: cancel it, so the element sits at its resting style.
        document.getAnimations().forEach((x) => { try { x.finish(); } catch { x.cancel(); } });
        await frame();
      });
      for (const d of await page.evaluate(inspectSlide, { floor: FLOOR_PX, signatureMin: i === 0 ? SIGNATURE_MIN : 0 })) defects.push(`${tag}slide ${i + 1}: ${d}`);
      if (sheet) shots.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
    }
    decks.push({ shots, w: cfg.w, h: cfg.h });
    total += n;
    await page.close();
    }
    if (sheet) {
      const w = 640, cols = Math.min(3, Math.max(...decks.map((d) => d.shots.length)));
      const rows = decks.map((d) => {
        const h = Math.round((w * d.h) / d.w);
        return `<div style="display:grid;grid-template-columns:repeat(${cols},${w}px)">${d.shots.map((b) => `<img style="width:${w}px;height:${h}px" src="data:image/jpeg;base64,${b}">`).join('')}</div>`;
      });
      const sp = await ctx.newPage();
      await sp.setViewportSize({ width: cols * w, height: 360 });
      await sp.setContent(`<body style="margin:0;background:#fff">${rows.join('')}</body>`);
      writeFileSync(resolve(sheet), await sp.screenshot({ fullPage: true }));
    }
    return { slides: total, defects };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const sheetIdx = args.indexOf('--sheet');
  const sheet = sheetIdx >= 0 ? args[sheetIdx + 1] : null;
  const input = args.filter((a, i) => !a.startsWith('--') && !(sheetIdx >= 0 && i === sheetIdx + 1));
  if (!input.length) { console.error('usage: node check-deck.mjs deck.html [more.html ...] [--sheet sheet.png]'); process.exit(2); }
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
