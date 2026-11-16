# @blankgrimoire/theme-serieslist

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

- 37ba5b0: Add the Series List Theme adapter for grid libraries with a paginated chapter
  list.
  
  It covers the two series-header layouts of the same theme family (stacked and
  split) with one set of selectors, reads the shared chapter list in a single
  request, and extracts reader pages from either a server-rendered container or an
  inline-script payload.
  
  Detection requires four matching selectors (`minScore: 60`) on the host scale,
  so a shared class alone cannot claim the theme.
