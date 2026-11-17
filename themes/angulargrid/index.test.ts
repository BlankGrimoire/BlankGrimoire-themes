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

/** Synthetic listing page: the card grid behind search and genre pages. */
const listingHTML = `<!DOCTYPE html>
<html lang="en" data-beasties-container>
<body>
  <app-root ng-version="1.0.0">
    <main>
      <a class="bc" href="/series/lorem-ipsum" aria-label="Lorem Ipsum">
        <div class="bc-cover">
          <img class="bc-img" src="https://media.example.org/covers/lorem.webp" alt="Lorem Ipsum">
          <div class="bc-badges"><span class="bc-type">SERIAL</span></div>
        </div>
        <div class="bc-overlay"><p class="bc-title">Lorem Ipsum</p></div>
      </a>
      <a class="bc" href="/series/dolor-sit-amet" aria-label="Dolor Sit Amet">
        <div class="bc-cover">
          <img class="bc-img" src="https://media.example.org/covers/dolor.webp" alt="Dolor Sit Amet">
        </div>
        <div class="bc-overlay"><p class="bc-title">Dolor Sit Amet</p></div>
      </a>
    </main>
  </app-root>
</body>
</html>`;

/** Synthetic series page: metadata plus a chapter list with one paid row. */
const seriesHTML = `<!DOCTYPE html>
<html lang="en" data-beasties-container>
<body>
  <app-root ng-version="1.0.0">
    <main>
      <div class="series-card">
        <div class="cover-col"><img class="cover-img" src="https://media.example.org/covers/lorem.webp"></div>
        <div class="info-col">
          <h1 class="series-title">Lorem Ipsum</h1>
          <p class="alt-titles">Dolor Sit Amet</p>
          <p class="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div class="genres">
            <a class="genre-tag">Fantasy</a>
            <a class="genre-tag">Drama</a>
          </div>
          <span class="badge badge--status">Ongoing</span>
        </div>
      </div>
      <div class="cl-wrap">
        <a class="cl-row" href="/series/lorem-ipsum/chapter-3">
          <img class="cl-thumb" src="https://media.example.org/thumbs/3.webp">
          <div class="cl-info"><span class="cl-num">Chapter 3</span><span class="cl-date">2h ago</span></div>
          <div class="cl-meta"><span class="cl-price">10</span></div>
        </a>
        <a class="cl-row" href="/series/lorem-ipsum/chapter-2">
          <img class="cl-thumb" src="https://media.example.org/thumbs/2.webp">
          <div class="cl-info"><span class="cl-num">Chapter 2</span><span class="cl-date">1d ago</span></div>
        </a>
        <a class="cl-row" href="/series/lorem-ipsum/chapter-1">
          <img class="cl-thumb" src="https://media.example.org/thumbs/1.webp">
          <div class="cl-info"><span class="cl-num">Chapter 1</span><span class="cl-date">2d ago</span></div>
        </a>
      </div>
    </main>
  </app-root>
</body>
</html>`;

/** Synthetic reader page: one image per page inside the strip. */
const readerHTML = `<!DOCTYPE html>
<html lang="en" data-beasties-container>
<body>
  <app-root ng-version="1.0.0">
    <main class="main-content main-content--reader">
      <div class="r-strip">
        <div class="r-page" data-page="1"><img class="r-page-img" src="https://media.example.org/pages/00.webp" alt="Page 1"></div>
        <div class="r-page" data-page="2"><img class="r-page-img" src="https://media.example.org/pages/01.webp" alt="Page 2"></div>
        <div class="r-page" data-page="3"><img class="r-page-img" src="https://media.example.org/pages/02.webp" alt="Page 3"></div>
      </div>
    </main>
  </app-root>
</body>
</html>`;

/** Synthetic paid reader page: the strip is replaced by the paywall block. */
const paywalledHTML = `<!DOCTYPE html>
<html lang="en" data-beasties-container>
<body>
  <app-root ng-version="1.0.0">
    <main class="main-content main-content--reader">
      <div class="r-strip paywalled-content">
        <div class="rpw-wrap">
          <h2 class="rpw-heading">Continue reading</h2>
          <p class="rpw-desc">This chapter is locked.</p>
          <button class="rpw-btn">Unlock</button>
        </div>
      </div>
    </main>
  </app-root>
</body>
</html>`;

let harness: VMHarness;

beforeAll(() => {
  harness = new VMHarness(['example.org'], runtimeIIFE, {
    default: themeAdapter,
  });
});

describe('Angular Grid Theme Adapter', () => {
  it('declares the hidden web view because the page is client-rendered', () => {
    expect(themeAdapter.detectionSignature.usesWebViewMode).toBe(true);
    expect(themeAdapter.apiVersion).toBe(1);
  });

  it('detects the stack from the Angular root and the inlined critical CSS', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/browse?q=lorem');

    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('extracts listing cards with resolved keys and covers', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/browse?q=lorem');

    expect(result.search?.items).toEqual([
      {
        key: 'https://example.org/series/lorem-ipsum',
        title: 'Lorem Ipsum',
        coverURL: 'https://media.example.org/covers/lorem.webp',
      },
      {
        key: 'https://example.org/series/dolor-sit-amet',
        title: 'Dolor Sit Amet',
        coverURL: 'https://media.example.org/covers/dolor.webp',
      },
    ]);
    expect(result.search?.hasNextPage).toBe(false);
  });

  it('reads series metadata and drops paid chapters', async () => {
    const result = await harness.testTheme(seriesHTML, 'https://example.org/series/lorem-ipsum', {
      mangaKey: 'lorem-ipsum',
    });

    expect(result.details).toMatchObject({
      key: 'lorem-ipsum',
      title: 'Lorem Ipsum',
      altTitles: ['Dolor Sit Amet'],
      tags: ['Fantasy', 'Drama'],
      status: 'ongoing',
    });
    expect(result.details?.synopsis).toContain('Lorem ipsum');
    expect(result.chapters?.map((chapter) => chapter.key)).toEqual([
      'https://example.org/series/lorem-ipsum/chapter-2',
      'https://example.org/series/lorem-ipsum/chapter-1',
    ]);
  });

  it('extracts reader pages in document order', async () => {
    const result = await harness.testTheme(
      readerHTML,
      'https://example.org/series/lorem-ipsum/chapter-2',
      {
        mangaKey: 'lorem-ipsum',
        chapterKey: 'https://example.org/series/lorem-ipsum/chapter-2',
      },
    );

    expect(result.pages?.map((page) => page.imageURL)).toEqual([
      'https://media.example.org/pages/00.webp',
      'https://media.example.org/pages/01.webp',
      'https://media.example.org/pages/02.webp',
    ]);
  });

  it('returns no pages for a locked chapter', async () => {
    const result = await harness.testTheme(
      paywalledHTML,
      'https://example.org/series/lorem-ipsum/chapter-3',
      {
        mangaKey: 'lorem-ipsum',
        chapterKey: 'https://example.org/series/lorem-ipsum/chapter-3',
      },
    );

    expect(result.pages).toEqual([]);
  });
});
