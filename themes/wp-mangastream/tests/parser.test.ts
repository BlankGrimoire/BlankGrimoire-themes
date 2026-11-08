// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('WP MangaStream Parser', () => {
  const fixturesDir = join(__dirname, '../fixtures');
  
  it('should parse search results', async () => {
    const html = await readFile(join(fixturesDir, 'search.html'), 'utf-8');
    expect(html).toContain('listupd');
    expect(html).toContain('bsx');
    expect(html).toContain('one-piece');
    expect(html).toContain('naruto');
    expect(html).toContain('bleach');
  });
  
  it('should parse latest updates', async () => {
    const html = await readFile(join(fixturesDir, 'latest.html'), 'utf-8');
    expect(html).toContain('listupd');
    expect(html).toContain('jujutsu-kaisen');
    expect(html).toContain('spy-x-family');
    expect(html).toContain('chainsaw-man');
  });
  
  it('should parse detail page', async () => {
    const html = await readFile(join(fixturesDir, 'detail.html'), 'utf-8');
    expect(html).toContain('entry-title');
    expect(html).toContain('One Piece');
    expect(html).toContain('Eiichiro Oda');
    expect(html).toContain('Action');
    expect(html).toContain('chapterlist');
  });
  
  it('should parse chapters list', async () => {
    const html = await readFile(join(fixturesDir, 'chapters.html'), 'utf-8');
    expect(html).toContain('chapterlist');
    expect(html).toContain('eph-num');
    expect(html).toContain('Chapter 1090');
    expect(html).toContain('Chapter 1086');
  });
  
  it('should parse pages with ts_reader JSON', async () => {
    const html = await readFile(join(fixturesDir, 'pages.html'), 'utf-8');
    expect(html).toContain('readerarea');
    expect(html).toContain('reading-content');
    expect(html).toContain('ts_reader.run');
    expect(html).toContain('images');
  });
});