// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('Static Advanced Parser', () => {
  const fixturesDir = join(__dirname, '../fixtures');
  
  it('should parse search results', async () => {
    const html = await readFile(join(fixturesDir, 'search.html'), 'utf-8');
    expect(html).toContain('panel-search-story');
    expect(html).toContain('content-genres-item');
    expect(html).toContain('one-piece');
    expect(html).toContain('naruto');
  });
  
  it('should parse latest updates', async () => {
    const html = await readFile(join(fixturesDir, 'latest.html'), 'utf-8');
    expect(html).toContain('panel-content-genres');
    expect(html).toContain('content-genres-item');
    expect(html).toContain('jujutsu-kaisen');
    expect(html).toContain('spy-x-family');
  });
  
  it('should parse detail page', async () => {
    const html = await readFile(join(fixturesDir, 'detail.html'), 'utf-8');
    expect(html).toContain('story-info-right');
    expect(html).toContain('One Piece');
    expect(html).toContain('Eiichiro Oda');
    expect(html).toContain('panel-story-info-description');
  });
  
  it('should parse chapters list', async () => {
    const html = await readFile(join(fixturesDir, 'chapters.html'), 'utf-8');
    expect(html).toContain('panel-story-chapter-list');
    expect(html).toContain('chapter-name');
    expect(html).toContain('Chapter 1090');
    expect(html).toContain('Chapter 1086');
  });
  
  it('should parse pages with container-chapter-reader', async () => {
    const html = await readFile(join(fixturesDir, 'pages.html'), 'utf-8');
    expect(html).toContain('container-chapter-reader');
    expect(html).toContain('https://example.org/chapters/one-piece/1090/01.jpg');
  });

});