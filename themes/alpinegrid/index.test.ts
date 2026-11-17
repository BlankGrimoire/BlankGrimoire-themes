// SPDX-License-Identifier: MIT

import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { VMHarness } from '@blankgrimoire/testing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runtimeIIFE = readFileSync(
  join(__dirname, 'node_modules/@blankgrimoire/runtime/dist/runtime.js'),
  'utf8',
);

const themeBundle = readFileSync(join(__dirname, 'bundle.js'), 'utf8');

const module = { exports: {} as Record<string, any> };
const exports = module.exports;
const sandbox: any = {
  module,
  exports,
  window: {},
  globalThis: {},
  console,
};

new Script(themeBundle).runInNewContext(sandbox);

const themeAdapter =
  module.exports?.default ??
  module.exports ??
  sandbox.BlankGrimoireRuntime?.default ??
  sandbox.BlankGrimoireRuntime;

if (!themeAdapter) {
  throw new Error('Failed to load theme adapter from bundle');
}

const seriesKey = 'https://example.org/comic/lorem-ipsum';
const chapterKey = 'https://example.org/comic/lorem-ipsum/LOREM12-chapter-12-en';

/** Synthetic series page: metadata lives in the `comic-data` payload. */
const seriesHTML = `<!DOCTYPE html>
<html lang="en" x-data="Utils.loadTheme()">
<body>
  <script type="application/json" id="comic-data">
    {
      "id": 1,
      "title": "Lorem Ipsum",
      "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "status": 1,
      "content_rating": "safe",
      "default_thumbnail": "https://media.example.org/covers/lorem.webp",
      "slug": "lorem-ipsum",
      "md_titles": { "1": { "title": "Dolor Sit Amet" } },
      "md_comic_md_genres": [
        { "md_genres": { "name": "Full Color", "slug": "full-color", "group": "Format" } },
        { "md_genres": { "name": "Fantasy", "slug": "fantasy", "group": "Genre" } },
        { "md_genres": { "name": "Drama", "slug": "drama", "group": "Genre" } }
      ]
    }
  </script>
  <main>
    <h1>Lorem Ipsum</h1>
    <div class="comic-desc">Lorem ipsum dolor sit amet.</div>
  </main>
</body>
</html>`;

/** Synthetic reader page: pages live in the `sv-data` payload. */
const chapterHTML = `<!DOCTYPE html>
<html lang="en" x-data="Utils.loadTheme()">
<body>
  <script type="application/json" id="sv-data">
    {
      "chapter": { "hid": "LOREM12", "chap": "12", "lang": "en" },
      "images": [
        { "h": 1500, "w": 800, "name": "image 0", "url": "https://media.example.org/pages/12/0.webp" },
        { "h": 1500, "w": 800, "name": "image 1", "url": "https://media.example.org/pages/12/1.webp" }
      ]
    }
  </script>
  <main><h1>Chapter 12</h1></main>
</body>
</html>`;

const searchPayload = {
  data: [
    {
      title: 'Lorem Ipsum',
      slug: 'lorem-ipsum',
      default_thumbnail: 'https://media.example.org/covers/lorem.webp',
    },
    { title: 'Dolor Sit Amet', slug: 'dolor-sit-amet', default_thumbnail: null },
  ],
  next_page_url: 'https://example.org/api/search?page=2',
};

const chapterListPayload = {
  data: [
    {
      hid: 'LOREM12',
      chap: '12',
      title: 'Chapter 12',
      lang: 'en',
      group_name: 'Lorem Group',
      publish_at: null,
      created_at: '2026-02-01T10:00:00.000000Z',
    },
    {
      hid: 'LOREM11',
      chap: '11',
      title: '',
      lang: 'en',
      group_name: 'Lorem Group',
      publish_at: null,
      created_at: '2026-01-20T10:00:00.000000Z',
    },
  ],
  pagination: { current_page: 1, last_page: 1, total: 2 },
};

let harness: VMHarness;

