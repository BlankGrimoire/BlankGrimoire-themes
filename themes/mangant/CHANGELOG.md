# @blankgrimoire/theme-mangant

## 1.1.4

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

## 1.1.3

### Patch Changes

- 37ba5b0: Stop detecting unrelated themes through shared script sources, and calibrate
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

## 1.1.2

### Patch Changes

- 5026aa7: Match the current search-results layout.
  
  The site now renders results as `.panel_story_list .story_item` with
  `.story_name` titles. The previous `#search_result` / `.list-comic-item-wrap`
  selectors no longer matched, so searches returned zero items. The new selectors
  are added while the legacy ones stay as fallbacks.

## 1.1.1

### Patch Changes

- de2a9dc: Publish optional CDN referrer headers with placeholder substitution at build time.
  
  Image hosts that reject requests without an origin `Referer` can now be served
  through the theme manifest. Committed sources keep `example.org` placeholders;
  the publish build fills in the deployment's hosts from
  `referrer-headers.config.json` or `REFERRER_*` environment variables. The app
  also learns a working referrer at runtime when the map is absent.
  
  The publish build also injects the package version into the bundle, so a
  changeset bump stays consistent with the manifest the app verifies.

## 1.1.0

### Minor Changes

- 49fbc96: Add the carousel grid adapter with declarative details, genre discovery, and a
  JSON chapter endpoint hook, replacing the legacy theme packages.
