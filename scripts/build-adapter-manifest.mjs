#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { buildManifest } from '@blankgrimoire/cli';
import { readAdapterPackage } from './adapter-package.mjs';

function readBundledAdapter(bundle) {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  runInNewContext(bundle, sandbox, { timeout: 1_000 });
  const exported = sandbox.BlankGrimoireRuntime;
  return exported?.default ?? exported?.adapter ?? exported;
}

function assertSame(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: bundle has ${actual}, expected ${expected}`);
  }
}

const packageDirectory = process.cwd();
const adapter = await readAdapterPackage(packageDirectory);
const bundle = await readFile(join(packageDirectory, 'dist', 'runtime.js'));
const detectionSignature = JSON.parse(
  await readFile(join(packageDirectory, 'detection.json'), 'utf8'),
);
const bundledAdapter = readBundledAdapter(bundle.toString('utf8'));

if (!bundledAdapter || typeof bundledAdapter !== 'object') {
  throw new Error(`${packageDirectory}: bundle does not export an adapter object`);
}

assertSame('id', bundledAdapter.id, adapter.id);
assertSame('name', bundledAdapter.name, adapter.name);
assertSame('version', bundledAdapter.version, adapter.version);
assertSame('apiVersion', bundledAdapter.apiVersion, 1);

if (
  JSON.stringify(bundledAdapter.detectionSignature) !==
  JSON.stringify(detectionSignature)
) {
  throw new Error(
    `${packageDirectory}: detection.json does not match src/index.ts detectionSignature`,
  );
}

await buildManifest({
  id: adapter.id,
  name: adapter.name,
  version: adapter.version,
  detectionSignature,
  sha256: createHash('sha256').update(bundle).digest('hex'),
  outFile: join(packageDirectory, 'dist', 'manifest.json'),
});

console.log(`Manifest ${adapter.id}@${adapter.version}`);
