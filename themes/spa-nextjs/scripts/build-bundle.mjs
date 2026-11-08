// SPDX-License-Identifier: MIT

import { buildBundle } from '@blankgrimoire/cli';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');
const distDir = join(__dirname, '..', 'dist');

async function main() {
  await buildBundle({
    entry: join(srcDir, 'index.ts'),
    outdir: distDir,
    adapterId: 'spa-nextjs',
    adapterName: 'SPA Next.js',
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
    }
  });
  
  console.log('Bundle built successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});