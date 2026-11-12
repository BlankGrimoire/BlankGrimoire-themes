// SPDX-License-Identifier: MPL-2.0

import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import type { ThemeAdapter } from '@blankgrimoire/types';
import { VMHarness } from '@blankgrimoire/testing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runtimeIIFE = readFileSync(
  join(__dirname, '../../../BlankGrimoire-sdk/packages/runtime/dist/runtime.js'),
  'utf8',
);

const themeBundle = readFileSync(
  join(__dirname, 'bundle.js'),
  'utf8',
);

// Load the theme from the bundle
const { defineTheme } = await import('@blankgrimoire/types');
// Create a sandbox with proper globals for the IIFE bundle to export
const module = { exports: {} as Record<string, any> };
const exports = module.exports;
const sandbox: any = {
  module,
  exports,
  window: {},
  globalThis: {},
  defineTheme,
  require: (id: string) => {
    if (id === '@blankgrimoire/types') {
      return { defineTheme };
    }
    throw new Error(`Module ${id} not found in sandbox`);
  }
};
const script = new Script(themeBundle);
script.runInNewContext(sandbox);
const themeAdapter = module.exports?.default ?? module.exports ?? sandbox.BlankGrimoireRuntime?.default ?? sandbox.BlankGrimoireRuntime;

if (!themeAdapter) {
  throw new Error('Failed to load theme adapter from bundle');
}

// Sample HTML from home page - complete with all selectors needed for detection
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Site - Read Free Content Online</title>
    <link rel="stylesheet" href="https://example.org/themes/style.css">
    <script src="https://example.org/themes/js/jquery.min.js"></script>
    <script src="https://example.org/themes/js/owl.carousel.min.js"></script>
</head>
<body>
    <div class="panel-story-info-description">Site description...</div>
    <nav class="wrap-menu-primary">
        <ul id="menu-menu-top" class="menu-primary">
            <li class="menu-item"><a href="https://example.org/official">HOME</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/latest" title="LATEST">LATEST</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/hot" title="HOT">HOT</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/new" title="NEW">NEW</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/completed" title="COMPLETED">COMPLETED</a></li>
        </ul>
    </nav>
    <form name="frmsearch">
        <input id="search_story" autocomplete="off" placeholder="Search..." class="searchi">
        <div id="search_result">
            <ul>
                <li>
                    <a href="https://example.org/item/finding-the-invisible-star">
                        <img src="https://cdn.example.org/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
                        <h3>Finding the Invisible Star</h3>
                    </a>
                </li>
                <li>
                    <a href="https://example.org/item/another-series">
                        <img src="https://cdn.example.org/thumb/another-series.webp" alt="Another Series">
                        <h3>Another Series</h3>
                    </a>
                </li>
            </ul>
            <div id="search-footer" class="searchf"></div>
        </div>
        <input style="display: none;">
    </form>
    <div class="owl-carousel owl-theme" id="owl-demo">
        <div class="owl-wrapper-outer">
            <div class="owl-wrapper">
                <div class="owl-item">
                    <div class="item">
                        <a href="https://example.org/item/finding-the-invisible-star">
                            <img src="https://cdn.example.org/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
                            <h3>Finding the Invisible Star</h3>
                            <span class="chapter">Chapter 8.5</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="chapter-list">
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-8-5">Chapter 8.5</a></span><span>801</span><span>18 minutes ago</span></div>
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-8-1">Chapter 8.1</a></span><span>282</span><span>11 hours ago</span></div>
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-8-5" data-url="/item/finding-the-invisible-star/chapter-8-5">Chapter 8.5</option>
        <option value="chapter-8" data-url="/item/finding-the-invisible-star/chapter-8">Chapter 8</option>
        <option value="chapter-1" data-url="/item/finding-the-invisible-star/chapter-1">Chapter 1</option>
    </select>
    <div class="container-chapter-reader"></div>
    <script src="https://example.org/themes/js/main.js"></script>
