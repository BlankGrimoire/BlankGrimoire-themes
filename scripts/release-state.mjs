#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverAdapterPackages } from './adapter-package.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const adapters = await discoverAdapterPackages(join(root, 'themes'));
const tags = new Set(
  execFileSync('git', ['tag', '--list'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean),
);

const pending = adapters.filter(
  (adapter) => !tags.has(`${adapter.id}@${adapter.version}`),
);

for (const adapter of pending) {
  console.log(`Pending release: ${adapter.id}@${adapter.version}`);
}

if (pending.length === 0) {
  console.log('All adapter versions are already tagged; nothing to release.');
} else {
  console.log(`${pending.length} adapter release(s) pending.`);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `has_release=${pending.length > 0}\nrelease_count=${pending.length}\n`,
  );
}

if (process.argv.includes('--require-release') && pending.length === 0) {
  process.exitCode = 1;
}
