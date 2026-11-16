# Series List Theme Adapter

Theme adapter for grid-library sites that render a card grid on listing pages
and a paginated chapter list on series pages.

## Features Mapped

| Generic Functionality | Implementation |
|---|---|
| **Search** | `/?s={query}` → `.listupd .bs` card, `.bigor .tt` title |
| **Filter by Genre** | `.metas-genres-values a` / `.genres-container .mgen a` → `/genres/{genre}/` |
| **Details** | Stacked header (`.seriestucon`) or split header (`.main-info`) variants |
| **Chapters** | `.eplister ul li` → `.eph-num a` + `.chapternum` + `.chapterdate` |
| **Reader** | `#readerarea img`, with an inline-script fallback |
| **Library** | Bookmark control on the series page |

## Variants covered

The family ships two series-header layouts. Both share the listing grid and the
chapter list, so one adapter handles them:

- **Stacked** — `.seriestuheader` title, `.seriestualt` alternative titles,
  `.seriestucontl .thumb` cover, `.seriestucontentr .entry-content` synopsis and
  an `.infotable` metadata table.
- **Split** — `.main-info h1.entry-title` title, `.alternative .desktop-titles`
  alternative titles, `.thumb-half .thumb` cover, `.summary .entry-content`
  synopsis and a `.tsinfo .imptdt` metadata list.

Author and artist are mapped only in the split variant, because the stacked
variant exposes the uploader instead of the author.

## Detection

The theme is detected by matching these selectors on the page:

- `.listupd`, `.listupd .bsx`, `.bsx > a .limit`, `.bsx .bigor .tt` — card grid
- `.ts-post-image` — card cover
- `.bixbox .releases` — section header block
- `.metas-genres-values` — per-card genre list
- `.eplister#chapterlist`, `.eph-num .chapternum`, `.chbox` — chapter list
- `.bxcl` — chapter list container
- `.seriestucon`, `.seriestuheader h1.entry-title` — stacked header
- `.main-info .info-half .titles`, `.tsinfo .imptdt` — split header
- `.ts-breadcrumb`, `.headpost`, `.chapterbody` — series and chapter page scaffolding
- `.chnav`, `#readerarea` — reader navigation and container

## Reader extraction

Two strategies run in order, and the first non-empty result wins:

1. `#readerarea img` for readers rendered in the HTML.
2. `ts_reader.run` inline-script payload, reading `sources[0].images`, for
   readers hydrated by JavaScript.

## Notes

- Chapter entries that the site marks with a paid or coin badge are filtered out
  at the selector level (`.eplister ul li:not(:has(.text-gold))`), so locked
  chapters never reach an adapter response. Hosts that cannot evaluate `:has()`
  must be updated before this adapter is used with them.
- The chapter list is read from the series page in a single request. Sites that
  paginate it usually render the newest entries first, which matches the `desc`
  order.
- `tags` exposes the first label only: the runtime reads a single node and
  splits its text, so a group of sibling links yields one value. Full genre
  lists need a contract change, tracked outside this adapter.

## Installation

```bash
pnpm install
pnpm build
```

## Testing

```bash
pnpm test
```
