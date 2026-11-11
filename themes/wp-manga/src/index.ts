// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

export default defineTheme({
  id: 'theme.wp-manga',
  name: 'WordPress Content Theme',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    metaGenerator: '^WP Content Theme',
    selectors: ['.wp-content-reader', '.wp-content-chapters'],
    minScore: 7,
  },
  selectors: {
    search: {
      path: '/search',
      item: '.wp-content-search-item',
      title: '.wp-content-search-title',
      link: 'a',
      cover: 'img',
      nextPage: '.wp-content-next',
    },
    details: {
      title: '.wp-content-title',
      cover: '.wp-content-cover img',
      synopsis: '.wp-content-synopsis',
      authors: '.wp-content-authors',
      artists: '.wp-content-artists',
      altTitles: '.wp-content-alt-titles',
      tags: '.wp-content-tags',
      status: '.wp-content-status',
      contentRating: '.wp-content-rating',
    },
    chapters: {
      item: '.wp-content-chapters li',
      link: 'a',
      title: '.wp-content-chapter-title',
      date: '.wp-content-chapter-date',
      order: 'desc',
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '.wp-content-reader img',
          srcAttributes: ['data-src', 'src'],
        },
      ],
    },
    attribution: {
      logo: 'img.wp-content-site-logo',
      credits: '.wp-content-credits',
    },
  },
});
