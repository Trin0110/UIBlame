import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dist = path.resolve('dist/index.js');

test('package exports uiBlame', async () => {
  const mod = await import(pathToFileURL(dist));
  assert.equal(typeof mod.uiBlame, 'function');
});

test('Vite transform injects a source marker into native JSX elements', async () => {
  const mod = await import(pathToFileURL(dist));
  const root = path.resolve('.');
  const plugin = mod.uiBlame();

  plugin.configResolved({ root });

  const id = path.join(root, 'src', 'Example.tsx');
  const result = await plugin.transform('<button type="button">Hello</button>', id);

  assert.ok(result && typeof result.code === 'string');
  assert.match(result.code, /data-uiblame-source/);
  assert.match(result.code, /src\/Example\.tsx\|1\|1/);
});

test('plugin is dev-server only', async () => {
  const mod = await import(pathToFileURL(dist));
  assert.equal(mod.uiBlame().apply, 'serve');
});
