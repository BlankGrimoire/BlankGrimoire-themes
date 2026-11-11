# Theme packages

Each adapter lives in its own package under this directory:

```text
themes/<theme-name>/
├── src/
├── fixtures/
├── test/ or tests/
├── detection.json
├── package.json
└── README.md
```

Adapters target reusable website themes or frameworks, never individual
websites. They must use synthetic fixtures and the published BlankGrimoire SDK
packages.

| Package | Adapter id | Detection marker | Kind |
|---|---|---|---|
| `spa-hydration` | `theme.spa-hydration` | Synthetic hydration metadata | Reference |
| `spa-nextjs` | `theme.spa-nextjs` | `__NEXT_DATA__` | Specific |
| `static-advanced` | `theme.static-advanced` | Static story/chapter classes | Specific |
| `themesia` | `theme.themesia` | Synthetic Themesia metadata | Reference |
| `wp-madara` | `theme.wp-madara` | `Madara` generator + AJAX chapter markers | Specific |
| `wp-manga` | `theme.wp-manga` | Synthetic WordPress content metadata | Reference |
| `wp-mangastream` | `theme.wp-mangastream` | `WordPress` generator + chapter-reader markers | Specific |

`package.json` owns the version and the public `blankgrimoire` metadata. The
shared scripts `scripts/build-adapter-bundle.mjs` and
`scripts/build-adapter-manifest.mjs` build the bundle, inject the version, and
generate the manifest from `package.json` and `detection.json`.

## Detection precedence

Specific adapters target a framework or theme family with distinctive markers.
Reference adapters use hand-written synthetic markers and exist to document the
contract and power the conformance tests; they do not claim real sites.

Repository signatures must not overlap. If two adapters would match the same
page, merge or deprecate one. If scores tie in a future app version, the
documented tie-break order is: higher `minScore`, then more selectors, then the
lexicographically smaller adapter id.

Adapters never solve anti-bot challenges. Challenges are completed by the user
in the visible app web view.

## Commands

From the repository root:

```bash
pnpm --filter @blankgrimoire/theme-spa-hydration test
pnpm --filter @blankgrimoire/theme-spa-hydration build
pnpm --filter @blankgrimoire/theme-spa-hydration manifest
```

Replace the filter with the package you are working on.
