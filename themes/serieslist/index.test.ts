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

/**
 * Synthetic listing page: a card grid with the shared card markup, a section
 * header, per-card genre links and pagination. All content is placeholder text.
 */
const listingHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Example Library</title></head>
<body>
  <div class="bixbox">
    <div class="releases"><h2>Latest Update</h2></div>
    <div class="listupd">
      <div class="bs">
        <div class="bsx">
          <a href="https://example.org/series/lorem-ipsum/" title="Lorem Ipsum">
            <div class="limit">
              <div class="ply"></div>
              <img src="https://example.org/media/lorem.jpg" class="ts-post-image wp-post-image" alt="Lorem Ipsum">
            </div>
            <div class="bigor">
              <div class="tt">Lorem Ipsum</div>
              <div class="adds"><div class="epxs">Chapter 12</div></div>
            </div>
          </a>
        </div>
        <div class="meta">
          <div class="metas-slider-genres">
            <span class="metas-genres-values">
              <a href="https://example.org/genres/fantasy/" rel="tag">Fantasy</a>
            </span>
          </div>
        </div>
      </div>
      <div class="bs">
        <div class="bsx">
          <a href="https://example.org/series/dolor-sit-amet/" title="Dolor Sit Amet">
            <div class="limit">
              <div class="ply"></div>
              <img src="https://example.org/media/dolor.jpg" class="ts-post-image wp-post-image" alt="Dolor Sit Amet">
            </div>
            <div class="bigor">
              <div class="tt">Dolor Sit Amet</div>
              <div class="adds"><div class="epxs">Chapter 3</div></div>
            </div>
          </a>
        </div>
        <div class="meta">
          <div class="metas-slider-genres">
            <span class="metas-genres-values">
              <a href="https://example.org/genres/drama/" rel="tag">Drama</a>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination">
      <span class="page-numbers current">1</span>
      <a class="page-numbers" href="https://example.org/page/2/?s=test">2</a>
      <a class="next page-numbers" href="https://example.org/page/2/?s=test">Next</a>
    </div>
  </div>
</body>
</html>`;

/** Synthetic series page using the stacked header variant. */
const stackedSeriesHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Lorem Ipsum</title></head>
<body>
  <div class="headpost"><h1 class="entry-title">Lorem Ipsum</h1></div>
  <div class="ts-breadcrumb bixbox">Home › Lorem Ipsum</div>
  <div class="seriestucon">
    <div class="seriestuheader">
      <h1 class="entry-title">Lorem Ipsum</h1>
      <div class="seriestualt">Ipsum Lorem</div>
    </div>
    <div class="seriestucontent">
      <div class="seriestucontl">
        <div class="thumb"><img src="https://example.org/media/lorem-cover.jpg" alt="Lorem Ipsum"></div>
      </div>
      <div class="seriestucontentr">
        <div class="entry-content entry-content-single">
          <p>Placeholder synopsis for the synthetic fixture.</p>
        </div>
        <table class="infotable">
          <tbody>
            <tr><td>Status</td><td>Ongoing</td></tr>
            <tr><td>Type</td><td>Series</td></tr>
            <tr><td>Alternative Names</td><td>Ipsum Lorem</td></tr>
            <tr><td>Posted By</td><td>Placeholder Uploader</td></tr>
          </tbody>
        </table>
        <div class="seriestugenre">
          <a href="https://example.org/genres/fantasy/" rel="tag">Fantasy</a>
          <a href="https://example.org/genres/drama/" rel="tag">Drama</a>
        </div>
      </div>
    </div>
  </div>
  <div class="bixbox bxcl">
    <div class="releases"><h2>Chapters</h2></div>
    <div class="eplister" id="chapterlist">
      <ul>
        <li data-num="3">
          <div class="chbox">
            <div class="eph-num">
              <a href="https://example.org/series/lorem-ipsum-chapter-3/">
                <span class="chapternum">Chapter 3</span>
                <span class="chapterdate">March 3, 2026</span>
              </a>
            </div>
          </div>
        </li>
        <li data-num="2">
          <div class="chbox">
            <div class="eph-num">
              <a href="https://example.org/series/lorem-ipsum-chapter-2/">
                <span class="chapternum">Chapter 2</span>
                <span class="chapterdate">March 2, 2026</span>
              </a>
            </div>
          </div>
        </li>
        <li data-num="1">
          <div class="chbox">
            <div class="eph-num">
              <a href="https://example.org/series/lorem-ipsum-chapter-1/">
                <span class="chapternum">Chapter 1</span>
                <span class="chapterdate">March 1, 2026</span>
              </a>
            </div>
          </div>
        </li>
        <li data-num="4">
          <div class="chbox">
            <div class="eph-num">
              <a href="https://example.org/series/lorem-ipsum-chapter-4/">
                <span class="chapternum">Chapter 4</span>
                <span class="chapterdate">March 4, 2026</span>
              </a>
            </div>
            <span class="text-gold">100</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</body>
</html>`;

