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
      '#chapterlist',
      '.manga-info',
      '.seriestu',
      '.reading-content',
      '.reader-area'
    ],
    scriptSrc: ['themes/(?:mangareader|manganova)/'],
    minScore: 6
  },
  selectors: {
    search: {
      path: '/?s={query}',
      item: '.listupd .bsx, .c-tabs-item__content, .item, .xem-nhieu-item',
      title: '.tt a, .entry-title a, h3 a, .series',
      link: 'a',
      cover: 'img'
    },
    details: {
      title: '.entry-title, h1.post-title',
      cover: '.thumb img, .post-thumb img, .wp-post-image',
      synopsis: '.entry-content, .post-content',
      authors: '.mgen a[href*="/author/"], .author-content a, .manga-author a',
      artists: '.mgen a[href*="/artist/"]',
      altTitles: '.alternative-titles, .alt-titles',
      tags: '.mgen a, .seriestugenre a',
      status: '.post-status, .status, .summary-content'
    },
    chapters: {
      item: '#chapterlist .eph-num, #chapterlist li, .listing-chapters_wrap li',
      link: 'a',
      title: 'a',
      date: '.chapterdate, .post-date, .chapter-release-date, .date',
      order: 'desc'
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '.reading-content img, .reader-area img, #readerarea img, .page-break img, .page img',
          srcAttributes: ['data-src', 'data-lazy-src', 'data-original', 'src']
        }
      ]
    },
    attribution: {
      logo: 'img.custom-logo, .logo img'
    }
  },
  hooks
});