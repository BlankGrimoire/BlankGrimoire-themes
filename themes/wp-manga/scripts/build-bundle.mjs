#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { buildBundle } from '@blankgrimoire/cli';

await buildBundle({
  entry: 'src/index.ts',
  outdir: 'dist',
  minify: true,
});
