# Local Test Environment

Scripts for testing theme adapters locally with the iOS app before merging.
This directory is a developer harness only: it is not published, and the local
signing key and TLS certificates stay gitignored.

The iOS app only accepts **HTTPS** repository URLs, so the recommended path is
the local HTTPS server below. Plain HTTP remains available for quick checks
with `curl`, but the app will reject it.

## Quick Start (local HTTPS)

```bash
# One-time: install mkcert and generate a certificate for localhost
brew install mkcert
mkcert -cert-file local-test/certs/local.pem \
  -key-file local-test/certs/local-key.pem \
  localhost 127.0.0.1 ::1

# Every run
./local-test/local-publish.sh --https
```

The script prints the index URL:

```text
https://localhost:8443/index.json
```

Then trust the mkcert CA in the booted simulator (once per simulator, or
again after erasing it) and add the repository in the app:

```bash
xcrun simctl keychain booted add-root-cert "$(mkcert -CAROOT)/rootCA.pem"
```

```text
Settings → Adapters → Add Repository
URL: https://localhost:8443/index.json
```

`mkcert -install` is optional. It adds the CA to the Mac system trust store so
`curl` and Safari trust it without `-k`, but it needs an interactive `sudo`
prompt. The simulator only needs the `simctl keychain` command above.

## Quick Start (plain HTTP)

```bash
./local-test/local-publish.sh
```

This serves `http://localhost:8080/index.json`. Useful to inspect the index
with `curl`, but the iOS app rejects it by design.

## End-to-end dry-run with synthetic sites

`local-test/sites/` contains two hand-written catalogs, Site A and Site B.
Both expose the same series and chapter paths (`/series/lorem/`,
`/chapter/1/`, `/chapter/2/`) on different ports. The iOS test imports both and
proves that chapter identities never collide across sites.

```bash
# Terminal 1: adapter repository (https://localhost:8443/index.json)
./local-test/local-publish.sh --https

# Terminal 2: synthetic sites (https://localhost:8444 and :8445)
./local-test/serve-sites.sh

# Terminal 3: gated iOS test
cd ../BlankGrimoire-iOS
make gen
xcodebuild test -project BlankGrimoire.xcodeproj -scheme BlankGrimoire \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro' \
  CODE_SIGNING_ALLOWED=NO BLANKGRIMMOIRE_E2E=1
```

Only the test with `BLANKGRIMMOIRE_E2E=1` talks to these servers; the normal
suite skips it. The test uses loopback IPs (`127.0.0.1`) because ATS does not
apply to numeric addresses. Override the endpoints with the
`BLANKGRIMMOIRE_E2E_REPOSITORY_URL`, `BLANKGRIMMOIRE_E2E_SITE_A` and
`BLANKGRIMMOIRE_E2E_SITE_B` build settings.

## Persistent signing key

The script stores the Ed25519 signing key in `local-test/local-signing.key`
(ignored by git) and reuses it on later runs. This keeps the repository public
key stable, so the app does not require removing and re-adding the repository
after every publish.

To start from a fresh key, delete `local-test/local-signing.key` and remove the
repository from the app before adding it again.

## What the script does

1. Reuses or generates the local Ed25519 key pair
2. Builds every theme adapter under `themes/`
3. Signs bundles and generates `public/index.json`
4. Serves `public/` over HTTP or local HTTPS
5. Verifies that the index exposes at least one adapter

## Output

```text
public/
├── index.json              # Signed index with every discovered adapter
├── adapters/
│   ├── theme.spa-hydration/
│   ├── theme.spa-nextjs/
│   ├── theme.static-advanced/
│   ├── theme.themesia/
│   ├── theme.wp-madara/
│   ├── theme.wp-manga/
│   └── theme.wp-mangastream/
```

`public/` is gitignored: running the script never dirties the repository.

Each adapter folder contains:

- `runtime.js` - Signed JavaScript bundle
- `manifest.json` - Adapter metadata
- `runtime.sig` - Ed25519 signature

## Using ngrok for physical device testing

```bash
# HTTP server + ngrok tunnel
./local-test/local-publish.sh --ngrok

# Optional: stable tunnel domain
./local-test/local-publish.sh --domain <your-tunnel-domain>
```

Use the printed tunnel URL in the app. `--ngrok` and `--https` are mutually
exclusive.

## Testing on a physical device with mkcert

1. Issue a certificate that includes the Mac's LAN IP:

   ```bash
   mkcert -cert-file local-test/certs/local.pem \
     -key-file local-test/certs/local-key.pem \
     localhost 127.0.0.1 ::1 192.168.1.50
   ```

2. Serve it with `./local-test/local-publish.sh --https`.
3. AirDrop `$(mkcert -CAROOT)/rootCA.pem` to the device, install the profile,
   then enable full trust in Settings → General → About → Certificate Trust
   Settings.
4. Add `https://192.168.1.50:8443/index.json` in the app.

## Requirements

- Node.js 22 + pnpm 9
- Python 3 with the `cryptography` package
- `mkcert` for the HTTPS mode
- `jq` for the index preview and verification
- `ngrok` only for the tunnel mode

## CI Integration

For CI pipelines, set these secrets/variables:
- `BLANKGRIMOIRE_PRIVATE_KEY` - Ed25519 private key (PEM format)
- `BLANKGRIMOIRE_PUBLIC_KEY` - `ed25519:BASE64` (32-byte raw key)

The GitHub Actions workflow uses these for production signing.
