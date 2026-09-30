import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dist = path.resolve('packages/uiblame/dist/index.js');

test('package build exists and exports uiBlame', async () => {
  await readFile(dist, 'utf8');
  const mod = await import(pathToFileURL(dist));
  assert.equal(typeof mod.uiBlame, 'function');
});
