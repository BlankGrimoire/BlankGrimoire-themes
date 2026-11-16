---
"@blankgrimoire/theme-serieslist": minor
---

Add the Series List Theme adapter for grid libraries with a paginated chapter
list.

It covers the two series-header layouts of the same theme family (stacked and
split) with one set of selectors, reads the shared chapter list in a single
request, and extracts reader pages from either a server-rendered container or an
inline-script payload.

Detection requires four matching selectors (`minScore: 60`) on the host scale,
so a shared class alone cannot claim the theme.
