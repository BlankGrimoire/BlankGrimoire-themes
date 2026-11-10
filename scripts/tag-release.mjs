#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverAdapterPackages } from './adapter-package.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const adapters = await discoverAdapterPackages(join(root, 'themes'));

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], {
  cwd: root,
  stdio: 'inherit',
});
execFileSync(
  'git',
  ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'],
  { cwd: root, stdio: 'inherit' },
);

const existingTags = new Set(
  execFileSync('git', ['tag', '--list'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean),
);

const created = [];
for (const adapter of adapters) {
  const tag = `${adapter.id}@${adapter.version}`;
  if (existingTags.has(tag)) {
    console.log(`Tag already exists: ${tag}`);
    continue;
  }
  execFileSync('git', ['tag', tag], { cwd: root, stdio: 'inherit' });
  created.push(tag);
}

if (created.length === 0) {
  console.log('No new adapter tags to publish.');
  process.exit(0);
}

for (const tag of created) {
  execFileSync('git', ['push', 'origin', tag], { cwd: root, stdio: 'inherit' });
}

console.log(`Created ${created.length} adapter tag(s): ${created.join(', ')}`);
