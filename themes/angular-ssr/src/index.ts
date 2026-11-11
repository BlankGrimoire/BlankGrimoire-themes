// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

/**
 * Generic adapter for Angular applications that server-render their catalog,
 * series, chapter, and reader markup.
 */
export default defineTheme({
  id: 'theme.angular-ssr',
  name: 'Angular SSR Reader',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    selectors: [
      '[ng-version]',
      '.site-header',
      '.page-content',
      '.series-card',
      '.browse-page',
      '.series-title',
      '.cl-row',
      '.r-page-img',
    ],
    minScore: 7,
  },
  selectors: {
    search: {
      path: '/browse?q={query}',
      item: '.bc',
      title: '.bc-title',
      link: 'a',
      cover: '.bc-img',
    },
    details: {
      title: '.series-title',
      cover: '.cover-img',
      synopsis: '.series-info .description',
      tags: '.genre-tag',
      status: '.badge--status',
    },
    chapters: {
      item: '.cl-row',
      link: 'a',
      title: '.cl-title',
      date: '.cl-date',
      order: 'desc',
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '.r-page-img',
          srcAttributes: ['src', 'data-src', 'data-lazy-src'],
        },
      ],
    },
    attribution: {},
  },
});
