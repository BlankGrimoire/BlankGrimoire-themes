// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

export default defineTheme({
  id: 'theme.spa-hydration',
  name: 'SPA Hydration Theme',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    metaGenerator: '^SPA Hydration Theme',
    selectors: ['.spa-reader', '.spa-chapter-list'],
    minScore: 7,
  },
  selectors: {
    search: {
      path: '/search',
      item: '.spa-search-item',
      title: '.spa-search-title',
      link: 'a',
      cover: 'img',
      nextPage: '.spa-next-page',
    },
    details: {
      title: '.spa-title',
      cover: '.spa-cover img',
      synopsis: '.spa-synopsis',
      authors: '.spa-authors',
      artists: '.spa-artists',
      altTitles: '.spa-alternative-titles',
      tags: '.spa-tags',
      status: '.spa-status',
      contentRating: '.spa-rating',
    },
    chapters: {
      item: '.spa-chapter-list li',
      link: 'a',
      title: '.spa-chapter-title',
      date: '.spa-chapter-date',
      order: 'asc',
    },
    pages: {
      strategies: [
        {
          kind: 'hydration',
          framework: 'next',
          path: 'props.pageProps.reader.pages',
        },
      ],
    },
    attribution: {
      logo: 'img.spa-site-logo',
      credits: '.spa-credits',
    },
  },
});
