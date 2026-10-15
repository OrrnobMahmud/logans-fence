# 08 — Content Structure for Extraction & Ranking

## 1. Heading hierarchy — hard rules

- **Exactly one `<h1>` per page**, at the top. Never use the site name as the H1 on every page.
- Sections = `<h2>`; sub-topics = `<h3>`; H4–H6 only in long technical docs.
- **Never skip a level** (no H1→H3, no H2→H4). Every H3 must have a parent H2 — a skipped level is a missing node in the model's content tree and a W3C accessibility failure.
- Every `<h2>`/`<h3>` must have **extractable content immediately after it** — extraction stops at the first paragraph after a matched heading; anything deeper in the section never registers.
- **Use CSS for visual size, heading tags for semantic hierarchy — never trade places.**
- Demote sidebar/widget headings ("Recent Posts") to lower levels so they don't dilute the outline.
- Audit CMS templates for duplicate H1s and empty heading tags.
- Headings must describe the content beneath them; never use a heading purely for styling.
- **H1 must match the page title's topic.**

## 2. Question-shaped, entity-rich headings

- Phrase H2s as **real user questions**: "How much does website development cost?" — not "Our Services", "More Information", "Introduction", "Overview", "Details" (zero semantic signal).
- Models select sections by **heading–query match, not body relevance**. Each H2 = one query you want to be cited for: 4 strong H2s = citable for 4 queries.
- **Every H2/H3 contains ≥1 recognizable entity** (brand, product, metric, place, concept).
- Prefer experience-driven headings: "Common Heading Mistakes" → "3 Heading Errors I Found Auditing 50 Enterprise Sites".
- Semantic drift check: an H3 should stay ≥65% semantically aligned with its parent H2 (below that, citation likelihood for that section drops sharply).
- The heading outline alone, read with no body text, must summarize the page's flow.

## 3. Answer-first — the core writing rule

- **The first 40–60 words after every H2/H3 must be the standalone answer.** Deliver the answer before context, examples, or data; burying it means a competitor gets cited.
- First 1–2 sentences under every heading = a self-contained extractable statement.
- Lead every paragraph and section with its key point — the model may truncate after the first clear statement.
- Put the answer in the first sentence using the phrasing of the likely question.
- **Keep the answer block free of links, images, and introductory filler.**
- Front-load answers into the **first third of the page**.
- Technical term definitions: term in the heading, definition in the **first sentence** of the following paragraph, **under 40 words**.

## 4. Paragraphs, lists, tables

- Paragraphs: **one idea, 2–4 sentences.**
- Bullet lists for criteria/features/pros-cons; numbered lists for steps/rankings/sequences.
  - **One clear idea per item, 5–7 items per list.**
  - Place the list directly after a descriptive heading matching the user question.
  - **Bold the key term in each list item.**
- Comparison data → **HTML tables** (81% extraction rate vs 23% when the same data is prose).
  - One comparison axis per column, clear header rows, **no merged cells**.
  - Wrap wide tables in an overflow container.
- Keep punctuation simple and consistent; avoid decorative arrows and complex formatting.
- Convert dense prose → lists/tables/definitions **first on evaluative, comparative, and commercial pages**; simple factual pages need least reformatting.

## 5. Statistics

- **2–3 per page**, each in its own sentence with the source named inline: "Google research published in 2024 found that 72 percent…", never "studies show…".
- **Bold the number and its context**; link the source so AI can verify.
- Update figures regularly (recency is a citation factor).

## 6. FAQ blocks

- Question uses the **exact phrasing users type into AI tools** (source from AnswerThePublic / AlsoAsked).
- **Answer in 2–4 self-contained sentences with NO internal links** — links truncate extraction.
- Group related pairs under descriptive `<h2>` headings; never one flat list.
- Add `FAQPage` JSON-LD to every FAQ.
- 8–10 well-researched FAQ items per important page.
- Avoid generic questions no user would ask an AI.
- Update FAQs quarterly.

## 7. Step-by-step content

- One-sentence outcome summary before the steps.
- Numbered list markup, **not paragraphs**; each step = a single actionable command plus its result.
- Add `HowTo` schema; group related steps under `<h3>` headings mirroring common sub-questions.

## 8. Quotability test

Write **one standalone quotable sentence per section**. Test: if an AI copied only that sentence, is it still correct and useful alone? Same for each definition.

## 9. Meta title rules

See `01-document-head.md` §1 — the five rules (front-load keyword in first 4 words, current year, audience term, no filler, one separator style).

## 10. Link rules inside content

- Descriptive anchor text only — never "click here"; e.g. "our guide to structured data implementation".
- **No links inside FAQ answers or extracted answer blocks.**
- Link pages **both directions** (article ↔ related articles). Orphan pages are invisible to AI.
- Every article gets **≥3–5 internal links from other relevant pages**.

## 11. Freshness & E-E-A-T

- Refresh important content every **3–6 months** (quarterly for high-value pages): new data, remove outdated screenshots, update the visible publication date, add a visible "last reviewed" date.
- Author byline + credentials + bio on every article; external sources hyperlinked; visible publication and update dates.
- Original insight beats rewritten knowledge — personal testing, proprietary data, direct experience = information gain. Paraphrases are rarely cited.
- Content updated regularly performs ~26% better.
- Never publish thin AI-generated content (detected and deprioritized).

## 12. Entity & brand naming

- Use the **exact brand/product name** everywhere instead of "we"/"our"/"our platform".
- Replace vague claims with measurable ones: ✗ "innovative and cutting-edge" → ✓ "42 dB dishwasher designed for open-concept kitchens with triple-layer insulation".
- Use synonyms and related terms ("citation frequency", "extractable content", "LLM retrieval") to reinforce entity mapping.

## 13. Page-type specifics

**Product pages**
- Title includes distinguishing attributes (color, size, material, compatibility), not brand alone — query fan-out splits on those.
- Descriptions = feature–benefit pairs under clear headings.
- Full Product schema: price, availability, rating, review count.
- Include a comparison/alternatives section, review highlights, and a Q&A section.

**Landing pages for AI-referred visitors**
- Lead with the exact claim/data point the AI quoted; brand intro and nav prompts go lower.
- Match page structure to what the AI quoted (mismatch → bounce).
- Primary CTA assumes late-stage intent ("Book a demo", "See pricing") over "Learn more".
- Mobile parity: same completeness and speed as desktop.

## 14. Priority order when fixing

1. Heading hierarchy
2. Answer-first structure
3. Structured data

Then: FAQs → entity optimization → cross-platform testing. Results appear in **3–8 weeks**.

## 15. Repurpose check (content templates for agents)

When generating any long-form page, emit in this order:

```
<H1 matching the title topic>
<40–60 word direct answer paragraph>
<H2 as a real user question>
  <1–2 sentence standalone answer>   ← no links, no images here
  <supporting detail: list / table / stats with sources>
  <H3 sub-question if needed>
    <1–2 sentence standalone answer>
    <detail>
<H2 FAQ section>
  <question phrased as users type it>
  <2–4 self-contained sentences, no links>  + FAQPage JSON-LD
```
