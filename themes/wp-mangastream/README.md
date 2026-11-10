# `theme.wp-mangastream`

**Package**: `@blankgrimoire/theme-wp-mangastream`
**Version**: managed by Changesets
**API Version**: 1

## Overview

Generic adapter for WordPress sites that expose a static chapter list and a
JSON-based reader. It targets a reusable theme family, not individual sites.

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

The adapter detects this chapter-theme family using:

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

## Distribution

This package is private to the monorepo and is not published to npm. The
release workflow builds and signs the bundle and publishes it through the
repository index on GitHub Pages. The app consumes the signed bundle, not the
TypeScript package.

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