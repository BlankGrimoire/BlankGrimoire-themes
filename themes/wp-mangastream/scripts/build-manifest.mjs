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
    id: 'wp-mangastream',
    name: 'WordPress MangaStream',
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