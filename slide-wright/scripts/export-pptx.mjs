#!/usr/bin/env node
// Export a slide-wright deck (single HTML file) to .pptx.
//
// Each slide becomes: a full-bleed background picture (the rendered slide with the
// extracted text hidden) + native, editable text boxes + speaker notes.
//
//   node export-pptx.mjs deck.html [-o deck.pptx] [--scale 2] [--debug-dir dir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ensureDeps } from './lib/deps.mjs';
import { extractSlide } from './lib/extract.mjs';
import { finalizePackage } from './lib/package.mjs';

const SLIDE_IN = 13.333; // slide width in inches; height follows the deck's aspect ratio
const HIDE_CSS = `
/* hit-testing (covered-text check) must see every element, including pointer-events:none ones */
.reveal *{pointer-events:auto!important}
.reveal .controls,.reveal .progress,.reveal .slide-number,.reveal .playback,.reveal .pause-overlay,.reveal .speaker-notes,.reveal .overview-controls{display:none!important}
/* transition:none matters: fragments use transition-all, which would fade the text out over 200ms and leave it in the screenshot */
[data-sw-x]{-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important}
[data-sw-x]::marker,[data-sw-x]::before,[data-sw-x]::after{-webkit-text-fill-color:currentcolor!important}
`;

async function launch(chromium) {
  const attempts = [{ channel: 'chrome' }, {}];
  let lastErr;
  for (let pass = 0; pass < 2; pass++) {
    for (const opts of attempts) {
      try { return await chromium.launch(opts); } catch (e) { lastErr = e; }
    }
    if (pass === 0) {
      console.error('No Chrome found; downloading Chromium (first run only)...');
      const { execFileSync } = await import('node:child_process');
      const cli = ensureDeps().resolve('playwright-core/cli.js');
      try { execFileSync(process.execPath, [cli, 'install', 'chromium'], { stdio: 'inherit' }); } catch { break; }
    }
  }
  throw new Error(`Could not start a browser: ${lastErr && lastErr.message}`);
}

/**
 * @param {object} o
 * @param {string} o.input    path to the deck .html
 * @param {string} [o.output] path to the .pptx (default: next to the input)
 * @param {number} [o.scale]  screenshot device scale factor (default 1)
 * @param {number} [o.timeout] ms to wait for the deck engine to be ready (default 30000)
 * @param {string} [o.debugDir] also write slide-N.png (text hidden) and slide-N.ref.png (as rendered)
 * @param {(page) => Promise<void>} [o.route] hook to set up request routing (tests serve the CDN offline)
 * @param {(msg: string) => void} [o.log]
 */
