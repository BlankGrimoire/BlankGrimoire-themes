---
"@blankgrimoire/theme-mangant": patch
---

Publish optional CDN referrer headers with placeholder substitution at build time.

Image hosts that reject requests without an origin `Referer` can now be served
through the theme manifest. Committed sources keep `example.org` placeholders;
the publish build fills in the deployment's hosts from
`referrer-headers.config.json` or `REFERRER_*` environment variables. The app
also learns a working referrer at runtime when the map is absent.

The publish build also injects the package version into the bundle, so a
changeset bump stays consistent with the manifest the app verifies.
