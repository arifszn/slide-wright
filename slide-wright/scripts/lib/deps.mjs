// Lazy dependency bootstrap. The skill ships no node_modules: the first export
// installs pinned packages into a per-user cache and loads them from there.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const PINNED = {
  pptxgenjs: '4.0.1',
  'playwright-core': '1.64.1',
};

export const CACHE_DIR =
  process.env.SLIDE_WRIGHT_CACHE || join(homedir(), '.cache', 'slide-wright', 'export-pptx');

// Returns a require() rooted at the cache, installing any missing packages first.
// `extra` is a { name: version } map (tests use it for reveal.js and pngjs).
export function ensureDeps(extra = {}) {
  const wanted = { ...PINNED, ...extra };
  mkdirSync(CACHE_DIR, { recursive: true });
  const req = createRequire(join(CACHE_DIR, 'noop.js'));
  const missing = Object.entries(wanted).filter(([name]) => {
    return !existsSync(join(CACHE_DIR, 'node_modules', name, 'package.json'));
  });
  if (missing.length) {
    const pkg = join(CACHE_DIR, 'package.json');
    if (!existsSync(pkg)) writeFileSync(pkg, '{"name":"slide-wright-export-cache","private":true}\n');
    console.error(`Installing ${missing.map(([n, v]) => `${n}@${v}`).join(', ')} into ${CACHE_DIR} (first run only)...`);
    execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', '--prefix', CACHE_DIR, ...missing.map(([n, v]) => `${n}@${v}`)], { stdio: ['ignore', 'inherit', 'inherit'] });
  }
  return req;
}
