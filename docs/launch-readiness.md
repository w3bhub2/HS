# Launch Readiness and Owner Handover

## Deployed and directly verifiable

- The GitHub Pages project URL is <https://w3bhub2.github.io/HS/>. It has no custom domain and does not replace `healspoc.com`.
- The bottom-right control uses the complete WhatsApp brand glyph and opens human-handled enquiry categories. The fixed mobile CTA opens the approved WhatsApp number directly.
- Each care-area page and the medical-travel page has its own relevant Pexels-sourced photograph, accurate alt text, and a visible stock-image disclosure. Pinterest was visual research only; see `docs/image-sources.md` for originals and license.
- The build generates 24 prerendered routes and a true 404 page. GitHub Actions type-checks, builds, audits static links/metadata/assets, runs a four-width browser audit, and exercises mocked form paths before deployment.
- When Web3Forms is unconfigured, visitors see working WhatsApp and email links instead of an enquiry form that cannot deliver.

## Not cleared for an unqualified production claim

1. **Web3Forms:** The owner must create a key for `hello@healspoc.com`, add it as the repository secret `WEB3FORMS_ACCESS_KEY`, restrict allowed origins, and verify a real submission received in that inbox. Mock tests are not delivery tests.
2. **Legal and privacy:** Confirm the registered legal entity, business address, jurisdiction, data controller, retention, processor terms, and consent requirements. Replace the clearly marked policy drafts after qualified legal review.
3. **Clinical information:** Provide a qualified medical reviewer and current primary sources before publishing procedure descriptions, eligibility, costs, outcomes, or medical articles. No verified provider listings have been supplied.
4. **Old domain:** Back up and restore-test the separate WordPress estate. Investigate its template material, users, plugins, scheduled tasks, files, database, and redirects with privileged access before any migration. Search Console/Bing exports are needed for final URL mapping and 301s.
5. **Human conversion testing:** Test the WhatsApp app handoff and team response on real iOS and Android devices. Confirm that enquiries reach the intended human team. A click is not a confirmed lead.
6. **Field performance and manual accessibility:** Collect real-user Core Web Vitals when traffic exists; test keyboard and screen-reader workflows on real devices. Lighthouse and automated Axe findings are lab evidence only.
7. **Analytics:** If tracking beyond in-browser events is needed, supply a property ID and approved privacy/consent approach. The current project does not report persisted lead analytics.

Until these owner-controlled items are completed, this is a functioning public GitHub Pages release with a working WhatsApp-first contact path, **not** a verified 10/10 healthcare production launch.