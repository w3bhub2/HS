# Production Deployment Checklist

The rebuilt site is deployed at <https://w3bhub2.github.io/HS/> without a custom domain. The checklist below applies to any future migration of `healspoc.com`, which has not been changed. The GitHub Pages build is public, but that alone does not verify the old WordPress installation or the outstanding owner-controlled services.

## Before changing the live site

- Obtain hosting, WordPress, DNS, email, analytics, Search Console, and Bing Webmaster Tools access from the owner.
- Create a full database and server-file backup, save it outside the web root, and test restoration to staging.
- Investigate the current WordPress user list, plugins, themes, scheduled tasks, database revisions, file integrity, injected scripts, redirects, logs, and security notices with the host or a qualified security reviewer.
- Export all indexed URLs, backlinks, sitemap URLs, and Search Console/Bing data. Review every redirect and retain any valuable content only after factual and clinical review.
- Confirm the registered legal entity, registered office, governing law, privacy contact, current patient-assistance capabilities, and approved medical reviewer.

## Configure before build

- Generate a Web3Forms access key for `hello@healspoc.com` and restrict it to `healspoc.com` and approved staging origins.
- Set `VITE_WEB3FORMS_ACCESS_KEY` in the production build environment. Confirm the recipient in the Web3Forms dashboard; it is not controlled by the form body.
- Complete a real test submission from the production domain. Confirm receipt at `hello@healspoc.com`, reply usability, spam handling, error handling, and the provider's retention/privacy terms.
- Add an analytics property only if approved. Verify the required consent approach and confirm events are not transmitting form fields or personal information.
- Replace or approve legal-policy drafts. Do not launch with unidentified controller, retention, or jurisdiction details.

## Stage and verify

- Upload only the built static output to a clean document root after preserving the old site and a rollback copy.
- Confirm `.htaccess` or equivalent host rules, SPA fallback, canonical HTTPS host, security headers, redirects, `/robots.txt`, `/sitemap.xml`, and static asset paths.
- Test the homepage and every listed route by direct URL load and refresh, including the legacy redirects and 410 retirements.
- Check the site on real iOS and Android devices, desktop browsers, keyboard-only navigation, and a screen reader.
- Test WhatsApp deep links on desktop and mobile. Confirm every link uses the approved destination and that treatment messages include the selected care area.
- Validate the form with empty and invalid values, valid country-coded numbers, consent unchecked/checked, honeypot populated, missing key, network failure, API rejection, and a real successful delivery.
- Inspect the browser console, network requests, CSP behavior, structured data, image loading, and Core Web Vitals. Treat Lighthouse as lab evidence only; collect field data after traffic is available.
- Verify status codes and redirect chains with `curl -I`; submit the sitemap in Search Console and Bing Webmaster Tools after DNS/property access is confirmed.

## Rollback

Keep the original website backup and the new static artifact separately until the owner accepts the migration. If critical routes, HTTPS, contact flows, or security headers fail, restore the prior site from the tested backup and investigate on staging rather than patching the live system without a recovery point.