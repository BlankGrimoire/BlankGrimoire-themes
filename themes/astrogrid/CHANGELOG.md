# @blankgrimoire/theme-astrogrid

## 0.1.2

### Patch Changes

- 964f46e: Read the series payload from either API shape and keep the canonical public
  URL for search results.

## 0.1.1

### Patch Changes

- 2f6bfff: Fix chapter loading and genre lists in the shipped adapters.
  
  `theme.astrogrid` requested the chapter list with `limit=500`, which the
  endpoint rejects with HTTP 403; opening a series therefore failed before the
  details could render. The hook now pages the endpoint in batches of 200 with an
  offset cursor. The signature also sets `usesWebViewMode: true`, because series
  and reader pages sit behind a challenge that the host must resolve in its web
  view before the page fetch.
  
  `theme.serieslist` and `theme.mangant` read genres with `tagsItem`: one label
  per genre anchor. Before, a group of sibling links was read as a single node,
  so a minified page returned the first genre or one joined string.

## 0.1.0

### Minor Changes

- 37ba5b0: Add the Astro Grid Theme adapter for statically generated content sites.
  
  The family renders a card grid on listing pages, a JSON-driven chapter list on
  series pages and a `data-page`-based reader. The adapter declares
  `networkHosts: ["api.{host}"]` and reads the site's own API for search, details
  and chapters, because the server-rendered chapter list is truncated and cannot
  tell a paid entry from a free one. That API shape also gives real chapter
  numbers, ISO publication dates and full pagination.
  
  Locked chapters are dropped from the chapter list (`is_premium`) and a locked
  reader renders no page containers, so no paid content reaches the host.
  
  Detection needs the Astro generator meta plus two structural markers
  (`minScore: 60`). Templates stay domain-free: the app expands `{host}` against
  the configured site and rejects anything outside its domain.