/** Synthetic series page using the split header variant. */
const splitSeriesHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Dolor Sit Amet</title></head>
<body>
  <div class="headpost"><h1 class="entry-title">Dolor Sit Amet</h1></div>
  <div class="ts-breadcrumb bixbox">Home › Dolor Sit Amet</div>
  <div class="main-info">
    <div class="first-half">
      <div class="info-half">
        <div class="titles">
          <h1 class="entry-title">Dolor Sit Amet</h1>
          <div class="alternative">
            <div class="desktop-titles">Amet Dolor | Sit Lorem</div>
          </div>
        </div>
        <div class="genres-container">
          <div class="wd-full">
            <span class="mgen">
              <a href="https://example.org/genres/drama/" rel="tag">Drama</a>
            </span>
          </div>
        </div>
        <div class="summary">
          <div class="wd-full">
            <div class="entry-content entry-content-single">
              <p>Another synthetic synopsis.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="thumb-half">
        <div class="thumb"><img src="https://example.org/media/dolor-cover.jpg" alt="Dolor Sit Amet"></div>
      </div>
    </div>
    <div class="second-half">
      <div class="left-side">
        <div class="tsinfo bixbox">
          <div class="imptdt"><h1>Type</h1><i>Series</i></div>
          <div class="imptdt"><h1>Status</h1><i>Completed</i></div>
          <div class="imptdt"><h1>Released</h1><i>2024</i></div>
          <div class="imptdt"><h1>Author</h1><i>Placeholder Author</i></div>
          <div class="imptdt"><h1>Artist</h1><i>Placeholder Artist</i></div>
        </div>
      </div>
      <div class="right-side">
        <div class="bixbox bxcl">
          <div class="releases"><h2>Chapters</h2></div>
          <div class="eplister" id="chapterlist">
            <ul>
              <li data-num="2">
                <a href="https://example.org/series/dolor-sit-amet-chapter-2/">
                  <div class="chbox">
                    <div class="eph-num">
                      <span class="chapternum">Chapter 2</span>
                      <span class="chapterdate">April 2, 2026</span>
                    </div>
                  </div>
                </a>
              </li>
              <li data-num="1">
                <a href="https://example.org/series/dolor-sit-amet-chapter-1/">
                  <div class="chbox">
                    <div class="eph-num">
                      <span class="chapternum">Chapter 1</span>
                      <span class="chapterdate">April 1, 2026</span>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

/** Synthetic reader page whose pages are rendered in the HTML. */
const serverReaderHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Lorem Ipsum Chapter 3</title></head>
<body>
  <div class="chapterbody">
  <div class="headpost"><h1 class="entry-title">Lorem Ipsum Chapter 3</h1></div>
  <div class="ts-breadcrumb bixbox">Home › Lorem Ipsum › Chapter 3</div>
  <div id="readerarea">
    <p>
      <img src="https://example.org/media/page-1.jpg" alt="page 1">
      <img src="https://example.org/media/page-2.jpg" alt="page 2">
      <img data-src="https://example.org/media/page-3.jpg" alt="page 3">
    </p>
  </div>
  <div class="chnav cbot">
    <span class="selector slc l"><div class="nvx"><select id="chapter"></select></div></span>
  </div>
  </div>
</body>
</html>`;

/** Synthetic reader page whose pages are hydrated from an inline script. */
const hydratedReaderHTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Dolor Sit Amet Chapter 2</title></head>
<body>
  <div class="chapterbody">
  <div class="headpost"><h1 class="entry-title">Dolor Sit Amet Chapter 2</h1></div>
  <div class="ts-breadcrumb bixbox">Home › Dolor Sit Amet › Chapter 2</div>
  <div id="readerarea"></div>
  <div class="chnav cbot">
    <span class="selector slc l"><div class="nvx"><select id="chapter"></select></div></span>
  </div>
  <script>
    ts_reader.run({"post_id":1,"noimagehtml":"","sources":[{"source":"Server 1","images":["https:\\/\\/example.org\\/media\\/hydrated-1.jpg","https:\\/\\/example.org\\/media\\/hydrated-2.jpg"]}],"lazyload":false,"protected":false});
  </script>
</body>
</html>`;

let harness: VMHarness;

beforeAll(() => {
  harness = new VMHarness(['example.org'], runtimeIIFE, themeAdapter);
});

