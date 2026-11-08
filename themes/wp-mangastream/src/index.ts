// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';
import type { ThemeHooks } from '@blankgrimoire/types';

/**
 * WordPress MangaStream Theme Adapter
 * 
 * Generic adapter for sites using the MangaStream WordPress theme.
 * Features static HTML chapters list and JSON reader via ts_reader.run().
 */

const hooks: ThemeHooks = {
  async getPages(ctx, mangaKey, chapterKey) {
    // For MangaStream, the reader page contains JSON data in a script tag
    // The runtime will parse using selectors, but we can add custom logic here if needed
    return [];
  }
};

export default defineTheme({
  id: 'wp-mangastream',
  name: 'WordPress MangaStream',
  version: '1.0.0',
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
    attribution: {}
  },
  hooks
});