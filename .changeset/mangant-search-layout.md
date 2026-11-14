---
"@blankgrimoire/theme-mangant": patch
---

Match the current search-results layout.

The site now renders results as `.panel_story_list .story_item` with
`.story_name` titles. The previous `#search_result` / `.list-comic-item-wrap`
selectors no longer matched, so searches returned zero items. The new selectors
are added while the legacy ones stay as fallbacks.