export async function exportDeck({ input, output, scale = 1, timeout = 30000, debugDir, route, log = () => {} }) {
  const req = ensureDeps();
  const PptxGenJS = req('pptxgenjs');
  const { chromium } = req('playwright-core');
  input = resolve(input);
  output = resolve(output || input.replace(/\.html?$/i, '') + '.pptx');

  const browser = await launch(chromium);
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
    const page = await ctx.newPage();
    if (route) await route(page);
    await page.goto(pathToFileURL(input).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.Reveal && Reveal.isReady && Reveal.isReady(), null, { timeout }).catch(() => {
      throw new Error('This file does not look like a slide-wright deck (no ready reveal.js instance). Is the network blocked? The engine loads from a CDN.');
    });

    const cfg = await page.evaluate(() => { const c = Reveal.getConfig(); return { w: c.width, h: c.height }; });
    await page.setViewportSize({ width: cfg.w, height: cfg.h });
    await page.addStyleTag({ content: HIDE_CSS });
    const count = await page.evaluate(() => {
      Reveal.configure({ transition: 'none', backgroundTransition: 'none', progress: false, controls: false, slideNumber: false, autoSlide: 0 });
      Reveal.layout();
      const slides = Reveal.getSlides().filter((s) => s.dataset.visibility !== 'hidden' && !s.querySelector('section'));
      slides.forEach((s, i) => s.setAttribute('data-sw-slide', i));
      return slides.length;
    });
    if (!count) throw new Error('No slides found.');
    await page.evaluate(() => document.fonts.ready);

    const pptx = new PptxGenJS();
    const heightIn = (SLIDE_IN * cfg.h) / cfg.w;
    pptx.defineLayout({ name: 'SW', width: SLIDE_IN, height: heightIn });
    pptx.layout = 'SW';
    pptx.title = (await page.title()) || basename(input);
    const inPerPx = SLIDE_IN / cfg.w;
    const ptPerPx = (SLIDE_IN * 72) / cfg.w;

    const manifest = { width: cfg.w, height: cfg.h, slides: [] };
    const fonts = new Set();
    if (debugDir) mkdirSync(debugDir, { recursive: true });

    for (let i = 0; i < count; i++) {
      await page.evaluate(async (idx) => {
        const s = document.querySelector(`[data-sw-slide="${idx}"]`);
        const { h, v } = Reveal.getIndices(s);
        Reveal.slide(h, v, 9999); // 9999 = past the last fragment, so every build step is shown
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await document.fonts.ready;
        document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* infinite animation: leave */ } });
        await Promise.all([...s.querySelectorAll('img')].map((im) => (im.decode ? im.decode().catch(() => {}) : null)));
        await new Promise((r) => requestAnimationFrame(r));
      }, i);

      const clip = { x: 0, y: 0, width: cfg.w, height: cfg.h };
      if (debugDir) await page.screenshot({ path: join(debugDir, `slide-${i + 1}.ref.png`), clip });
      const data = await page.evaluate(extractSlide, i);
      if (Math.abs(data.scale - 1) > 0.01) throw new Error(`Slide ${i + 1} renders at scale ${data.scale.toFixed(3)}, expected 1. Is the viewport ${cfg.w}x${cfg.h}?`);
      const png = await page.screenshot({ clip });
      if (debugDir) writeFileSync(join(debugDir, `slide-${i + 1}.png`), png);

      const slide = pptx.addSlide();
      slide.background = { data: 'image/png;base64,' + png.toString('base64') };
      for (const b of data.blocks) {
        const runs = [];
        const align = b.align;
        const lineSpacing = b.lineSpacingPx ? Math.round(b.lineSpacingPx * ptPerPx * 10) / 10 : undefined;
        let startsParagraph = true;
        b.runs.forEach((r) => {
          if (r.br) { if (runs.length) runs[runs.length - 1].options.breakLine = true; startsParagraph = true; return; }
          const s = r.style;
          fonts.add(s.fontFace);
          const options = { fontFace: s.fontFace, fontSize: Math.round(s.px * ptPerPx * 100) / 100, color: s.color, bold: s.bold, italic: s.italic };
          // Paragraph options go on the first run of a paragraph only: pptxgenjs writes a new
          // <a:pPr> for every later run that carries them, which is invalid inside one <a:p>.
          if (startsParagraph) { options.align = align; if (lineSpacing) options.lineSpacing = lineSpacing; }
          startsParagraph = false;
          if (s.underline) options.underline = { style: 'sng' };
          if (s.strike) options.strike = 'sngStrike';
          if (s.spacingPx) options.charSpacing = Math.round(s.spacingPx * ptPerPx * 100) / 100;
          const alpha = s.alpha * b.opacity;
          if (alpha < 0.995) options.transparency = Math.round((1 - alpha) * 100);
          runs.push({ text: r.text, options });
        });
        if (!runs.length) continue;
        slide.addText(runs, {
          x: b.x * inPerPx, y: b.y * inPerPx, w: b.w * inPerPx, h: b.h * inPerPx,
          margin: 0, fit: 'none', valign: 'top', wrap: b.wrap, isTextBox: true,
        });
      }
      if (data.notes) slide.addNotes(data.notes);
      manifest.slides.push({ title: data.title, notes: data.notes, skippedText: data.skippedText, blocks: data.blocks });
      log(`slide ${i + 1}/${count}: ${data.blocks.length} text boxes${data.skippedText.length ? `, ${data.skippedText.length} left as image` : ''}`);
    }

    mkdirSync(dirname(output), { recursive: true });
    const raw = await pptx.write({ outputType: 'nodebuffer' });
    writeFileSync(output, await finalizePackage(req('jszip'), raw));
    manifest.output = output;
    manifest.fonts = [...fonts];
    manifest.fontStatus = await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight}: ${f.status}`));
    manifest.loadedFonts = await page.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/^["']|["']$/g, '')))]);
    return manifest;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const output = opt('-o') || opt('--output');
  const scale = Number(opt('--scale') || 1);
  const debugDir = opt('--debug-dir');
  const input = args[0];
  if (!input) { console.error('usage: export-pptx.mjs deck.html [-o out.pptx] [--scale 1|2] [--debug-dir dir]'); process.exit(2); }
  exportDeck({ input, output, scale, debugDir, log: (m) => console.error(m) })
    .then((m) => {
      console.log(m.output);
      console.error(`${m.slides.length} slides. Fonts used: ${m.fonts.join(', ') || '(none)'}. Viewers without these fonts installed will see substitutes.`);
    })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
