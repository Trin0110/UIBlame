import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const cli = path.resolve('packages/uiblame/dist/cli.js');

const { stdout } = await execFileAsync(
  process.execPath,
  [
    cli,
    'inspect',
    '--root', root,
    '--file', 'apps/demo/src/main.tsx',
    '--line', '17'
  ],
  { cwd: root, windowsHide: true, maxBuffer: 2 * 1024 * 1024 }
);

const result = JSON.parse(stdout);

if (result.provenance?.status !== 'verified-ai') {
  throw new Error(
    `Dogfood provenance expected verified-ai, got ${result.provenance?.status ?? 'missing'}: ${result.provenance?.reason ?? 'no reason'}`
  );
}

if (result.provenance?.record?.agent !== 'chatgpt') {
  throw new Error('Dogfood provenance did not resolve to the expected bootstrap record.');
}

console.log(
  `Dogfood provenance passed: ${result.source.file}:${result.source.line} → ${result.provenance.record.agent} (${result.provenance.status}).`
);
