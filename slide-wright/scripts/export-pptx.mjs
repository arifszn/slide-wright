#!/usr/bin/env node
// Export a slide-wright deck (single HTML file) to .pptx.
//
// Each slide becomes: a full-bleed background picture (the rendered slide with the
// extracted text hidden) + native, editable text boxes + embedded local videos + speaker notes.
//
//   node export-pptx.mjs deck.html [-o deck.pptx] [--scale 2] [--timeout ms] [--debug-dir dir]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ensureDeps } from './lib/deps.mjs';
import { extractSlide } from './lib/extract.mjs';
import { finalizePackage } from './lib/package.mjs';

const SLIDE_IN = 13.333; // slide width in inches; height follows the deck's aspect ratio
const USAGE = 'usage: export-pptx.mjs deck.html [-o out.pptx] [--scale 1|2] [--timeout ms] [--debug-dir dir]';
const VIDEO_EXT = new Set(['.mp4', '.m4v', '.mov']);
const HIDE_CSS = `
/* hit-testing (covered-text check) must see every element, including pointer-events:none ones */
.reveal *{pointer-events:auto!important}
.reveal .controls,.reveal .progress,.reveal .slide-number,.reveal .playback,.reveal .pause-overlay,.reveal .speaker-notes,.reveal .overview-controls{display:none!important}
/* transition:none matters: fragments use transition-all, which would fade the text out over 200ms and leave it in the screenshot */
[data-sw-x]{-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important}
[data-sw-x]::marker,[data-sw-x]::before,[data-sw-x]::after{-webkit-text-fill-color:currentcolor!important}
/* chips rebuilt as highlighted runs: the highlight replaces the painted box */
[data-sw-chip]{background-color:transparent!important}
`;

async function launch(chromium) {
  const attempts = [{ channel: 'chrome' }, { channel: 'msedge' }, {}];
  let lastErr;
  for (let pass = 0; pass < 2; pass++) {
    for (const opts of attempts) {
      try { return await chromium.launch(opts); } catch (e) { lastErr = e; }
    }
    if (pass === 0) {
      console.error('No Chrome or Edge found; downloading Chromium (first run only)...');
      const { execFileSync } = await import('node:child_process');
      const cli = ensureDeps().resolve('playwright-core/cli.js');
      try { execFileSync(process.execPath, [cli, 'install', 'chromium'], { stdio: 'inherit' }); } catch { break; }
    }
  }
  throw new Error(`Could not start a browser: ${lastErr && lastErr.message}`);
}

