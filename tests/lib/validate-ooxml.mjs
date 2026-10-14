// Independent structural validator for the .pptx files this exporter writes.
// Written from the OPC (ECMA-376 part 2) and PresentationML rules; it is not a full XSD
// validation. It exists to catch what XML-level tests miss: a package PowerPoint would
// call corrupt (dangling relationships, parts without a content type, bad colour values).
//
// Deliberately NOT checked: the order of children in <p:presentation>. pptxgenjs writes
// <p:notesMasterIdLst> after <p:sldIdLst>, which the schema forbids but PowerPoint accepts;
// "fixing" the order is known to make decks unopenable.
import { ensureDeps } from '../../slide-wright/scripts/lib/deps.mjs';
import { TEST_DEPS } from './offline.mjs';

const req = ensureDeps(TEST_DEPS);
const JSZip = req('jszip');
const { DOMParser } = req('@xmldom/xmldom');

const dirname = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
const resolvePart = (fromPart, target) => {
  if (target.startsWith('/')) return target.slice(1);
  const out = dirname(fromPart) ? dirname(fromPart).split('/') : [];
  for (const seg of target.split('/')) {
    if (seg === '..') out.pop();
    else if (seg !== '.' && seg !== '') out.push(seg);
  }
  return out.join('/');
};
const relsFor = (part) => `${dirname(part)}${dirname(part) ? '/' : ''}_rels/${part.split('/').pop()}.rels`;
const ENUM_ALGN = new Set(['l', 'ctr', 'r', 'just', 'justLow', 'dist', 'thaiDist']);

