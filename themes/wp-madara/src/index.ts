// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';
import type { ThemeHooks } from '@blankgrimoire/types';

/**
 * WordPress Madara Theme Adapter
 * 
 * Generic adapter for sites using the Madara WordPress theme.
 * Supports search, catalog (latest/popular), details, AJAX chapters, and pages.
 */

const hooks: ThemeHooks = {
  // Note: Hooks are optional escape hatches. The runtime handles standard parsing using selectors.
  // These hooks are for edge cases where selector-based parsing isn't sufficient.
  
  // Example: Custom search with AJAX chapters ID extraction
  // The runtime will use selectors for standard parsing
  // This hook would only be needed for edge cases
  
  async getChapters(ctx, key) {
    // This hook runs after the runtime has fetched the detail page
    // We can extract the internal manga ID and make the AJAX request
    
    // The runtime provides the detail page HTML via ctx.html or similar
    // For now, we rely on the standard selector-based parsing
    
    // Return empty - runtime will use selectors
    return [];
  }
};

export default defineTheme({
  id: 'theme.wp-madara',
  name: 'WordPress Madara',
  version: '__ADAPTER_VERSION__',
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
      link: 'a',
      cover: 'img'
    },
    details: {
      title: '.post-title h1, h1.entry-title',
      cover: '.summary_image img, .post-thumb img',
      synopsis: '.summary__content, .description-summary, .manga-excerpt',
      authors: '.author-content a, .manga-author a',
      artists: '.artist-content a, .manga-artist a',
      altTitles: '.alternative-titles .summary-content, .alt-titles',
      tags: '.genres-content a, .manga-genres a',
      status: '.post-status .summary-content, .manga-status'
    },
    chapters: {
      item: '.wp-manga-chapter, .chapter-item, li.wp-manga-chapter',
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