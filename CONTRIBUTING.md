# Contributing to BlankGrimoire Themes

## Ground rules (non-negotiable)

1. **Themes, not websites.** An adapter must target a theme or framework.
   Adapters named after, or built for, a single website will be rejected.
2. **No domains in the repository.** No real domain may appear in code,
   tests, fixtures, comments, commit messages, adapter metadata or
   documentation. Issue reports are the exception: name the site there so a
   maintainer can reproduce its layout. Inside the repository, use placeholders
   such as `example.org`.
3. **Synthetic fixtures only.** Test HTML must be written by hand and contain
   placeholder text and images (e.g. `Lorem ipsum`, `https://example.org`).
   Never copy markup, text or images from real websites.
4. **No circumvention.** Adapters must not bypass authentication, paywalls,
   DRM or access controls.
5. **Attribution is preserved.** Adapters must expose the site's name, logo
   and credits when available, and must never filter out credit pages.

Pull requests that break these rules will be closed with the `out-of-scope` label.

## Adapter guidelines

- Prefer **declarative configuration** (selectors and extraction strategies).
  Use hooks only when a theme really requires custom logic.
- Keep the `ThemeSignature` specific enough to avoid false positives.
- Each adapter lives in `themes/<name>/` with `src/`, `fixtures/`, `test/`
  and a `README.md` describing the structures it supports.
- Add a Changeset with `pnpm changeset` on every change. Do not edit adapter
  versions or package changelogs by hand.

## Workflow

1. Fork and create a branch: `feat/theme-<name>` or `fix/<adapter>-<topic>`.
2. Copy an existing package under `themes/` as the starting point.
3. Add or update synthetic fixtures and tests.
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm publish:check`.
5. Add a Changeset with `pnpm changeset`.
6. Open a PR using Conventional Commits (`feat:`, `fix:`, `chore:`) and fill
   in the template.

## Releases

Releases are automatic. When changes reach `main`, the publish workflow applies
the pending changesets, commits the version bump, publishes the signed bundles
to GitHub Pages, and then tags the released adapters. Do not version packages, edit
changelogs, or create release tags by hand.

## Reporting a broken adapter

Describe **which structure changed** (e.g. "chapter list now loaded via AJAX")
using a synthetic HTML snippet. An issue may name the site and its URL — that
is how the engine gets identified — but the repository itself stays free of real
domains.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).