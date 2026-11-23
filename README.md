# HealSpoc Website

A static React/Vite rebuild for HealSpoc, designed around human-handled WhatsApp enquiries, restrained healthcare facilitation content, and a secondary Web3Forms contact form.

**GitHub Pages:** <https://w3bhub2.github.io/HS/> (no custom domain). The separate `healspoc.com` WordPress installation is not changed by this repository.

## Run locally

```bash
npm install
npm run dev
npx tsc --noEmit
VITE_BASE_PATH=/HS/ VITE_SITE_URL=https://w3bhub2.github.io/HS npm run build -- --base /HS/
VITE_BASE_PATH=/HS/ VITE_SITE_URL=https://w3bhub2.github.io/HS node scripts/prepare-static-site.mjs
VITE_BASE_PATH=/HS/ VITE_SITE_URL=https://w3bhub2.github.io/HS node scripts/audit-static-site.mjs
```

GitHub Actions builds and deploys the site on pushes to `main` using `.github/workflows/pages.yml`. The Vite build is postprocessed into 24 prerendered HTML routes, a custom `404.html`, shared CSS/JavaScript files, a sitemap, and route-specific metadata. The Pages deployment lives under `/HS/`; direct links and reloads work because each route has its own `index.html`.

`npm run build` is the required Vite compile step, not the complete Pages artifact. Run `scripts/prepare-static-site.mjs` after it. The preparer extracts the configured single-file bundle into shared external assets, prerenders routes, and adds a browser-enforced CSP meta tag. `scripts/sync-csp-hashes.mjs` updates optional Apache/Netlify host policies; GitHub Pages ignores `.htaccess`, `_headers`, and `_redirects`. It cannot serve real HTTP 301 redirects or custom security response headers for this project site.

`node scripts/browser-audit.mjs` uses Playwright and axe-core against a local server serving `dist` from `/HS/`; it is a local QA step, not a substitute for real-device or production tests.
`node scripts/form-mock-audit.mjs` starts a temporary development server with a dummy key and exercises success, error, honeypot, phone normalization, and analytics paths using mocked API responses. It does not send an email.

To run the same browser gate as CI, start `VITE_BASE_PATH=/HS/ node scripts/preview-pages.mjs` in one terminal, then run `HEALSPOC_PREVIEW_URL=http://127.0.0.1:8080/HS/ node scripts/browser-audit.mjs` in another. The GitHub Pages workflow now runs this audit and the mocked form audit before publishing a new commit.

## Contact and form setup

- The approved WhatsApp destination is `+91 9108027762` (`https://wa.me/919108027762`). All prefilled messages open a conversation for a person to handle.
- The official email is `hello@healspoc.com`.
- The Web3Forms recipient is configured by the access key, not by a hidden `recipient` form field. Create the key for `hello@healspoc.com`, restrict allowed domains to `w3bhub2.github.io` (and any approved future domain), and add it as the repository Actions secret `WEB3FORMS_ACCESS_KEY`.
- Copy `.env.example` to `.env.local` for local configuration. A Web3Forms browser access key is designed for client-side use and is visible in the built JavaScript; do not put an account password or private server credential in a `VITE_` variable.
- Without an access key the form is not shown, so visitors cannot waste time submitting an undeliverable enquiry. WhatsApp and email remain available. A real Web3Forms inbox-delivery test requires owner access and has not been completed.
- The form intentionally excludes medical records, scans, diagnoses, and other sensitive health data.

## Analytics

`src/analytics.ts` emits privacy-conscious events via the `healspoc:analytics` browser event and forwards to `window.dataLayer` or `window.gtag` only when an owner-provided integration exists. The project contains no analytics ID or external analytics script. Events include WhatsApp widget opens, category selections, WhatsApp clicks, treatment-specific WhatsApp clicks, contact form starts, submissions, and errors. Event payloads do not contain form values or other personal data. Complete privacy and consent review before adding an analytics provider.

## Content and clinical review

Treatment routes are enquiry starting points, not clinical articles. They intentionally withhold treatment indications, comparisons, eligibility, prices, named providers, and outcome claims until evidence and qualified medical review are supplied. Hospital and doctor routes explain why no profiles are currently published. Patient assistance is described as something to confirm, not as a promised service.

Legal pages are drafts because the legal entity, registered address, governing jurisdiction, Web3Forms retention details, and privacy-controller information require owner/legal confirmation. Do not publish them as finalized policies until that review is complete.

## Production migration

The separate public site `healspoc.com` was observed as a WordPress/PHP site on Hostinger infrastructure. Publishing this GitHub Pages site does not replace it or prove it secure. Do not change the existing production domain until a recoverable backup, WordPress security investigation, URL migration review, and rollback plan are complete. See `docs/audit-findings.md` and `docs/deployment-checklist.md`.

Image sources and licensing notes, including Pinterest visual research and the original Pexels listings for every treatment image, are recorded in `docs/image-sources.md`. Pinterest images were not copied without independent usage rights.

See `docs/launch-readiness.md` for the exact checks still requiring owner access or approval before treating the project as a fully verified healthcare production site.