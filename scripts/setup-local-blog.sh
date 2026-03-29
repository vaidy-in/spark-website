#!/usr/bin/env bash
# Build Tailwind, fetch blog JSON (optional cache), generate static marketing/.site-output.
# Blog UI matches the legacy layout; posts are blog/*.html (no Beehiiv fetch in the browser).
#
# Usage (from repo root):
#   bash marketing/scripts/setup-local-blog.sh
#   bash marketing/scripts/setup-local-blog.sh http://127.0.0.1:5500/
#   npm run setup:local-blog
#
# Options:
#   --install      Run npm ci first.
#   --no-fetch     Use existing marketing/.blog-cache/latest.json (no curl).
#   --fetch-only   Only download latest.json.
#
# Env:
#   BLOG_POSTS_URL  API base for curl (default: Cloud Function URL).
#   SITE_URL        Canonical base if no positional URL (default: http://127.0.0.1:8080/).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

API_URL="${BLOG_POSTS_URL:-https://getblogposts-eyyuwkjlza-uc.a.run.app}"
INSTALL=0
FETCH_ONLY=0
NO_FETCH=0
SITE_URL_POS=""

usage() {
    awk '/^#!/ { next } /^# ?/ { sub(/^# ?/, ""); print; n++; if (n >= 18) exit }' "$0"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --install)
            INSTALL=1
            shift
            ;;
        --fetch-only)
            FETCH_ONLY=1
            shift
            ;;
        --no-fetch)
            NO_FETCH=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1 (try --help)" >&2
            exit 1
            ;;
        *)
            if [[ -n "$SITE_URL_POS" ]]; then
                echo "Extra argument: $1" >&2
                exit 1
            fi
            SITE_URL_POS="$1"
            shift
            ;;
    esac
done

if [[ "$NO_FETCH" -eq 1 && "$FETCH_ONLY" -eq 1 ]]; then
    echo "Cannot use --no-fetch and --fetch-only together." >&2
    exit 1
fi

if [[ "$INSTALL" -eq 1 ]]; then
    echo "[setup-local-blog] npm ci"
    npm ci
fi

CACHE_DIR="$ROOT/marketing/.blog-cache"
JSON_FILE="$CACHE_DIR/latest.json"
mkdir -p "$CACHE_DIR"

if [[ "$NO_FETCH" -eq 0 ]]; then
    echo "[setup-local-blog] Saving API response to $JSON_FILE"
    curl -fsS "${API_URL}?force_refresh=1" -o "$JSON_FILE"
    echo "[setup-local-blog] Saved $(wc -c < "$JSON_FILE" | tr -d ' ') bytes"
else
    if [[ ! -f "$JSON_FILE" ]]; then
        echo "Missing $JSON_FILE. Run without --no-fetch once." >&2
        exit 1
    fi
    echo "[setup-local-blog] Using existing $JSON_FILE"
fi

if [[ "$FETCH_ONLY" -eq 1 ]]; then
    echo "[setup-local-blog] --fetch-only done."
    exit 0
fi

export BLOG_POSTS_JSON_FILE="$JSON_FILE"

if [[ -n "$SITE_URL_POS" ]]; then
    export SITE_URL="$SITE_URL_POS"
elif [[ -z "${SITE_URL:-}" ]]; then
    export SITE_URL="http://127.0.0.1:8080/"
fi

echo "[setup-local-blog] SITE_URL=$SITE_URL"
echo "[setup-local-blog] Building CSS + static blog"
npm run build:marketing:css
node marketing/scripts/generate-blog-pages.js

echo ""
echo "[setup-local-blog] Done. Document root:"
echo "  $ROOT/marketing/.site-output"
echo "Open blog.html here; sidebar links go to static blog/*.html (no live API)."
