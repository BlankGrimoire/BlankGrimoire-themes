# Contributing to BlankGrimoire Themes

## Ground rules (non-negotiable)

1. **Themes, not websites.** An adapter must target a theme or framework.
   Adapters named after, or built for, a single website will be rejected.
2. **No domains.** No real domain may appear in code, tests, comments,
   commit messages or issues.
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
- Bump the adapter `version` following SemVer on every change.

## Workflow

1. Fork and create a branch: `feat/theme-<name>` or `fix/<adapter>-<topic>`.
2. Scaffold with `npm create blank-theme@latest`.
3. Add or update synthetic fixtures and tests.
4. Run `pnpm test` and `pnpm lint`.
5. Open a PR using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `chore:`) and fill in the template.

## Reporting a broken adapter

Describe **which structure changed** (e.g. "chapter list now loaded via AJAX")
using a synthetic HTML snippet. Do not post links to websites.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).