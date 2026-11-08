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
    adapterId: 'wp-mangastream',
    adapterName: 'WordPress MangaStream',
    version: '1.0.0',
    apiVersion: 1,
    detectionSignature: {
      metaGenerator: 'WordPress',
      selectors: [
        '.listupd',
        '#chapterlist',
        '#readerarea',
        'ts_reader'
      ],
      minScore: 6
    },
    selectors: {
      search: {
        path: '/?s={query}',
        item: '.listupd .bsx',
        title: '.tt a, h3 a',
        link: 'a@href',
        cover: 'img@src, img@data-src'
      },
      details: {
        title: '.entry-title, h1.post-title',
        cover: '.thumb img@src, .post-thumb img@src',
        synopsis: '.entry-content, .post-content',
        authors: '.mgen a[href*="/author/"]',
        artists: '.mgen a[href*="/artist/"]',
        altTitles: '.alternative-titles, .alt-titles',
        tags: '.mgen a',
        status: '.post-status, .status'
      },
      chapters: {
        item: '#chapterlist .eph-num a, #chapterlist li a, .listing-chapters_wrap li a',
        link: 'a@href',
        title: 'a',
        date: '.chapter-release-date@datetime, .chapter-release-date, .date',
        order: 'desc'
      },
      pages: {
        strategies: [
          {
            kind: 'css',
            image: '.reading-content img, .page-break img, .page img',
            srcAttributes: ['data-src', 'data-lazy-src', 'data-original', 'src']
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