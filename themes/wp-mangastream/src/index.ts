// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';
import type { ThemeHooks } from '@blankgrimoire/types';

/**
 * WordPress Chapter Theme Adapter
 * 
 * Generic adapter for WordPress sites using a static chapter list and a
 * JSON-based reader via ts_reader.run().
 */

const hooks: ThemeHooks = {
  async getPages(ctx, mangaKey, chapterKey) {
    // The reader page contains JSON data in a script tag
    // The runtime will parse using selectors, but we can add custom logic here if needed
    return [];
  }
};

export default defineTheme({
  id: 'theme.wp-mangastream',
  name: 'WordPress Chapter Theme',
  version: '__ADAPTER_VERSION__',
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
      link: 'a',
      cover: 'img'
    },
    details: {
      title: '.entry-title, h1.post-title',
      cover: '.thumb img, .post-thumb img',
      synopsis: '.entry-content, .post-content',
      authors: '.mgen a[href*="/author/"]',
      artists: '.mgen a[href*="/artist/"]',
      altTitles: '.alternative-titles, .alt-titles',
      tags: '.mgen a',
      status: '.post-status, .status'
    },
    chapters: {
      item: '#chapterlist .eph-num a, #chapterlist li a, .listing-chapters_wrap li a',
      link: 'a',
      title: 'a',
      date: '.chapter-release-date, .date',
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