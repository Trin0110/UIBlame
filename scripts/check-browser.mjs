import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// Run against `npm run dev`; temporary source/store edits are always restored.
const url = process.env.UIBLAME_DEMO_URL || 'http://localhost:5173';
const sourceFile = new URL('../apps/demo/src/main.tsx', import.meta.url);
const storeFile = new URL('../.uiblame/provenance.jsonl', import.meta.url);
const originalSource = await readFile(sourceFile, 'utf8');
const originalStore = await readFile(storeFile, 'utf8');
const browser = await chromium.launch({ executablePath: process.env.UIBLAME_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const panel = page.locator('#uiblame-root .panel');
const pill = panel.locator('.pill');
async function inspect(selector, status, keyboard = false) {
  await page.keyboard.press('Escape');
  if (keyboard) await page.keyboard.press('Alt+Shift+B');
  else await page.getByRole('button', { name: '◎ UIBlame' }).click();
  await page.locator(selector).click();
  await pill.getByText(status, { exact: true }).waitFor();
}
try {
  await page.goto(url);
  await inspect('h1', 'Verified AI');
  assert.equal(await page.locator('h1').getAttribute('data-uiblame-source'), 'apps/demo/src/main.tsx|19|9');
  assert.match(await panel.innerText(), /bootstrap-v0.1/);
  assert.match(await panel.innerText(), /SHA-256/);
  assert.match(await panel.innerText(), /Commit\n[a-f0-9]{10}\nAuthor\n[^—]/);
  await panel.getByText('Git diff', { exact: true }).click();
  assert.match(await panel.locator('pre').innerText(), /diff --git/);
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await page.screenshot({ path: new URL('../artifacts/verified-ai.png', import.meta.url).pathname });

  await inspect('.nav strong', 'Unknown', true);
  assert.match(await panel.innerText(), /Unknown does not mean human-written/);
  await page.keyboard.press('Escape');
  assert.equal(await panel.isVisible(), false);

  // A click without a preceding mousemove must select the clicked source.
  await page.keyboard.press('Alt+Shift+B');
  await page.locator('h1').evaluate(el => el.click());
  await pill.getByText('Verified AI', { exact: true }).waitFor();
  await panel.getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(await panel.isVisible(), false);

  // Slow earlier responses must not replace the evidence for a later selection.
  let releaseFirst;
  const firstPending = new Promise(resolve => { releaseFirst = resolve; });
  let first = true;
  await page.route('**/__uiblame/api/inspect?*', async route => {
    if (first) { first = false; await firstPending; }
    await route.continue();
  });
  await page.keyboard.press('Alt+Shift+B');
  await page.locator('h1').click();
  await panel.getByText('Tracing this pixel…').waitFor();
  await inspect('.nav strong', 'Unknown');
  const oldResponse = page.waitForResponse(response => response.url().includes('main.tsx%7C19%7C9'));
  releaseFirst();
  await oldResponse;
  await page.unrouteAll({ behavior: 'wait' });
  assert.equal(await pill.innerText(), 'Unknown');

  await writeFile(sourceFile, originalSource.replace('Click any pixel.', 'Changed after recording.'));
  await page.reload();
  await page.getByRole('heading', { name: /Changed after recording/ }).waitFor();
  await inspect('h1', 'Recorded AI');
  await page.screenshot({ path: new URL('../artifacts/recorded-ai.png', import.meta.url).pathname });
  assert.match(await panel.innerText(), /uncommitted changes/);
  await writeFile(sourceFile, originalSource);
  await writeFile(storeFile, originalStore + '\nnot-json\nnull\n{}\n');
  await page.reload();
  await inspect('h1', 'Verified AI');
  assert.deepEqual(errors, []);
  console.log('Chromium passed: source marker → endpoint → Git metadata/diff → Verified AI; Unknown; Recorded AI; malformed-store recovery; keyboard, click-only, close and stale-response handling.');
} finally {
  await writeFile(sourceFile, originalSource);
  await writeFile(storeFile, originalStore);
  await browser.close();
}