describe('Series List Theme Adapter', () => {
  it('detects the theme on a listing page', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/');

    expect(result.detected).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(result.detectionSignature.minScore);
  });

  it('detects the theme on a series page', async () => {
    const result = await harness.testTheme(
      stackedSeriesHTML,
      'https://example.org/series/lorem-ipsum/',
    );

    expect(result.detected).toBe(true);
  });

  it('detects the theme on a reader page', async () => {
    const result = await harness.testTheme(
      serverReaderHTML,
      'https://example.org/series/lorem-ipsum-chapter-3/',
    );

    expect(result.detected).toBe(true);
  });

  it('exposes the genre discovery and filtering contract', () => {
    const genre = themeAdapter.selectors.genre;

    expect(genre.pagePath).toBe('/');
    expect(genre.filterPath).toBe('/genres/{genre}/');
    expect(genre.valueAttr).toBe('href');
    // The slug is extracted from the link target, e.g. `/genres/action/`.
    expect(genre.valuePattern).toBe('/genres/([^/?#]+)');
    expect(genre.filterPath.replace('{genre}', 'action')).toBe('/genres/action/');
  });

  it('extracts search results from the card grid', async () => {
    const result = await harness.testTheme(listingHTML, 'https://example.org/', {
      searchQuery: { page: 1, text: 'lorem' },
    });

    expect(result.search).toBeDefined();
    expect(result.search?.items.length).toBe(2);
    expect(result.search?.items[0]?.title).toBe('Lorem Ipsum');
    expect(result.search?.items[0]?.key).toBe(
      'https://example.org/series/lorem-ipsum/',
    );
    expect(result.search?.items[0]?.coverURL).toBe(
      'https://example.org/media/lorem.jpg',
    );
    expect(result.search?.hasNextPage).toBe(true);
  });

  it('extracts details from the stacked header variant', async () => {
    const result = await harness.testTheme(
      stackedSeriesHTML,
      'https://example.org/series/lorem-ipsum/',
      { mangaKey: 'https://example.org/series/lorem-ipsum/' },
    );

    expect(result.details?.title).toBe('Lorem Ipsum');
    expect(result.details?.altTitles).toContain('Ipsum Lorem');
    expect(result.details?.synopsis).toContain('Placeholder synopsis');
    expect(result.details?.status).toBe('ongoing');
    // `tagsItem` returns every sibling genre anchor, not just the first.
    expect(result.details?.tags).toEqual(['Fantasy', 'Drama']);
    expect(result.details?.coverURL).toBe(
      'https://example.org/media/lorem-cover.jpg',
    );
  });

  it('extracts details from the split header variant', async () => {
    const result = await harness.testTheme(
      splitSeriesHTML,
      'https://example.org/series/dolor-sit-amet/',
      { mangaKey: 'https://example.org/series/dolor-sit-amet/' },
    );

    expect(result.details?.title).toBe('Dolor Sit Amet');
    expect(result.details?.status).toBe('completed');
    expect(result.details?.authors).toEqual(['Placeholder Author']);
    expect(result.details?.artists).toEqual(['Placeholder Artist']);
    expect(result.details?.tags).toContain('Drama');
  });

  it('extracts the chapter list in desc order with dates', async () => {
    const result = await harness.testTheme(
      stackedSeriesHTML,
      'https://example.org/series/lorem-ipsum/',
      { mangaKey: 'https://example.org/series/lorem-ipsum/' },
    );

    // The fourth entry carries a paid badge and must be dropped.
    expect(result.chapters?.length).toBe(3);
    expect(result.chapters?.map((chapter) => chapter.title)).toEqual([
      'Chapter 3',
      'Chapter 2',
      'Chapter 1',
    ]);
    expect(result.chapters?.[0]?.number).toBe(3);
    expect(result.chapters?.[0]?.key).toBe(
      'https://example.org/series/lorem-ipsum-chapter-3/',
    );
    expect(result.chapters?.[0]?.publishedAt).toBe(
      new Date('March 3, 2026').toISOString(),
    );
  });

  it('extracts chapters when the link wraps the entry', async () => {
    const result = await harness.testTheme(
      splitSeriesHTML,
      'https://example.org/series/dolor-sit-amet/',
      { mangaKey: 'https://example.org/series/dolor-sit-amet/' },
    );

    expect(result.chapters?.map((chapter) => chapter.title)).toEqual([
      'Chapter 2',
      'Chapter 1',
    ]);
    expect(result.chapters?.[0]?.key).toBe(
      'https://example.org/series/dolor-sit-amet-chapter-2/',
    );
  });

  it('extracts pages from a server-rendered reader', async () => {
    const result = await harness.testTheme(
      serverReaderHTML,
      'https://example.org/series/lorem-ipsum-chapter-3/',
      { chapterKey: 'https://example.org/series/lorem-ipsum-chapter-3/' },
    );

    expect(result.pages?.map((page) => page.imageURL)).toEqual([
      'https://example.org/media/page-1.jpg',
      'https://example.org/media/page-2.jpg',
      'https://example.org/media/page-3.jpg',
    ]);
    expect(result.pages?.map((page) => page.index)).toEqual([0, 1, 2]);
  });

  it('extracts pages from a hydrated reader', async () => {
    const result = await harness.testTheme(
      hydratedReaderHTML,
      'https://example.org/series/dolor-sit-amet-chapter-2/',
      { chapterKey: 'https://example.org/series/dolor-sit-amet-chapter-2/' },
    );

    expect(result.pages?.map((page) => page.imageURL)).toEqual([
      'https://example.org/media/hydrated-1.jpg',
      'https://example.org/media/hydrated-2.jpg',
    ]);
  });
});
