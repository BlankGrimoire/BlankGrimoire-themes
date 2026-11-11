// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

/**
 * Generic adapter for Next.js catalog pages with an image-based reader.
 * Paths are resolved against the site selected by the user.
 */
export default defineTheme({
  id: 'theme.next-reader',
  name: 'Next.js Image Reader',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    selectors: [
      '#__NEXT_DATA__',
      '#__next',
      'main',
      'a[href*="/series/comic/"]',
      'img[alt^="Page "]',
    ],
    scriptSrc: ['/_next/static/'],
    minScore: 7,
  },
  selectors: {
    search: {
      path: '/search?q={query}',
      item: 'main a[href*="/series/comic/"]',
      title: 'h2, h3, h4, [class*="title"]',
      link: 'a',
      cover: 'img',
    },
    details: {
      title: 'main h1',
      cover: 'main img[alt]',
      synopsis: 'main [role="tabpanel"] p, main p',
      tags: 'main a[href^="/genres/"], main a[href*="?tag="]',
      status: 'main [class*="status"], main [class*="capitalize"]',
    },
    chapters: {
      item: 'main a[href*="/chapter/"]',
      link: 'a',
      title: '',
      date: 'time, [class*="date"]',
      order: 'desc',
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: 'main img[alt^="Page "]',
          srcAttributes: ['data-src', 'data-lazy-src', 'src'],
        },
      ],
    },
    attribution: {},
  },
});
