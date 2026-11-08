# BlankGrimoire Themes

Official **theme adapters** for BlankGrimoire.

An adapter targets a *website theme or framework*, never a specific website.
Users choose which websites to add inside the app; the app detects the
matching theme automatically.

## Available adapters

| Adapter | Covers | Status |
|---|---|---|
| `theme.wp-manga` | WordPress content themes | ✅ Implemented, pending release |
| `theme.themesia` | Themesia-family WordPress themes | ✅ Implemented, pending release |
| `theme.spa-hydration` | Next.js / Nuxt sites exposing hydration data | 📋 Planned |

## Development

Requirements: Node 22 and pnpm 9.

```bash
pnpm install
pnpm lint
pnpm build
pnpm typecheck
pnpm test
```

Adapters are developed as independent packages under [`themes/`](./themes/).
Each package owns its version, synthetic fixtures, tests, and build output.
The packages consume the published SDK from npm; the iOS app later consumes
the signed adapter bundles and repository index, not npm packages directly.

## Installing in the app

In BlankGrimoire, open **Settings → Adapter Repositories** and add:

```text
https://YOUR-PAGES-DOMAIN/index.json
```

Bundles are signed with Ed25519; the app verifies every update.

## What this repository does NOT contain

- ❌ Website domains or lists of websites
- ❌ Site-specific scrapers
- ❌ HTML, images or text copied from real websites

Tests run exclusively against **hand-written synthetic fixtures**.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md): pull requests that break these rules
will be closed.

## License

[MIT](LICENSE). See also the [Disclaimer](DISCLAIMER.md).