// Runs INSIDE the page (serialized by Playwright), so it must stay self-contained:
// no imports, no references to outer scope.
//
// For one active slide it (1) finds the leaf text blocks that can be rebuilt as
// native PowerPoint text, and (2) hides exactly that text in the DOM so the
// slide screenshot becomes a text-free background. Anything it cannot place
// faithfully (SVG text, gradient text, shadowed text, transformed text, clipped
// text, pseudo-element content) is deliberately left in the raster.
export function extractSlide(idx) {
  const sec = document.querySelector(`[data-sw-slide="${idx}"]`);
  // Coordinates are relative to the slide area, not the <section>: with `center: true` the
  // engine moves the section down and shrinks it to its content.
  const stage = sec.closest('.slides') || sec;
  const sr = stage.getBoundingClientRect();
  const k = sr.width / stage.offsetWidth; // layout px -> screen px (1 when the viewport matches the deck)
  const rel = (r) => ({ l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k });

  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const color = (str) => {
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = '#000';
    cv.fillStyle = str;
    cv.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = cv.getImageData(0, 0, 1, 1).data;
    const h = (n) => n.toString(16).padStart(2, '0');
    return { hex: (h(r) + h(g) + h(b)).toUpperCase(), a: a / 255 };
  };

  const SKIP_TAGS = new Set(['SVG', 'CANVAS', 'IMG', 'VIDEO', 'AUDIO', 'IFRAME', 'PICTURE', 'SCRIPT', 'STYLE', 'ASIDE', 'NOSCRIPT', 'OBJECT']);
  const isInline = (cs) => cs.display === 'inline' || cs.display === 'contents';
  const hasText = (s) => /\S/.test(s);
  const hasBorder = (cs) => ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none');
  const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  // The opaque colour behind `el`, or null when it is not one flat colour (image, gradient, stacked tints).
  const backdrop = (el) => {
    const flat = (node) => {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage !== 'none') return null;
      const c = color(cs.backgroundColor);
      return c.a > 0.98 ? c.hex : c.a > 0 ? null : '';
    };
    const chain = [];
    for (let n = el; n; n = n.parentElement) {
      chain.push(n);
      if (n === sec) {
        // the engine paints data-background-* on a separate layer behind the section
        if ([...sec.attributes].some((a) => /^data-background-(image|video|iframe|gradient)/.test(a.name))) return null;
        const bg = window.Reveal && Reveal.getSlideBackground && Reveal.getSlideBackground(sec);
        if (bg) chain.push(bg);
      }
    }
    for (const n of chain) {
      const c = flat(n);
      if (c === null) return null;
      if (c) return c;
    }
    return 'FFFFFF';
  };
  // An inline chip (code pill, highlight) that is only a flat background can be rebuilt as a
  // highlighted run. Returns its colour, '' when it paints nothing, null when it must stay in the raster.
  const chipFill = (el, cs) => {
    if (cs.backgroundImage !== 'none' || hasBorder(cs) || cs.boxShadow !== 'none') return null;
    const bg = color(cs.backgroundColor);
    if (bg.a === 0) return '';
    if (bg.a > 0.98) return bg.hex;
    const under = backdrop(el.parentElement);
    if (!under) return null;
    const [a, b] = [rgb(bg.hex), rgb(under)];
    return a.map((v, i) => Math.round(v * bg.a + b[i] * (1 - bg.a)).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const inlineHasText = (el) => {
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && hasText(n.nodeValue)) return true;
      if (n.nodeType === 1 && !SKIP_TAGS.has(n.tagName.toUpperCase()) && n.tagName !== 'BR' && isInline(getComputedStyle(n)) && inlineHasText(n)) return true;
    }
    return false;
  };
  // A pure translate is already reflected in getBoundingClientRect, so such text can be placed
  // exactly; rotation, scale and skew cannot be reproduced in a text box and stay in the raster.
  const pureTranslate = (t) => t === 'none' || /^matrix\(1, 0, 0, 1, [-\d.e]+, [-\d.e]+\)$/.test(t);
  const clipsContent = (cs) => ['hidden', 'clip', 'scroll', 'auto'].some((v) => cs.overflowX === v || cs.overflowY === v);

  const blocks = [];
  const consumed = new Set(); // elements whose own text we extracted (to be hidden)
  const consumedNodes = new Set();
  const chips = new Set(); // inline chips rebuilt as highlighted runs (their background is hidden)
  const skippedText = []; // text left in the raster, reported for visibility

  const walk = (el, ctx) => {
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const opacity = ctx.opacity * parseFloat(cs.opacity);
    if (opacity <= 0.01) return;
    const leaveReason =
      ctx.leave ||
      (!pureTranslate(cs.transform) && el !== sec && 'transform') ||
      (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text' ? 'gradient-text' : '') ||
      (cs.filter !== 'none' && 'filter') ||
      (cs.mixBlendMode !== 'normal' && 'blend') ||
      (cs.writingMode && cs.writingMode !== 'horizontal-tb' && 'vertical-text') ||
      '';
    const clips = clipsContent(cs) ? ctx.clips.concat([rel(el.getBoundingClientRect())]) : ctx.clips;
    const next = { opacity, leave: leaveReason, clips };

    const block = !isInline(cs) && inlineHasText(el);
    if (block) emit(el, cs, next);
    visitChildren(el, block, next);
  };

  const visitChildren = (el, parentIsBlock, ctx) => {
    for (const c of el.children) {
      if (parentIsBlock && isInline(getComputedStyle(c)) && !SKIP_TAGS.has(c.tagName.toUpperCase())) {
        // inline content was consumed by the parent block; only look for block descendants
        const cs = getComputedStyle(c);
        if (cs.display === 'none') continue;
        const op = ctx.opacity * parseFloat(cs.opacity);
        const leave = ctx.leave || (!pureTranslate(cs.transform) && 'transform') || '';
        visitChildren(c, true, { opacity: op, leave, clips: ctx.clips });
      } else walk(c, ctx);
    }
  };

  const transformText = (t, tt) => {
    if (tt === 'uppercase') return t.toUpperCase();
    if (tt === 'lowercase') return t.toLowerCase();
    if (tt === 'capitalize') return t.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());
    return t;
  };

  const genericFont = { 'sans-serif': 'Arial', 'system-ui': 'Arial', 'ui-sans-serif': 'Arial', '-apple-system': 'Arial', serif: 'Times New Roman', 'ui-serif': 'Times New Roman', monospace: 'Courier New', 'ui-monospace': 'Courier New' };
  const fontFace = (ff) => {
    const fams = ff.split(',').map((f) => f.trim().replace(/^["']|["']$/g, ''));
    const real = fams.find((f) => !(f.toLowerCase() in genericFont));
    return real || genericFont[fams[0].toLowerCase()] || 'Arial';
  };

  const emit = (el, cs, ctx) => {
    const textNodes = [];
    const parts = []; // { text } | { br: true }
    const consumedEls = new Set([el]);
    const ownChips = new Set();
    let leave = ''; // why this block has to stay in the raster
    // inh: what inline ancestors inside this block contribute to a run
    const collect = (node, ncs, inh) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) {
          if (!n.nodeValue) continue;
          const pre = /^(pre|pre-wrap|break-spaces|pre-line)$/.test(ncs.whiteSpace);
          let text = n.nodeValue.replace(/\r/g, '');
          text = ncs.whiteSpace === 'pre' || ncs.whiteSpace === 'pre-wrap' || ncs.whiteSpace === 'break-spaces' ? text : pre ? text.replace(/[ \t\f]+/g, ' ') : text.replace(/[ \t\r\n\f]+/g, ' ');
          // an inline nowrap span (code chip) must not break inside a wrapping paragraph
          if (node !== el && ncs.whiteSpace === 'nowrap' && cs.whiteSpace !== 'nowrap') text = text.replace(/(?<=\S) (?=\S)/g, ' ');
          if (hasText(text)) {
            // hidden inline text still takes up room, and a shadow cannot be rebuilt: keep the block as rendered
            if (ncs.visibility !== 'visible' || inh.opacity <= 0.01) leave = leave || 'hidden-inline';
            else if (ncs.textShadow !== 'none') leave = leave || 'text-shadow';
          }
          const fill = color(ncs.webkitTextFillColor || ncs.color);
          const outlined = parseFloat(ncs.webkitTextStrokeWidth) > 0; // the stroke cannot be hidden or rebuilt, so the glyphs must stay in the raster
          const col = fill.a < 0.02 || outlined ? null : fill; // transparent fill = gradient or outlined text: leave it in the raster
          const style = {
            fontFace: fontFace(ncs.fontFamily),
            px: inh.script ? inh.script.px : parseFloat(ncs.fontSize), // PowerPoint shrinks super/subscript itself
            bold: parseInt(ncs.fontWeight, 10) >= 600 || ncs.fontWeight === 'bold',
            italic: ncs.fontStyle === 'italic' || ncs.fontStyle === 'oblique',
            underline: ncs.textDecorationLine.includes('underline'),
            strike: ncs.textDecorationLine.includes('line-through'),
            color: col && col.hex,
            alpha: col ? col.a * inh.opacity : 1,
            spacingPx: ncs.letterSpacing === 'normal' ? 0 : parseFloat(ncs.letterSpacing) || 0,
          };
          if (inh.script) style.script = inh.script.type;
          if (inh.link) style.link = inh.link;
          if (inh.highlight) style.highlight = inh.highlight;
          parts.push({ text: transformText(text, ncs.textTransform), preserve: pre, node: n, style });
          textNodes.push(n);
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { parts.push({ br: true }); continue; }
          if (SKIP_TAGS.has(n.tagName.toUpperCase())) continue;
          const c = getComputedStyle(n);
          if (c.display === 'none') continue;
          if (isInline(c)) {
            const next = { ...inh, opacity: inh.opacity * parseFloat(c.opacity) };
            if (c.verticalAlign === 'super' || c.verticalAlign === 'sub') next.script = { type: c.verticalAlign, px: parseFloat(ncs.fontSize) };
            if (n.tagName === 'A' && /^(https?|mailto):/i.test(n.href || '')) next.link = n.href;
            if (c.display === 'inline' && hasText(n.textContent)) {
              const fill = chipFill(n, c);
              // a chip with a border, gradient or shadow keeps its text in the raster: text moved
              // to a native box would drift off it whenever the wrap points differ
              if (fill === null) { leave = leave || 'inline-box'; continue; }
              if (fill) { next.highlight = fill; ownChips.add(n); }
            }
            consumedEls.add(n);
            // A chip's side padding becomes a highlighted no-break space sized to match, so the
            // chip keeps its width and the text after it does not shift left.
            const pad = (side) => {
              const px = parseFloat(c[`padding${side}`]);
              if (!next.highlight || !(px >= 1)) return;
              cv.font = `${c.fontStyle} ${c.fontWeight} 100px ${c.fontFamily}`;
              const size = Math.min(parseFloat(c.fontSize), px / (cv.measureText('\u00a0').width / 100 || 0.28));
              if (size < 3) return;
              parts.push({ text: '\u00a0', pad: true, style: { fontFace: fontFace(c.fontFamily), px: Math.round(size * 10) / 10, bold: false, italic: false, underline: false, strike: false, color: 'FFFFFF', alpha: 1, spacingPx: 0, highlight: next.highlight } });
            };
            pad('Left');
            collect(n, c, next);
            pad('Right');
          }
          else if (/^inline-/.test(c.display) && hasText(n.textContent)) leave = leave || 'inline-box'; // pill/badge inside a text flow
        }
      }
    };
    collect(el, cs, { opacity: 1 });

    const ownText = parts.filter((p) => p.text !== undefined && hasText(p.text));
    if (!ownText.length) return;
    if (leave) { skippedText.push(`${leave}: ${ownText[0].text.trim().slice(0, 40)}`); return; }
    if (ctx.leave || parts.some((p) => p.text !== undefined && p.style.color === null && hasText(p.text))) {
      skippedText.push(`${ctx.leave || 'gradient-text'}: ${ownText[0].text.trim().slice(0, 40)}`);
      return;
    }

    // Geometry from the actual text ranges (not the element box).
    const rects = [];
    for (const part of parts) {
      const n = part.node;
      if (!n) continue;
      // whitespace-only nodes have a rect only when whitespace is preserved (code indentation);
      // measuring them keeps the box where the indentation starts, since the runs include it
      if (!hasText(n.nodeValue) && !part.preserve) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 0.5 && r.height > 0.5) rects.push(Object.assign(rel(r), { script: !!part.style.script }));
    }
    if (!rects.length) return;
    // super/subscripts sit off the line: they count for the width, not for line positions
    const onLine = rects.some((r) => !r.script) ? rects.filter((r) => !r.script) : rects;
    const u = { l: Math.min(...rects.map((r) => r.l)), t: Math.min(...onLine.map((r) => r.t)), r: Math.max(...rects.map((r) => r.r)), b: Math.max(...onLine.map((r) => r.b)) };
    const W = stage.offsetWidth, H = stage.offsetHeight;
    const clipped = ctx.clips.some((c) => u.l < c.l - 2 || u.t < c.t - 2 || u.r > c.r + 2 || u.b > c.b + 2);
    if (clipped || u.r < 0 || u.l > W || u.b < 0 || u.t > H) {
      skippedText.push(`clipped: ${ownText[0].text.trim().slice(0, 40)}`);
      return;
    }

    // Covered by something opaque on top (e.g. the stacked step clones of a stepped code
    // block, where only the last clone is visible)? Then it is not on screen: skip it.
    // A false positive only leaves the text in the raster, which is the safe failure.
    const covered = [rects[0], rects[rects.length - 1]].some((r) => {
      const hit = document.elementFromPoint(sr.left + ((r.l + r.r) / 2) * k, sr.top + ((r.t + r.b) / 2) * k);
      return hit && !el.contains(hit);
    });
    if (covered) { skippedText.push(`covered: ${ownText[0].text.trim().slice(0, 40)}`); return; }

    // Group the text rects into visual lines by centre line. Grouping by rect top breaks as soon
    // as one line mixes font sizes (inline code next to body text): the tops differ, one line
    // reads as several, and the pitch collapses.
    const lineSets = [];
    for (const r of onLine.slice().sort((x, y) => x.t + x.b - (y.t + y.b))) {
      const c = (r.t + r.b) / 2, h = r.b - r.t;
      const cur = lineSets[lineSets.length - 1];
      if (cur && Math.abs(c - cur.sum / cur.n) <= 0.4 * Math.max(cur.h, h)) { cur.sum += c; cur.n++; cur.h = Math.max(cur.h, h); }
      else lineSets.push({ sum: c, n: 1, h });
    }
    const lines = lineSets.length;
    const glyphH = Math.max(...onLine.map((r) => r.b - r.t)); // tallest inline box on the line sets the line height
    const fs = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight);
    const brs = parts.filter((p) => p.br).length;
    const centre = (l) => l.sum / l.n;
    let pitch = lines > 1 ? (centre(lineSets[lines - 1]) - centre(lineSets[0])) / (lines - 1) : lh || glyphH;
    if (lines > 1 && pitch < 0.6 * fs) pitch = lh || 1.2 * fs; // implausibly tight: line detection went wrong, trust the CSS
    const dir = cs.direction === 'rtl';
    const align = { left: 'left', right: 'right', center: 'center', justify: 'justify', start: dir ? 'right' : 'left', end: dir ? 'left' : 'right' }[cs.textAlign] || 'left';

    // Box: single-line text hugs its glyphs with slack and never wraps (so a wider
    // substitute font overflows like CSS would, instead of reflowing onto a second line).
    // Multi-line text uses the container's content box so wrapping stays comparable.
    const slack = Math.max(6, 0.03 * (u.r - u.l));
    let x, w;
    if (lines === 1 && brs === 0) {
      // slack goes on the side(s) the text can grow toward, so the anchored edge stays put
      const tw = u.r - u.l;
      x = align === 'right' ? u.l - 2 * slack : align === 'center' ? u.l - slack : u.l;
      w = tw + 2 * slack;
    } else {
      const er = rel(el.getBoundingClientRect());
      const cl = er.l + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      const cr = er.r - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
      const bl = Math.min(cl, u.l), br = Math.max(cr, u.r);
      const s = Math.max(6, 0.03 * (br - bl));
      x = align === 'right' ? bl - s : align === 'center' ? bl - s / 2 : bl;
      w = align === 'right' ? br - x : align === 'center' ? br - bl + s : br - bl + s;
    }
    const single = lines === 1 && brs === 0;
    // CSS puts half the leading above each line; PowerPoint/LibreOffice put the whole
    // exact-spacing excess above the first line.
    const y = single ? u.t : u.t - (pitch - glyphH);
    const h = single ? glyphH : lines * pitch;

    // Merge adjacent runs with identical style, normalise collapsed whitespace.
    const runs = [];
    let prevEndsSpace = true;
    parts.forEach((p, i) => {
      if (p.br) { runs.push({ br: true }); prevEndsSpace = true; return; }
      let t = p.text;
      if (p.pad) { runs.push({ text: t, style: p.style }); return; }
      if (!p.preserve) {
        if (prevEndsSpace) t = t.replace(/^ /, '');
        prevEndsSpace = t.endsWith(' ');
      } else prevEndsSpace = /\s$/.test(t);
      if (!t) return;
      const last = runs[runs.length - 1];
      const same = last && !last.br && JSON.stringify(last.style) === JSON.stringify(p.style);
      if (same) last.text += t; else runs.push({ text: t, style: p.style });
    });
    while (runs.length && !runs[runs.length - 1].br && !runs[runs.length - 1].style.highlight && !/\S/.test(runs[runs.length - 1].text)) runs.pop();
    if (runs.length && !runs[runs.length - 1].br) runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/ +$/, '');
    if (!runs.some((r) => r.text && hasText(r.text))) return;

    // preserved newlines become explicit breaks
    const flat = [];
    for (const r of runs) {
      if (r.br || !r.text.includes('\n')) { flat.push(r); continue; }
      r.text.split('\n').forEach((seg, i, arr) => {
        if (seg) flat.push({ text: seg, style: r.style });
        if (i < arr.length - 1) flat.push({ br: true });
      });
    }

    for (const e of consumedEls) consumed.add(e);
    for (const e of ownChips) chips.add(e);
    for (const n of textNodes) consumedNodes.add(n);
    blocks.push({
      x, y, w, h, align, wrap: !single,
      lineSpacingPx: single ? null : pitch,
      opacity: ctx.opacity,
      runs: flat,
    });
  };

  walk(sec, { opacity: 1, leave: '', clips: [] });

  // ---- hide extracted text in the DOM (the screenshot then shows only what remains) ----
  // Only elements whose own text was extracted are blanked. Child elements that stay in the
  // raster get their original fill/shadow pinned inline, because the fill colour inherits.
  const pin = new Map();
  for (const e of consumed) for (const c of e.children) if (!consumed.has(c)) {
    const cs = getComputedStyle(c);
    pin.set(c, [cs.webkitTextFillColor, cs.textShadow]);
  }
  for (const e of consumed) e.setAttribute('data-sw-x', '');
  for (const e of chips) e.setAttribute('data-sw-chip', '');
  for (const [c, [fill, shadow]] of pin) {
    c.style.setProperty('-webkit-text-fill-color', fill, 'important');
    c.style.setProperty('text-shadow', shadow, 'important');
  }

  // SVG text always stays in the raster; report it so the log explains what is not editable
  for (const t of sec.querySelectorAll('svg text')) {
    const str = t.textContent.replace(/\s+/g, ' ').trim();
    if (str && t.getClientRects().length) skippedText.push(`svg: ${str.slice(0, 40)}`);
  }

  // videos: where the picture sits on the slide, so the exporter can embed the file there
  const videos = [];
  for (const v of sec.querySelectorAll('video')) {
    const cs = getComputedStyle(v);
    const r = rel(v.getBoundingClientRect());
    let x = r.l, y = r.t, w = r.r - r.l, h = r.b - r.t;
    if (w < 2 || h < 2 || cs.visibility !== 'visible') continue;
    if (v.videoWidth && v.videoHeight && (cs.objectFit === 'contain' || cs.objectFit === 'scale-down')) {
      const f = Math.min(w / v.videoWidth, h / v.videoHeight);
      const cw = v.videoWidth * f, ch = v.videoHeight * f;
      x += (w - cw) / 2; y += (h - ch) / 2; w = cw; h = ch;
    }
    videos.push({ x, y, w, h, src: v.currentSrc || v.src || '' });
  }

  // notes: <aside class="notes"> or data-notes
  let notes = sec.getAttribute('data-notes') || '';
  const aside = sec.querySelector('aside.notes');
  if (aside) {
    const c = aside.cloneNode(true);
    c.querySelectorAll('br').forEach((b) => b.replaceWith('\n'));
    c.querySelectorAll('p,li,div,h1,h2,h3,h4,h5,h6,tr').forEach((b) => b.append('\n'));
    c.querySelectorAll('li').forEach((li) => li.prepend('- '));
    notes = c.textContent;
  }
  notes = notes.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();

  const hl = sec.querySelector('h1,h2,h3');
  return { blocks, videos, notes, skippedText, title: hl ? hl.textContent.replace(/\s+/g, ' ').trim() : '', width: stage.offsetWidth, height: stage.offsetHeight, scale: k };
}
