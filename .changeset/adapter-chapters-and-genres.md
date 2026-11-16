---
"@blankgrimoire/theme-astrogrid": patch
"@blankgrimoire/theme-mangant": patch
"@blankgrimoire/theme-serieslist": patch
---

Fix chapter loading and genre lists in the shipped adapters.

`theme.astrogrid` requested the chapter list with `limit=500`, which the
endpoint rejects with HTTP 403; opening a series therefore failed before the
details could render. The hook now pages the endpoint in batches of 200 with an
offset cursor. The signature also sets `usesWebViewMode: true`, because series
and reader pages sit behind a challenge that the host must resolve in its web
view before the page fetch.

`theme.serieslist` and `theme.mangant` read genres with `tagsItem`: one label
per genre anchor. Before, a group of sibling links was read as a single node,
so a minified page returned the first genre or one joined string.
