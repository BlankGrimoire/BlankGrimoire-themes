// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';
import type { ThemeHooks } from '@blankgrimoire/types';

/**
 * Static Advanced Theme Adapter
 * 
 * Generic adapter for static HTML sites with specific class patterns.
 * Requires Referer header for image requests.
 */

const hooks: ThemeHooks = {};

export default defineTheme({
  id: 'static-advanced',
  name: 'Static Advanced',
  version: '1.0.0',
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
    attribution: {}
  },
  hooks
});