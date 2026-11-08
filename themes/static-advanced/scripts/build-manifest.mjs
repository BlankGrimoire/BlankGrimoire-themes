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
    id: 'static-advanced',
    name: 'Static Advanced',
    version: '1.0.0',
    apiVersion: 1,
    detectionSignature: {
      selectors: [
        '.container-chapter-reader',
        '.panel-story-chapter-list',
        '.content-genres-item',
        '.panel-search-story'
      ],
      minScore: 7
    },
    selectors: {
      search: {
        path: '/search/story/{query}',
        item: '.panel-search-story, .content-genres-item',
        title: 'h3 a, .title a',
        link: 'a@href',
        cover: '.genres-item-img img@src, img@src'
      },
      details: {
        title: '.story-info-right h1, h1.story-title',
        cover: '.info-image img@src, .cover-image img@src',
        synopsis: '#panel-story-info-description, .description',
        authors: '.table-value a[href*="/author/"]',
        artists: '.table-value a[href*="/artist/"]',
        altTitles: '.alternative-titles, .alt-titles',
        tags: '.mgen a, .genres a',
        status: '.post-status, .status'
      },
      chapters: {
        item: '.panel-story-chapter-list a.chapter-name, .chapter-list a',
        link: 'a@href',
        title: 'a',
        date: '.chapter-release-date@datetime, .chapter-release-date, .date',
        order: 'desc'
      },
      pages: {
        strategies: [
          {
            kind: 'css',
            image: '.container-chapter-reader img, .reading-content img',
            srcAttributes: ['src', 'data-src', 'data-lazy-src']
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