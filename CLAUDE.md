# niva-lp

## Hard requirement: this site must never be indexed

This landing page is private. Every page, on every deploy, must be
non-indexable. Treat this as a blocking requirement — do not ship a page
that lacks it, and do not remove any of the layers below without an
explicit instruction from the repo owner.

Three layers, all of which must stay in place:

1. **Response header** — `vercel.json` sets
   `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate`
   on `/(.*)`. This covers HTML, PDFs, images and every other asset.
   If the host ever changes away from Vercel, port this header to the new
   host's config (`netlify.toml`, `_headers`, nginx, Cloudflare, etc.) in
   the same commit.

2. **Meta tag** — every HTML document's `<head>` must contain:

   ```html
   <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
   ```

   In Next.js App Router, set it once in the root layout instead:

   ```ts
   export const metadata = {
     robots: { index: false, follow: false, nocache: true },
   }
   ```

3. **`public/robots.txt`** — allows general crawling on purpose, so crawlers
   can fetch each URL and *see* the noindex directive, and blocks AI/dataset
   crawlers that ignore noindex. Read the comments in that file before
   editing it. Never change it to a blanket `Disallow: /` — a URL that is
   blocked from crawling is never fetched, so the noindex is never read, and
   the URL can still end up indexed from an inbound link.

Also: publish no `sitemap.xml`, and do not add analytics/verification tags
(Google Search Console, Bing) that invite indexing.

### Verifying

After any deploy, run `./scripts/check-noindex.sh <url>` and confirm it
passes before considering the work done.
