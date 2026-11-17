# Angular Grid Theme Adapter

Theme adapter for single-page content sites built with Angular: a
client-rendered card grid on listing pages, a series page with metadata and a
chapter list, and a reader that renders one image per page.

## Features Mapped

| Generic Functionality | Implementation |
|---|---|
| **Search** | `/browse?q={query}` over the card grid (first page only) |
| **Filter by Genre** | Not mapped; genre pages are separate routes |
| **Details** | `.series-title`, `.alt-titles`, `.description`, `.genre-tag`, `.badge--status` |
| **Chapters** | `a.cl-row` rows; rows carrying `.cl-price` are dropped |
| **Reader** | `img.r-page-img` inside `.r-strip` |
| **Library** | Not mapped |

## Why the hidden web view

The document is assembled by the client, so a plain request returns the shell.
The adapter therefore sets `usesWebViewMode: true`: the host loads the page in
its hidden web view and extracts the rendered DOM. Selectors only work on that
rendered document.

The same requirement covers the challenge the site puts in front of plain
requests; the host resolves it in the web view before extraction.

## Known limits

- **Search pagination**: the listing paginates with buttons, not links, so the
  host cannot derive a next-page URL. Only the first page of results is
  returned and `hasNextPage` stays `false`.
- **Genres**: the contract has no separate genre group, so genre labels are
  returned as tags.
- **Content rating**: the site does not expose one; the field stays empty.

## Paid content

A chapter that costs coins renders a price element inside its row
(`.cl-price`), so it is dropped from the chapter list. A locked chapter also
replaces the reader strip with a paywall block and renders no page images, so
no page is extracted even if the URL is opened directly.

## Tests

`index.test.ts` builds synthetic pages with the same class structure and
exercises the real runtime bundle through `VMHarness`: detection, listing,
series metadata, chapter ordering with a paid row dropped, reader pages and a
locked chapter.