</body>
<\/html>`;

// Sample HTML from detail page - includes detection selectors
const detailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Finding the Invisible Star - Read Free Online</title>
    <link rel="stylesheet" href="https://example.org/themes/style.css">
    <script src="https://example.org/themes/js/jquery.min.js"></script>
    <script src="https://example.org/themes/js/owl.carousel.min.js"></script>
</head>
<body>
    <div class="panel-story-info-description">Site description...</div>
    <nav class="wrap-menu-primary">
        <ul id="menu-menu-top" class="menu-primary">
            <li class="menu-item"><a href="https://example.org/official">HOME</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/latest" title="LATEST">LATEST</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/hot" title="HOT">HOT</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/new" title="NEW">NEW</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/completed" title="COMPLETED">COMPLETED</a></li>
        </ul>
    </nav>
    <form name="frmsearch">
        <input id="search_story" autocomplete="off" placeholder="Search..." class="searchi">
        <div id="search_result"><ul></ul><div id="search-footer" class="searchf"></div></div>
        <input style="display: none;">
    </form>
    <div class="owl-carousel owl-theme" id="owl-demo">
        <div class="owl-wrapper-outer">
            <div class="owl-wrapper">
                <div class="owl-item">
                    <div class="item">
                        <a href="https://example.org/item/finding-the-invisible-star">
                            <img src="https://cdn.example.org/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
                            <h3>Finding the Invisible Star</h3>
                            <span class="chapter">Chapter 8.5</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="story-info-left">
        <img src="https://cdn.example.org/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
    </div>
    <div class="story-info-right">
        <h1>Finding the Invisible Star</h1>
        <table class="variations-table">
            <tr><td class="table-label">Author(s)</td><td class="table-value"><a href="/author/some-author">Some Author</a></td></tr>
            <tr><td class="table-label">Genre(s)</td><td class="table-value"><a href="/genre/action">Action</a></td></tr>
            <tr><td class="table-label">Status</td><td class="table-value status-value">Ongoing</td></tr>
        </table>
        <div class="panel-story-info-description">Description of the series...</div>
    </div>
    <div class="chapter-list">
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-8-5">Chapter 8.5</a></span><span>801</span><span>18 minutes ago</span></div>
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-8-1">Chapter 8.1</a></span><span>282</span><span>11 hours ago</span></div>
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-8">Chapter 8</a></span><span>1069</span><span>10-29 00:50</span></div>
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-7">Chapter 7</a></span><span>210</span><span>10-14 20:19</span></div>
        <div class="row"><span><a href="/item/finding-the-invisible-star/chapter-1">Chapter 1</a></span><span>1118</span><span>08-05 20:41</span></div>
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-8-5" data-url="/item/finding-the-invisible-star/chapter-8-5">Chapter 8.5</option>
        <option value="chapter-8" data-url="/item/finding-the-invisible-star/chapter-8">Chapter 8</option>
        <option value="chapter-1" data-url="/item/finding-the-invisible-star/chapter-1">Chapter 1</option>
    </select>
    <div class="container-chapter-reader"></div>
    <script src="https://example.org/themes/js/main.js"></script>
</body>
<\/html>`;

// Sample HTML from chapter/reader page - includes detection selectors
const readerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Finding the Invisible Star Chapter 8.5 - Read Online Free</title>
    <link rel="stylesheet" href="https://example.org/themes/style.css">
    <script src="https://example.org/themes/js/jquery.min.js"></script>
    <script src="https://example.org/themes/js/owl.carousel.min.js"></script>
</head>
<body class="chapter-page">
    <div class="panel-story-info-description">Site description...</div>
    <nav class="wrap-menu-primary">
        <ul id="menu-menu-top" class="menu-primary">
            <li class="menu-item"><a href="https://example.org/official">HOME</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/latest" title="LATEST">LATEST</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/hot" title="HOT">HOT</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/new" title="NEW">NEW</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/completed" title="COMPLETED">COMPLETED</a></li>
        </ul>
    </nav>
    <form name="frmsearch">
        <input id="search_story" autocomplete="off" placeholder="Search..." class="searchi">
        <div id="search_result"><ul></ul><div id="search-footer" class="searchf"></div></div>
        <input style="display: none;">
    </form>
    <div class="owl-carousel owl-theme" id="owl-demo">
        <div class="owl-wrapper-outer">
            <div class="owl-wrapper">
                <div class="owl-item">
                    <div class="item">
                        <a href="https://example.org/item/finding-the-invisible-star">
                            <img src="https://cdn.example.org/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
                            <h3>Finding the Invisible Star</h3>
                            <span class="chapter">Chapter 8.5</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container-chapter-reader">
        <img src="https://cdn.example.org/item/finding-the-invisible-star/8.5/0.webp" />
        <img src="https://cdn.example.org/item/finding-the-invisible-star/8.5/1.webp" />
        <img src="https://cdn.example.org/item/finding-the-invisible-star/8.5/2.webp" />
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-8-5" data-url="/item/finding-the-invisible-star/chapter-8-5">Chapter 8.5</option>
        <option value="chapter-8" data-url="/item/chapter-8">Chapter 8</option>
        <option value="chapter-1" data-url="/item/chapter-1">Chapter 1</option>
    </select>
    <script src="https://example.org/themes/js/main.js"></script>
