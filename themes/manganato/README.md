# MangaNato Theme Adapter

Theme adapter for [MangaNato](https://manganato.gg) that maps generic manga reading functionalities to MangaNato's HTML structure.

## Features Mapped

| Generic Functionality | MangaNato Implementation |
|----------------------|-------------------------|
| **Search** | `/search/story/{query}` → `#search_result ul li` |
| **Filter by Genre** | Extract from `.variations-table .table-value a[href*='genre']` |
| **Details** | `.story-info-right h1`, `.story-info-left img`, `.panel-story-info-description`, `.variations-table` |
| **Chapters** | `.chapter-list .row` with premium filtering (`.fa-coins`, `.fa-lock`, etc.) |
| **Reader** | `.container-chapter-reader img` with `src`/`data-src` |
| **Library** | Add/remove/check via site's library buttons |

## Detection

The theme is detected by matching these selectors on the page:
- `form[name="frmsearch"]` - Search form
- `#search_story.searchi` - Search input
- `#search_result` - Search results dropdown
- `.owl-carousel` - Carousel for featured manga
- `.chapter-list .row` - Chapter list structure
- `#chapter-dropdown.navi-change-chapter` - Chapter dropdown
- `.container-chapter-reader` - Reader container
- `.panel-story-info-description` - Description panel

Script patterns: `owl.carousel`, `owl.carousel.min`, `jquery.min`, `2xstorage.com`

## Installation

```bash
pnpm install
pnpm build
```

## Testing

```bash
pnpm test
```

## Structure

```
themes/manganato/
├── manifest.json      # Theme metadata and declarative selectors
├── bundle.js          # Compiled adapter bundle (IIFE)
├── package.json       # NPM package config
├── tsconfig.json      # TypeScript config
├── index.test.ts      # VMHarness tests
└── README.md          # This file
```

## Usage

The theme is designed to be imported into the BlankGrimoire app at runtime. The app loads the bundle, registers the adapter, and uses it when the user adds a MangaNato URL.

## Premium Chapter Filtering

The adapter automatically skips chapters marked as premium/paid using these markers:
- `.premium-badge`
- `.vip-tag`
- `[class*="coin"]`
- `[class*="premium"]`
- `.fa-coins`
- `.fa-lock`

## Genre Filtering

Genres are extracted from:
- `.variations-table .table-value a[href*='genre']`
- `.genres a`

These are normalized and made available for cross-site genre filtering.