import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const claims = JSON.parse(readFileSync(resolve(root, '.factory/claims.json'), 'utf8'));
const tests = readdirSync(resolve(root, 'tests')).filter(file => file.endsWith('.ts')).map(file => readFileSync(resolve(root, 'tests', file), 'utf8')).join('\n');
const ids = new Set();

for (const claim of claims) {
  if (!claim.id || !claim.claim || !claim.where || !claim.test || !claim.sandbox) throw new Error(`Claim entry is incomplete: ${JSON.stringify(claim)}`);
  if (ids.has(claim.id)) throw new Error(`Duplicate claim id: ${claim.id}`);
  ids.add(claim.id);
  const tag = `@claim:${claim.id}`;
  const occurrences = tests.split(tag).length - 1;
  if (occurrences !== 1) throw new Error(`${tag} must appear in exactly one outcome test; found ${occurrences}`);
  if (!claim.test.includes(tag)) throw new Error(`${claim.id} command does not select its tagged test`);
}

for (const tag of tests.match(/@claim:[a-z0-9-]+/g) || []) {
  if (!ids.has(tag.slice(7))) throw new Error(`Unregistered test tag: ${tag}`);
}

console.log(`Claims registry checks passed (${claims.length} public claims, one outcome test each).`);
