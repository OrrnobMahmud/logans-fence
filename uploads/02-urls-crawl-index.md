# 02 — URLs, Crawling & Indexation

## 1. URL policy — one resource, one URL

Enforce all of these with **server-level 301 redirects**, never in JavaScript:

- HTTP → HTTPS
- `www` → non-`www` (or the reverse — pick one, forever)
- Trailing slash: pick one convention and 301 the other form; self-referencing canonicals in that format
- Uppercase → lowercase paths
- `index.html` / `.php` extensions stripped

URL format: descriptive keyword paths — `/blog/technical-seo-guide/`, never `/p=123`. Short, keyword-aligned paths communicate page purpose before a model reads the document.

**Session IDs live in cookies, never in the URL.**

## 2. robots.txt — the blocklist

```
User-agent: *
Allow: /accounts/login/
Disallow: /admin/
Disallow: /accounts/
Disallow: /api/
Disallow: /v1/
Disallow: /graphql/
Disallow: /search
Disallow: /tag/
Disallow: /cart/
Disallow: /wishlist/
Disallow: /checkout/
Disallow: /my-account/
Disallow: /share/
Disallow: /feed/
Disallow: /rss/
Disallow: /atom/
Disallow: /*?filter=
Disallow: /*?sort=
Disallow: /experiment/
Disallow: /staging/

Sitemap: https://example.com/sitemap.xml
```

Rules:
- **Never block your own CSS/JS/font assets.** `Disallow: /static/js/` or `Disallow: /static/css/` is one of the most common JavaScript SEO mistakes — Googlebot cannot render what it cannot fetch. Verify CDN/subdomain robots.txt (`static.example.com`) too.
- Avoid wildcards like `Disallow: /*?*` — they block cache-busting query strings (`main.js?v=123`).
- robots.txt blocks **crawling, not indexing**. It is a blocklist of discovery, not a deindexing tool.
- After adding a Disallow, re-crawl and confirm log requests to that path drop to zero.
- Crawl-delay is honored for non-Google bots only; use it for AI crawlers (`07-ai-agentic-visibility.md`).

## 3. robots.txt vs noindex — the semantics that break sites

| Intent | Use |
|---|---|
| Stop Googlebot from *fetching* a directory forever (admin, API, assets) | robots.txt `Disallow` |
| Remove a specific page from the *index* | `<meta name="robots" content="noindex">` or `X-Robots-Tag: noindex` header |
| Temporary noindex | meta robots tag |
| Permanent directory-wide block | robots.txt |

**Never combine `Disallow` and `noindex` on the same URL.** Googlebot must be allowed to crawl the page before it can read the noindex tag — blocking both traps the URL in the index forever with a "No information available" snippet.

**Exact deindexing procedure, in order:**
1. Remove discovery sources (internal links, sitemap entries, backlinks).
2. Remove the `Disallow` rule so Googlebot can crawl again.
3. Add `<meta name="robots" content="noindex">` in `<head>`.
4. Wait for recrawl/deindex (or force with GSC Removals).
5. Re-apply `Disallow` only **after** the page drops from the index.

`X-Robots-Tag: noindex` HTTP header for resources that cannot carry a meta tag: PDFs, feeds, API responses, staging hosts, A/B variant responses.

## 4. Canonical rules

See `01-document-head.md` §5. Site-level: every duplicate/parameter variation canonicalizes to one master; the master self-references. Described in the source as *"the single most effective technical fix for URL-based bloat."*

## 5. XML sitemap

- Contains **only** canonical, indexable, 200-status, high-value URLs.
- **Exclude** every URL carrying noindex, a redirect, a 404, or thin content.
- Sitemap URLs must **exactly match** canonical tags.
- Use real content `lastmod` (CMS modification time), not build time.
- Split by content type (posts, pages, products).
- Generate programmatically from the same data source as the app: Next.js `app/sitemap.ts`, Nuxt `@nuxtjs/sitemap`, Express `sitemap`, or a build-time script in `package.json`.
- Keep in sync: SSG/ISR → build step + CMS webhooks; SSR → dynamic generation or ~1 h TTL cache; CSR → cron/CI regeneration.
- Submit to GSC and Bing Webmaster Tools.
- Add an HTML sitemap linking all important pages.

Healthy state: every sitemap URL returns 200, zero crawl errors, and indexed count ≈ sitemap count. **Pages indexed but absent from the sitemap = primary bloat signal.**

## 6. Status codes

| Situation | Code |
|---|---|
| Page moved permanently | **301** (single hop — chains >2 hops waste ~3× crawl capacity) |
| Temporary | 302, sparingly |
| Page deleted | **404** — never redirect a deleted page to the homepage (creates soft 404) |
| Intentionally removed / expired / discontinued | **410 Gone** (Google drops 410 faster than 404) |
| Unknowing route in an SPA | real **404** status, never 200 |
| Persistent errors | avoid 5xx — Googlebot backs off, then surges |

