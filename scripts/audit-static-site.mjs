import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const siteUrl = (process.env.VITE_SITE_URL || "https://healspoc.com").replace(/\/+$/, "");
const basePart = (process.env.VITE_BASE_PATH || "/").replace(/^\/+|\/+$/g, "");
const basePath = basePart ? `/${basePart}/` : "/";
const problems = [];
const assert = (condition, message) => {
  if (!condition) problems.push(message);
};

function getTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(([tag]) => tag);
}

function attribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(new RegExp(`\\b${escapedName}=["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
}

function meta(html, key, value) {
  return getTags(html, "meta")
    .find((tag) => attribute(tag, key) === value);
}

function localFile(link) {
  if (!link.startsWith(basePath)) return null;
  const parsed = new URL(link, "https://example.invalid");
  const relative = parsed.pathname.slice(basePath.length);
  return relative.endsWith("/") || relative === ""
    ? join(dist, relative, "index.html")
    : join(dist, relative);
}

const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const titles = new Set();

assert(routes.length === 24, `Expected 24 sitemap routes; found ${routes.length}.`);
assert(new Set(routes).size === routes.length, "The sitemap contains duplicate URLs.");
assert(routes.every((url) => url.startsWith(`${siteUrl}/`)), "Sitemap URLs do not match the deployed site URL.");

for (const url of routes) {
  const path = new URL(url).pathname.replace(basePath, "/");
  const documentPath = path === "/"
    ? join(dist, "index.html")
    : join(dist, path, "index.html");

  assert(existsSync(documentPath), `Missing prerendered route: ${url}`);
  if (!existsSync(documentPath)) continue;

  const html = readFileSync(documentPath, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const canonical = getTags(html, "link").find((tag) => attribute(tag, "rel") === "canonical");
  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;

  assert(Boolean(title), `${path}: missing title.`);
  assert(!titles.has(title), `${path}: duplicate title: ${title}`);
  titles.add(title);
  assert(h1Count === 1, `${path}: expected one h1, found ${h1Count}.`);
  assert(Boolean(meta(html, "name", "description")), `${path}: missing meta description.`);
  assert(attribute(canonical || "", "href") === url, `${path}: incorrect canonical URL.`);
  assert(attribute(meta(html, "property", "og:url") || "", "content") === url, `${path}: incorrect Open Graph URL.`);
  assert(Boolean(meta(html, "http-equiv", "Content-Security-Policy")), `${path}: missing CSP meta tag.`);
  assert(!/lorem ipsum|40K Reviews|guaranteed savings|Dr\. Jennifer Scott/i.test(html), `${path}: prohibited placeholder or unsupported claim found.`);
  assert(!/961\s*102\s*7762|951\s*335\s*7762/.test(html), `${path}: superseded phone number found.`);
  assert(html.includes('href="https://wa.me/919108027762'), `${path}: approved WhatsApp destination missing.`);

  const schema = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/i)?.[1];
  try {
    const structuredData = JSON.parse(schema || "");
    assert(structuredData["@type"] === "Organization", `${path}: unexpected structured-data type.`);
    assert(structuredData.url === `${siteUrl}/`, `${path}: unexpected structured-data site URL.`);
    assert(structuredData.contactPoint?.telephone === "+919108027762", `${path}: incorrect schema contact number.`);
  } catch {
    problems.push(`${path}: invalid Organization JSON-LD.`);
  }

  for (const tag of getTags(html, "img")) {
    assert(Boolean(attribute(tag, "alt")), `${path}: image missing alt text.`);
    const src = attribute(tag, "src");
    const file = localFile(src);
    assert(Boolean(file && existsSync(file)), `${path}: missing image ${src}.`);
  }

  for (const tag of getTags(html, "source")) {
    const srcSet = attribute(tag, "srcSet");
    if (srcSet) {
      const file = localFile(srcSet);
      assert(Boolean(file && existsSync(file)), `${path}: missing picture source ${srcSet}.`);
    }
  }

  for (const tag of getTags(html, "a")) {
    const href = attribute(tag, "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("https://")) continue;
    const file = localFile(href);
    assert(Boolean(file && existsSync(file)), `${path}: broken internal link ${href}.`);
  }
}

const cssFile = join(dist, "assets", readFileSync(join(dist, "index.html"), "utf8")
  .match(/href="\/[^" ]+\/assets\/(healspoc-[^" ]+\.css)"/)?.[1] || "missing.css");
assert(existsSync(cssFile), "Missing compiled stylesheet.");
if (existsSync(cssFile)) {
  const css = readFileSync(cssFile, "utf8");
  const refs = [...css.matchAll(/url\((\.\.\/fonts\/[^)]+\.woff2)\)/g)].map((match) => match[1]);
  assert(refs.length >= 2, "Locally hosted fonts were not resolved into the static stylesheet.");
  for (const ref of refs) {
    assert(existsSync(resolve(dirname(cssFile), ref)), `Missing font file: ${ref}`);
  }
}

const notFound = readFileSync(join(dist, "404.html"), "utf8");
assert(notFound.includes("noindex,follow"), "The 404 page is not marked noindex.");
assert(!/rel="canonical"/.test(notFound), "The 404 page unexpectedly declares a canonical URL.");
assert(readFileSync(join(dist, "robots.txt"), "utf8").includes(`${siteUrl}/sitemap.xml`), "Robots sitemap URL is incorrect.");
assert(existsSync(join(dist, ".nojekyll")), "GitHub Pages .nojekyll marker is missing.");
assert(!existsSync(join(dist, ".htaccess")), "Apache rules must not be included in the Pages artifact.");
assert(!existsSync(join(dist, "_headers")), "Unsupported response-header rules must not be included in the Pages artifact.");
assert(!existsSync(join(dist, "_redirects")), "Unsupported redirect rules must not be included in the Pages artifact.");

if (problems.length) {
  console.error(`Static audit failed with ${problems.length} issue(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`Static audit passed: ${routes.length} prerendered pages, metadata, links, images, fonts, schema, sitemap, and 404 page.`);
  console.log("External delivery, hosting security headers, mobile devices, and live analytics remain separate verification tasks.");
}