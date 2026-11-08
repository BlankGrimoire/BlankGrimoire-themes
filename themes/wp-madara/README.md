# WordPress Madara Theme Adapter

**Package**: `@blankgrimoire/theme-wp-madara`
**Version**: 1.0.0
**API Version**: 1

## Overview

Generic adapter for websites using the **Madara WordPress theme**. This theme is widely used by content aggregation sites and provides a consistent structure for content extraction.

## Supported Features

| Feature | Supported | Method |
|---------|-----------|--------|
| Search | ✅ | `/?s={query}&post_type=wp-manga` |
| Latest Updates | ✅ | `/manga/page/{page}/?m_orderby=latest` |
| Popular | ✅ | `/manga/page/{page}/?m_orderby=popular` |
| Genres | ✅ | `/genre/{slug}/page/{page}/` |
| Series Details | ✅ | `/{series-slug}/` |
| Chapters (AJAX) | ✅ | POST `/wp-admin/admin-ajax.php` |
| Pages | ✅ | `/{series-slug}/{chapter-slug}/` |

## Detection

The adapter detects Madara themes using:

- Meta generator tag: `<meta name="generator" content="Madara">`
- CSS selectors: `.page-item-detail`, `.wp-manga`, `.manga_get_chapters`
- Presence of `manga_get_chapters` AJAX endpoint

Minimum detection score: **7**

## Selectors

### Search
- **Path**: `/?s={query}&post_type=wp-manga`
- **Item**: `.c-tabs-item__content, .page-item-detail`
- **Title**: `h3 a, .post-title a, .title a`
- **Link**: `a@href`
- **Cover**: `img@data-src, img@data-lazy-src, img@src`

### Catalog (Latest/Popular)
- **Latest Path**: `/manga/page/{page}/?m_orderby=latest`
- **Popular Path**: `/manga/page/{page}/?m_orderby=popular`
- **Item**: `.page-item-detail`
- **Title**: `h3 a, .post-title a`
- **Link**: `a@href`
- **Cover**: `img@data-src, img@data-lazy-src, img@src`

### Details
- **Title**: `.post-title h1, h1.entry-title`
- **Cover**: `.summary_image img@data-src, .summary_image img@data-lazy-src, .post-thumb img@src`
- **Synopsis**: `.summary__content, .description-summary, .manga-excerpt`
- **Authors**: `.author-content a, .manga-author a`
- **Artists**: `.artist-content a, .manga-artist a`
- **Alt Titles**: `.alternative-titles .summary-content, .alt-titles`
- **Tags**: `.genres-content a, .manga-genres a`
- **Status**: `.post-status .summary-content, .manga-status`

### Chapters (AJAX)
- **Endpoint**: `POST /wp-admin/admin-ajax.php`
- **Action**: `manga_get_chapters`
- **Parameter**: `manga={internal_id}`
- **Item**: `.wp-manga-chapter, .chapter-item, li.wp-manga-chapter`
- **Link**: `a@href`
- **Title**: `a`
- **Date**: `.chapter-release-date@datetime, .chapter-release-date, .date`
- **Order**: `desc`

### Pages
- **Strategies**:
  - CSS: `.reading-content img, .page-break img, .page img`
  - **Src Attributes**: `data-src`, `data-lazy-src`, `data-original`, `src`

## Installation

```bash
pnpm add @blankgrimoire/theme-wp-madara
```

## Usage

```typescript
import { WpMadaraAdapter } from '@blankgrimoire/theme-wp-madara';

const adapter = new WpMadaraAdapter('https://example.org', requestHandler);

// Search
const results = await adapter.search('one piece', 1);

// Latest updates
const latest = await adapter.fetchLatestUpdates(1);

// Series details
const details = await adapter.fetchMangaDetails('one-piece');

// Chapters (fetches via AJAX)
const chapters = await adapter.fetchChapters('one-piece');

// Pages for a chapter
const pages = await adapter.fetchPages('one-piece/chapter-1090');
```

## Internal Series ID Extraction

The adapter automatically extracts the internal WordPress post ID from the series detail page using multiple strategies:

1. Hidden inputs: `input[name="manga_id"]`, `input[name="post_id"]`
2. Data attributes: `[data-manga-id]`, `[data-post]`, `[data-id]`
3. JavaScript variables: `manga_id`, `post_id` in script tags
3. Meta tags: `meta[property="manga:id"]`

## Configuration

The adapter supports `selectorOverrides` for customizing selectors per-site:

```typescript
const adapter = new WpMadaraAdapter('https://example.org', requestHandler, {
  selectorOverrides: {
    search: { item: '.custom-search-item' },
    details: { title: '.custom-title' }
  }
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck

# Test
pnpm test

# Generate manifest
pnpm manifest
```

## License

MIT