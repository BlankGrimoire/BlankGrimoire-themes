# AGENTS.md

Instructions for AI coding agents working in this repository.
Human contributors: see `CONTRIBUTING.md` and the organization's `.github` repository.

## Repository Facts

| Key | Value |
|-----|-------|
| Repository | BlankGrimoire-themes |
| Stack | TypeScript pnpm monorepo of seven theme adapters |
| Adapters | `theme.spa-hydration`, `theme.spa-nextjs`, `theme.static-advanced`, `theme.themesia`, `theme.wp-madara`, `theme.wp-manga`, `theme.wp-mangastream` |
| License | MIT |
| Source header | `// SPDX-License-Identifier: MIT` (or `# SPDX-License-Identifier: MIT` for shell) at the top of every source file |
| Contact | blankgrimoire.dev@gmail.com |
| Copyright holder | BlankGrimoire contributors |

## Non-Negotiable Rules

1. **No real website domains** anywhere (code, tests, comments, commit messages, docs). Use `example.org` / `example.com` only. The project's own Pages host `blankgrimoire.github.io`, localhost, and private test IPs are the only infrastructure exceptions.
2. **Themes, not websites.** No site-specific scrapers, no lists of sites, no adapters named after sites.
3. **Synthetic fixtures only.** Hand-written Lorem ipsum and placeholder images. Never copy HTML, text, or images from real sites.
4. **No circumvention.** No bypass of authentication, paywalls, DRM, or access controls. Anti-bot challenges are completed by the user in a **visible** WKWebView, never a hidden one and never by an adapter.
5. **Attribution preserved.** Site name, logo, credits, and the "Open on site" button. Credit pages are never filtered.
6. **No marketing vocabulary.** The words manga, manhwa, and scanlation must not appear in descriptions, topics, or README marketing. Domain type names (e.g. `MangaSummary`) are acceptable in code. Published adapter names and descriptions are validated at build time.
7. **Never commit secrets.** The Ed25519 private key lives only in GitHub environment secrets. Local keys and certificates are gitignored.
8. **Never commit personal emails.** The only allowed email is blankgrimoire.dev@gmail.com.

## Adapter Metadata

Each `themes/<directory>/package.json` owns its version and carries the public
identity in a `blankgrimoire` block:

```json
"blankgrimoire": {
  "adapterId": "theme.example",
  "adapterName": "Example Content Theme"
}
```

- Adapter ids always use the `theme.*` namespace and never change after release.
- `scripts/adapter-package.mjs` validates ids, names, descriptions, and uniqueness.
- Build scripts inject the package version into the bundle; the manifest generator
  rejects a bundle whose id, name, version, `apiVersion`, or detection signature
  does not match the package and `detection.json`.
- Detection signatures must stay disjoint. Merge or deprecate overlapping adapters
  instead of publishing both.

## Git and Release Rules

- Never `git push`, never force push, never create remote resources, never publish packages.
- Conventional Commits only: `feat`, `fix`, `perf`, `refactor`, `docs`, `chore`, `ci`, `test`, `revert`; use `!` for breaking changes.
- Branches: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`.
- Squash merge; the PR title is validated by `pr-title.yml`.
- Every adapter change includes a Changeset (`pnpm changeset`).
- Never edit `CHANGELOG.md` or adapter versions by hand. Never create release tags manually.
- The publish workflow tags adapters only after a successful GitHub Pages deploy.
  Pushes with no pending `<adapter-id>@<version>` tag are skipped.

## Code Style

Same TS settings as the SDK. Adapters are named after themes or technologies, never websites. Fixtures are synthetic and use only `example.org` / `example.com`.

Decision: no separate ESLint/Prettier layer for now. Strict TypeScript,
`pnpm lint`, the adapter tests, and `pnpm publish:check` are the quality gate.
Revisit the decision if the team adopts a formatter.

## Commands

| Task | Command |
|------|---------|
| Install | `pnpm install --frozen-lockfile` |
| Hygiene / content scan | `pnpm lint` |
| Build all adapters | `pnpm build` |
| Typecheck | `pnpm typecheck` |
| Test | `pnpm test` |
| Generate manifests (builds first) | `pnpm manifest` |
| Full publication dry-run | `pnpm publish:check` |
| Add a changeset | `pnpm changeset` |
| Apply changeset versions | `pnpm run version` |

The themes pin published `@blankgrimoire/*` packages. Building
`../BlankGrimoire-sdk` locally has no effect unless you add a temporary pnpm
override; never commit that override.

`agent-docs/` holds internal design and historical planning notes. `local-test/`
holds the local signing and HTTPS serving harness. Both are scanned by the
hygiene check; neither is published.

## Before Every Commit

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm publish:check` pass.
- [ ] Every new source file has the MIT SPDX header.
- [ ] Domain, vocabulary, secrets, email, and SPDX scans are clean.
- [ ] A changeset exists for every adapter change.
- [ ] No new dependencies without human approval.

## Ask a Human Before

- Adding dependencies not listed in the handouts.
- Changing the adapter contract after SDK-1 approval.
- Anything touching remotes, repository settings, or secrets.
- App icon or branding, distribution or code signing, and license questions.
