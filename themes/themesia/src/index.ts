// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

export default defineTheme({
  id: 'theme.themesia',
  name: 'Themesia Content Theme',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    metaGenerator: '^Themesia Content Theme',
    selectors: ['.tsia-reader', '.tsia-chapter-list'],
    minScore: 7,
  },
  selectors: {
    search: {
      path: '/search',
      item: '.tsia-search-item',
      title: '.tsia-search-title',
      link: 'a',
      cover: 'img',
      nextPage: '.tsia-next-page',
    },
    details: {
      title: '.tsia-title',
      cover: '.tsia-cover img',
      synopsis: '.tsia-synopsis',
      authors: '.tsia-authors',
      artists: '.tsia-artists',
      altTitles: '.tsia-alternative-titles',
      tags: '.tsia-tags',
      status: '.tsia-status',
      contentRating: '.tsia-rating',
    },
    chapters: {
      item: '.tsia-chapter-list li',
      link: 'a',
      title: '.tsia-chapter-title',
      date: '.tsia-chapter-date',
      order: 'asc',
    },
    pages: {
      strategies: [
        {
          kind: 'scriptJSON',
          pattern: 'THEMESIA_READER_DATA',
          path: 'THEMESIA_READER_DATA.reader.pages',
        },
      ],
    },
    attribution: {
      logo: 'img.tsia-site-logo',
      credits: '.tsia-credits',
    },
  },
});
