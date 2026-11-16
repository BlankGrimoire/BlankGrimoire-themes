---
"@blankgrimoire/theme-mangant": patch
---

Stop detecting unrelated themes through shared script sources, and calibrate
the threshold for the host scoring scale.

The signature listed `owl.carousel`, `owl.carousel.min`, `jquery.min` and a CDN
placeholder under `scriptSrc`. On the host each matching pattern is worth `+20`
while the threshold was `15`, so a single shared script was enough to claim the
theme: any site running jQuery matched, with **zero** selectors hit. Two sibling
adapter families measured `20`–`60` points before this change and `0` after,
while the pages this adapter targets still score `75` (listing) and `120`
(series).

The threshold is now `45`, which requires three selectors, and `.item` was
removed from the signature because a card class that generic should not
contribute to detection.
