// SPDX-License-Identifier: MIT

import { buildManifest } from '@blankgrimoire/cli';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

async function main() {
  const bundle = await readFile(join(distDir, 'runtime.js'));
  const sha256 = createHash('sha256').update(bundle).digest('hex');
  
  await buildManifest({
    id: 'spa-nextjs',
    name: 'SPA Next.js',
    version: '1.0.0',
    apiVersion: 1,
    detectionSignature: {
      selectors: [
        '#__NEXT_DATA__',
        'script[id="__NEXT_DATA__"]'
      ],
      minScore: 9
    },
    selectors: {
      search: {
        path: '/series?title={query}',
        item: '',
        title: '',
        link: '',
        cover: ''
      },
      details: {
        title: '',
        cover: '',
        synopsis: '',
        authors: '',
        artists: '',
        altTitles: '',
        tags: '',
        status: ''
      },
      chapters: {
        item: '',
        link: '',
        title: '',
        date: '',
        order: 'desc'
      },
      pages: {
        strategies: [
          {
            kind: 'css',
            image: '',
            srcAttributes: []
          }
        ]
      },
      attribution: {
        logo: null,
        credits: null
      }
    },
    sha256,
    bundleSize: bundle.length,
    outFile: join(distDir, 'manifest.json')
  });
  
  console.log('Manifest built successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});