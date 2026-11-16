// SPDX-License-Identifier: MIT

import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
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

/** Synthetic home page: shell switch plus the two-column home layout. */
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="generator" content="Astro v7.2.4">
  <title>Example Library</title>
</head>
<body>
  <nav>
    <a data-content-mode-link="comics" href="/comics">Comics</a>
    <a data-content-mode-link="novels" href="/novels">Novels</a>
  </nav>
  <a href="/browse?genres=fantasy">Fantasy</a>
  <a href="/browse?genres=action">Action</a>
  <main>
    <div id="home-main">
      <a href="/comics/lorem-ipsum-7ba78ec7">Lorem Ipsum</a>
    </div>
    <aside id="home-side">
      <a href="/comics/dolor-sit-amet-7ba78ec7">Dolor Sit Amet</a>
    </aside>
  </main>
</body>
</html>`;

/** Synthetic listing page: the card grid used by search, browse and genres. */
const listingHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="generator" content="Astro v7.2.4">
  <title>Browse</title>
</head>
<body>
  <a data-content-mode-link="comics" href="/comics">Comics</a>
  <div id="series-grid-container">
    <div id="series-grid">
      <div class="series-card">
        <a href="/comics/lorem-ipsum-7ba78ec7">
          <img src="https://cdn.example.org/covers/lorem.jpg" alt="Lorem Ipsum">
        </a>
        <div>
          <a href="/comics/lorem-ipsum-7ba78ec7"><h3>Lorem Ipsum</h3></a>
        </div>
      </div>
      <div class="series-card">
        <a href="/comics/dolor-sit-amet-7ba78ec7">
          <img src="https://cdn.example.org/covers/dolor.jpg" alt="Dolor Sit Amet">
        </a>
        <div>
          <a href="/comics/dolor-sit-amet-7ba78ec7"><h3>Dolor Sit Amet</h3></a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

/** Synthetic series page: header blocks, chapter rows and the island payload. */
const seriesHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="generator" content="Astro v7.2.4">
  <title>Lorem Ipsum</title>
</head>
<body>
  <a data-content-mode-link="comics" href="/comics">Comics</a>
  <article>
    <h1>Lorem Ipsum</h1>
    <div id="alt-container">
      <p id="alt-titles">Ipsum Lorem • Lorem Ipsum</p>
    </div>
    <div id="description-text"><p>Placeholder synopsis for the fixture.</p></div>
  </article>
  <div id="desktop-cover-container">
    <img src="https://cdn.example.org/covers/lorem.jpg" alt="Lorem Ipsum">
  </div>
  <a href="/browse?genres=fantasy">Fantasy</a>
  <a href="/browse?genres=action">Action</a>
  <script id="continue-reading-data" type="application/json">{"kind":"comic","slug":"lorem-ipsum","base":"/comics/lorem-ipsum-7ba78ec7","numbers":[2,1]}</script>
  <a href="/comics/lorem-ipsum-7ba78ec7/chapter/1#resume">First Chapter</a>
  <div class="divide-y">
    <a href="/comics/lorem-ipsum-7ba78ec7/chapter/2" data-astro-prefetch="hover">
      <div class="flex">
        <div><div><span>Chapter 2</span></div></div>
      </div>
      <div class="text-right"><span>3 days ago</span></div>
    </a>
    <a href="/comics/lorem-ipsum-7ba78ec7/chapter/1" data-astro-prefetch="hover">
      <div class="flex">
        <div><div><span>Chapter 1</span></div></div>
      </div>
      <div class="text-right"><span>last week</span></div>
    </a>
  </div>
</body>
</html>`;

/** Synthetic reader page: one wrapper per image, rendered by the server. */
const readerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="generator" content="Astro v7.2.4">
  <title>Lorem Ipsum Chapter 2</title>
