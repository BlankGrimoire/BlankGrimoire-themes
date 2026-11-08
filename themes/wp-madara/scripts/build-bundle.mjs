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
    adapterId: 'wp-madara',
    adapterName: 'WordPress Madara',
    version: '1.0.0',
    apiVersion: 1,
    detectionSignature: {
      metaGenerator: 'Madara',
      selectors: [
        '.page-item-detail',
        '.wp-manga',
        '.manga_get_chapters',
        '.c-tabs-item__content',
        '.summary_image',
        '.post-title'
      ],
      minScore: 7
    },
    selectors: {
      search: {
        path: '/?s={query}&post_type=wp-manga',
        item: '.c-tabs-item__content, .page-item-detail',
        title: 'h3 a, .post-title a, .title a',
        link: 'a@href',
        cover: 'img@data-src, img@data-lazy-src, img@src'
      },
      details: {
        title: '.post-title h1, h1.entry-title',
        cover: '.summary_image img@data-src, .summary_image img@data-lazy-src, .post-thumb img@src',
        synopsis: '.summary__content, .description-summary, .manga-excerpt',
        authors: '.author-content a, .manga-author a',
        artists: '.artist-content a, .manga-artist a',
        altTitles: '.alternative-titles .summary-content, .alt-titles',
        tags: '.genres-content a, .manga-genres a',
        status: '.post-status .summary-content, .manga-status'
      },
      chapters: {
        item: '.wp-manga-chapter, .chapter-item, li.wp-manga-chapter',
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