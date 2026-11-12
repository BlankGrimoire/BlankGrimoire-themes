# Carousel List Grid Theme Adapter

Theme adapter for sites using carousel-based grid layouts with chapter lists and reader pages.

## Features Mapped

| Generic Functionality | Implementation |
|----------------------|----------------|
| **Search** | `/search/story/{query}` → `.list-comic-item-wrap` (plus legacy result item layouts) |
| **Filter by Genre** | Home page `.panel-category a[href*='/genre/'][title]` → `/genre/{genre}` |
| **Details** | `.manga-info-content .manga-info-text h1`, `.manga-info-pic img`, `#contentBox`, `.genre-list` |
| **Chapters** | `hooks.getChapters` → `/api/manga/{slug}/chapters?limit=50&offset=N` |
| **Reader** | `.container-chapter-reader img` with `src`/`data-src` |
| **Library** | Add/remove/check via site's library buttons |

## Detection

The theme is detected by matching these selectors on the page:

- `form[name="frmsearch"]` - Search form
- `#search_story.searchi` - Search input
- `#search_result` - Search results dropdown
- `.owl-carousel` - Carousel for featured items
- `.chapter-list .row` - Chapter list structure
- `#chapter-dropdown.navi-change-chapter` - Chapter dropdown
- `.container-chapter-reader` - Reader container
- `.panel-story-info-description` - Description panel

Script patterns: `owl.carousel`, `owl.carousel.min`, `jquery.min`, `cdn.example.org`

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
themes/mangant/
├── detection.json     # Detection signature
├── manifest.json      # Adapter metadata and mirrored selectors
├── bundle.js          # Adapter bundle (IIFE)
├── package.json       # NPM package config
├── tsconfig.json      # TypeScript config
├── index.test.ts      # VMHarness tests
└── README.md          # This file
```

## Usage

The theme is designed to be imported into the app at runtime. The app loads the bundle, registers the adapter, and uses it when the user adds a compatible site URL.

## Details Extraction

The details page is fully declarative. `querySelector` picks the first matching
element for each field, so selector order matters:

- **title**: `.manga-info-content .manga-info-text h1`
- **cover**: `.manga-info-pic img` (also handles the newer `.comic-info-section` thumbnail layout)
- **synopsis**: `#contentBox`. `.description` is intentionally not used because that
  block is a site notice rendered earlier in the document and would win the match.
- **status**: `.comic-info-section .info-wrap > div:nth-child(2) p:last-child`,
  then the legacy `.manga-info-text > li:nth-child(3)`.
- **tags**: `.genre-list`. The runtime splits the selected element's text on commas
  and newlines, so every genre anchor is returned without the `"Genres :"` label.
- **authors / artists**: only linked values are extracted. The current layout
  renders them as prefixed text (`"Author(s) : ..."`), which is skipped on
  purpose so the UI does not show a duplicated label.

## Chapters

The series page does not embed the chapter rows. It declares a JSON endpoint via
`data-api-url` and renders the rows with page scripts. Because the runtime does
not execute page scripts, the adapter supplies `hooks.getChapters`, which:

1. Derives the origin and slug from the series key.
2. Requests `{origin}/api/manga/{slug}/chapters?limit=50&offset=N`.
3. Follows `pagination.has_more` until every page is read.
4. Emits absolute chapter keys (`{origin}/manga/{slug}/{chapter_slug}`),
   numeric `number`, and `publishedAt` normalized to milliseconds.
5. Sorts chapters newest first.

The chapter payload shape is:

```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "chapter_name": "Chapter 4",
        "chapter_slug": "chapter-4",
        "chapter_num": 4,
        "updated_at": "2026-03-25T19:09:43.000000Z",
        "view": 42
      }
    ],
    "pagination": { "total": 4, "limit": 50, "offset": 0, "has_more": false }
  }
}
```

The API returns six fractional digits; the hook trims them to three so the
value parses as standard ISO 8601.

## Genre Filtering

Genres are discovered from the home page category panel and exposed as
`selectors.genre`:

- `pagePath`: `/` — page that contains the genre links
- `source`: `.panel-category a[href*='/genre/'][title]` — CSS selector for the links
- `valueAttr`/`valuePattern`: extract the `action` slug from `/genre/action`
- `filterPath`: `/genre/{genre}` — result page used when a genre is selected
