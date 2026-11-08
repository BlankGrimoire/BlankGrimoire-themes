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
    adapterId: 'static-advanced',
    adapterName: 'Static Advanced',
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
    }
  });
  
  console.log('Bundle built successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});