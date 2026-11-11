// SPDX-License-Identifier: MIT

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defineTheme } from '@blankgrimoire/types';
import { extractHydration } from '@blankgrimoire/runtime';
import { VMHarness } from '@blankgrimoire/testing';
import type { HydrationStrategy } from '@blankgrimoire/runtime';
import adapter from '../src/index.js';

const runtimeIIFE = readFileSync(
  'node_modules/@blankgrimoire/runtime/dist/runtime.js',
  'utf8',
);
const nextFixture = readFileSync(new URL('../fixtures/next-page.html', import.meta.url), 'utf8');
const nuxtFixture = readFileSync(new URL('../fixtures/nuxt-page.html', import.meta.url), 'utf8');

function isHydrationStrategy(strategy: unknown): strategy is HydrationStrategy {
  if (typeof strategy !== 'object' || strategy === null) {
    return false;
  }
  const candidate = strategy as Record<string, unknown>;
  return (
    candidate.kind === 'hydration' &&
    (candidate.framework === 'next' || candidate.framework === 'nuxt')
  );
}

function hydrationStrategy(strategy: unknown): HydrationStrategy {
  if (!isHydrationStrategy(strategy)) {
    throw new Error('Expected a hydration strategy');
  }
  return strategy;
}

describe('theme.spa-hydration', () => {
  const harness = new VMHarness(['example.org'], runtimeIIFE, adapter);

  it('detects the supported SPA structure', async () => {
    const result = await harness.testTheme(nextFixture, 'https://example.org/');

    expect(result.detected).toBe(true);
    expect(result.score).toBe(7);
  });

  it('extracts search results and pagination', async () => {
    const result = await harness.testTheme(nextFixture, 'https://example.org/');

    expect(result.search).toEqual({
      items: [
        {
          key: 'https://example.org/series/velit-esse',
          title: 'Velit Esse',
          coverURL: 'https://example.org/covers/velit-esse.png',
        },
      ],
      hasNextPage: true,
    });
  });

  it('extracts details and normalizes metadata', async () => {
    const result = await harness.testTheme(nextFixture, 'https://example.org/');

    expect(result.details).toMatchObject({
      key: 'lorem-ipsum',
      title: 'Velit Esse',
      authors: ['Author One', 'Author Two'],
      artists: ['Artist One'],
      altTitles: ['Velit', 'Esse'],
      tags: ['Action', 'Adventure'],
      status: 'ongoing',
      contentRating: 'safe',
      attribution: {
        siteName: 'Example Site',
        siteURL: 'https://example.org/',
        logoURL: 'https://example.org/branding/logo.png',
        credits: 'Synthetic SPA fixture credits',
      },
    });
  });

  it('extracts chapters in the declared order', async () => {
    const result = await harness.testTheme(nextFixture, 'https://example.org/');

    expect(result.chapters?.map((chapter) => chapter.title)).toEqual([
      'Chapter 1',
      'Chapter 2',
    ]);
    expect(result.chapters?.[1]?.publishedAt).toBe('2025-04-02T00:00:00.000Z');
  });

  it('extracts Next.js hydration pages', async () => {
    const pages = extractHydration(
      hydrationStrategy(adapter.selectors.pages.strategies[0]),
      harness.getNativeBridge().parseHTML(nextFixture),
      'https://example.org/',
    );

    expect(pages).toEqual([
      { index: 0, imageURL: 'https://example.org/pages/spa-next-001.png' },
      { index: 1, imageURL: 'https://example.org/pages/spa-next-002.png' },
    ]);
  });

  it('extracts equivalent Nuxt hydration pages', async () => {
    const nuxtAdapter = defineTheme({
      ...adapter,
      selectors: {
        ...adapter.selectors,
        pages: {
          strategies: [
            {
              kind: 'hydration',
              framework: 'nuxt',
              path: 'reader.pages',
            },
          ],
        },
      },
    });
    const nuxtHarness = new VMHarness(['example.org'], runtimeIIFE, nuxtAdapter);
    const pages = extractHydration(
      hydrationStrategy(nuxtAdapter.selectors.pages.strategies[0]),
      nuxtHarness.getNativeBridge().parseHTML(nuxtFixture),
      'https://example.org/',
    );

    expect(pages).toEqual([
      { index: 0, imageURL: 'https://example.org/pages/spa-nuxt-001.png' },
      { index: 1, imageURL: 'https://example.org/pages/spa-nuxt-002.png' },
    ]);
  });
});
