---
"@blankgrimoire/theme-static-advanced": patch
"@blankgrimoire/theme-wp-madara": patch
"@blankgrimoire/theme-wp-mangastream": patch
---

Fix selectors that used the unsupported `selector@attribute` syntax. Search, chapter and cover extraction now read attributes from the selected element, so these adapters work with the runtime again.
