# 04 — Performance & Mobile

## 1. Core Web Vitals thresholds (hard targets)

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| **LCP** | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| **INP** | ≤ 200 ms | 200–500 ms | > 500 ms |
| **CLS** | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** | ≤ 200 ms target (Google's LCP guidance ≤ 800 ms) | ≤ 500 ms | > 1 s slows Googlebot |

- Scoring is the **75th percentile** of page loads. **All three must pass — one poor metric fails the page.**
- Mobile matters more (mobile-first indexing).
- INP replaced FID in March 2024 — ignore FID on new projects.
- Field data (CrUX) is what Google ranks on; Lighthouse lab data is only for debugging.
- A PageSpeed score of 100 is **not** evidence Googlebot gets a fast server — check GSC Crawl Stats average response time and server logs instead.

## 2. The 15 build factors

1. Preload the LCP image in `<head>` with `rel="preload"` + `fetchpriority="high"`:
   ```html
   <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
   ```
2. Compress images to WebP/AVIF at 70–85% quality; serve via `srcset`; CDN.
3. Inline critical CSS; defer non-critical CSS with `media="print"` onload; `defer` scripts.
4. Keep TTFB ≤ 200 ms: fast hosting, server/edge caching, CDN, optimized DB queries, no N+1.
5. **Always** `width`/`height` (or CSS `aspect-ratio`) on images, iframes, ad slots.
6. `font-display: swap` + preload critical font files.
7. Reserve fixed space (or fixed positioning) for cookie banners, chat widgets, popups — never inject above existing content.
8. Break JS tasks >50 ms with `setTimeout`/`requestIdleCallback`; heavy work to web workers.
9. Batch DOM reads/writes; use document fragments; no layout thrashing in loops.
10. Third-party scripts with `async`/`defer`; self-host critical ones.
11. `{ passive: true }` on scroll/touch listeners; debounce/throttle resize and scroll.
12. Validate lab data against field data (CrUX).
13. Set performance budgets + CI regression alerts.
14. Test on physical devices (emulators miss thermal throttling).
15. Monitor third-party script changes.

## 3. Image rules

- Every `<img>`: `width`/`height` (or `aspect-ratio`), `alt`, `loading` attribute.
- LCP/hero: `loading="eager"` + preload + `fetchpriority="high"`.
- Everything below the fold: native `loading="lazy"` with a real `src`.
- Always `srcset` + `sizes` — a single source forces every device to download the full file.
  ```html
  <img src="hero-800.webp" srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1600.webp 1600w"
       sizes="100vw" width="800" height="600" alt="…">
  ```
- Use `<picture>` for art direction and AVIF/WebP with JPEG fallback (25–35% better compression than JPEG).
- Responsive LCP: `sizes="100vw"` with a ~400 px candidate for mobile — a 2000 px image is wasted on a 375 px screen.
- Compress (Squoosh/TinyPNG) — 50–80% reduction typical.
- Video: 16:9 aspect-ratio container (`padding-bottom: 56.25%`), `width`/`height` on iframes, `loading="lazy"` embeds, `<source>` MP4 + WebM/AV1, thumbnail + play button instead of autoplay.

## 4. Fonts

```html
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```
- `font-display: swap` to avoid FOIT (Googlebot waits for visible text).
- `font-size-adjust: 0.5` to reduce swap shift; pick fallback fonts with similar metrics.
- Inline critical font subsets as data URIs (only needed glyphs).

## 5. Animation & layout

- Animate with `transform` / `opacity` only — never `top`, `left`, `margin` (they trigger layout).
- Add `contain-intrinsic-size` to any element using `content-visibility: auto`; never apply `content-visibility` to anything in the initial viewport.
- Use skeleton screens; never insert content above existing content after load.
- Easiest CLS win first (width/height + `font-display: swap` + reserved ad space), then LCP, then INP (JS refactor).

## 6. Mobile rules

**Viewport** — see `01-document-head.md` §3.

**Content overflow**
- Replace fixed-width containers (`width: 1200px`, `min-width: 960px`) with `%`/`vw` units.
- `max-width: 100%` on all images, videos, embeds.
- Wrap tables in `<div style="overflow-x: auto">`.
- `min-width: 0` on flex/grid children so they can shrink.
- Test at **320–428 px** viewports; clear every GSC "Content wider than screen" error.

**Text size**
- Body text **≥ 16 px** on mobile — below that triggers "Text too small", which can suppress pages.
- Use `rem`/`em`: `html { font-size: 16px }`, h1 2rem, h2 1.5rem, p/li/a 1rem; captions may be 14 px, nothing smaller.
- Guard viewport-relative sizes: `font-size: max(16px, 3vw)` (plain `3vw` = 10.8 px at 360 px).
- Line-height **1.5–1.6**, never below 1.4.
- Contrast: **4.5:1** normal text, **3:1** large text (WCAG 2.1 AA).
- Watch footers, sidebars, breadcrumbs, dates, author names.

**Touch targets**
- Minimum **48×48 px** with **≥ 8 px** between adjacent targets.
- Inline links need padding: `a { padding: 12px 8px; display: inline-block; }` (16 px × 1.5 line-height ≈ 24 px is too small).
- Form inputs ≥ 48 px tall; buttons ≥ 48×48; space pagination and social icons.
- `button, a { touch-action: manipulation; }` to kill the 300 ms tap delay.
- Handle `touchstart`/`touchend`, not just `click`; feature-detect, don't browser-detect.

**CSS strategy**
- Mobile-first: base styles for mobile, then `min-width` media queries up (768, 1024…).
- Breakpoints: 320, 375, 414, 768, 1024, 1280, 1920.
- Navigation collapses to hamburger/accordion; multi-column stacks.
- One responsive stylesheet — not separate mobile stylesheets.

## 7. JS & third-party budget

- `defer` every script that doesn't need immediate execution.
- Target total JS ≤ 300 KB, total images ≤ 1 MB; enforce with `size-limit` / Lighthouse CI and fail the build on breach.
- 500 KB–2 MB bundles = 5–20 s parse on mobile.
- `async`/`defer` on **all** third-party scripts; lazy-load non-critical ones after `DOMContentLoaded`; self-host critical third-party resources; use a tag manager; add `dns-prefetch`/`preconnect`.
- Watch the ~6-connections-per-domain cap on HTTP/1.1.

## 8. Server

- Page/object/fragment caching, CDN, DB indexing, no N+1 queries, auto-scaling.
- Support `304 Not Modified` for unchanged content (Google-recommended).
- Monitor `5xx`, `429`, timeouts, DNS failures — Google lowers crawl capacity on all of them.
- Caching layers: full-page cache, `Cache-Control` browser caching, CDN caching, object caching (Redis/Memcached).
- CMS notes: WordPress → system cron (not pseudo-cron), full-page + object cache, audit plugins quarterly (a 50-plugin site can generate ~80 requests per page); Django → `{% cache %}` fragments + Redis + `select_related`/`prefetch_related`; Next/Nuxt → SSG for content, ISR for periodic, avoid pure SSR for high-traffic pages, cache rendered output at the CDN.

## 9. Process

- Set up RUM (web-vitals npm package: `onLCP/onINP/onCLS`, `{reportAllChanges: true}` on SPA route changes, sample 10–20% of traffic).
- Alert on budget breaches; monthly audit; prioritize "poor" page groups first.
- Pages with poor CWV get **less crawl budget** — fix "poor"/"needs-improvement" groups first.
