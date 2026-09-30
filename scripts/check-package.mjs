import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const [pack] = JSON.parse(execFileSync(npm, ['pack', '--dry-run', '--json', '-w', 'uiblame'], { encoding: 'utf8' }));
const files = new Set(pack.files.map(file => file.path));
for (const file of ['dist/cli.js', 'dist/index.js', 'dist/index.d.ts', 'README.md', 'LICENSE', 'package.json']) {
  assert.ok(files.has(file), `Package missing ${file}`);
}
assert.ok([...files].every(file => file.startsWith('dist/') || ['README.md', 'LICENSE', 'package.json'].includes(file)), 'Unexpected package contents');
console.log(`Package dry-run passed: ${[...files].join(', ')}`);
