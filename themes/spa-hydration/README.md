# `theme.spa-hydration`

Declarative adapter for reusable SPA structures exposing reader pages through
Next.js or Nuxt hydration payloads.

The package contains only synthetic fixtures and does not target individual
websites. Catalog metadata uses CSS selectors, while reader pages use the
BlankGrimoire SDK hydration strategy.

## Development

From the repository root:

```bash
pnpm --filter @blankgrimoire/theme-spa-hydration test
pnpm --filter @blankgrimoire/theme-spa-hydration build
pnpm --filter @blankgrimoire/theme-spa-hydration manifest
```
