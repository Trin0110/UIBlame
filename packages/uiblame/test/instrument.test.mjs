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

test('disabled plugin injects neither markers, runtime nor middleware', async () => {
  const { uiBlame } = await import(pathToFileURL(dist));
  const plugin = uiBlame({ enabled: false });
  plugin.configResolved({ root: process.cwd(), base: '/' });
  assert.equal(plugin.transform('<div />', path.resolve('App.tsx')), null);
  assert.deepEqual(plugin.transformIndexHtml(), []);
  plugin.configureServer({ middlewares: { use() { assert.fail('disabled middleware'); } } });
});

test('instrumentation preserves custom components and skips files outside the root', async () => {
  const { uiBlame } = await import(pathToFileURL(dist));
  const plugin = uiBlame();
  plugin.configResolved({ root: process.cwd(), base: '/' });
  const result = plugin.transform('<><Widget /><div data-uiblame-source="existing" /><span /></>', path.resolve('App.tsx'));
  assert.equal((result.code.match(/data-uiblame-source/g) || []).length, 2);
  assert.match(result.code, /existing/);
  assert.equal(plugin.transform('<div />', path.resolve('../outside.tsx')), null);
});
