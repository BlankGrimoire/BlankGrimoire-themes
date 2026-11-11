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
  id: 'theme.static-advanced',
  name: 'Static Advanced',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    selectors: [
      '.container-chapter-reader',
      '.panel-story-chapter-list',
      '.content-genres-item',
      '.panel-search-story',
      '.chapter-page',
      '.manga-info-top',
      '#chapter-list-container'
    ],
    minScore: 7
  },
  selectors: {
    search: {
      path: '/search/story/{query}',
      item: '.panel-search-story, .content-genres-item, .item',
      title: 'h3 a, .title a, .slide-caption h3 a',
      link: 'a',
      cover: '.genres-item-img img, .manga-info-pic img, img'
    },
    details: {
      title: '.story-info-right h1, .manga-info-content h1, h1.story-title',
      cover: '.info-image img, .cover-image img, .manga-info-pic img',
      synopsis: '#panel-story-info-description, .description, .manga-info-content .description',
      authors: '.table-value a[href*="/author/"]',
      artists: '.table-value a[href*="/artist/"]',
      altTitles: '.alternative-titles, .alt-titles',
      tags: '.mgen a, .genres a, .manga-info-text a',
      status: '.post-status, .status, .manga-info-text'
    },
    chapters: {
      item: '.panel-story-chapter-list a.chapter-name, .chapter-list a, #chapter-list-container a',
      link: 'a',
      title: 'a',
      date: '.chapter-release-date, .date',
      order: 'desc'
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '.container-chapter-reader img, .reading-content img, .widget-chapter-images img',
          srcAttributes: ['src', 'data-src', 'data-lazy-src']
        }
      ]
    },
    attribution: {}
  },
  hooks
});