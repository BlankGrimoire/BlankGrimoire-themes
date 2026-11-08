// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('SPA Next.js Parser', () => {
  const fixturesDir = join(__dirname, '../fixtures');
  
  it('should parse search results from __NEXT_DATA__', async () => {
    const html = await readFile(join(fixturesDir, 'search.html'), 'utf-8');
    expect(html).toContain('__NEXT_DATA__');
    expect(html).toContain('searchResults');
    expect(html).toContain('one-piece');
    expect(html).toContain('naruto');
  });
  
  it('should parse latest updates from __NEXT_DATA__', async () => {
    const html = await readFile(join(fixturesDir, 'latest.html'), 'utf-8');
    expect(html).toContain('__NEXT_DATA__');
    expect(html).toContain('latestUpdates');
    expect(html).toContain('jujutsu-kaisen');
    expect(html).toContain('spy-x-family');
  });
  
  it('should parse detail page from __NEXT_DATA__', async () => {
    const html = await readFile(join(fixturesDir, 'detail.html'), 'utf-8');
    expect(html).toContain('__NEXT_DATA__');
    expect(html).toContain('One Piece');
    expect(html).toContain('Eiichiro Oda');
    expect(html).toContain('chapters');
  });
  
  it('should parse chapters from __NEXT_DATA__', async () => {
    const html = await readFile(join(fixturesDir, 'chapters.html'), 'utf-8');
    expect(html).toContain('__NEXT_DATA__');
    expect(html).toContain('chapters');
    expect(html).toContain('Chapter 1090');
    expect(html).toContain('Chapter 1088');
  });
  
  it('should parse pages from __NEXT_DATA__', async () => {
    const html = await readFile(join(fixturesDir, 'pages.html'), 'utf-8');
    expect(html).toContain('__NEXT_DATA__');
    expect(html).toContain('images');
    expect(html).toContain('one-piece/1090/01.jpg');
  });
});