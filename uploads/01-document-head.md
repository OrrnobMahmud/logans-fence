# 01 — Document Head Rules

## 1. Meta title — the five rules

Apply to every page. Verified: rewriting 11 titles with these rules alone produced +11.7% clicks in 12 days.

1. **Front-load the primary keyword** — it must appear in the **first four words**. Weight at position 7 is far weaker than position 1.
2. **Append the current year** (`2026`) on informational/commercial pages — signals freshness.
3. **Insert the audience term** — "for Beginners", "for Graphic Designers".
4. **Delete filler words** — strip "How to", "A Guide to", "Read Before You Hire", "Get Ideas From". They push the keyword back and waste characters.
5. **Standardize separators** — choose ONE style site-wide (colon or pipe). Never mix.

Format constraints:
- 50–60 characters total.
- Primary keyword near the beginning, brand name at the end.
- Unique per page — never reuse a title across routes.

Scoring gate (from the case study): answer 5 yes/no questions per title — keyword in first 4 words? year? specific audience? filler removed? separator consistent? — **rewrite if 3 or more are "no"**.

## 2. Meta description

- 150–160 characters.
- Contains the primary keyword naturally.
- Unique per page, active voice, ends with a CTA.
- Put the main takeaway/statistic/recommendation here — **the meta description is what AI systems quote**, not a marketing slogan.

## 3. Viewport — exactly one, exactly this

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Never: fixed widths (`width=1024`), `initial-scale` below 1 (causes a 300 ms tap delay), duplicate viewport tags (browser uses only the first), or omitting the tag (mobile then defaults to a 980 px viewport).

**Never** ship `maximum-scale=1.0` or `user-scalable=no` — accessibility violation, flagged by Google's mobile tests.

Audit: grep page source for `meta name="viewport"`; a theme + an SEO plugin often emit two.

## 4. Robots meta

Default indexable page:

```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

- Use `noindex` (meta) for pages that must leave the index — **never** pair it with a robots.txt `Disallow` on the same URL (see `02-urls-crawl-index.md` §4).
- Set robots meta **dynamically per route** in SPA frameworks (`next/head`, `react-helmet`, `vue-meta`) or every page inherits the same directive.

## 5. Canonical

- Self-referencing `<link rel="canonical">` on **every** page.
- **Absolute URL** with `https://`.
- Target must **return 200** — never point at a redirect or a 404.
- Only canonicalize genuinely similar content — never a product page to the homepage.
- Must be in the **initial server-rendered HTML**, never injected after hydration, and never overridden by client JS. Raw and rendered HTML must agree.

```html
<link rel="canonical" href="https://example.com/blog/technical-seo-guide/" />
```

## 6. Open Graph & Twitter — server-rendered, always

Social crawlers (Facebook, Twitter, LinkedIn, Slack, Telegram) execute **zero JavaScript**. OG tags injected by JS = blank preview.

```html
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="…" />
<meta property="og:description" content="…" />
<meta property="og:url" content="https://example.com/page/" />
<meta property="og:site_name" content="…" />
<meta property="og:image" content="https://example.com/static/og-image.webp" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="…" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="…" />
<meta name="twitter:description" content="…" />
<meta name="twitter:image" content="https://example.com/static/og-image.webp" />
```

- OG image exactly **1200×630**.
- Twitter `title`/`description` are redundant when OG is present, but `twitter:card` is required.
- For CSR-only apps, serve pre-rendered HTML to social crawler user agents (Prerender.io / Rendertron / edge middleware).
- Verify with Facebook Sharing Debugger and LinkedIn Post Inspector.

## 7. Full head template (from the live site)

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>{Keyword-first title, 50–60 chars} - {Brand}</title>
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="description" content="{150–160 chars}" />
  <meta name="author" content="{Name}" />

  <!-- Open Graph -->
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:site_name" content="{brand}" />
  <meta property="og:image" content="{abs}/og-image.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{alt}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{abs}/og-image.webp" />

  <link rel="canonical" href="{canonical}" />

  <!-- JSON-LD: see 06-structured-data.md -->
  <script type="application/ld+json">{ … @graph … }</script>

  <link rel="shortcut icon" href="/static/images/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" sizes="180x180" href="/static/images/apple-touch-icon.png">
  <meta name="google-site-verification" content="…" />
  <meta name="msvalidate.01" content="…" />

  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>

  <!-- Critical CSS preloaded + render-blocking; non-critical CSS deferred -->
  <link rel="preload" href="/static/css/output.css?v=1" as="style">
  <link rel="stylesheet" href="/static/css/output.css?v=1">
  <!-- Non-critical: media="print" swap pattern with <noscript> fallback -->
  <link rel="preload" as="style" href="…/font-awesome.min.css" />
  <link rel="stylesheet" href="…/font-awesome.min.css" media="print" onload="this.onload=null;this.media='all'">
  <noscript><link rel="stylesheet" href="…/font-awesome.min.css"></noscript>
</head>
```

## 8. Per-route uniqueness

Every route needs its own: title, meta description, canonical, robots meta, OG tags. In a framework, generate them from route data — never hardcode one head component for the whole app.

## 9. Verification

1. `curl -s https://example.com/page | grep -E '<title>|meta name="description"|rel="canonical"'`
2. View Page Source (not DevTools Inspect) — confirms server render.
3. GSC URL Inspection → "View tested page".
4. Rich Results Test for any JSON-LD.
5. Facebook Sharing Debugger for OG.
