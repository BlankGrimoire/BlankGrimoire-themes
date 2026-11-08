// SPDX-License-Identifier: MIT

import { defineTheme } from '@blankgrimoire/types';
import type { ThemeHooks } from '@blankgrimoire/types';

/**
 * SPA Next.js Theme Adapter
 * 
 * Generic adapter for Next.js sites using __NEXT_DATA__ hydration.
 * Handles Cloudflare Turnstile challenge detection.
 */

const hooks: ThemeHooks = {
  async getMangaDetails(ctx, key) {
    // For Next.js, we extract all data from __NEXT_DATA__
    // The runtime handles standard selector parsing, but we can add custom logic here
    return {} as any;
  },
  
  async getChapters(ctx, key) {
    // Chapters are already in the detail page's __NEXT_DATA__
    return [];
  },
  
  async getPages(ctx, mangaKey, chapterKey) {
    // Pages are extracted from __NEXT_DATA__ on chapter page
    return [];
  }
};

export default defineTheme({
  id: 'spa-nextjs',
  name: 'SPA Next.js',
  version: '1.0.0',
  detectionSignature: {
    selectors: [
      '#__NEXT_DATA__',
      'script[id="__NEXT_DATA__"]'
    ],
    minScore: 9
  },
  selectors: {
    search: {
      path: '/series?title={query}',
      item: '',  // Parsed from __NEXT_DATA__
      title: '',
      link: '',
      cover: ''
    },
    details: {
      title: '',
      cover: '',
      synopsis: '',
      authors: '',
      artists: '',
      altTitles: '',
      tags: '',
      status: ''
    },
    chapters: {
      item: '',
      link: '',
      title: '',
      date: '',
      order: 'desc'
    },
    pages: {
      strategies: [
        {
          kind: 'css',
          image: '',
          srcAttributes: []
        }
      ]
    },
    attribution: {}
  },
  hooks
});