</head>
<body>
  <a data-content-mode-link="comics" href="/comics">Comics</a>
  <div class="reader">
    <div data-page="0"><img src="https://cdn.example.org/pages/2-1.jpg" data-page-index="0" alt="Page 1"></div>
    <div data-page="1"><img src="https://cdn.example.org/pages/2-2.jpg" data-page-index="1" alt="Page 2"></div>
    <div data-page="2"><img src="https://cdn.example.org/pages/2-3.jpg" data-page-index="2" alt="Page 3"></div>
  </div>
</body>
</html>`;

/** Synthetic locked reader: the paywall shows no page containers. */
const lockedReaderHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="generator" content="Astro v7.2.4">
  <title>Lorem Ipsum Chapter 3 - Premium</title>
</head>
<body>
  <a data-content-mode-link="comics" href="/comics">Comics</a>
  <div class="reader-locked">Checking chapter access</div>
</body>
</html>`;

const searchResults: Record<string, unknown> = {
  '0': {
    data: [
      {
        id: 1,
        slug: 'lorem-ipsum',
        title: 'Lorem Ipsum',
        cover: 'https://cdn.example.org/covers/lorem.jpg',
        public_url: 'https://example.org/comics/lorem-ipsum-7ba78ec7',
      },
      {
        id: 2,
        slug: 'dolor-sit-amet',
        title: 'Dolor Sit Amet',
        cover: 'https://cdn.example.org/covers/dolor.jpg',
        public_url: 'https://example.org/comics/dolor-sit-amet-7ba78ec7',
      },
    ],
    meta: { has_more: true, per_page: 24, total: 30 },
  },
  '24': {
    data: [
      {
        id: 3,
        slug: 'sed-do-eiusmod',
        title: 'Sed Do Eiusmod',
        public_url: 'https://example.org/comics/sed-do-eiusmod-7ba78ec7',
      },
    ],
    meta: { has_more: false, per_page: 24, total: 30 },
  },
};

const seriesPayload = {
  series: {
    id: 1,
    slug: 'lorem-ipsum',
    title: 'Lorem Ipsum',
    alt_titles: ['Ipsum Lorem', 'Lorem Ipsum'],
    description: '<p>Placeholder synopsis for the fixture.</p><p>Second paragraph.</p>',
    cover: 'https://cdn.example.org/covers/lorem.jpg',
    status: 'ongoing',
    type: 'comic',
    author: 'Placeholder Author',
    artist: 'Placeholder Artist',
    chapter_count: 2,
    genres: [
      { id: 1, name: 'Fantasy', slug: 'fantasy' },
      { id: 2, name: 'Action', slug: 'action' },
    ],
  },
};

const chaptersPayload = {
  data: [
    {
      number: 3,
      slug: 'chapter-3',
      is_premium: true,
      published_at: '2026-03-25T19:09:43.123456Z',
    },
    {
      number: 2,
      slug: 'chapter-2',
      is_premium: false,
      published_at: '2026-03-24T19:09:43.123456Z',
    },
    {
      number: 1,
      slug: 'chapter-1',
      is_premium: false,
      published_at: '2026-03-23T19:09:43.123456Z',
    },
  ],
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

  harness = new VMHarness(
    ['example.org', 'example.com', 'api.example.org', 'api.example.com'],
    runtimeIIFE,
    adapter,
  );

  const bridge = (harness as any).bridge;
  const originalRequest = bridge.request.bind(bridge);
  nativeProxy.request = async (request: any) => {
    const url = new URL(String(request.url));
    if (url.hostname.startsWith('api.')) {
      const body = (() => {
        if (url.pathname === '/api/series') {
          const offset = url.searchParams.get('offset') ?? '0';
          return searchResults[offset] ?? searchResults['0'];
        }
        if (url.pathname.endsWith('/chapters')) {
          // The real endpoint answers HTTP 403 for very large limits. Refuse
          // them here so a regression back to limit=500 fails the suite.
          const limit = Number(url.searchParams.get('limit') ?? '0');
          if (limit > 450) {
            return { status: 403, body: 'Forbidden' };
          }
          if (url.pathname.includes('lorem-paged')) {
            const offset = Number(url.searchParams.get('offset') ?? '0');
            const entry = (number: number) => ({
              number,
              slug: `chapter-${number}`,
              is_premium: false,
              published_at: '2026-03-25T19:09:43.123456Z',
            });
            const data =
              offset === 0
                ? Array.from({ length: 200 }, (_, index) => entry(400 - index))
                : [entry(200), entry(199)];
            return { data };
          }
          return chaptersPayload;
        }
        if (url.pathname.startsWith('/api/series/')) {
          return seriesPayload;
        }
        return { data: [], meta: { has_more: false, total: 0 } };
      })();
      return {
        status: 200,
        url: String(request.url),
        headers: {},
        body: JSON.stringify(body),
      };
    }
    return originalRequest(request);
  };
});

