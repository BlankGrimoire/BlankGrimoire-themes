# `theme.static-advanced`

**Package**: `@blankgrimoire/theme-static-advanced`
**Version**: managed by Changesets
**API Version**: 1

## Overview

Generic adapter for static HTML sites that use a consistent set of story,
chapter-list, and chapter-reader classes. Reader images may require a
`Referer` header.

The package contains only synthetic fixtures and does not target individual
websites.

## Detection

- `.container-chapter-reader`
- `.panel-story-chapter-list`
- `.content-genres-item`
- `.panel-search-story`

Minimum detection score: **7**

## Supported features

| Feature | Structure |
|---|---|
| Search | `.panel-search-story`, `.content-genres-item` |
| Details | `.story-info-right h1`, `.info-image img`, `#panel-story-info-description` |
| Chapters | `.panel-story-chapter-list a.chapter-name` |
| Pages | `.container-chapter-reader img` with lazy-load attributes |

## Development

From the repository root:

```bash
pnpm --filter @blankgrimoire/theme-static-advanced test
pnpm --filter @blankgrimoire/theme-static-advanced build
pnpm --filter @blankgrimoire/theme-static-advanced manifest
```
