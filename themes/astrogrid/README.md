# Astro Grid Theme Adapter

Theme adapter for statically generated content sites that render a card grid on
listing pages, a JSON-driven chapter list on series pages and a
`data-page`-based reader.

## Features Mapped

| Generic Functionality | Implementation |
|---|---|
| **Search** | `GET {api}/api/series` with `search`, `limit` and `offset` |
| **Filter by Genre** | `/browse?genres={genre}` |
| **Details** | `GET {api}/api/series/{slug}` |
| **Chapters** | `GET {api}/api/series/{slug}/chapters`, premium entries dropped |
| **Reader** | `[data-page] img` from the server-rendered HTML |
| **Library** | Not mapped; the site's bookmark control needs a signed-in session |

## Why hooks

The family renders its listing and series pages from a JSON API on a sibling
host. The server-rendered chapter list is a truncated copy of the same payload,
so reading rows misses chapters and cannot tell a paid entry from a free one:
the paid badge exists only after client-side hydration, but the adapter runtime
extracts from the HTML it receives.

The adapter therefore declares `networkHosts: ["api.{host}"]` and reads the
same API the page uses:

- search returns the real pagination (`meta.total`) instead of the first grid;
- details return alternative titles as an array, the real author/artist and a
  plain-text synopsis;
- chapters carry real numbers and ISO publication dates.

`networkHosts` never names a domain. The host replaces `{host}` with the site
host (dropping a leading `www.`) and accepts the expansion only when it stays on
the site's own domain.

## Paid content

The chapter endpoint flags locked entries with `is_premium`. The hook drops
every such chapter before returning the list, so a locked chapter never reaches
the host (rule 9). The reader page of a locked chapter has no `data-page`
elements, so page extraction also returns an empty list instead of teaser
images.

## Variants covered

- Listing pages with a `.series-card` grid inside `#series-grid`.
- Home layout with `#home-main` / `#home-side` sections and genre links.
- Series headers with `#description-text`, `#alt-titles` and
  `#continue-reading-data`.
- Readers that render one `[data-page]` wrapper per image.

The declarative selectors stay in the bundle as a fallback for pages that
render without JavaScript, and they define the item, title, date and reader
structure for hosts that inspect selectors without running hooks.

## Detection

The theme is detected through `meta[name="generator"]` containing `Astro` plus
these structural markers:

- `#home-main`, `#home-side` — home layout
- `[data-content-mode-link]` — the comics/novels switch in the shell
- `#series-grid`, `.series-card` — listing grid
- `#continue-reading-data` — series payload
- `#description-text` — series synopsis block
- `[data-page-index]` — reader pages

The threshold is `minScore: 60`: with the generator meta (`+30` on the host
scale) two markers are required, so an unrelated Astro site cannot claim the
theme from the generator alone. The home layout scores `75`, listing pages
`75`, series pages `90`.

## Installation

```bash
pnpm install
pnpm build
```

## Testing

```bash
pnpm test
```
