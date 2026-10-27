# BlankGrimoire Themes

Official **theme adapters** for BlankGrimoire.

An adapter targets a *website theme or framework*, never a specific website.
Users choose which websites to add inside the app; the app detects the
matching theme automatically.

## Available adapters

| Adapter | Covers | Status |
|---|---|---|
| `theme.wp-manga` | WordPress manga-oriented themes | 🚧 In progress |
| `theme.themesia` | Themesia-family WordPress themes | 📋 Planned |
| `theme.spa-hydration` | Next.js / Nuxt sites exposing hydration data | 📋 Planned |

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