# Technical SEO Build Rules

Build instructions for coding agents: imperative, numeric where a threshold exists, and organized so each file maps to one layer of the stack.

**How to use:** paste the path of the relevant file into a coding agent as a constraint set, or feed the whole folder as project rules.

```
"Follow the build rules in seo-build-rules/. Every page you generate must
pass the checklist in README.md § Master Checklist."
```

## File index

| File | Covers |
|---|---|
| `01-document-head.md` | `<head>` tags: title, meta, robots, canonical, OG/Twitter, viewport |
| `02-urls-crawl-index.md` | URL policy, robots.txt, noindex, canonical, sitemap, status codes, the 35 index-bloat causes |
| `03-rendering-html.md` | SSR/SSG vs CSR, content in initial HTML, crawlable links, interaction-gated content |
| `04-performance-mobile.md` | Core Web Vitals thresholds, viewport, text size, touch targets, images, fonts, JS budget |
| `05-architecture-linking.md` | Click depth, pillar/cluster, internal link counts, anchor text |
| `06-structured-data.md` | JSON-LD rules, schema type per page, homepage type map |
| `07-ai-agentic-visibility.md` | AI crawlers, `llms.txt`, accessibility tree, semantic HTML, WebMCP |
| `08-content-extraction.md` | Heading hierarchy, answer-first writing, lists/tables/FAQ, meta title rules |

## The doctrine in one paragraph

Most visibility failures are structural, not keyword or backlink problems. Ship **crawlable, server-rendered, semantically structured HTML**; give every resource **one canonical URL**; keep important pages **within 3 clicks**; put the **answer in the first sentence under every heading**; mark up meaning with **JSON-LD**; and let **AI crawlers and assistive technology read the same DOM a human sees**. Then verify with server logs and Search Console, not with a Lighthouse score.

## Master checklist

Run this against every page before calling it done.

**Access & indexation**
- [ ] One URL per resource; HTTP→HTTPS, one host, one trailing-slash policy enforced by 301 at server level (`02`)
- [ ] Self-referencing `<link rel="canonical" href="https://…">` on every page, absolute URL, target returns 200 (`01`, `02`)
- [ ] robots.txt allows own CSS/JS assets; blocks `/search`, `/tag`, `/cart`, `/api/`, `/feed/`, `?filter=`, `?sort=`, staging hosts (`02`)
- [ ] Never `Disallow` + `noindex` on the same URL (`02`)
- [ ] Sitemap contains canonical, indexable, 200-status URLs only (`02`)
- [ ] Real `404`/`410`, never a 200 soft-404 (`02`, `03`)
- [ ] No orphan pages: every published page has ≥1 internal link (`05`)

**Document head** (`01`)
- [ ] Unique `<title>` 50–60 chars, primary keyword in first 4 words, year, audience, one separator style
- [ ] Unique meta description 150–160 chars
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, exactly one, no `user-scalable=no`
- [ ] Robots meta, OG, Twitter card, `og:image` 1200×630, in raw HTML

**Rendering** (`03`)
- [ ] Title, meta, canonical, H1, body copy, internal links, JSON-LD all present in **view-source** HTML
- [ ] All navigation is static `<a href="...">`; no `javascript:void(0)`, no `href="#"` + onclick
- [ ] No content behind clicks, tabs, accordions, or scroll to be indexed
- [ ] Router returns real 404 status for unknown routes

**Performance & mobile** (`04`)
- [ ] LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, TTFB ≤ 200 ms target (never >500 ms)
- [ ] Every `<img>`/`<iframe>`/ad slot has `width`/`height` or CSS `aspect-ratio`
- [ ] Body text ≥ 16 px on mobile; touch targets ≥ 48×48 px with ≥ 8 px gap
- [ ] LCP image `loading="eager"` + `rel="preload"` + `fetchpriority="high"`; below-fold images native `loading="lazy"` with real `src`

**Architecture** (`05`)
- [ ] Important pages ≤ 3 clicks from home; pillar ↔ cluster linked both directions
- [ ] 3–5 contextual body links per article (pillars 8–12); ≤ 30 total per page
- [ ] Unique anchor text per target; no internal `nofollow`

**Structured data** (`06`)
- [ ] JSON-LD only, in initial HTML, `@graph` for multi-entity
- [ ] Organization + BreadcrumbList site-wide; Article + Person on posts; FAQPage/HowTo where format matches
- [ ] Passes Rich Results Test; schema matches visible content

**AI & agentic** (`07`)
- [ ] `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` allowed in robots.txt (policy decision; default allow)
- [ ] `llms.txt` at domain root, spec format
- [ ] Every interactive element has `aria-label`/`<label for>` and a valid role; no unlabeled icon buttons
- [ ] Headings, body text, links, and schema in the light DOM / accessibility tree

**Content** (`08`)
- [ ] Exactly one H1; H2→H3 never skipped; no empty or duplicate headings
- [ ] First 40–60 words after every H2/H3 = the standalone answer
- [ ] H2s phrased as real user questions with ≥1 recognizable entity
- [ ] Paragraphs 2–4 sentences; lists of 5–7 items; comparison data in tables
- [ ] FAQ answers 2–4 self-contained sentences with **no links inside** them

## Known conflicts (resolved here)

| Conflict | Resolution used |
|---|---|
| TTFB: "under 800 ms" (LCP guide) vs "target 200 ms, 500 ms acceptable, >1 s slows Googlebot" (crawl budget guide) | Target **≤ 200 ms**, hard ceiling 500 ms |
| Click depth: "within 3 clicks" vs "flag over 4 clicks" | Build to **≤ 3** |
| `llms.txt`: one article says Google does not use it; another scores it in Lighthouse Agentic Browsing | Ship it anyway — Google ignores it, AI agents and Lighthouse do not |
| AI bots: "allow all" (AI-visibility articles) vs "block training bots" (bot-traffic guide baseline) | **Policy decision per site.** Default = allow. Block training-only bots (`GPTBot`, `CCBot`, `Google-Extended`) when content is copyrighted and revenue is not AI-referred; always allow answer/inference crawlers (`PerplexityBot`, `ChatGPT-User`, `ClaudeBot`) |
