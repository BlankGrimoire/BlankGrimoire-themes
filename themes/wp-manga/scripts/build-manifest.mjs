#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildManifest } from '@blankgrimoire/cli';

const bundle = await readFile('dist/runtime.js');
const sha256 = createHash('sha256').update(bundle).digest('hex');
const detectionSignature = JSON.parse(await readFile('detection.json', 'utf8'));

await buildManifest({
  id: 'theme.wp-manga',
  name: 'WordPress Content Theme',
  version: '1.0.0',
  detectionSignature,
  sha256,
  outFile: 'dist/manifest.json',
});
