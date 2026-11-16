---
"@blankgrimoire/theme-astrogrid": minor
---

Add the Astro Grid Theme adapter for statically generated content sites.

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
