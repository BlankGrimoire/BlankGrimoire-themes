// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('Angular SSR parser fixture', () => {
  it('contains catalog, series, chapter, and reader markers', async () => {
    const html = await readFile(join(__dirname, '../fixtures/reader.html'), 'utf8');

    expect(html).toContain('ng-version');
    expect(html).toContain('class="bc"');
    expect(html).toContain('class="series-title"');
    expect(html).toContain('class="cl-row"');
    expect(html).toContain('class="r-page-img"');
  });
});
