---
"@blankgrimoire/theme-mangant": patch
---

Stop detecting unrelated themes through shared script sources.

The detection signature listed `owl.carousel`, `owl.carousel.min`, `jquery.min`
and a CDN placeholder under `scriptSrc`. On the host each matching pattern is
worth `+20`, while the threshold is `15`, so a single shared script was enough to
claim the theme: any site running jQuery matched, with **zero** selectors hit.

The two sibling adapters were measured as false positives at `20`–`60` points
before this change and at `0` afterwards, while the sites this adapter targets
still score `90` (listing) and `135` (series). Detection is now selector-only,
which is also what the theme's structure actually describes.