</body>
<\/html>`;

let harness: any;

beforeAll(async () => {
  // Load theme adapter from bundle
  const { defineTheme } = await import('@blankgrimoire/types');
  // The VM harness evaluates the adapter and the runtime in separate contexts,
  // so bridge the adapter's `__native` to the harness-provided transport.
  const nativeProxy: any = {};
  // Create a sandbox with proper globals for the IIFE bundle to export
  const module = { exports: {} as Record<string, any> };
  const exports = module.exports;
  const sandbox: any = {
    __native: {
      request: (request: any) => nativeProxy.request(request),
    },
    module,
    exports,
    window: {},
    globalThis: {},
    defineTheme,
    require: (id: string) => {
      if (id === '@blankgrimoire/types') {
        return { defineTheme };
      }
      throw new Error(`Module ${id} not found in sandbox`);
    }
  };
  const script = new Script(themeBundle);
  script.runInNewContext(sandbox);
  const themeAdapter = module.exports?.default ?? module.exports ?? sandbox.BlankGrimoireRuntime?.default ?? sandbox.BlankGrimoireRuntime;

  if (!themeAdapter) {
    throw new Error('Failed to load theme adapter from bundle');
  }

  const { VMHarness } = await import('@blankgrimoire/testing');

  harness = new VMHarness(
    ['example.org', 'cdn.example.org'],
    runtimeIIFE,
    themeAdapter,
  );

  // The chapter list lives behind a JSON endpoint. Serve a deterministic
  // two-page response so the hook, its pagination and the date normalization
  // are exercised without network access.
  const chapterPages: Record<string, unknown> = {
    '0': {
      success: true,
      data: {
        chapters: [
          {
            chapter_name: 'Chapter 4',
            chapter_slug: 'chapter-4',
            chapter_num: 4,
            updated_at: '2026-03-25T19:09:43.000000Z',
            view: 40,
          },
          {
            chapter_name: 'Chapter 3',
            chapter_slug: 'chapter-3',
            chapter_num: 3,
            updated_at: '2026-03-24T19:09:43.000000Z',
            view: 30,
          },
        ],
        pagination: { total: 4, limit: 50, offset: 0, has_more: true },
      },
    },
    '50': {
      success: true,
      data: {
        chapters: [
          {
            chapter_name: 'Chapter 2',
            chapter_slug: 'chapter-2',
            chapter_num: 2,
            updated_at: '2026-03-23T19:09:43.000000Z',
            view: 20,
          },
          {
            chapter_name: 'Chapter 1',
            chapter_slug: 'chapter-1',
            chapter_num: 1,
            updated_at: '2026-03-22T19:09:43.000000Z',
            view: 10,
          },
        ],
        pagination: { total: 4, limit: 50, offset: 50, has_more: false },
      },
    },
  };

  const bridge = (harness as any).bridge;
  const originalRequest = bridge.request.bind(bridge);
  nativeProxy.request = async (request: any) => {
    const url = String(request.url);
    if (url.includes('/api/manga/')) {
      const offset = new URL(url).searchParams.get('offset') ?? '0';
      return {
        status: 200,
        url,
        headers: {},
        body: JSON.stringify(chapterPages[offset] ?? chapterPages['50']),
      };
    }
    return originalRequest(request);
  };
});

describe('Carousel List Grid Theme Adapter', () => {
  it('detects the theme on home page', async () => {
    const result = await harness.testTheme(homeHTML, 'https://example.org/');
    
    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(15);
    expect(result.detectionSignature.minScore).toBe(15);
  });

  it('exposes the genre discovery and filtering contract', () => {
    const genre = themeAdapter.selectors.genre;

    expect(genre).toBeDefined();
    // The genre links live on the home page.
    expect(genre.pagePath).toBe('/');
    // A genre result page is `/genre/<slug>`.
    expect(genre.filterPath).toBe('/genre/{genre}');
    expect(genre.source).toBe(".panel-category a[href*='/genre/'][title]");
    // The slug is extracted from the link target, e.g. `/genre/boys-love`.
    expect(genre.valueAttr).toBe('href');
    expect(genre.valuePattern).toBe('/genre/([^/?#]+)');
    expect(genre.filterPath.replace('{genre}', 'boys-love')).toBe('/genre/boys-love');
  });

  it('extracts search results', async () => {
    const result = await harness.testTheme(homeHTML, 'https://example.org/', {
      searchQuery: { page: 1, text: 'test' }
    });
    
    expect(result.search).toBeDefined();
    expect(result.search?.items.length).toBeGreaterThan(0);
    expect(result.search?.items[0]).toHaveProperty('key');
    expect(result.search?.items[0]).toHaveProperty('title');
  });

  it('extracts details', async () => {
    const result = await harness.testTheme(detailHTML, 'https://example.org/item/test', {
      mangaKey: 'finding-the-invisible-star'
    });
    
    expect(result.details).toBeDefined();
    expect(result.details?.title).toBe('Finding the Invisible Star');
    expect(result.details?.tags).toContain('Action');
    expect(result.details?.status).toBe('ongoing');
  });

  it('extracts chapter list in desc order', async () => {
    const result = await harness.testTheme(detailHTML, 'https://example.org/item/test', {
      mangaKey: 'finding-the-invisible-star'
    });
    
    expect(result.chapters).toBeDefined();
    // Two mocked pages of two chapters each.
    expect(result.chapters?.length).toBe(4);
    expect(result.chapters?.[0]).toHaveProperty('key');
    expect(result.chapters?.[0]).toHaveProperty('title');
    // Should be ordered desc (newest first)
    expect(result.chapters?.map((c: any) => c.title)).toEqual([
      'Chapter 4',
      'Chapter 3',
      'Chapter 2',
      'Chapter 1',
    ]);
  });

  it('extracts pages from reader', async () => {
    const result = await harness.testTheme(readerHTML, 'https://example.org/item/test/chapter-8-5', {
      mangaKey: 'finding-the-invisible-star',
      chapterKey: 'chapter-8-5'
    });
    
    expect(result.pages).toBeDefined();
    expect(result.pages?.length).toBeGreaterThan(0);
    expect(result.pages?.[0]).toHaveProperty('imageURL');
    expect(result.pages?.[0].imageURL).toMatch(/cdn\.example\.org/);
  });

  it('reads chapters from the JSON endpoint instead of the embedded list', async () => {
    const premiumHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Series - Chapter List</title>
    <link rel="stylesheet" href="https://example.org/themes/style.css">
    <script src="https://example.org/themes/js/jquery.min.js"></script>
    <script src="https://example.org/themes/js/owl.carousel.min.js"></script>
</head>
<body>
    <div class="panel-story-info-description">Site description...</div>
    <nav class="wrap-menu-primary">
        <ul id="menu-menu-top" class="menu-primary">
            <li class="menu-item"><a href="https://example.org/official">HOME</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/latest" title="LATEST">LATEST</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/hot" title="HOT">HOT</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/new" title="NEW">NEW</a></li>
            <li class="menu-item"><a href="https://example.org/item-list/completed" title="COMPLETED">COMPLETED</a></li>
        </ul>
    </nav>
    <form name="frmsearch">
        <input id="search_story" autocomplete="off" placeholder="Search..." class="searchi">
        <div id="search_result"><ul></ul><div id="search-footer" class="searchf"></div></div>
        <input style="display: none;">
    </form>
    <div class="owl-carousel owl-theme" id="owl-demo">
        <div class="owl-wrapper-outer">
            <div class="owl-wrapper">
                <div class="owl-item">
                    <div class="item">
                        <a href="https://example.org/item/test">
                            <img src="https://cdn.example.org/thumb/test.webp" alt="Test Series">
                            <h3>Test Series</h3>
                            <span class="chapter">Chapter 3</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="chapter-list">
        <div class="row"><span><a href="/item/test/chapter-1">Chapter 1</a></span><span>100</span><span>1 hour ago</span></div>
        <div class="row"><span><a href="/item/test/chapter-2">Chapter 2</a></span><span>50</span><span>2 hours ago</span></div>
        <div class="row"><span><a href="/item/test/chapter-3"><i class="fa-coins"></i> Chapter 3 (Premium)</a></span><span>10</span><span>3 hours ago</span></div>
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-3" data-url="/item/test/chapter-3">Chapter 3</option>
        <option value="chapter-2" data-url="/item/test/chapter-2">Chapter 2</option>
        <option value="chapter-1" data-url="/item/test/chapter-1">Chapter 1</option>
    </select>
    <div class="container-chapter-reader"></div>
    <script src="https://example.org/themes/js/main.js"></script>
</body>
<\/html>`;
    
    const result = await harness.testTheme(premiumHTML, 'https://example.org/item/test', {
      mangaKey: 'test'
    });
    
    // The embedded rows in the fixture are ignored: the hook reads the same
    // JSON endpoint the site uses.
    expect(result.chapters?.length).toBe(4);
    expect(result.chapters?.map((c: any) => c.title)).not.toContain('Chapter 3 (Premium)');
    expect(result.chapters?.[0].key).toBe('https://example.org/manga/test/chapter-4');
    expect(result.chapters?.[0].number).toBe(4);
    // Microseconds are trimmed to an ISO 8601 value that Swift can parse.
    expect(result.chapters?.[0].publishedAt).toBe('2026-03-25T19:09:43.000Z');
  });
})
