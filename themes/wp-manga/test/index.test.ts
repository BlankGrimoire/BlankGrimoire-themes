// SPDX-License-Identifier: MIT

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VMHarness } from '@blankgrimoire/testing';
import adapter from '../src/index.js';

const runtimeIIFE = readFileSync(
  'node_modules/@blankgrimoire/runtime/dist/runtime.js',
  'utf8',
);
const fixture = readFileSync(new URL('../fixtures/content-page.html', import.meta.url), 'utf8');

describe('theme.wp-manga', () => {
  const harness = new VMHarness(['example.org'], runtimeIIFE, adapter);

  it('detects the supported theme structure', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.detected).toBe(true);
    expect(result.score).toBe(7);
  });

  it('extracts search results and pagination', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.search).toEqual({
      items: [
        {
          key: 'https://example.org/series/lorem-ipsum',
          title: 'Lorem Ipsum',
          coverURL: 'https://example.org/covers/lorem-ipsum.png',
        },
      ],
      hasNextPage: true,
    });
  });

  it('extracts details and normalizes metadata', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.details).toMatchObject({
      key: 'lorem-ipsum',
      title: 'Lorem Ipsum',
      authors: ['Author One', 'Author Two'],
      artists: ['Artist One'],
      altTitles: ['Lorem', 'Ipsum'],
      tags: ['Action', 'Adventure'],
      status: 'ongoing',
      contentRating: 'safe',
      attribution: {
        siteName: 'Example Site',
        siteURL: 'https://example.org/',
        logoURL: 'https://example.org/logo.png',
        credits: 'Synthetic fixture credits',
      },
    });
  });

  it('extracts chapters in the declared order', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.chapters).toHaveLength(2);
    expect(result.chapters?.map((chapter) => chapter.title)).toEqual([
      'Chapter 2',
      'Chapter 1',
    ]);
    expect(result.chapters?.[0]?.publishedAt).toBe('2025-02-02T00:00:00.000Z');
  });

  it('extracts reader pages with resolved URLs', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.pages).toEqual([
      { index: 0, imageURL: 'https://example.org/pages/001.png' },
      { index: 1, imageURL: 'https://example.org/pages/002.png' },
    ]);
  });
});