// "3 inline-box, 12 svg": how many texts stayed in the picture, by reason
export function skipSummary(skipped) {
  const counts = {};
  for (const t of skipped) { const reason = t.slice(0, t.indexOf(':')); counts[reason] = (counts[reason] || 0) + 1; }
  return Object.entries(counts).map(([reason, n]) => `${n} ${reason}`).join(', ');
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
      throw new Error('No ready reveal.js instance. The file is not a reveal.js deck, or the engine could not load from its CDN (is the network blocked?).');
    });

    const cfg = await page.evaluate(() => { const c = Reveal.getConfig(); return { w: c.width, h: c.height }; });
    await page.setViewportSize({ width: cfg.w, height: cfg.h });
    await page.addStyleTag({ content: HIDE_CSS });
    const count = await page.evaluate(() => {
      // margin/minScale/maxScale: a deck with the engine's default letterbox margin must still render 1:1.
      // autoPlayMedia: a playing video would be captured mid-frame.
      Reveal.configure({ transition: 'none', backgroundTransition: 'none', progress: false, controls: false, slideNumber: false, autoSlide: 0, margin: 0, minScale: 1, maxScale: 1, autoPlayMedia: false });
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
    pptx.author = (await page.evaluate(() => (document.querySelector('meta[name="author"]') || {}).content)) || 'slide-wright';
    pptx.company = '';
    pptx.subject = '';
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
        // A looping animation has no end to jump to: cancel it, so the element sits at its resting style.
        document.getAnimations().forEach((a) => { try { a.finish(); } catch { a.cancel(); } });
        await Promise.all([...s.querySelectorAll('img')].map((im) => (im.decode ? im.decode().catch(() => {}) : null)));
        // Videos: a still frame without player controls. The poster when there is one, else a frame
        // a few seconds in (the first frame is often black).
        const until = (target, event) => new Promise((r) => { target.addEventListener(event, r, { once: true }); setTimeout(r, 3000); });
        for (const v of s.querySelectorAll('video')) {
          v.removeAttribute('controls');
          v.pause();
          if (v.poster) { if (v.played.length) v.load(); const im = new Image(); im.src = v.poster; await im.decode().catch(() => {}); continue; }
          if (v.readyState < 1 && (v.currentSrc || v.src)) await until(v, 'loadedmetadata');
          const t = Math.min(3, (v.duration || 0) / 2);
          if (t > 0 && Number.isFinite(t)) { v.currentTime = t; await until(v, 'seeked'); }
        }
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
      // Local video files are embedded where they sit; the still frame doubles as the cover.
      // Anything else (remote source, unsupported container) stays a still in the background.
      const videos = [];
      for (const v of data.videos) {
        const file = v.src.startsWith('file:') ? fileURLToPath(v.src) : '';
        const box = { x: Math.max(0, v.x), y: Math.max(0, v.y) };
        box.width = Math.min(cfg.w, v.x + v.w) - box.x;
        box.height = Math.min(cfg.h, v.y + v.h) - box.y;
        const reason = !file ? 'not a local file' : !existsSync(file) ? 'file not found' : !VIDEO_EXT.has(extname(file).toLowerCase()) ? 'unsupported format' : box.width < 2 || box.height < 2 ? 'off the slide' : '';
        if (!reason) {
          const cover = await page.screenshot({ clip: box });
          slide.addMedia({ type: 'video', path: file, cover: 'data:image/png;base64,' + cover.toString('base64'), x: box.x * inPerPx, y: box.y * inPerPx, w: box.width * inPerPx, h: box.height * inPerPx });
        }
        videos.push({ src: v.src, embedded: !reason, reason, x: v.x, y: v.y, w: v.w, h: v.h });
      }
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
          else if (s.link) options.underline = { style: 'none' }; // pptxgenjs underlines every link otherwise
          if (s.link) options.hyperlink = { url: s.link };
          if (s.script) options[s.script === 'super' ? 'superscript' : 'subscript'] = true;
          if (s.highlight) options.highlight = s.highlight;
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
      manifest.slides.push({ title: data.title, notes: data.notes, skippedText: data.skippedText, videos, blocks: data.blocks });
      const left = skipSummary(data.skippedText);
      const embedded = videos.filter((v) => v.embedded).length;
      log(`slide ${i + 1}/${count}: ${data.blocks.length} text boxes${embedded ? `, ${embedded} video${embedded > 1 ? 's' : ''} embedded` : ''}${videos.length > embedded ? `, ${videos.length - embedded} video${videos.length - embedded > 1 ? 's' : ''} left as a still (${[...new Set(videos.filter((v) => !v.embedded).map((v) => v.reason))].join(', ')})` : ''}${left ? `; text left in the picture: ${left}` : ''}`);
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
  const fail = (msg) => { console.error(msg ? `${msg}\n${USAGE}` : USAGE); process.exit(2); };
  const opt = (flag) => { const i = args.indexOf(flag); if (i < 0) return undefined; if (i + 1 >= args.length) fail(`${flag} needs a value`); return args.splice(i, 2)[1]; };
  const num = (flag, def, ok) => { const raw = opt(flag); if (raw === undefined) return def; const n = Number(raw); if (!ok(n)) fail(`invalid ${flag}: ${raw}`); return n; };
  const output = opt('-o') || opt('--output');
  const scale = num('--scale', 1, (n) => n >= 1 && n <= 4);
  const timeout = num('--timeout', 30000, (n) => n > 0);
  const debugDir = opt('--debug-dir');
  const unknown = args.find((a) => a.startsWith('-'));
  if (unknown) fail(`unknown option: ${unknown}`);
  if (args.length !== 1) fail();
  const input = args[0];
  exportDeck({ input, output, scale, timeout, debugDir, log: (m) => console.error(m) })
    .then((m) => {
      console.log(m.output);
      const left = skipSummary(m.slides.flatMap((x) => x.skippedText));
      if (left) console.error(`Text left in the picture (not editable): ${left}.`);
      console.error(`${m.slides.length} slides. Fonts used: ${m.fonts.join(', ') || '(none)'}. Viewers without these fonts installed will see substitutes.`);
    })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
