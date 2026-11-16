#!/usr/bin/env node
// SPDX-License-Identifier: MIT

/**
 * Prepares `dist/runtime.js` for publication.
 *
 * The committed `bundle.js` keeps the `__ADAPTER_VERSION__` placeholder, so the
 * package version stays the single source of truth: a changeset bumps
 * `package.json` and the built bundle follows. The manifest generator rejects a
 * bundle whose version differs from the package.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const VERSION_PLACEHOLDER = '__ADAPTER_VERSION__';

const packageDirectory = process.cwd();
const sourcePath = join(packageDirectory, 'bundle.js');
const distDirectory = join(packageDirectory, 'dist');
const distPath = join(distDirectory, 'runtime.js');
const packagePath = join(packageDirectory, 'package.json');

const bundle = await readFile(sourcePath, 'utf8');
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));

if (!bundle.includes(VERSION_PLACEHOLDER)) {
  throw new Error(`${sourcePath}: missing ${VERSION_PLACEHOLDER}`);
}
if (typeof packageJson.version !== 'string') {
  throw new Error(`${packagePath}: missing version`);
}

await mkdir(distDirectory, { recursive: true });
await writeFile(distPath, bundle.replaceAll(VERSION_PLACEHOLDER, packageJson.version));

console.log(`Built ${packageJson.blankgrimoire?.adapterId}@${packageJson.version}`);
