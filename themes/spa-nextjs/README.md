# `theme.spa-nextjs`

**Package**: `@blankgrimoire/theme-spa-nextjs`
**Version**: managed by Changesets
**API Version**: 1

## Overview

Generic adapter for Next.js sites that expose their page data through the
`__NEXT_DATA__` hydration script. It targets the framework pattern, never an
individual website.

The adapter only detects and describes the hydration structure. Anti-bot
challenges are handled by the user in the visible app web view; the adapter
never solves or bypasses them.

## Detection

- `#__NEXT_DATA__`
- `script[id="__NEXT_DATA__"]`

Minimum detection score: **9**

## Development

From the repository root:

```bash
pnpm --filter @blankgrimoire/theme-spa-nextjs test
pnpm --filter @blankgrimoire/theme-spa-nextjs build
pnpm --filter @blankgrimoire/theme-spa-nextjs manifest
```
