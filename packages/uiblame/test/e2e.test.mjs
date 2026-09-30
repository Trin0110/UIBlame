import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const cli = path.resolve('dist/cli.js');

async function runNode(args, cwd) {
  return execFileAsync(process.execPath, [cli, ...args], {
    cwd,
    windowsHide: true,
    maxBuffer: 2 * 1024 * 1024
  });
}

async function runGit(cwd, args) {
  return execFileAsync('git', ['-C', cwd, ...args], {
    windowsHide: true,
    maxBuffer: 2 * 1024 * 1024
  });
}

test('CLI records and verifies provenance without storing raw prompt by default', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'uiblame-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, 'src'), { recursive: true });
  await writeFile(
    path.join(root, 'src', 'App.tsx'),
    '<button type="button">AI assisted</button>\n<div>Unknown line</div>\n',
    'utf8'
  );

  await runGit(root, ['init']);
  await runGit(root, ['config', 'user.name', 'UIBlame Test']);
  await runGit(root, ['config', 'user.email', 'uiblame@example.test']);
  await runGit(root, ['add', '.']);
  await runGit(root, ['commit', '-m', 'fixture']);

  await runNode(
    [
      'record',
      '--root', root,
      '--file', 'src/App.tsx',
      '--lines', '1',
      '--agent', 'codex',
      '--session', 'test-session',
      '--prompt', 'private prompt text'
    ],
    root
  );

  const recordText = await readFile(path.join(root, '.uiblame', 'provenance.jsonl'), 'utf8');
  const record = JSON.parse(recordText.trim());

  assert.equal(record.agent, 'codex');
  assert.equal(record.session, 'test-session');
  assert.equal(record.prompt, undefined);
  assert.match(record.promptHash, /^[a-f0-9]{64}$/);
  assert.match(record.contentHash, /^[a-f0-9]{64}$/);

  const verified = await runNode(
    ['inspect', '--root', root, '--file', 'src/App.tsx', '--line', '1'],
    root
  );
  const verifiedResult = JSON.parse(verified.stdout);
  assert.equal(verifiedResult.provenance.status, 'verified-ai');

  const unknown = await runNode(
    ['inspect', '--root', root, '--file', 'src/App.tsx', '--line', '2'],
    root
  );
  const unknownResult = JSON.parse(unknown.stdout);
  assert.equal(unknownResult.provenance.status, 'unknown');

  await writeFile(
    path.join(root, 'src', 'App.tsx'),
    '<button type="button">Changed after record</button>\n<div>Unknown line</div>\n',
    'utf8'
  );

  const changed = await runNode(
    ['inspect', '--root', root, '--file', 'src/App.tsx', '--line', '1'],
    root
  );
  const changedResult = JSON.parse(changed.stdout);
  assert.equal(changedResult.provenance.status, 'recorded-ai');
});

test('CLI rejects source paths outside the project root', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'uiblame-safe-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeFile(path.join(path.dirname(root), 'uiblame-outside.txt'), 'secret', 'utf8');

  await assert.rejects(
    runNode(
      ['record', '--root', root, '--file', '../uiblame-outside.txt', '--lines', '1', '--agent', 'codex'],
      root
    ),
    /Source path escapes the project root/
  );
});
