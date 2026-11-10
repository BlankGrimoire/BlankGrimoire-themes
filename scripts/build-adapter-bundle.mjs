#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildBundle } from '@blankgrimoire/cli';
import { readAdapterPackage } from './adapter-package.mjs';

const VERSION_PLACEHOLDER = '__ADAPTER_VERSION__';
const packageDirectory = process.cwd();
const adapter = await readAdapterPackage(packageDirectory);
const outFile = await buildBundle({
  entry: join(packageDirectory, 'src', 'index.ts'),
  outdir: join(packageDirectory, 'dist'),
  minify: true,
});

const bundled = await readFile(outFile, 'utf8');
if (!bundled.includes(VERSION_PLACEHOLDER)) {
  throw new Error(
    `${packageDirectory}: bundle does not contain ${VERSION_PLACEHOLDER}; declare it in src/index.ts`,
  );
}

await writeFile(outFile, bundled.replaceAll(VERSION_PLACEHOLDER, adapter.version));
console.log(`Built ${adapter.id}@${adapter.version}`);