describe('Astro Grid Theme Adapter', () => {
  it('declares the API host template instead of a domain', () => {
    expect(themeAdapter.networkHosts).toEqual(['api.{host}']);
  });

  it('detects the theme on the home layout', async () => {
    const result = await harness.testTheme(homeHTML, 'https://example.org/');

    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.detectionSignature.minScore).toBe(60);
  });

  it('detects the theme on a listing page', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/browse');

    expect(result.detected).toBe(true);
  });

  it('requires two markers besides the generator meta', async () => {
    const result = await harness.testTheme(
      '<html><head><meta name="generator" content="Astro v7"></head><body></body></html>',
      'https://example.org/',
    );

    expect(result.score).toBe(30);
    expect(result.detected).toBe(false);
  });

  it('exposes the genre discovery and filtering contract', () => {
    const genre = themeAdapter.selectors.genre;

    expect(genre.pagePath).toBe('/browse');
    expect(genre.filterPath).toBe('/browse?genres={genre}');
    expect(genre.valuePattern).toBe('genres=([^&?#]+)');
    expect(genre.filterPath.replace('{genre}', 'action')).toBe('/browse?genres=action');
  });

  it('reads search results from the API', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/browse', {
      searchQuery: { page: 1, text: 'lorem' },
    });

    expect(result.search?.items.map((item: any) => item.title)).toEqual([
      'Lorem Ipsum',
      'Dolor Sit Amet',
    ]);
    expect(result.search?.items[0]?.key).toBe(
      'https://example.org/comics/lorem-ipsum-7ba78ec7',
    );
    expect(result.search?.items[0]?.coverURL).toBe(
      'https://cdn.example.org/covers/lorem.jpg',
    );
    // `meta.total` is larger than the page, so a next page exists.
    expect(result.search?.hasNextPage).toBe(true);
  });

  it('asks for the next offset and stops on the last page', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/browse', {
      searchQuery: { page: 2, text: 'lorem' },
    });

    expect(result.search?.items.map((item: any) => item.title)).toEqual(['Sed Do Eiusmod']);
    expect(result.search?.hasNextPage).toBe(false);
  });

  it('maps every detail field from the series payload', async () => {
    const result = await harness.testTheme(
      seriesHTML,
      'https://example.org/comics/lorem-ipsum-7ba78ec7',
      { mangaKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7' },
    );

    expect(result.details?.title).toBe('Lorem Ipsum');
    expect(result.details?.status).toBe('ongoing');
    expect(result.details?.coverURL).toBe('https://cdn.example.org/covers/lorem.jpg');
    expect(result.details?.altTitles).toEqual(['Ipsum Lorem', 'Lorem Ipsum']);
    expect(result.details?.authors).toEqual(['Placeholder Author']);
    expect(result.details?.artists).toEqual(['Placeholder Artist']);
    expect(result.details?.tags).toEqual(['Fantasy', 'Action']);
    // HTML is reduced to plain text.
    expect(result.details?.synopsis).toBe(
      'Placeholder synopsis for the fixture. Second paragraph.',
    );
    expect(result.details?.attribution?.siteName).toBeDefined();
  });

  it('drops paid chapters and keeps ISO dates', async () => {
    const result = await harness.testTheme(
      seriesHTML,
      'https://example.org/comics/lorem-ipsum-7ba78ec7',
      { mangaKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7' },
    );

    expect(result.chapters?.map((chapter: any) => chapter.number)).toEqual([2, 1]);
    expect(result.chapters?.map((chapter: any) => chapter.title)).toEqual([
      'Chapter 2',
      'Chapter 1',
    ]);
    expect(result.chapters?.[0]?.key).toBe(
      'https://example.org/comics/lorem-ipsum-7ba78ec7/chapter/2',
    );
    // Microseconds are trimmed to an ISO 8601 value that Swift can parse.
    expect(result.chapters?.[0]?.publishedAt).toBe('2026-03-24T19:09:43.123Z');
  });

  it('keeps the declarative chapter fallback aligned with the row markup', async () => {
    // Hosts that inspect selectors without running hooks read the server
    // rendered rows: the first block holds the number, the second the date.
    // The bundle exports the adapter as its own `default`, and the harness
    // unwraps that key, so the copy has to point back at itself.
    const declarativeAdapter: any = { ...themeAdapter, hooks: {} };
    declarativeAdapter.default = declarativeAdapter;
    const declarative = new VMHarness(
      ['example.org'],
      runtimeIIFE,
      declarativeAdapter,
    );
    const result = await declarative.testTheme(
      seriesHTML,
      'https://example.org/comics/lorem-ipsum-7ba78ec7',
      { mangaKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7' },
    );

    expect(result.chapters?.map((chapter: any) => chapter.title)).toEqual([
      'Chapter 2',
      'Chapter 1',
    ]);
    // The rendered date is relative, so the runtime leaves it out.
    expect(result.chapters?.[0]?.publishedAt).toBeUndefined();
  });

  it('pages the chapter endpoint until a short batch', async () => {
    const result = await harness.testTheme(
      seriesHTML,
      'https://example.org/comics/lorem-paged-7ba78ec7',
      { mangaKey: 'https://example.org/comics/lorem-paged-7ba78ec7' },
    );

    expect(result.chapters?.length).toBe(202);
    expect(result.chapters?.[0]?.number).toBe(400);
    expect(result.chapters?.[201]?.number).toBe(199);
  });

  it('derives the API host from the configured site', async () => {
    const result = await harness.testTheme(
      seriesHTML,
      'https://example.com/comics/lorem-ipsum-7ba78ec7',
      { mangaKey: 'https://example.com/comics/lorem-ipsum-7ba78ec7' },
    );

    expect(result.chapters?.length).toBe(2);
    expect(result.chapters?.[0]?.key).toBe(
      'https://example.com/comics/lorem-ipsum-7ba78ec7/chapter/2',
    );
  });

  it('extracts reader pages from the server-rendered wrappers', async () => {
    const result = await harness.testTheme(
      readerHTML,
      'https://example.org/comics/lorem-ipsum-7ba78ec7/chapter/2',
      { chapterKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7/chapter/2' },
    );

    expect(result.pages?.map((page: any) => page.imageURL)).toEqual([
      'https://cdn.example.org/pages/2-1.jpg',
      'https://cdn.example.org/pages/2-2.jpg',
      'https://cdn.example.org/pages/2-3.jpg',
    ]);
    expect(result.pages?.map((page: any) => page.index)).toEqual([0, 1, 2]);
  });

  it('returns no pages for a locked chapter', async () => {
    // Detection runs on the site root in the app, so the reader is parsed
    // directly here: a locked chapter renders no page containers at all.
    const bridge = (harness as any).bridge;
    const runtime = (harness as any).runtime;
    const context = {
      adapter: themeAdapter,
      context: {
        baseURL: 'https://example.org/comics/lorem-ipsum-7ba78ec7/chapter/3',
        siteName: 'Example Site',
        overrides: {},
      },
      document: bridge.parseHTML(lockedReaderHTML),
      parseHTML: (value: string) => bridge.parseHTML(value),
    };
    const pages = JSON.parse(
      await runtime.dispatch(
        context,
        'pages',
        JSON.stringify({
          mangaKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7',
          chapterKey: 'https://example.org/comics/lorem-ipsum-7ba78ec7/chapter/3',
        }),
      ),
    );

    expect(pages).toEqual([]);
  });
});
