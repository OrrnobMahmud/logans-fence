# 06 — Structured Data (JSON-LD)

## 1. Format rules

- **JSON-LD only** — `<script type="application/ld+json">` with `"@context": "https://schema.org"`. Not Microdata, not RDFa (JSON-LD needs no HTML attribute edits and Google's recommended format).
- Must be in the **initial server-rendered HTML**, never client-injected after hydration.
- Use `@graph` to consolidate multiple entities on one page and declare shared `@id`s:
  ```json
  { "@context": "https://schema.org", "@graph": [ { "@type": "Person", "@id": "https://example.com/#person", … }, { "@type": "WebSite", "@id": "https://example.com/#website", … } ] }
  ```
- **One primary `@type` per page** — multiple primaries confuse Google. Supporting types allowed, minimal and relevant.
- Schema must match the **visible content** and actual business model — never mark up content that isn't on the page, never fake ratings.
- Use the most specific type (`Product`, not `Thing`).
- Include all required properties for the type.
- Validate before publishing: Rich Results Test (`search.google.com/test/rich-results`) + Schema Markup Validator (`validator.schema.org`).
- Verify in raw HTML by searching for `application/ld+json`.
- Schema is **not** a direct ranking factor and does not guarantee rich results.

## 2. Required placements

| Schema | Where |
|---|---|
| `Organization` (+ `Person` for author/publisher) | **Every page**, homepage + contact at minimum |
| `WebSite` | Homepage (Sitelinks search box) |
| `BreadcrumbList` | **Every page** |
| `Article` / `BlogPosting` | Every blog post (required for Google News) |
| `FAQPage` | Any Q&A / FAQ content |
| `HowTo` | Tutorials and guides |
| `Product` (+ `Offer`, `AggregateRating`) | Product pages |
| `LocalBusiness` (+ `PostalAddress`, `OpeningHours`) | Local pages |
| `Review` / `AggregateRating` | Review and product pages |
| `ItemList` | Listicle/directory pages |

Minimum for any site: **WebSite + Organization + page-specific type.** Add FAQPage/HowTo wherever the content format matches.

## 3. Homepage primary type by site type

| Homepage type | Primary `@type` | Supporting |
|---|---|---|
| Ecommerce | `OnlineStore` | `Product`, `Offer` (`priceCurrency`, `availability: …/InStock`), `AggregateRating` |
| SaaS | `SoftwareApplication` | `WebApplication`, `Offer` (`applicationCategory: "BusinessApplication"`, `operatingSystem: "Web"`) |
| Corporate / agency | `Organization` | `ContactPoint` (`telephone`, `contactType`), `sameAs[]` |
| Local business | `LocalBusiness` | `PostalAddress`, `openingHours: "Mo-Su 09:00-21:00"` |
| Blog / news | `Blog` or `NewsMediaOrganization` | `blogPost` → `BlogPosting` (`headline`, `author`) |
| Educational | `EducationalOrganization` | `Course`, `VideoObject` |
| Portfolio | `Person` | `CreativeWork`, `worksFor` → `Organization` |
| Directory / marketplace | `ItemList` | `LocalBusiness`, `AggregateRating` (`ratingValue`, `reviewCount`) |
| Event | `Event` | `Place`, `Offer` (`startDate`, `priceCurrency`) |
| Nonprofit | `Organization` | `nonprofitStatus: "Nonprofit501c3"`, `contactPoint` (`contactType: "donations"`) |

Switch type only when the business model changes (add products → `OnlineStore`; add a location → `LocalBusiness`).

## 4. Person / entity signals (E-E-A-T)

- `Person` with `name`, `jobTitle`, `image`, `description`, `address`.
- **`sameAs[]`** listing LinkedIn, GitHub, Twitter/X, Facebook, Instagram, Crunchbase, Wikipedia — this is the entity-disambiguation signal.
- `knowsAbout[]` for topical expertise.
- `author` on every article, with a visible bio and credentials on the page.

## 5. AI-citation-specific schema

- `FAQPage` is the most citable format — AI Overviews often extract FAQ pairs verbatim. 8–10 well-researched FAQ items with schema can earn citations across platforms.
- `HowTo` for step-by-step; `Article` + `FAQPage` + `Product`/`ItemList` cover the main citation types.
- Use `hasPart` on `Article` to map the H2/H3 structure explicitly before a crawler finishes parsing the DOM.
- Brands with comprehensive schema appear in AI recommendations **3–5× more often**.

## 6. Page-type → schema quick map (from the author's course curriculum)

- Home / About / Contact → Organization (or Person) + WebSite + BreadcrumbList
- Blog index + single post → Blog / BlogPosting + Person + BreadcrumbList
- Course hub + lesson → Course + BreadcrumbList
- Case study hub + detail → Article + BreadcrumbList
- Product → Product + Offer + AggregateRating
- FAQ section → FAQPage
- Guide with steps → HowTo

## 7. Reference example (live site homepage)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://example.com/#person",
      "name": "…",
      "url": "https://example.com/",
      "image": "https://example.com/static/images/person.webp",
      "jobTitle": "…",
      "description": "…",
      "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.com/" },
      "sameAs": ["https://www.linkedin.com/in/…", "https://github.com/…"],
      "knowsAbout": ["Technical SEO", "Indexing", "Crawl Optimization"],
      "address": { "@type": "PostalAddress", "addressLocality": "…", "addressCountry": "…" }
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com/",
      "name": "…",
      "description": "…",
      "publisher": { "@id": "https://example.com/#person" }
    }
  ]
}
</script>
```

## 8. Validation gate

Every page: Rich Results Test must return no errors, schema must describe only visible content, and the JSON-LD must be present in `curl` output. Add this as a CI assertion.
