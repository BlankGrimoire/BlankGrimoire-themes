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
const sandbox: { 
  BlankGrimoireRuntime?: ThemeAdapter;
  defineTheme: typeof defineTheme;
  require: (id: string) => unknown;
} = { 
  BlankGrimoireRuntime: undefined,
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
const themeAdapter = sandbox.BlankGrimoireRuntime?.default ?? sandbox.BlankGrimoireRuntime;

if (!themeAdapter) {
  throw new Error('Failed to load theme adapter from bundle');
}

// Sample HTML from MangaNato home page
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MangaNato - MangaNato.Com | Read Free Manga & Manhwa Online</title>
    <link rel="stylesheet" href="https://www.manganato.gg/themes/manganato/css/style.css">
    <script src="https://www.manganato.gg/themes/manganato/js/jquery.min.js"></script>
    <script src="https://www.manganato.gg/themes/manganato/js/owl.carousel.min.js"></script>
</head>
<body>
    <nav class="wrap-menu-primary">
        <ul id="menu-menu-top" class="menu-primary">
            <li class="menu-item"><a href="https://www.manganato.gg/official">HOME</a></li>
            <li class="menu-item"><a href="https://www.manganato.gg/manga-list/latest-manga" title="LATEST MANGA">LATEST MANGA</a></li>
            <li class="menu-item"><a href="https://www.manganato.gg/manga-list/hot-manga" title="HOT MANGA">HOT MANGA</a></li>
            <li class="menu-item"><a href="https://www.manganato.gg/manga-list/new-manga" title="NEW MANGA">NEW MANGA</a></li>
            <li class="menu-item"><a href="https://www.manganato.gg/manga-list/completed-manga" title="COMPLETED MANGA">COMPLETED MANGA</a></li>
        </ul>
    </nav>
    <form name="frmsearch">
        <input id="search_story" autocomplete="off" placeholder="Search manga..." class="searchi">
        <div id="search_result"><ul></ul><div id="search-footer" class="searchf"></div></div>
        <input style="display: none;">
    </form>
    <div class="owl-carousel owl-theme" id="owl-demo">
        <div class="owl-wrapper-outer">
            <div class="owl-wrapper">
                <div class="owl-item">
                    <div class="item">
                        <a href="https://www.manganato.gg/manga/finding-the-invisible-star">
                            <img src="https://img-r1.2xstorage.com/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
                            <h3>Finding the Invisible Star</h3>
                            <span class="chapter">Chapter 8.5</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://www.manganato.gg/themes/manganato/js/main.js"></script>
</body>
</html>`;

// Sample HTML from MangaNato detail page
const detailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Finding the Invisible Star Manga Free - Read Finding the Invisible Star Latest Chapters Online Free | MangaNato</title>
</head>
<body>
    <div class="story-info-left">
        <img src="https://img-r1.2xstorage.com/thumb/finding-the-invisible-star.webp" alt="Finding the Invisible Star">
    </div>
    <div class="story-info-right">
        <h1>Finding the Invisible Star</h1>
        <table class="variations-table">
            <tr><td class="table-label">Author(s)</td><td class="table-value"><a href="/author/some-author">Some Author</a></td></tr>
            <tr><td class="table-label">Genre(s)</td><td class="table-value"><a href="/genre/romance">Romance</a></td></tr>
            <tr><td class="table-label">Status</td><td class="table-value">Ongoing</td></tr>
        </table>
        <div class="panel-story-info-description">Description of the manga...</div>
    </div>
    <div class="chapter-list">
        <div class="row"><span><a href="/manga/finding-the-invisible-star/chapter-8-5">Chapter 8.5</a></span><span>801</span><span>18 minutes ago</span></div>
        <div class="row"><span><a href="/manga/finding-the-invisible-star/chapter-8-1">Chapter 8.1</a></span><span>282</span><span>11 hours ago</span></div>
        <div class="row"><span><a href="/manga/finding-the-invisible-star/chapter-8">Chapter 8</a></span><span>1069</span><span>10-29 00:50</span></div>
        <div class="row"><span><a href="/manga/finding-the-invisible-star/chapter-7">Chapter 7</a></span><span>210</span><span>10-14 20:19</span></div>
        <div class="row"><span><a href="/manga/finding-the-invisible-star/chapter-1">Chapter 1</a></span><span>1118</span><span>08-05 20:41</span></div>
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-8-5" data-url="/manga/finding-the-invisible-star/chapter-8-5">Chapter 8.5</option>
        <option value="chapter-8" data-url="/manga/finding-the-invisible-star/chapter-8">Chapter 8</option>
        <option value="chapter-1" data-url="/manga/finding-the-invisible-star/chapter-1">Chapter 1</option>
    </select>
</body>
</html>`;

// Sample HTML from MangaNato chapter/reader page
const readerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Finding the Invisible Star Chapter 8.5 - Read Online Free | MangaNato</title>
</head>
<body class="chapter-page">
    <div class="container-chapter-reader">
        <img src="https://img-r1.2xstorage.com/finding-the-invisible-star/8.5/0.webp" />
        <img src="https://img-r1.2xstorage.com/finding-the-invisible-star/8.5/1.webp" />
        <img src="https://img-r1.2xstorage.com/finding-the-invisible-star/8.5/2.webp" />
    </div>
    <select class="navi-change-chapter" id="chapter-dropdown">
        <option value="chapter-8-5" data-url="/manga/finding-the-invisible-star/chapter-8-5">Chapter 8.5</option>
        <option value="chapter-8" data-url="/manga/finding-the-invisible-star/chapter-8">Chapter 8</option>
        <option value="chapter-1" data-url="/manga/finding-the-invisible-star/chapter-1">Chapter 1</option>
    </select>
</body>
</html>`;

let harness: VMHarness;

beforeAll(async () => {
  // Load theme adapter from bundle
  const { defineTheme } = await import('@blankgrimoire/types');
  const sandbox: { 
    BlankGrimoireRuntime?: ThemeAdapter;
    defineTheme: typeof defineTheme;
    require: (id: string) => unknown;
  } = { 
    BlankGrimoireRuntime: undefined,
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
  const themeAdapter = sandbox.BlankGrimoireRuntime?.default ?? sandbox.BlankGrimoireRuntime;

  if (!themeAdapter) {
    throw new Error('Failed to load theme adapter from bundle');
  }

  harness = new VMHarness(
    ['example.org'],
    runtimeIIFE,
    themeAdapter,
  );
});

describe('MangaNato Theme Adapter', () => {
  it('detects the theme on home page', async () => {
    const result = await harness.testTheme(homeHTML, 'https://example.org/');
    
    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.detectionSignature.minScore).toBe(20);
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

  it('extracts manga details', async () => {
    const result = await harness.testTheme(detailHTML, 'https://example.org/manga/test', {
      mangaKey: 'finding-the-invisible-star'
    });
    
    expect(result.details).toBeDefined();
    expect(result.details?.title).toBe('Finding the Invisible Star');
    expect(result.details?.genres).toContain('Romance');
    expect(result.details?.status).toBe('ongoing');
  });

  it('extracts chapter list in desc order', async () => {
    const result = await harness.testTheme(detailHTML, 'https://example.org/manga/test', {
      mangaKey: 'finding-the-invisible-star'
    });
    
    expect(result.chapters).toBeDefined();
    expect(result.chapters?.length).toBeGreaterThan(0);
    expect(result.chapters?.[0]).toHaveProperty('key');
    expect(result.chapters?.[0]).toHaveProperty('title');
    // Should be ordered desc (newest first)
    expect(result.chapters?.[0].title).toContain('8.5');
  });

  it('extracts pages from reader', async () => {
    const result = await harness.testTheme(readerHTML, 'https://example.org/manga/test/chapter-8-5', {
      mangaKey: 'finding-the-invisible-star',
      chapterKey: 'chapter-8-5'
    });
    
    expect(result.pages).toBeDefined();
    expect(result.pages?.length).toBeGreaterThan(0);
    expect(result.pages?.[0]).toHaveProperty('imageURL');
    expect(result.pages?.[0].imageURL).toMatch(/2xstorage\.com/);
  });

  it('skips premium chapters when premiumMarker matches', async () => {
    const premiumHTML = `<!DOCTYPE html>
<html><body>
    <div class="chapter-list">
        <div class="row"><span><a href="/manga/test/chapter-1">Chapter 1</a></span><span>100</span><span>1 hour ago</span></div>
        <div class="row"><span><a href="/manga/test/chapter-2">Chapter 2</a></span><span>50</span><span>2 hours ago</span></div>
        <div class="row"><span><a href="/manga/test/chapter-3"><i class="fa-coins"></i> Chapter 3 (Premium)</a></span><span>10</span><span>3 hours ago</span></div>
    </div>
</body></html>`;
    
    const result = await harness.testTheme(premiumHTML, 'https://example.org/manga/test', {
      mangaKey: 'test'
    });
    
    // Chapter 3 should be skipped because it has .fa-coins
    expect(result.chapters?.length).toBe(2);
    expect(result.chapters?.map(c => c.title)).not.toContain('Chapter 3 (Premium)');
  });
});