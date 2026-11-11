// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('Next.js image reader fixture', () => {
  it('contains catalog, series, chapter, and reader markers', async () => {
    const html = await readFile(join(__dirname, '../fixtures/reader.html'), 'utf8');

    expect(html).toContain('id="__next"');
    expect(html).toContain('/series/comic/example-series');
    expect(html).toContain('/chapter/1');
    expect(html).toContain('alt="Page 1"');
  });
});
