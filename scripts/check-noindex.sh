#!/usr/bin/env bash
# Verify a deployed URL is non-indexable.
# Usage: ./scripts/check-noindex.sh https://example.vercel.app [more-urls...]
set -uo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <url> [url...]" >&2
  exit 2
fi

fail=0

for url in "$@"; do
  echo "== $url"

  headers=$(curl -sSL -D - -o /dev/null "$url" 2>&1) || {
    echo "  FAIL  could not fetch"
    fail=1
    continue
  }

  if grep -iq '^x-robots-tag:.*noindex' <<<"$headers"; then
    echo "  ok    X-Robots-Tag: $(grep -i '^x-robots-tag:' <<<"$headers" | tail -1 | tr -d '\r')"
  else
    echo "  FAIL  no 'X-Robots-Tag: noindex' response header"
    fail=1
  fi

  body=$(curl -sSL "$url" 2>/dev/null)
  if grep -iqE '<meta[^>]+name=["'"'"']robots["'"'"'][^>]+noindex' <<<"$body"; then
    echo "  ok    <meta name=\"robots\" ... noindex> present"
  else
    echo "  FAIL  no <meta name=\"robots\" content=\"noindex...\"> in HTML"
    fail=1
  fi

  robots=$(curl -sSL "${url%/}/robots.txt" 2>/dev/null)
  if grep -q . <<<"$robots"; then
    echo "  ok    robots.txt served"
    if grep -iqE '^[[:space:]]*Disallow:[[:space:]]*/[[:space:]]*$' <<<"$robots" \
       && grep -iqE '^[[:space:]]*User-agent:[[:space:]]*\*' <<<"$robots" \
       && ! grep -iqE '^[[:space:]]*Allow:[[:space:]]*/' <<<"$robots"; then
      echo "  WARN  robots.txt appears to block all crawling — that HIDES the"
      echo "        noindex directive from crawlers. See CLAUDE.md."
    fi
  else
    echo "  WARN  robots.txt not served"
  fi

  if curl -sSLf -o /dev/null "${url%/}/sitemap.xml" 2>/dev/null; then
    echo "  WARN  sitemap.xml is published — remove it"
  fi
done

if [ "$fail" -ne 0 ]; then
  echo
  echo "RESULT: NOT SAFE — site is indexable."
  exit 1
fi

echo
echo "RESULT: all checks passed — site is non-indexable."
