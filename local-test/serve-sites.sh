#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
#
# Serves the two synthetic sites used by the F6 end-to-end dry-run.
#
# Site A and Site B expose the same series and chapter paths on different
# ports, so a test can prove that chapter identities never collide across
# sites. The adapter repository itself is served separately by
# `local-publish.sh --https` on port 8443.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_FILE="$ROOT/local-test/certs/local.pem"
KEY_PEM="$ROOT/local-test/certs/local-key.pem"
SITE_A_PORT="${SITE_A_PORT:-8444}"
SITE_B_PORT="${SITE_B_PORT:-8445}"

if [[ ! -f "$CERT_FILE" || ! -f "$KEY_PEM" ]]; then
    echo "Missing TLS certificate. See local-test/README.md." >&2
    exit 1
fi

pids=()
cleanup() {
    for pid in "${pids[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
}
trap cleanup EXIT INT TERM

node "$ROOT/local-test/serve-https.mjs" \
    "$ROOT/local-test/sites/site-a" "$SITE_A_PORT" "$CERT_FILE" "$KEY_PEM" &
pids+=("$!")

node "$ROOT/local-test/serve-https.mjs" \
    "$ROOT/local-test/sites/site-b" "$SITE_B_PORT" "$CERT_FILE" "$KEY_PEM" &
pids+=("$!")

sleep 1

CA_FILE="$(mkcert -CAROOT)/rootCA.pem"
for port in "$SITE_A_PORT" "$SITE_B_PORT"; do
    if ! curl -fsS --cacert "$CA_FILE" "https://localhost:${port}/" >/dev/null; then
        echo "Site on port $port did not start." >&2
        exit 1
    fi
done

echo "Site A: https://localhost:${SITE_A_PORT}"
echo "Site B: https://localhost:${SITE_B_PORT}"
echo "Press Ctrl+C to stop."

wait
