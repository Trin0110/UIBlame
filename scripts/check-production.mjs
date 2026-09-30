import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('apps/demo/dist');
const forbidden = [
  'data-uiblame-source',
  '/__uiblame/api/inspect',
  'uiblame-root',
  '◎ UIBlame'
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(?:html|js|mjs|css|map)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const files = await walk(dist);
for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const marker of forbidden) {
    if (content.includes(marker)) {
      throw new Error(`Production build leaked UIBlame dev marker "${marker}" in ${path.relative(process.cwd(), file)}`);
    }
  }
}

console.log(`Production build check passed across ${files.length} text asset(s).`);
