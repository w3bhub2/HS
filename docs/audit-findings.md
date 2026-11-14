# HealSpoc Public-Site Audit and Rebuild Notes

## Scope and limits

This is a public, unauthenticated reconnaissance of `https://healspoc.com` and a local-project inspection performed before the rebuild. It is not a security penetration test, CMS audit, server audit, or deployment review. No hosting, WordPress, database, registrar, analytics, Search Console, or email account credentials were available. No production changes or backup were performed.

## Public evidence observed

- The root site responded over HTTPS with HTTP 200. Response headers exposed WordPress/PHP, a WordPress REST API and pingback endpoint, plus Hostinger/HPanel and HCDN identifiers.
- Public DNS-over-HTTPS lookups returned A records, `cosmos.dns-parking.com` and `nova.dns-parking.com` nameservers, and Hostinger MX/SPF records. These are public DNS observations only; DNS account ownership and configuration were not inspected.
- `robots.txt` allows general crawling, blocks `/wp-admin/`, and points to the WordPress sitemap.
- The sitemap and public WordPress REST API exposed a `Home` page, an `About` page, the default `Hello world!` post, and an author record exposing an internal-looking email address. The published `About` and home content contain lorem ipsum, generic template photography, fabricated-looking doctor profiles, and an unsupported 4.9 / 40K rating claim.
- The public `Hello world!` page still contains WordPress starter copy and a sample comment.
- Search results expose older treatment-cost pages with unverified prices, provider lists, success-rate language, hospital references, and superseded contact details. These pages conflict with the supplied current contact information and must not be reused as factual content.
- The current public page and public search index do not establish current provider relationships, clinical reviewers, operating locations, accreditations, treatment pricing, patient outcomes, or travel-support capabilities. No such details are asserted in this rebuild.
- The public root HTML did not yield a verified analytics property or tag ID. Analytics account configuration and other routes remain uninspected.

## Security assessment

The placeholder content and exposed WordPress author record are confirmed public issues. Their cause is not confirmed. Available evidence is not enough to claim an SEO-spam injection, an account compromise, or an authorized/unauthorized edit. Treat the WordPress installation as untrusted until the owner or host reviews users, plugins, themes, scheduled tasks, database changes, file integrity, redirects, logs, and Search Console security notices.

No admin access was available to inspect or remove users, plugins, themes, cron jobs, redirects, scripts, database records, or server files. No recoverable backup was created. TLS was observed at the public edge, but origin TLS, HSTS, access controls, backup restoration, and security headers were not fully verified.

## URLs with observed value

The WordPress sitemap exposed `/`, `/about/`, `/hello-world/`, and an author archive. Search results also exposed legacy treatment routes including gastric balloon, gastric bypass, lap-band, sleeve gastrectomy, kyphosis, brain cancer, and goiter cost pages. A hosting-ready redirect map is included for the observed legacy paths; it has not been applied to production. The `About` route is retained. The starter post and author archive are retired in the supplied Apache redirect configuration.

This list is not a complete Search Console export. Search Console and Bing Webmaster Tools access is required to find all indexed URLs, backlinks, crawl errors, and current query value before final migration.

## Verified content policy for this build

- Brand: HealSpoc. The public website footer has displayed “HealSpoc Healthcare Services LLP”; confirm the legal entity and registration details with the owner before treating it as a final legal disclosure.
- Official contact details supplied for this rebuild: `+91 9108027762`, `https://wa.me/919108027762`, and `hello@healspoc.com`.
- No physical address, registered office, jurisdiction, hospital/doctor relationship, named clinician, patient story, price, savings figure, outcome, accreditation, or operational travel service is published as fact.
- HealSpoc is described as a healthcare facilitator, not a hospital, clinic, or medical provider. Clinical decisions remain with licensed providers.
- Treatment routes use a conservative enquiry framework. Clinical indications, treatment comparisons, cost figures, provider names, and clinical recommendations are withheld pending source verification and qualified medical review.
- Legal pages are clearly marked as owner/legal-review drafts where entity, jurisdiction, data retention, and processor details need confirmation.

## Architecture choice

The local project was an empty React/Vite/Tailwind shell. This rebuild uses a small static React application with no CMS, no custom backend, no account system, and no third-party analytics ID. This is compatible in principle with static hosting, including a document-root deployment that supports SPA fallback and the supplied Apache rules. The observed Hostinger headers do not prove that a future deployment path or `.htaccess` behavior is configured correctly.

Content is maintained in typed source files. A CMS was not added because access to the existing WordPress installation and the owner's publishing workflow were unavailable, and rebuilding on top of an untrusted installation would be unsafe. A static deployment reduces the application surface but requires code-based content updates. Each published route is prerendered to semantic HTML with route-specific titles, descriptions, and canonicals; React hydrates for navigation and interactive features. The GitHub Pages project URL is separate from the old production domain, so search migration and permanent redirects cannot be completed there.

## Owner / deployment blockers

- Take and validate a full backup before changing the live site. This has not been done.
- Investigate the public WordPress installation and verify whether its recent placeholder changes were authorized.
- Export Search Console/Bing URLs and backlinks; approve redirects and confirm 301 behavior after deployment.
- Confirm the legal entity, registered office, governing jurisdiction, privacy controller, data retention, and authorized support services.
- Verify current hospital/provider relationships and supply an appropriately qualified medical reviewer for clinical content.
- Create a Web3Forms access key for `hello@healspoc.com`, restrict allowed domains, build with the key, and complete a real inbox delivery test. No key or inbox access was available in this project.
- Provide analytics property IDs and consent/privacy requirements if analytics are required. Events are instrumented as an integration seam only; no external analytics service is configured.
- Stage, deploy, verify HTTPS/security headers, and keep a tested rollback artifact. Deployment has not occurred.