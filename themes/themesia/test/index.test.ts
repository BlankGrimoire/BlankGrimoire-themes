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

describe('theme.themesia', () => {
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
          key: 'https://example.org/series/tempor-incidunt',
          title: 'Tempor Incidunt',
          coverURL: 'https://example.org/covers/tempor-incidunt.png',
        },
      ],
      hasNextPage: true,
    });
  });

  it('extracts details and normalizes metadata', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.details).toMatchObject({
      key: 'lorem-ipsum',
      title: 'Tempor Incidunt',
      authors: ['Author One', 'Author Two'],
      artists: ['Artist One'],
      altTitles: ['Tempor', 'Incidunt'],
      tags: ['Action', 'Adventure'],
      status: 'completed',
      contentRating: 'suggestive',
      attribution: {
        siteName: 'Example Site',
        siteURL: 'https://example.org/',
        logoURL: 'https://example.org/branding/logo.png',
        credits: 'Synthetic Themesia fixture credits',
      },
    });
  });

  it('extracts chapters in the declared order', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.chapters?.map((chapter) => chapter.title)).toEqual([
      'Chapter 1',
      'Chapter 2',
    ]);
    expect(result.chapters?.[1]?.publishedAt).toBe('2025-03-02T00:00:00.000Z');
  });

  it('extracts script JSON reader pages with resolved URLs', async () => {
    const result = await harness.testTheme(fixture, 'https://example.org/');

    expect(result.pages).toEqual([
      { index: 0, imageURL: 'https://example.org/pages/themesia-001.png' },
      { index: 1, imageURL: 'https://example.org/pages/themesia-002.png' },
    ]);
  });
});
