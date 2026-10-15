# 05 — Architecture & Internal Linking

## 1. Depth

- **Every important page within 3 clicks of the homepage.** Pages at depth 4+ get crawled less often and weaker authority signals.
- Prefer flat architecture: fewer intermediate layers. `home → category → subcategory → product` = depth 3 (fine); adding a tag layer = depth 5 (bad).
- Every page needs **≥1 internal link** — orphan pages are effectively invisible (~25% of web pages have zero internal links). A sitemap is not a substitute for links.
- Flag any page at depth ≥4 in a quarterly crawl.

## 2. Pillar / cluster topology

- Pillar page (comprehensive, typically 2,000+ words) at depth 1 → cluster pages at depth 2 → all within 3 clicks.
- **Bi-directional linking is mandatory:** pillar links down to every cluster; every cluster links back to the pillar; sibling clusters cross-link.
- Each pillar anchors **4–8** cluster articles.
- Pages reachable via **multiple navigation paths** match more queries (and more AI fan-out branches).
- Orphan pages carry less authority in the citation graph.

## 3. Link counts

| Page role | Contextual body links | Total incl. nav/footer |
|---|---|---|
| Pillar / hub | 8–12 | ≤ 30 |
| Standard article | **3–5** | ≤ 30 |
| Any page | — | 15–30 ceiling (nav/footer alone add ~5–15) |

- A page with 80 outgoing links (or 50+ sitewide internal links) dilutes value per link sharply.
- Allocate internal equity like a budget: conversion pages, cornerstones, service pages get the most; author bios, archives, tags get the least.
- Find top pages by referring domains (Screaming Frog/Semrush) and link *from* them to new content that needs ranking velocity.

## 4. Publishing workflow — retro-linking

Every new page must get:
- **≥1 contextual internal link within 2 weeks of publication.**
- Preferably **2–3 contextual links from older, already-ranking or backlinked posts** ("retro-linking"), ~15 minutes per publish.

Publishing without retro-links is a named mistake.

## 5. Anchor text

- Mix: partial match **most often**, exact match sparingly, branded, natural phrases, minimal generic.
- **Never use the same clickable text for two different target pages** — it confuses which page owns the topic. Each target gets a unique set of descriptor anchors.
- Never zero-signal text: "click here", "link", "page", "read more", "this".
- Bad: identical labels on one page pointing at different targets, or over-used exact match.
- Example healthy set for one target: "structuring your website", "organising page relationships", "building topical connections", "routing authority through content".

## 6. Link markup by role

| Link type | Markup | Notes |
|---|---|---|
| Navigation | `<nav>` + `<ul>` | |
| Breadcrumbs | `<ol>` + `BreadcrumbList` JSON-LD | Google uses breadcrumb markup for rich results |
| Contextual body | `<a>` inside `<p>`/content | **strongest signal** — the backbone |
| Footer | `<a>` | low authority; utility pages only (privacy, terms, contact) |
| Same-page anchor `#id` | `<a href="#…">` | passes no inter-page authority |

- Never rely on nav/footer alone — every article needs 3–5 body links.
- Internal links are **dfollow**; `rel="nofollow"` on an internal link is a bug (except login/admin/ToS).
- External links: `rel="nofollow"` (untrusted/UGC/paid), `rel="sponsored"` (paid), `rel="ugc"` (comments/forums), no rel for editorial.

## 7. Crawlability of links (agent- and crawler-facing)

- All important navigation = **static HTML `<a href>`**. Never JS click handlers as the sole mechanism.
- Every nav and body link must appear in the **accessibility tree without user interaction** — links revealed only by accordion/tab/lazy-load/hover JS are invisible to AI crawlers.
- Descriptive `aria-label` where visual text is ambiguous.
- Test with the Lighthouse accessibility audit and with JS disabled in DevTools.

## 8. Crawl traps to avoid building

Faceted navigation, calendars, internal search, session IDs, infinite scroll without URL change, and unbounded parameter combinations. Prevention: `noindex` on parameterized pages, consolidate filters into canonicals, block search results in robots.txt, correct pagination (`02-urls-crawl-index.md` §8–9). Verify trap fixes by confirming crawl counts for those paths **drop to zero**.

## 9. Audit cadence

- Quarterly Screaming Frog/Sitebulb crawl; plus after migrations, category restructures, consolidations, or 10+ new articles.
- Check: inlinks per page (0–1 = orphan), % of pages at depth ≥4, outlink-count outliers, duplicate anchor texts.
- GSC → Links → Internal Links: if conversion/cornerstone pages rank low on inlink count, fix the architecture.
- Rewrite a pillar when it accumulates >500 words of outdated advice — rewrite, don't patch, and refresh internal links/anchors at the same time.
- Reference result: a corrected linking structure lifted one large site's Googlebot-crawled share from 40% → 70%.
