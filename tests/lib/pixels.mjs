// Small PNG helpers for the visual tests.
import { ensureDeps } from '../../slide-wright/scripts/lib/deps.mjs';
import { TEST_DEPS } from './offline.mjs';
import { readFileSync } from 'node:fs';

const { PNG } = ensureDeps(TEST_DEPS)('pngjs');
export const decode = (bufOrPath) => PNG.sync.read(typeof bufOrPath === 'string' ? readFileSync(bufOrPath) : bufOrPath);

// Ink = pixels that differ from the region's dominant colour. Returns { count, cx, cy }.
export function ink(png, rect, threshold = 60) {
  const x0 = Math.max(0, Math.floor(rect.x)), y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(png.width, Math.ceil(rect.x + rect.w)), y1 = Math.min(png.height, Math.ceil(rect.y + rect.h));
  const hist = new Map();
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * png.width + x) * 4;
    const key = (png.data[i] >> 3) << 10 | (png.data[i + 1] >> 3) << 5 | (png.data[i + 2] >> 3);
    hist.set(key, (hist.get(key) || 0) + 1);
  }
  let best = 0, bestKey = 0;
  for (const [k, v] of hist) if (v > best) { best = v; bestKey = k; }
  const bg = [((bestKey >> 10) & 31) << 3, ((bestKey >> 5) & 31) << 3, (bestKey & 31) << 3];
  let count = 0, sx = 0, sy = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * png.width + x) * 4;
    const d = Math.abs(png.data[i] - bg[0]) + Math.abs(png.data[i + 1] - bg[1]) + Math.abs(png.data[i + 2] - bg[2]);
    if (d > threshold) { count++; sx += x; sy += y; }
  }
  return { count, total: (x1 - x0) * (y1 - y0), cx: count ? sx / count : NaN, cy: count ? sy / count : NaN };
}
