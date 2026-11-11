// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';

/**
 * SPA Next.js Theme Adapter
 * 
 * Generic adapter for Next.js sites using __NEXT_DATA__ hydration.
 * Anti-bot challenges are handled by the visible app web view, never here.
 */

export default defineTheme({
  id: 'theme.spa-nextjs',
  name: 'SPA Next.js',
  version: '__ADAPTER_VERSION__',
  detectionSignature: {
    selectors: [
      '#__NEXT_DATA__',
      'script[id="__NEXT_DATA__"]',
      '#__next',
      'main'
    ],
    scriptSrc: ['/_next/static/'],
    minScore: 9
  },
  selectors: {
    search: {
      path: '/series?title={query}',
      item: 'a[href*="/series/"]',
      title: 'h2, h3, h4, [class*="title"]',
      link: 'a',
      cover: 'img'
    },
    details: {
      title: 'main h1, article h1, h1',
      cover: 'main img, article img',
      synopsis: 'main p, article p',
      tags: 'main a[href*="/genres/"], article a[href*="/genres/"]',
      status: 'main [class*="status"], article [class*="status"]'
    },
    chapters: {
      item: 'a[href*="/chapter"], a[href*="/chapters/"]',
      link: 'a',
      title: '',
      date: '[class*="date"], time',
      order: 'desc'
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '[class*="reader"] img, [class*="chapter"] img, main img',
          srcAttributes: ['data-src', 'data-lazy-src', 'src']
        }
      ]
    },
    attribution: {}
  }
});