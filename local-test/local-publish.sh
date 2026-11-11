#!/bin/bash
# SPDX-License-Identifier: MIT
# Local test script for building, signing, and publishing theme adapters.
# Reuses a local Ed25519 key, builds adapters, signs bundles, and serves the
# result over plain HTTP or local HTTPS.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

USE_NGROK=false
NGROK_DOMAIN=""
PORT=""
USE_HTTPS=false
CERT_FILE="local-test/certs/local.pem"
KEY_PEM="local-test/certs/local-key.pem"
SIGNING_KEY="local-test/local-signing.key"

while [[ $# -gt 0 ]]; do
    case $1 in
        --ngrok)
            USE_NGROK=true
            shift
            ;;
        --domain)
            NGROK_DOMAIN="$2"
            USE_NGROK=true
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --https)
            USE_HTTPS=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --https           Serve with the local mkcert certificate"
            echo "  --port PORT       Local server port (default: 8443 for --https, 8080 otherwise)"
            echo "  --ngrok           Start an ngrok tunnel after publishing (HTTP only)"
            echo "  --domain DOMAIN   Use a custom ngrok domain (requires ngrok account)"
            echo "  --help, -h        Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage"
            exit 1
            ;;
    esac
done

if [[ "$USE_HTTPS" = true && "$USE_NGROK" = true ]]; then
    echo "Use either --https or --ngrok, not both."
    exit 1
fi

if [[ -z "$PORT" ]]; then
    if [[ "$USE_HTTPS" = true ]]; then
        PORT=8443
    else
        PORT=8080
    fi
fi

echo "🔐 Preparing local Ed25519 signing key..."

if [[ -f "$SIGNING_KEY" ]]; then
    read -r SEED_B64 PUBLIC_KEY_B64 < "$SIGNING_KEY"
    echo "  Reusing $SIGNING_KEY"
else
    read -r SEED_B64 PUBLIC_KEY_B64 <<< $(python3 -c "
import os, base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

seed = os.urandom(32)
private_key = Ed25519PrivateKey.from_private_bytes(seed)
public_key = private_key.public_key()

print(f'{base64.b64encode(seed).decode()} {base64.b64encode(public_key.public_bytes_raw()).decode()}')
")
    printf '%s %s\n' "$SEED_B64" "$PUBLIC_KEY_B64" > "$SIGNING_KEY"
    chmod 600 "$SIGNING_KEY"
    echo "  Generated and saved to $SIGNING_KEY (gitignored)"
fi

export BLANKGRIMOIRE_PRIVATE_KEY="$SEED_B64"
export BLANKGRIMOIRE_PUBLIC_KEY="ed25519:$PUBLIC_KEY_B64"

echo "🔑 Signing key:"
echo "  Public: ${PUBLIC_KEY_B64:0:20}..."

echo "🔨 Building themes..."
pnpm publish:build

echo "✅ Done! Files in ./public:"
ls -la public/
echo ""
echo "📋 index.json preview:"
cat public/index.json | jq '.extensions[] | {id, name, version, bundleURL}'

find_port() {
    local port=$1
    while lsof -ti:$port >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

PORT=$(find_port "$PORT")

if [[ "$USE_HTTPS" = true ]]; then
    if [[ ! -f "$CERT_FILE" || ! -f "$KEY_PEM" ]]; then
        echo ""
        echo "❌ Missing TLS certificate."
        echo "   Generate it with:"
        echo "   mkcert -cert-file $CERT_FILE -key-file $KEY_PEM localhost 127.0.0.1 ::1"
        exit 1
    fi

    echo ""
    echo "🌐 Starting local HTTPS server on port $PORT..."
    node local-test/serve-https.mjs public "$PORT" "$CERT_FILE" "$KEY_PEM" &
else
    echo ""
    echo "🌐 Starting local HTTP server on port $PORT..."
    python3 -m http.server "$PORT" --directory public &
fi

SERVER_PID=$!

# Wait for server to be ready
sleep 2

SCHEME="http"
if [[ "$USE_HTTPS" = true ]]; then
    SCHEME="https"
fi
INDEX_URL="$SCHEME://localhost:$PORT/index.json"

# Verify server is up. `-k` keeps the Mac from needing the mkcert CA in its
# system trust store; the iOS Simulator gets the CA through simctl below.
ADAPTER_COUNT=$(curl -sk "$INDEX_URL" | jq '.extensions | length')
if [[ -n "$ADAPTER_COUNT" && "$ADAPTER_COUNT" -gt 0 ]]; then
    echo "✅ Local server verified ($ADAPTER_COUNT adapters)"
else
    echo "❌ Server verification failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

NGROK_URL=""

if [ "$USE_NGROK" = true ]; then
    echo ""
    echo "🔗 Starting ngrok tunnel..."

    # Check ngrok auth
    if ! ngrok config check >/dev/null 2>&1; then
        echo "⚠️  ngrok not authenticated. Run: ngrok config add-authtoken <YOUR_TOKEN>"
        echo "   Get the token from your ngrok account dashboard."
        USE_NGROK=false
    fi

    if [ "$USE_NGROK" = true ]; then
        if [ -n "$NGROK_DOMAIN" ]; then
            echo "Using custom domain: $NGROK_DOMAIN"
            ngrok http --domain="$NGROK_DOMAIN" $PORT &
        else
            ngrok http $PORT &
        fi

        NGROK_PID=$!
        sleep 3

        # Get ngrok public URL
        NGROK_API="http://localhost:4040/api/tunnels"
        for i in {1..10}; do
            NGROK_URL=$(curl -s "$NGROK_API" | jq -r '.tunnels[0].public_url' 2>/dev/null)
            if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
                break
            fi
            sleep 1
        done

        if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
            echo ""
            echo "✅ ngrok tunnel active!"
            echo "   Public URL: $NGROK_URL"
            echo "   Index URL:  $NGROK_URL/index.json"
            echo ""
            echo "📱 In iOS Simulator/Device:"
            echo "   Settings → Adapters → Add Repository"
            echo "   URL: $NGROK_URL/index.json"
        else
            echo "⚠️  ngrok tunnel started but couldn't get URL"
            echo "   Check ngrok dashboard: http://localhost:4040"
        fi
    fi
fi

echo ""
echo "📋 Local index URL: $INDEX_URL"

if [[ "$USE_HTTPS" = true ]]; then
    echo ""
    echo "📱 Trust the mkcert CA in the booted iOS Simulator (once per simulator, or after erasing it):"
    echo "   xcrun simctl keychain booted add-root-cert \"$(mkcert -CAROOT)/rootCA.pem\""
    echo ""
    echo "   Then add this repository in the app:"
    echo "   $INDEX_URL"
fi

if [ -n "$NGROK_URL" ]; then
    echo "📋 Public index URL: $NGROK_URL/index.json"
fi

echo ""
echo "Press Ctrl+C to stop server"

cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $SERVER_PID 2>/dev/null
    if [ -n "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null
    fi
    exit 0
}

trap cleanup INT TERM

wait $SERVER_PID
