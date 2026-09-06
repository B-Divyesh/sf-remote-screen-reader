import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const claims = JSON.parse(readFileSync(resolve(root, '.factory/claims.json'), 'utf8'));

for (const claim of claims) {
  console.log(`\n[claim ${claim.id}] ${claim.claim}`);
  const result = spawnSync(claim.test, { cwd: root, shell: true, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`\nAll ${claims.length} declared claim commands passed.`);
