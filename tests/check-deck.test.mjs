// Tests for slide-wright/scripts/check-deck.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkDeck } from '../slide-wright/scripts/check-deck.mjs';
import { offlineRoute } from './lib/offline.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'sw-check-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

// basic.html has one deliberately clipped sentence (slide 6); everything else is clean.
test('clean deck: only the deliberately clipped sentence is reported, contact sheet written', async () => {
  const sheet = join(tmp, 'sheet.png');
  const r = await checkDeck({ input: join(here, 'fixtures/basic.html'), sheet, route: offlineRoute() });
  assert.ok(r.slides > 0);
  assert.deepEqual(r.defects, ['slide 6: clipped content: p']);
  assert.ok(existsSync(sheet));
});

test('broken deck: reports off-frame and undersized text per slide', async () => {
  const html = readFileSync(join(here, 'fixtures/basic.html'), 'utf8').replace('<h2 class="action-title">', '<h2 class="action-title" style="position:relative;left:1200px;font-size:12px">');
  const input = join(tmp, 'broken.html');
  writeFileSync(input, html);
  const r = await checkDeck({ input, route: offlineRoute() });
  assert.ok(r.defects.some((d) => /^slide \d+: outside frame/.test(d)), r.defects.join('\n'));
  assert.ok(r.defects.some((d) => /below 18px/.test(d)), r.defects.join('\n'));
});