/** @returns {Promise<string[]>} human-readable problems; empty means no problem found */
export async function validatePptx(buffer) {
  const errors = [];
  const err = (m) => errors.push(m);
  let zip;
  try { zip = await JSZip.loadAsync(buffer); } catch (e) { return [`not a zip archive: ${e.message}`]; }
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const nameSet = new Set(names);
  const text = new Map();
  for (const n of names) if (/\.(xml|rels)$/.test(n)) text.set(n, await zip.file(n).async('string'));

  // 1. every XML part is well-formed
  for (const [n, xml] of text) {
    const problems = [];
    try {
      new DOMParser({ onError: (level, msg) => { if (level !== 'warning') problems.push(msg); } }).parseFromString(xml, 'text/xml');
    } catch (e) { problems.push(e.message); }
    if (problems.length) err(`${n}: not well-formed XML (${problems[0].split('\n')[0]})`);
  }

  // 2. content types cover every part, overrides point at real parts
  const ct = text.get('[Content_Types].xml');
  if (!ct) err('[Content_Types].xml is missing');
  else {
    const defaults = new Set([...ct.matchAll(/<Default\s[^>]*Extension="([^"]+)"/g)].map((m) => m[1].toLowerCase()));
    const overrides = new Set([...ct.matchAll(/<Override\s[^>]*PartName="([^"]+)"/g)].map((m) => m[1].slice(1)));
    for (const o of overrides) if (!nameSet.has(o)) err(`[Content_Types].xml overrides ${o}, which is not in the package`);
    for (const n of names) {
      if (n === '[Content_Types].xml') continue;
      // PresentationML parts must have their own Override: the generic xml Default would give them the wrong type
      const needsOverride = /^ppt\/(slides|notesSlides|slideLayouts|slideMasters|notesMasters|theme)\/[^/]+\.xml$/.test(n) || /^(ppt\/presentation|docProps\/(core|app))\.xml$/.test(n);
      if (!overrides.has(n) && (needsOverride || !defaults.has(n.split('.').pop().toLowerCase()))) err(`${n} has no content type`);
    }
  }

  // 3. relationships: unique ids, targets exist
  const rels = new Map(); // part -> Map(id -> {target, type})
  for (const [n, xml] of text) {
    if (!n.endsWith('.rels')) continue;
    const owner = n.replace(/(^|\/)_rels\//, '$1').replace(/\.rels$/, '');
    if (owner && !nameSet.has(owner) && owner !== '') err(`${n} belongs to ${owner}, which is not in the package`);
    const map = new Map();
    for (const m of xml.matchAll(/<Relationship\s([^>]*?)\/?>/g)) {
      const attr = (k) => (m[1].match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
      const id = attr('Id'), target = attr('Target'), mode = attr('TargetMode');
      if (map.has(id)) err(`${n}: duplicate relationship id ${id}`);
      map.set(id, { target, type: attr('Type') });
      if (mode !== 'External' && target) {
        const abs = resolvePart(owner, target);
        if (!nameSet.has(abs)) err(`${n}: ${id} targets ${abs}, which is not in the package`);
      }
    }
    rels.set(owner, map);
  }
  const relOf = (part, id) => (rels.get(part) || new Map()).get(id);

  // 4. presentation: slide list ↔ relationships ↔ slide parts
  const pres = text.get('ppt/presentation.xml');
  const slideParts = names.filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  if (!pres) err('ppt/presentation.xml is missing');
  else {
    const listed = [];
    const ids = [];
    for (const m of pres.matchAll(/<p:sldId\s[^>]*?id="(\d+)"[^>]*?r:id="([^"]+)"/g)) {
      ids.push(+m[1]);
      const r = relOf('ppt/presentation.xml', m[2]);
      if (!r) err(`presentation.xml: sldId points at unknown relationship ${m[2]}`);
      else listed.push(resolvePart('ppt/presentation.xml', r.target));
    }
    if (new Set(ids).size !== ids.length) err('presentation.xml: duplicate slide ids');
    if (ids.some((i) => i < 256 || i > 2147483647)) err('presentation.xml: slide id outside 256..2147483647');
    for (const p of slideParts) if (!listed.includes(p)) err(`${p} exists but is not in <p:sldIdLst>`);
    for (const p of listed) if (!nameSet.has(p)) err(`<p:sldIdLst> lists ${p}, which is missing`);
    if (new Set(listed).size !== listed.length) err('presentation.xml: a slide is listed twice');
    const sz = pres.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
    if (!sz) err('presentation.xml: <p:sldSz> missing');
    else if (+sz[1] < 914400 || +sz[2] < 914400 || +sz[1] > 51206400 || +sz[2] > 51206400) err(`presentation.xml: slide size ${sz[1]}x${sz[2]} EMU outside the 1in..56in range`);
  }

  // 5. per-slide content
  const slideSize = pres && pres.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
  for (const part of slideParts) {
    const xml = text.get(part);
    const ridRefs = [...xml.matchAll(/\sr:(?:embed|id|link)="([^"]+)"/g)].map((m) => m[1]);
    for (const id of ridRefs) if (!relOf(part, id)) err(`${part}: references relationship ${id}, which is not declared`);

    const shapeIds = [...xml.matchAll(/<p:cNvPr\s[^>]*?\bid="(\d+)"/g)].map((m) => m[1]);
    if (new Set(shapeIds).size !== shapeIds.length) err(`${part}: duplicate shape ids`);

    for (const m of xml.matchAll(/<a:srgbClr\s+val="([^"]*)"/g)) if (!/^[0-9A-Fa-f]{6}$/.test(m[1])) err(`${part}: invalid colour "${m[1]}" (hex must be 6 digits, no #, no alpha)`);
    for (const m of xml.matchAll(/<a:alpha\s+val="(-?\d+)"/g)) if (+m[1] < 0 || +m[1] > 100000) err(`${part}: alpha ${m[1]} outside 0..100000`);
    for (const m of xml.matchAll(/<a:rPr\b[^>]*?\ssz="(-?\d+)"/g)) if (+m[1] < 100 || +m[1] > 400000) err(`${part}: font size ${m[1]} outside 100..400000`);
    for (const m of xml.matchAll(/\sspc="(-?\d+)"/g)) if (Math.abs(+m[1]) > 200000) err(`${part}: character spacing ${m[1]} out of range`);
    for (const m of xml.matchAll(/<a:spcPts\s+val="(-?\d+)"/g)) if (+m[1] < 0 || +m[1] > 158400) err(`${part}: spacing ${m[1]} outside 0..158400`);
    for (const m of xml.matchAll(/<a:pPr\b[^>]*?\salgn="([^"]*)"/g)) if (!ENUM_ALGN.has(m[1])) err(`${part}: unknown alignment "${m[1]}"`);
    for (const m of xml.matchAll(/<a:ext\s+cx="(-?\d+)"\s+cy="(-?\d+)"/g)) if (+m[1] < 0 || +m[2] < 0) err(`${part}: negative shape extent`);
    if (/<a:t>[^<]*\u0000/.test(xml)) err(`${part}: NUL character in text`);
    if (slideSize) {
      for (const m of xml.matchAll(/<a:off\s+x="(-?\d+)"\s+y="(-?\d+)"\/><a:ext\s+cx="(\d+)"\s+cy="(\d+)"/g)) {
        const [x, y, w, h] = m.slice(1).map(Number);
        if (w > 0 && (x > +slideSize[1] || y > +slideSize[2] || x + w < 0 || y + h < 0)) err(`${part}: a shape lies completely outside the slide`);
      }
    }
    // text that needs xml:space="preserve" to survive any XML consumer
    for (const m of xml.matchAll(/<a:t(\s[^>]*)?>([^<]*)<\/a:t>/g)) {
      if (/^\s|\s$/.test(m[2]) && !/xml:space="preserve"/.test(m[1] || '')) err(`${part}: run "${m[2].slice(0, 20)}" has leading/trailing whitespace but no xml:space="preserve"`);
    }
  }

  // 6. media referenced from slides must be real images
  for (const n of names.filter((x) => x.startsWith('ppt/media/') && x.endsWith('.png'))) {
    const head = await zip.file(n).async('nodebuffer');
    if (head.length < 8 || head.readUInt32BE(0) !== 0x89504e47) err(`${n} is not a PNG`);
  }

  // 7. notes pages point at a slide and a notes master that exist
  for (const n of names.filter((x) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(x))) {
    const r = rels.get(n);
    if (!r) { err(`${n} has no relationships`); continue; }
    const types = [...r.values()].map((v) => v.type.split('/').pop());
    if (!types.includes('slide')) err(`${n} does not link back to a slide`);
    if (!types.includes('notesMaster')) err(`${n} does not link to a notes master`);
  }
  return errors;
}