- Client routers cannot set HTTP status → fix with SSR/SSG: Next.js `notFound()` in a server component, Nuxt `throw createError({ statusCode: 404 })`.
- Fix every 404 Googlebot hits. A 404 with external backlinks → **301 to a relevant replacement immediately** (preserves link equity).
- A 404 in logs = a broken internal link; use the referrer field to locate it.
- Prefer server-side redirects; client-side redirects need a render (wastes crawl budget, delays indexing).

## 7. noindex targets by template

Apply `noindex, follow` (links still pass equity) to:

- Tag archives (unless deliberately editorially enriched)
- Date/calendar archives, and any archive with <5 posts
- Thin author/profile pages (<100-word bio)
- Deep pagination beyond page 3–5
- Internal search results
- Printer/PDF duplicate templates
- Comment pagination beyond page 1
- Individual image gallery pages (keep the main gallery indexable)
- Past event/webinar/newsletter link-only archives
- Auto-generated comparison pages lacking original analysis
- A/B test variant URLs (during the test)
- Staging/dev environments (plus robots.txt `Disallow: /` + auth + `X-Robots-Tag` header)

**Do NOT blanket-noindex all categories** — e-commerce category pages (`/men-shirts`) stay indexable and get enriched with 300–500 words of category-specific copy. Thin threshold: <200 visible words.

## 8. Parameter handling

- `?sort=`, `?filter=`, `?brand=` → robots.txt `Disallow` + canonicalize to the unfiltered master; GSC URL Parameters → "Crawl: No URLs".
- `utm_*` → canonical to the clean URL; GSC "Crawl: No URLs"; never let campaign URLs get indexed.
- Session params → cookies, or GSC "Crawl: No URLs".
- Prefer JS-driven filtering that creates **no crawlable URL**.

## 9. The 35 causes of index bloat (build-time prevention)

Each line: the defect → the prevention rule.

**Template / page-type causes**
1. Thin blog category pages → noindex categories with <200 words, except e-commerce categories (enrich instead).
2. Tag archives → `noindex, follow` on all tag templates.
3. Filter/parameter URLs → block in robots.txt, canonicalize to master, never index filter combinations.
4. Pagination pages → `rel="next"`/`rel="prev"`; view-all if <200 items; noindex beyond page 3–5; never put paginated URLs in the sitemap.
5. Session-ID URLs → session in cookies only.
6. Soft 404s returning 200 → real 404/410; flag 200 pages with <100 words and no main content.
7. Staging/dev copies leaked → robots.txt `Disallow: /` + HTTP auth + `X-Robots-Tag: noindex` + GSC removal; audit quarterly.
8. Duplicate product URLs → exactly one canonical path per product, 301 every variation to it, CMS auto-generates canonicals.
9. Internal search results → `Disallow: /search`, noindex existing, prefer URL-less JS search.
10. Printer-friendly/PDF versions → noindex meta on print templates; `X-Robots-Tag: noindex` on PDFs.
11. HTTP + HTTPS both indexed → site-wide 301, HTTPS preferred property in GSC.
12. www + non-www both indexed → pick one, 301 the other, consistent internal links and canonicals.
13. Trailing-slash variants → one policy, server rewrite 301, self-referencing canonicals.
14. UTM parameter URLs → GSC "Crawl: No URLs" for `utm_*`, canonical to clean URL.
15. Thin affiliate pages (<300 words, scraped descriptions) → original reviews/comparisons/pros-cons, or noindex. Never index scraped product copy.
16. Auto-generated city/service pages → unique local content per city (≥80% identical text = doorway page), or consolidate into one `LocalBusiness` page with `areaServed`.
17. Sort-by pages → `Disallow: ?sort=`, GSC "Crawl: No URLs", canonical to default order.
18. Auto-generated `/compare` `/vs` pages → noindex unless original ≥300-word analysis.
19. Thin author pages → noindex by default; index only with real bio, portfolio, works.
20. Date archives → noindex; never keep an archive with <5 posts.
21. RSS/feed pages → `Disallow: /feed/ /rss/ /atom/` + `X-Robots-Tag: noindex` + GSC removals.
22. API endpoints → `Disallow: /api/ /v1/ /graphql`; correct `Content-Type: application/json`, never `text/html`; noindex header as backup.
23. JS SPA routes → SSR/SSG for critical paths; canonicals to consolidate route variants; verify rendered HTML in URL Inspection.
24. Legacy URLs after redesign → pre-launch redirect map; 301 every old URL; update internal links; GSC Change of Address.
25. Language/country variants without hreflang → **bidirectional** hreflang (each page links all versions + self), consistent URL structure, `x-default`; verify in GSC hreflang report.
26. Paginated comment pages → noindex beyond page 1, or canonical to main post, or disable pagination.
27. Individual image gallery pages → noindex per-image URLs; index the main gallery; `ImageObject` on the gallery.
28. A/B test variant URLs → robots.txt disallow + noindex header during test; prefer server-side tests that create no URLs; clean up after.
29. Past event/webinar archives → noindex minimal post-event pages; keep only those with recordings/transcripts.
30. Newsletter archive link-dumps → noindex; keep only exclusive content.
31. Zero-reply forum threads → auto-noindex threads with 0 replies after 30–90 days.
32. Cart/wishlist/user/share pages → robots.txt disallow + noindex + require auth so leaked URLs are unreachable.
33. Mirror/multisite copies (`.net`, `blog.` subdomain) → 301 alias domains to primary; move subdomain into subdirectory.
34. Hashbang URLs (`#!/path`, `_escaped_fragment_`) → migrate to History API clean URLs, 310-redirect old patterns, GSC removals.
35. Click-tracking intermediary pages (`/go?url=`, `/out`, `/track`) → replace with JS/analytics events that create no URL; else noindex + disallow.

