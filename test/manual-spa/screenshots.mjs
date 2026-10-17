import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const requiredScreenshots = ['radar', 'std-management'].flatMap(view => ['en', 'bn'].flatMap(lang => [
  { view, lang, layout: 'desktop', width: 1440, height: 1000 },
  { view, lang, layout: 'mobile', width: 390, height: 844 },
].map(item => ({ ...item, file: `${view}-${lang}-${item.layout}.png` }))));

export function validateVisualManifest(visual, sourceRevision, runId) {
  assert.equal(visual.sourceRevision, sourceRevision);
  assert.equal(visual.runId, runId);
  assert.equal(visual.captures.length, requiredScreenshots.length);
  assert.deepEqual(visual.captures.map(c => c.file).sort(), requiredScreenshots.map(c => c.file).sort());
  for (const expected of requiredScreenshots) {
    const capture = visual.captures.find(c => c.file === expected.file);
    for (const [key, value] of Object.entries(expected)) assert.equal(capture[key], value);
    assert.match(capture.sha256, /^[a-f0-9]{64}$/);
  }
}

export async function captureSyntheticView(page, directory, visual, view, lang) {
  assert.equal(new URL(page.url()).origin, 'http://127.0.0.1:4179');
  const output = path.join(directory, 'screenshots');
  await mkdir(output, { recursive: true });
  for (const item of requiredScreenshots.filter(c => c.view === view && c.lang === lang)) {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    // DOM-only screenshots after dialogs close. Accounts and documents are
    // seeded synthetics; never capture DevTools, token URLs or browser profiles.
    const bytes = await page.screenshot({ fullPage: true, animations: 'disabled' });
    await writeFile(path.join(output, item.file), bytes);
    visual.captures.push({ ...item, sha256: createHash('sha256').update(bytes).digest('hex') });
    await writeFile(path.join(output, 'manifest.json'), JSON.stringify(visual, null, 2));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}
