# 03 — Rendering & HTML Delivery

## 1. Choose a rendering strategy per page type

| Page type | Strategy |
|---|---|
| Marketing, blog, docs, help center | **SSG or ISR** |
| E-commerce product pages | ISR or SSR |
| News / real-time | SSR |
| Dashboards, authenticated, personalized | CSR is fine |
| Large mixed site | Hybrid: SSG marketing + SSR dynamic |

AI readability by method: **SSR yes, SSG yes, CSR no.**

Rule: **put all SEO-critical content in the initial HTML response — do not rely on Google's rendering queue.** Dynamic rendering is a workaround Google recommends against; treat it as a temporary bridge, never the architecture.

## 2. Must be in the initial HTML (verify with `curl`)

- `<title>` and meta description
- `<link rel="canonical">` and robots meta
- H1 and all body paragraphs
- Internal links
- JSON-LD structured data
- Primary navigation

Verification:
```
curl -s https://example.com/page
```
must return all of the above. Then GSC URL Inspection → "View tested page" → "Test live URL".

Diagnosis: View Page Source (not DevTools Inspect). Minimal HTML full of `<script>` tags = CSR, which is a problem.

CSR → SSR migration order: (1) GSC URL Inspection, compare "View crawled page" HTML vs source, (2) identify critical content, (3) pick framework (React→Next.js, Vue→Nuxt), (4) convert top pages first, (5) re-test after each change.

## 3. Content must exist in the DOM without interaction

**Google does not click buttons, open accordions, scroll, or trigger user actions.** Content behind tabs, accordions, "load more", hover, or scroll will not be indexed — and AI parsers skip it too.

- Render content by default in the DOM (visually hidden is fine); use JS only to *toggle* it.
- Never gate content behind a "Load More" click.
- Prefer **progressive enhancement** (works without JS) over graceful degradation.
- Test: disable JS in DevTools. If critical content or navigation disappears, you have no fallback — add SSR/SSG or a `<noscript>` block.

## 4. Links must be real anchors

Crawlable: `<a href="/products/123">`, React Router `<BrowserRouter>` links, Next/Nuxt `<Link>` — all render a real `href`.

**Never ship:**
- `href="javascript:void(0)"`
- `href="#"` + onclick
- `<button onclick="navigateTo(...)">`
- `<div>` / `<span>` with onclick as navigation

These are dead links for SEO and inaccessible. Fix: real `href` + `event.preventDefault()` for JS navigation; style an `<a>` with CSS to look like a button.

Also:
- Site navigation must never live inside a Shadow DOM root — expose `<a>` tags in the light DOM.
- Links injected only by accordion/tab/lazy-load/hover JS may be missing from the accessibility tree → invisible to AI agents.
- Internal `rel="nofollow"` is a bug (except login/admin/ToS).

## 5. Hash fragments are forbidden

- Never use `/#/products` — Google treats all hash URLs as one page; Bing/Yandex can't crawl them; creates duplicates.
- Use the HTML5 History API: React Router `BrowserRouter`, Vue Router `history: createWebHistory()`, Angular `PathLocationStrategy`.
- Server fallback for SPA routes: Nginx `try_files $uri $uri/ /index.html;`, Apache rewrite, Express `app.get('*', ...)`.
- Migrate legacy `#!/path` hashbang URLs with 301s (`02` §9.34).

## 6. Lazy loading

- Use **native** `loading="lazy"` with a real `src` in the HTML:
  ```html
  <img src="photo.webp" loading="lazy" width="800" height="600" alt="…">
  ```
- **Never** use `data-src` swapping or scroll-event listeners — Googlebot does not scroll. If you must use JS, use IntersectionObserver and always keep a visible `src` fallback.
- **Never lazy-load above-the-fold images, hero banners, logos, or the LCP element** → `loading="eager"` there.
- Every `loading="lazy"` image needs a valid `src` fallback (native lazy-load may not trigger for Googlebot).
- Every image and iframe needs `width`/`height` or CSS `aspect-ratio` — missing dimensions = CLS.
- Reserve fixed-size containers for ads/embeds; use skeleton screens; never inject content *above* existing content post-load.

## 7. Web components

- All critical SEO content — headings, body text, links, structured data — in the **light DOM**.
- Shadow DOM is for presentation only (styles, animations, widgets).
- Never put site navigation in a shadow root.
- Test new components with URL Inspection before production.

## 8. Rendering performance

- Inline above-the-fold critical CSS in `<head>`; defer non-critical stylesheets with `media="print" onload="this.media='all'"` + `<noscript>` fallback.
- `defer` scripts that need the DOM; `async` for independent ones (analytics).
- Preload critical fonts and primary LCP image; `preconnect` key third-party origins.
- Replace interactive YouTube/Twitter/Instagram embeds with static preview images (each embed adds 1–3 s render delay), or load after full render; use lite embeds (Lite YouTube saves 500 KB–1 MB per video).
- Unoptimized SSR (≥3 s) causes Googlebot timeouts and retries → use streaming SSR, ISR, or cache SSR output.
- Code-split per route; dynamic-import heavy components (`ssr: false` only for non-SEO components).
- Replace Moment.js (300 KB) with date-fns (7 KB) or Day.js (2 KB); minify + Brotli; `npm dedupe`.
- Enforce a CI bundle budget (`size-limit` ≈ 200 KB JS) that fails the build.

## 9. Service workers

Audit the SW fetch handler so Googlebot gets fresh content; invalidate SW cache on major deploys. Expose only one content version (pre-rendered *or* client-rendered) — never let both be crawlable.

## 10. Rendering delays worth investigating

- Google's median time to render ≈ **5 seconds**, 90th percentile a few minutes — do not build around a "5-second timeout" myth.
- Trigger for investigation: URLs stuck in "Crawled – currently not indexed" **>2 weeks**, stalling indexation rate, or many "Discovered – currently not indexed".
- Speed it up: smaller bundles, faster TTFB, fix 5xx, stronger internal linking, refreshed sitemap in GSC.

## 11. JS SEO test checklist

1. URL Inspection live test on top pages — screenshot shows all content; HTML contains title, description, canonical.
2. Rich Results Test for structured data.
3. Raw vs rendered HTML comparison — critical elements must be in *raw* HTML.
4. Mobile-Friendly Test.
5. PageSpeed Insights for CWV.
6. Screaming Frog/Sitebulb with JS rendering **enabled and disabled**, compare the two crawls.
7. GSC Coverage for crawl/index/render errors.
8. Navigate to a nonexistent URL — Network tab must show **404, not 200**.
9. `curl` the page — title, description, H1, body, JSON-LD present.

Automate 1–3 as CI assertions on meta tags, structured data, and canonicals per page.
