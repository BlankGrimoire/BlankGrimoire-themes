# WordPress MangaStream Theme Adapter

**Package**: `@blankgrimoire/theme-wp-mangastream`
**Version**: 1.0.0
**API Version**: 1

## Overview

Generic adapter for websites using the **MangaStream WordPress theme**. This theme is widely used by content aggregation sites and provides a consistent structure with static HTML chapters and JSON-based reader.

## Supported Features

| Feature | Supported | Method |
|---------|-----------|--------|
| Search | ✅ | `/?s={query}` |
| Latest Updates | ✅ | `/manga/?page={page}&order=update` |
| Popular | ✅ | `/manga/?page={page}&order=popular` |
| Series Details | ✅ | `/{series-slug}/` |
| Chapters (Static) | ✅ | `#chapterlist` HTML list |
| Pages (JSON) | ✅ | `ts_reader.run()` JSON extraction |

## Detection

The adapter detects MangaStream themes using:

- Meta generator tag: `<meta name="generator" content="WordPress">`
- CSS selectors: `.listupd`, `#chapterlist`, `#readerarea`
- JavaScript: `ts_reader.run()` function

Minimum detection score: **6**

## Selectors

### Search
- **Path**: `/?s={query}`
- **Item**: `.listupd .bsx`
- **Title**: `.tt a, h3 a`
- **Link**: `a@href`
- **Cover**: `img@src, img@data-src`

### Catalog (Latest/Popular)
- **Latest Path**: `/manga/?page={page}&order=update`
- **Popular Path**: `/manga/?page={page}&order=popular`
- **Item**: `.listupd .bsx`
- **Title**: `.tt a, h3 a`
- **Link**: `a@href`
- **Cover**: `img@src, img@data-src`

### Details
- **Title**: `.entry-title, h1.post-title`
- **Cover**: `.thumb img@src, .post-thumb img@src`
- **Synopsis**: `.entry-content, .post-content`
- **Authors**: `.mgen a[href*="/author/"]`
- **Artists**: `.mgen a[href*="/artist/"]`
- **Alt Titles**: `.alternative-titles, .alt-titles`
- **Tags**: `.mgen a`
- **Status**: `.post-status, .status`

### Chapters (Static HTML)
- **Item**: `#chapterlist .eph-num a, #chapterlist li a, .listing-chapters_wrap li a`
- **Link**: `a@href`
- **Title**: `a`
- **Date**: `.chapter-release-date@datetime, .chapter-release-date, .date`
- **Order**: `desc`

### Pages (JSON in Script)
- **Strategies**:
  - CSS fallback: `.reading-content img, .page-break img, .page img`
  - **Src Attributes**: `data-src`, `data-lazy-src`, `data-original`, `src`
  - **Primary**: JSON extraction from `ts_reader.run({...})` script tag

## Installation

```bash
pnpm add @blankgrimoire/theme-wp-mangastream
```

## Usage

```typescript
import { WpMangaStreamAdapter } from '@blankgrimoire/theme-wp-mangastream';

const adapter = new WpMangaStreamAdapter('https://example.org', requestHandler);

// Search
const results = await adapter.search('one piece', 1);

// Latest updates
const latest = await adapter.fetchLatestUpdates(1);

// Series details
const details = await adapter.fetchMangaDetails('one-piece');

// Chapters (static HTML parsing)
const chapters = await adapter.fetchChapters('one-piece');

// Pages (extracts from ts_reader.run() JSON)
const pages = await adapter.fetchPages('one-piece/chapter-1090');
```

## Reader JSON Extraction

The adapter extracts page URLs from the `ts_reader.run()` JavaScript function call found in script tags on the reader page:

```javascript
ts_reader.run({"sources":[{"images":["url1.jpg","url2.jpg",...]}]});
```

The adapter uses regex to extract and parse this JSON, providing a robust method for getting page URLs without parsing lazy-loaded images.

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