# 07 — AI & Agentic Visibility

## 1. Let AI crawlers in (robots.txt)

The single cheapest, fastest fix (1 day, no cost). Check for a forgotten `Disallow: /` under any of these and allow them:

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /
```

**Policy decision per site.** Two documented postures:
- *Maximum AI visibility* → allow all.
- *Protect copyrighted content* → block **training** crawlers (`GPTBot`, `CCBot`, `Google-Extended`, `CommonCrawl`), but **always allow answer/inference crawlers** (`PerplexityBot`, `ChatGPT-User`, `ClaudeBot`) because those generate citations.

Also:
- ~40% of AI crawlers ignore robots.txt anyway — the file is necessary, not sufficient.
- Verify hits in server logs (`grep GPTBot`, `grep ClaudeBot`). Absent = firewall, CDN, or security plugin is blocking them — whitelist those UAs/IPs.
- Rate-limit aggressive AI crawlers: **if AI crawlers exceed 10% of bot-handling capacity, throttle them.**
- Use `Crawl-delay` in robots.txt for non-Google bots.
- Submit the sitemap to GSC **and** Bing Webmaster Tools.

## 2. `llms.txt` at the domain root

Spec format ([llmstxt.org](https://llmstxt.org)):

```markdown
# Project Name
> Short description of the project or site.

Optional context paragraph.

## Docs
- [Getting Started](https://example.com/docs/getting-started): Step-by-step setup for new users.

## Blog
- [Article Title](https://example.com/blog/article/): One-line standalone description.

## Optional
- [Secondary page](https://example.com/secondary): Skipped by LLMs when context is tight.
```

Rules:
- Exactly one file at `/llms.txt`. It **coexists with** robots.txt (crawler access) and sitemap.xml (all indexable pages) — llms.txt is a curated answering directory, not a ranking signal and not for training.
- H1 = site name; `>` blockquote = one-line summary; `##` H2 sections grouped by section (Home, About, Docs, API, Blog, then the rest); entries as `- [Title](URL): Description`.
- `## Optional` is special: LLMs may skip it. Everything outside it is treated as essential.
- Size: `llms.txt` 2–50 KB; optional `llms-full.txt` (full concatenated content) 50 KB–5+ MB, keep under ~100,000 tokens.
- Each description must stand alone as a useful sentence, lead with the main point, use the **real brand name** (never "our platform"), pull from the meta description or H1.
- Generate it from a crawl that honors robots.txt, `X-Robots-Tag`, and `<meta name="robots">`, grouping pages by top-level directory; exclude login/admin/404/PDF/CSS/JS/noindex.
- Note: Google has stated it does **not** use llms.txt — ship it for AI agents and the Lighthouse Agentic Browsing score, not for Google.
- Refresh every 3–6 months.

## 3. Semantic HTML instead of nested divs

```html
<article> <section> <header> <main> <nav> <footer> <aside> <form>
```
Never `<div><div><div><div><h2>…</h2>`. Agents and screen readers build meaning from element roles.

## 4. Accessibility tree (required for AI agents)

AI agents read the **accessibility tree**, code structure, and metadata — not your visual rendering.

- **Every interactive element needs a programmatic name** → `aria-label`:
  ```html
  <button aria-label="Add to cart"><svg>…</svg></button>
  ```
- **Every element needs a valid role** — a `div` acting as a button gets `role="button"`; form inputs get an associated `<label for>`.
- No unlabeled icon buttons, no input without a label.
- Verify: Chrome DevTools → Accessibility panel → find unlabelled nodes; Lighthouse accessibility audit.

## 5. Layout stability for agents

- `width`/`height` on **all** images and videos — agents that identify an element lose it when it moves.
- Reserve ad/embed space with fixed-dimension containers; never inject content above existing elements after load.
- **CLS < 0.1.**

Scored by Chrome's **Lighthouse "Agentic Browsing" category** (2026): a fraction of passed checks (e.g. 5/8), not 0–100. Four check areas: WebMCP integration, agent-accessible content, layout stability, `llms.txt` discoverability. Run: F12 → Lighthouse → Agentic Browsing. **Under half the checks passing = fix before launch.**

## 6. WebMCP — only for complex interactions

Declarative API via data attributes on forms/searches/checkouts/tools. Blog posts don't need it.

```html
<form data-webmcp-tool="search_flights"
      data-webmcp-description="Search for available flights">
  <input type="text" name="from" data-webmcp-description="Departure city">
  <input type="text" name="to" data-webmcp-description="Arrival city">
  <input type="date" name="date" data-webmcp-description="Travel date">
  <button type="submit">Search</button>
</form>
```

## 7. Machine-readable content

- Pricing, features, FAQs, comparisons in **plain HTML**, accessible with no JavaScript interaction — "JavaScript-heavy pages return empty shells to plain HTTP requests."
- Serve clean, crawlable static HTML; heavy JS blocks AI crawlers.
- Page load under **3 seconds** — over that, AI crawlers move on.
- **No hidden content** behind tabs/accordions/JS.
- Pass Mobile-Friendly Test on every page (AI inherits mobile rendering constraints).
- Answer in the **first 100 words** (see `08-content-extraction.md`).

## 8. Cross-source consistency (agents verify)

Agents cross-reference structured data, `llms.txt`, API responses, and HTTP cache headers. **Schema price ≠ API price → the agent skips your product.** Pricing, features, and positioning must not contradict across your site, G2/Capterra/Trustpilot, and third-party comparisons.

- Use the exact brand/product name everywhere (never "we"/"our") — mismatched naming ("Acme Analytics" vs "Acme Data") makes the model omit you.
- Write a 40-word entity definition (subject + category + differentiator) and place it **identically** on: homepage above the fold, About page, footer, and Organization schema description.
- `sameAs` links in Organization schema → LinkedIn, Twitter, Crunchbase, Wikipedia.

## 9. Detection & monitoring

- Detect agents by User-Agent + IP range: `Google-Extended`, `ChatGPT-User`, `Claude-Web`. Analytics don't separate agents by default — use server logs (GoAccess/Python), the `isbot` library, or custom filters. Heuristics: 100% bounce + ~0 time-on-page, PDF/API-only requests, datacenter IPs.
- Log analysis: watch `GPTBot`, `ChatGPT-User`, `Claude-Web`, `Google-Extended`, `PerplexityBot`, `Amazonbot`, `cohere-ai`, `CCBot/2.0`, `Meta-ExternalAgent`, `Bytespider`.
- If AI crawlers bypass important pages → add them to `llms.txt` and give them strong internal links.
- Manual citation testing monthly: 20–30 queries across 5 query types (brand, category, problem, comparison, alternative) in ChatGPT, Perplexity, Gemini, AI Overviews. Log cited/mentioned/absent. **Citation rate <30% on priority queries = still work to do.**
- Track AI citation rate and brand mentions as a **separate KPI** from clicks.
- AI-referred traffic often arrives as *direct* (no referrer) — build a GA segment of direct sessions on known AI-cited pages.

## 10. Timeline expectations

| Fix type | Visible in AI answers |
|---|---|
| robots.txt, schema, entity definitions, heading/answer-first rewrites | **4–8 weeks** (heading changes: 3–8 weeks) |
| Third-party authority (Wikipedia, review sites, podcasts) | 3–6 months |
| Traditional ranking changes | 3–6 months |

## 11. Off-site note (not buildable, but set expectations)

Only ~23% of branded AI citations come from your own site — 77% from third-party sources (G2, Capterra, Wikipedia, Reddit, trade press). Build the on-site layer first (steps 1–8 above), then the authority layer.