beforeAll(() => {
  const nativeProxy: any = {};
  const nativeModule = { exports: {} as Record<string, any> };
  const nativeSandbox: any = {
    __native: {
      request: (request: any) => nativeProxy.request(request),
    },
    module: nativeModule,
    exports: nativeModule.exports,
    window: {},
    globalThis: {},
    console,
  };
  new Script(themeBundle).runInNewContext(nativeSandbox);
  const adapter =
    nativeModule.exports?.default ??
    nativeModule.exports ??
    nativeSandbox.BlankGrimoireRuntime?.default ??
    nativeSandbox.BlankGrimoireRuntime;

  harness = new VMHarness(['example.org', 'media.example.org'], runtimeIIFE, adapter);

  const bridge = (harness as any).bridge;
  const originalRequest = bridge.request.bind(bridge);
  nativeProxy.request = async (request: any) => {
    const url = new URL(String(request.url));
    if (url.pathname === '/api/search') {
      return { status: 200, url: url.href, headers: {}, body: JSON.stringify(searchPayload) };
    }
    if (url.pathname.startsWith('/api/comics/') && url.pathname.endsWith('/chapter-list')) {
      return {
        status: 200,
        url: url.href,
        headers: {},
        body: JSON.stringify(chapterListPayload),
      };
    }
    if (url.pathname.startsWith('/comic/') && !url.pathname.endsWith('/chapter-list')) {
      return { status: 200, url: url.href, headers: {}, body: seriesHTML };
    }
    return originalRequest(request);
  };
});

describe('Alpine Grid Theme Adapter', () => {
  it('detects the stack from the Alpine root and the app entry point', async () => {
    const result = await harness.testTheme(seriesHTML, seriesKey, { mangaKey: seriesKey });

    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('maps search results from the JSON endpoint', async () => {
    const result = await harness.testTheme(seriesHTML, seriesKey, { mangaKey: seriesKey });

    expect(result.search?.items).toEqual([
      {
        key: 'https://example.org/comic/lorem-ipsum',
        title: 'Lorem Ipsum',
        coverURL: 'https://media.example.org/covers/lorem.webp',
      },
      { key: 'https://example.org/comic/dolor-sit-amet', title: 'Dolor Sit Amet' },
    ]);
    expect(result.search?.hasNextPage).toBe(true);
  });

  it('reads series metadata from the embedded payload', async () => {
    const result = await harness.testTheme(seriesHTML, seriesKey, { mangaKey: seriesKey });

    expect(result.details).toMatchObject({
      key: seriesKey,
      title: 'Lorem Ipsum',
      status: 'ongoing',
      contentRating: 'safe',
      altTitles: ['Dolor Sit Amet'],
      tags: ['Fantasy', 'Drama'],
      coverURL: 'https://media.example.org/covers/lorem.webp',
    });
    expect(result.details?.synopsis).toContain('Lorem ipsum');
  });

  it('builds chapter URLs from the list endpoint in reading order', async () => {
    const result = await harness.testTheme(seriesHTML, seriesKey, { mangaKey: seriesKey });

    expect(result.chapters?.map((chapter) => chapter.key)).toEqual([
      'https://example.org/comic/lorem-ipsum/LOREM11-chapter-11-en',
      'https://example.org/comic/lorem-ipsum/LOREM12-chapter-12-en',
    ]);
    expect(result.chapters?.map((chapter) => chapter.number)).toEqual([11, 12]);
    expect(result.chapters?.[1]).toMatchObject({
      title: 'Chapter 12',
      language: 'en',
      group: 'Lorem Group',
    });
    expect(result.chapters?.[0]?.title).toBe('Chapter 11');
  });

  it('extracts reader pages from the embedded payload', async () => {
    const result = await harness.testTheme(chapterHTML, chapterKey, {
      mangaKey: seriesKey,
      chapterKey,
    });

    expect(result.pages?.map((page) => page.imageURL)).toEqual([
      'https://media.example.org/pages/12/0.webp',
      'https://media.example.org/pages/12/1.webp',
    ]);
  });
});
