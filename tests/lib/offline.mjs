// Serves the reveal.js CDN URLs from the locally installed package so tests need no network.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDeps, CACHE_DIR } from '../../slide-wright/scripts/lib/deps.mjs';

export const TEST_DEPS = { 'reveal.js': '5.1.0', pngjs: '7.0.0', '@xmldom/xmldom': '0.9.12' };

// allowFonts: let Fontshare/Google font requests through (for the web-font test)
export function offlineRoute({ allowFonts = false } = {}) {
  ensureDeps(TEST_DEPS);
  const root = join(CACHE_DIR, 'node_modules', 'reveal.js');
  const types = { '.js': 'text/javascript', '.css': 'text/css' };
  return async (page) => {
    await page.route(/cdn\.jsdelivr\.net\/npm\/reveal\.js@5\.1\.0\//, (route) => {
      const rel = new URL(route.request().url()).pathname.replace(/^\/npm\/reveal\.js@5\.1\.0\//, '');
      const file = join(root, rel);
      if (!existsSync(file)) return route.fulfill({ status: 404, body: '' });
      const ext = file.slice(file.lastIndexOf('.'));
      return route.fulfill({ status: 200, contentType: types[ext] || 'application/octet-stream', body: readFileSync(file) });
    });
    // everything else is blocked unless fonts are allowed: most fixtures use system fonts only
    const allowed = allowFonts ? /^https?:\/\/(cdn\.jsdelivr\.net|api\.fontshare\.com|cdn\.fontshare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/ : /^https?:\/\/cdn\.jsdelivr\.net/;
    await page.route(/^https?:\/\//, (route) => (allowed.test(route.request().url()) ? route.fallback() : route.abort()));
  };
}
