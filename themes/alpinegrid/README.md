# Alpine Grid Theme Adapter

Theme adapter for content sites that render with Alpine.js and ship their
catalogue as same-origin JSON: a paginated `/api/search`, a chapter list
endpoint, and series/chapter pages that embed their data in JSON scripts.

## Features Mapped

| Generic Functionality | Implementation |
|---|---|
| **Search** | `/api/search?q={query}&page={page}` |
| **Filter by Genre** | Not mapped |
| **Details** | `script#comic-data` payload on the series page |
| **Chapters** | `/api/comics/{slug}/chapter-list`, every page, reading order |
| **Reader** | `script#sv-data` payload on the chapter page (`images[]`) |
| **Library** | Not mapped |

## Why hooks for search, details and chapters

The catalogue is delivered as JSON, not as markup:

- search results are fetched by the page after it loads;
- the chapter list endpoint answers 60 entries per page and is paginated;
- series metadata lives in a `comic-data` JSON script whose fields (alternate
  titles, genre groups, numeric status) have no stable HTML counterpart.

Declarative selectors cannot express any of that, so the adapter declares
hooks. The page payload is read with a small script-tag extractor, which keeps
the adapter independent from a DOM implementation.

The reader path stays declarative: the chapter page embeds its pages in a
`sv-data` JSON script, which the runtime's `scriptJSON` strategy reads without
executing any page script.

## Details mapping

| Payload field | Contract field |
|---|---|
| `title` | `title` |
| `default_thumbnail` | `coverURL` |
| `desc` | `synopsis` (tags stripped) |
| `md_titles[*].title` | `altTitles` |
| `md_comic_md_genres[*].md_genres` with `group: "Genre"` | `tags` |
| `status` (`1` ongoing, `2` completed, `3` unknown) | `status` |
| `content_rating` (`safe`, `suggestive`, `mature`) | `contentRating` |

The format group (`Full Color`, `Long Strip`, …) is not a genre and is
deliberately skipped.

## Known limits

- **Genre filters**: unified genres have no mapping onto this site's filter
  parameters yet, so the search ignores them.
- **Authors and artists**: the payload exposes empty arrays for the sampled
  series; they are not mapped rather than guessed.
- **Paid content**: no price or lock marker appears in the chapter list. A
  chapter without images yields no pages, so nothing is invented.

## Tests

`index.test.ts` stubs the JSON endpoints and the series page, then runs the
real runtime through `VMHarness`: detection, search mapping with pagination,
series metadata, chapter order and URL shape, and reader pages from the
embedded payload. Fixtures are synthetic.
