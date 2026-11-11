# BlankGrimoire Themes

Official **theme adapters** for BlankGrimoire.

An adapter targets a *website theme or framework*, never a specific website.
Users choose which websites to add inside the app; the app detects the
matching theme automatically.

## Available adapters

| Adapter | Package | Covers | Kind |
|---|---|---|---|
| `theme.spa-hydration` | `@blankgrimoire/theme-spa-hydration` | Next.js / Nuxt hydration payloads | Reference |
| `theme.spa-nextjs` | `@blankgrimoire/theme-spa-nextjs` | Next.js sites exposing `__NEXT_DATA__` | Specific |
| `theme.static-advanced` | `@blankgrimoire/theme-static-advanced` | Static HTML sites with story/chapter class patterns | Specific |
| `theme.themesia` | `@blankgrimoire/theme-themesia` | Themesia-family content themes | Reference |
| `theme.wp-madara` | `@blankgrimoire/theme-wp-madara` | Madara WordPress themes with AJAX chapters | Specific |
| `theme.wp-manga` | `@blankgrimoire/theme-wp-manga` | WordPress content themes | Reference |
| `theme.wp-mangastream` | `@blankgrimoire/theme-wp-mangastream` | WordPress chapter themes with static lists and JSON readers | Specific |

All adapters are implemented and versioned independently with Changesets.

### Detection and overlap

Detection signatures are intentionally disjoint:

- **Specific adapters** require a framework marker or a distinctive set of
  selectors (`Madara`, `WordPress` plus chapter-reader markers,
  `__NEXT_DATA__`, or the static story/chapter classes).
- **Reference adapters** use hand-written synthetic `metaGenerator` markers
  and selectors. They document the contract and back the conformance tests;
  they do not claim real sites.

If a future adapter would overlap an existing one, merge or deprecate it
instead of publishing both. When scores tie, the app's documented tie-break
order is: higher `minScore`, then more selectors, then lexicographic adapter
id. No anti-bot challenge is solved by an adapter: challenges are completed by
the user in the visible app web view.

## Development

Requirements: Node 22 and pnpm 9.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm typecheck
pnpm test
pnpm manifest
pnpm publish:check
```

Adapters are independent packages under [`themes/`](./themes/). Each package
owns its version, detection signature, synthetic fixtures, tests, and build
output. Shared build helpers in [`scripts/`](./scripts/) read the
`blankgrimoire` metadata block in each package, inject the package version into
the bundle, and verify that the bundle, manifest, and detection signature
agree.

The packages consume the published SDK from npm; the iOS app later consumes
the signed adapter bundles and repository index, not npm packages directly.

## Versioning and release

Versions are managed with [Changesets](./.changeset/):

1. Every adapter change includes a changeset (`pnpm changeset`).
2. On `main`, the publish workflow applies the changesets and commits the
   version bump itself, as `blankgrimoire-release-bot[bot]`, with
   `chore(release): version theme adapters [skip ci]`. No version pull request
   is opened.
3. The same run checks the publication, builds and signs the bundles, deploys
   GitHub Pages, and only then creates `<adapter-id>@<version>` tags.
4. Pushes with no pending adapter version (every `<adapter-id>@<version>`
   tag already exists) do not deploy or create tags.

Do not edit `CHANGELOG.md` or package versions by hand; Changesets writes the
per-package changelogs. The release identity is a GitHub App, so the version
commit and tag pushes do not depend on a personal access token. After a
release, merge `main` back into `develop` so the integration branch keeps the
released versions and the consumed changesets.

## Publishing

The `main` branch workflow publishes signed adapter bundles to GitHub Pages.
It requires the `BLANKGRIMOIRE_PRIVATE_KEY` GitHub Actions secret and the
`BLANKGRIMOIRE_PUBLIC_KEY` repository variable.

- `BLANKGRIMOIRE_PUBLIC_KEY` must be `ed25519:` followed by the base64-encoded
  32-byte raw Ed25519 public key.
- `BLANKGRIMOIRE_PRIVATE_KEY` accepts any format supported by the SDK CLI:
  PEM PKCS#8, base64 PKCS#8 DER, or a base64-encoded 32-byte Ed25519 seed.

Run `pnpm publish:check` locally to build and validate the complete static
publication with an ephemeral key pair. For a full local publish, use
`./local-test/local-publish.sh --https`.

## Installing in the app

In BlankGrimoire, open **Settings → Adapter Repositories** and add:

```text
https://blankgrimoire.github.io/BlankGrimoire-themes/index.json
```

Bundles are signed with Ed25519; the app verifies every update.

## Repository layout

- `scripts/` — shared adapter discovery, build, publication, tagging, and
  hygiene scripts.
- `themes/` — one package per adapter.
- `agent-docs/` — internal design and historical planning notes. They are not
  published, contain no real domains, and are covered by the hygiene check.
- `local-test/` — local signing and static-server harness for development.
  Keys and certificates stay gitignored; nothing here is published.

## What this repository does NOT contain

- ❌ Website domains or lists of websites
- ❌ Site-specific scrapers
- ❌ HTML, images or text copied from real websites
- ❌ Automatic anti-bot challenge solving

Tests run exclusively against **hand-written synthetic fixtures**.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md): pull requests that break these rules
will be closed.

## License

[MIT](LICENSE). See also the [Disclaimer](DISCLAIMER.md).
