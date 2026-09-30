import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { uiBlame } from '../dist/index.js';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';

const repo = path.resolve('../..');

test('real Vite demo resolves repository provenance with a nested base', async (t) => {
  const server = await createServer({
    optimizeDeps: { noDiscovery: true, include: [] }, configFile: false, root: path.join(repo, 'apps/demo'), base: '/demo/',
    plugins: [uiBlame({ root: '../..' })],
    server: { host: '127.0.0.1', port: 0 },
  });
  t.after(() => server.close());
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const html = await (await fetch(`${origin}/demo/`)).text();
  assert.match(html, /data-uiblame-runtime/);
  assert.match(html, /\/demo\/__uiblame\/api\/inspect/);
  const source = await (await fetch(`${origin}/demo/src/main.tsx`)).text();
  assert.match(source, /apps\/demo\/src\/main.tsx\|17\|7/);
  for (const [line, status] of [[17, 'verified-ai'], [9, 'unknown']]) {
    const response = await fetch(`${origin}/demo/__uiblame/api/inspect?source=${encodeURIComponent(`apps/demo/src/main.tsx|${line}|1`)}`);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.provenance.status, status);
    assert.match(result.git.commit, /^[a-f0-9]{40,64}$/);
    assert.ok(result.git.author);
    assert.ok(result.git.diff);
  }
});

test('middleware rejects unsafe paths and malformed markers, survives malformed provenance', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'uiblame-server-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.uiblame'));
  await writeFile(path.join(root, 'App.tsx'), '<div>hello</div>\n');
  await writeFile(path.join(root, '.uiblame/provenance.jsonl'), 'broken\nnull\n{}\n{"schemaVersion":1}\n');
  await symlink(os.tmpdir(), path.join(root, 'linked'), 'dir');
  await symlink(path.join(root, 'App.tsx'), path.join(root, 'alias.tsx'));
  const server = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, configFile: false, root, plugins: [uiBlame()], server: { host: '127.0.0.1', port: 0 } });
  t.after(() => server.close());
  await server.listen();
  const endpoint = `http://127.0.0.1:${server.httpServer.address().port}/__uiblame/api/inspect?source=`;
  for (const marker of ['', 'App.tsx|0|1', 'App.tsx|1.5|1', 'App.tsx|1|Infinity', '../secret|1|1', `${root}/App.tsx|1|1`, 'alias.tsx|1|1', `linked/${path.basename(root)}/App.tsx|1|1`]) {
    const response = await fetch(endpoint + encodeURIComponent(marker));
    assert.equal(response.status, 400, marker);
    assert.ok((await response.json()).error);
  }
  const result = await (await fetch(endpoint + encodeURIComponent('App.tsx|1|1'))).json();
  assert.equal(result.provenance.status, 'unknown');
  assert.equal(result.git.available, false);
});