## 10. The 8-step bloat fix (order matters)

1. **robots.txt** — disallow every pattern that must never be indexed (blocks *discovery* of new junk).
2. **noindex** — for thin pages already in the index (meta or header).
3. **canonicals** — self-referencing everywhere; duplicates/params → master.
4. **consolidate** — merge thin categories; 300–500 unique words on each survivor.
5. **pagination** — view-all under 200 items, else noindex beyond page 1 or canonical deep pages to page 1.
6. **GSC URL Parameters** — tracking-only params → "Crawl: No URLs".
7. **staging** — robots.txt + noindex header + auth + GSC removal.
8. **clean sitemap** — canonical, indexable, high-value URLs only.

Timing: robots.txt 24–48 h; noindex/canonical 1–4 weeks; full cleanup 4–8 weeks; ranking gains 2–6 weeks after re-evaluation.

Detection queries: `site:domain inurl:filter|sort|utm_source|search|q=|api|feed|wishlist|comment-page|#!`, plus `filetype:pdf`, plus the GSC Index Coverage report for Soft 404.

## 11. Crawl budget thresholds

- Irrelevant under **~1,000 pages**; measurable above **10,000** (Google: >10k changing regularly, or >1M changing weekly). Optimize *crawl quality* regardless of size.
- Fix server infrastructure **first**: TTFB target **≤ 200 ms** before any other factor; <500 ms acceptable; >1 s triggers Googlebot slowdown.
- Timeouts: Googlebot retries up to **3 times** per timeout — fix timeouts at the source.
- Redirect chains longer than 2 hops → consolidate to direct 301s.
- **Wasted crawl ratio = (4xx + 5xx responses to Googlebot) / total Googlebot responses × 100. Above 5% = significant waste.**
- Serve one consistent favicon path with a long cache lifetime (favicon passes can generate millions of requests).
- Prevent 5xx (causes back-off/surge oscillation).

## 12. WAF / edge / consent — never block Googlebot

- Whitelist Googlebot's published IP ranges in the WAF and rate limiter.
- Allowlist Googlebot IPs in CAPTCHA and JS-challenge settings (a Cloudflare challenge blocks Googlebot entirely).
- Exempt Googlebot from geo-blocking.
- Cookie-consent must be server-side or must not hide main content from crawlers.
- Allow AI crawlers per `07-ai-agentic-visibility.md`.

## 13. Bot verification — never trust the User-Agent

Spoofed scrapers send Googlebot UAs. Verify by **reverse DNS + forward DNS round trip**:

```
nslookup 66.249.66.1            # hostname must end in .googlebot.com or .google.com
nslookup crawl-66-249-66-1.googlebot.com   # must resolve back to 66.249.66.1
```

Both must match. Audit filter rules periodically as new crawlers appear.

## 14. Indexation gap analysis

1. Export URLs crawled by Googlebot from server logs (last 30 days).
2. Export indexed URLs from GSC Index Coverage.
3. Cross-reference → *crawled but not indexed* = your gap. Diagnose per URL: canonical dedup, quality, noindex/robots/JS failure, competing URLs.
4. Track the gap monthly. Investigate when pages sit in "Crawled – currently not indexed" **>2 weeks**.

Logs retain **≥90 days** (30 days minimum for a one-off audit). Use Apache **Combined Log Format** (not CLF — CLF has no user-agent/referrer); add `$request_time` to Nginx `log_format`.

Monitoring alerts: crawl count down **>30%** vs 14-day rolling average; crawler error rate **>5% for two consecutive days**; average Googlebot response time **>1,000 ms**; a new AI crawler UA appears.
