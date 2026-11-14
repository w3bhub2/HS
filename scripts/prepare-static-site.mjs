import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { resolve, dirname, join } from "node:path";
import { syncCspHashes } from "./sync-csp-hashes.mjs";

const root = process.cwd();
const dist = resolve(root, "dist");
const origin = (process.env.VITE_SITE_URL || "https://healspoc.com").replace(/\/+$/, "");
const basePart = (process.env.VITE_BASE_PATH || "/").replace(/^\/+|\/+$/g, "");
const basePath = basePart ? `/${basePart}/` : "/";
const builtIndex = await readFile(resolve(dist, "index.html"), "utf8");

function contentHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function externalizeAssets(html) {
  const scriptMatch = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .find(([, attributes, body]) =>
      /\btype=["']module["']/i.test(attributes) &&
      !/\bsrc\s*=/i.test(attributes) &&
      body.trim(),
    );
  const styleMatch = html.match(/<style\b([^>]*)>([\s\S]*?)<\/style>/i);

  if (!scriptMatch || !styleMatch) {
    throw new Error("Expected the configured single-file build to contain one app script and one style block.");
  }

  const jsName = `healspoc-${contentHash(scriptMatch[2])}.js`;
  const stylesheetSource = styleMatch[2]
    .replaceAll("url(/fonts/", "url(../fonts/")
    .replaceAll("url(./fonts/", "url(../fonts/");
  const cssName = `healspoc-${contentHash(stylesheetSource)}.css`;
  const assets = resolve(dist, "assets");

  return mkdir(assets, { recursive: true }).then(async () => {
    await writeFile(resolve(assets, jsName), scriptMatch[2]);
    await writeFile(resolve(assets, cssName), stylesheetSource);
    const externalModule = `<script type="module" crossorigin src="${basePath}assets/${jsName}"></script>`;
    const stylesheet = `<link rel="stylesheet" href="${basePath}assets/${cssName}" />`;
    const externalHtml = html
      .replace(scriptMatch[0], externalModule)
      .replace(styleMatch[0], stylesheet)
      .replace(
        /<link\b(?=[^>]*\brel=["']icon["'])[^>]*\/?\s*>/i,
        `<link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg" />`,
      );
    return externalHtml;
  });
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setMeta(html, attribute, key, value) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${escapeRegExp(attribute)}=["']${escapeRegExp(key)}["'])[^>]*\\/?\\s*>`,
    "i",
  );
  const tag = `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(value)}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `${tag}\n</head>`);
}

function setCanonical(html, path, isKnownPage) {
  const pattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\/?\s*>/i;
  if (!isKnownPage) return html.replace(pattern, "");
  const tag = `<link rel="canonical" href="${origin}${path}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `${tag}\n</head>`);
}

function applyMetadata(html, path, metadata, isKnownPage) {
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(metadata.title)}</title>`);
  output = setMeta(output, "name", "description", metadata.description);
  output = setMeta(output, "property", "og:title", metadata.title);
  output = setMeta(output, "property", "og:description", metadata.description);
  output = setMeta(output, "property", "og:url", `${origin}${path}`);
  output = setMeta(output, "property", "og:image", `${origin}/images/hero-care.jpg`);
  output = setCanonical(output, path, isKnownPage);

  const robotsPattern = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*\/?\s*>/i;
  if (isKnownPage) {
    output = output.replace(robotsPattern, "");
  } else {
    output = setMeta(output, "name", "robots", "noindex,follow");
  }

  const preloadPattern = /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*\/?\s*>/i;
  output = path === "/"
    ? output.replace(
      preloadPattern,
      `<link rel="preload" as="image" href="${basePath}images/hero-care.webp" type="image/webp" fetchpriority="high" />`,
    )
    : output.replace(preloadPattern, "");

  output = output.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    (whole, json) => {
      const schema = JSON.parse(json);
      schema.url = `${origin}/`;
      return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    },
  );

  // GitHub Pages does not support custom response headers, so enforce the
  // browser-supported subset of the policy in the prerendered HTML itself.
  const inlineScripts = [...output.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, body]) => !/\bsrc\s*=/i.test(attributes) && body.trim())
    .map(([, , body]) =>
      `'sha256-${createHash("sha256").update(body).digest("base64")}'`,
    );
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self' https://api.web3forms.com",
    "connect-src 'self' https://api.web3forms.com",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "style-src 'self'",
    "style-src-attr 'none'",
    `script-src 'self' ${inlineScripts.join(" ")}`,
    "script-src-attr 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  output = output.replace(
    "</head>",
    `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(policy)}" />\n</head>`,
  );
  return output;
}

function applyServerMarkup(html, markup) {
  const emptyRoot = '<div id="root"></div>';
  if (!html.includes(emptyRoot)) {
    throw new Error("Could not find the empty React root in the built HTML template.");
  }
  return html.replace(emptyRoot, `<div id="root">${markup}</div>`);
}

const htmlTemplate = await externalizeAssets(builtIndex);
const sitemap = await readFile(resolve(root, "public/sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)]
  .map(([, url]) => new URL(url).pathname)
  .filter(Boolean);

if (!routes.includes("/")) {
  throw new Error("The public sitemap must include the homepage.");
}

const vite = await createServer({
  mode: "production",
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const [{ default: App, getMetadata, isKnownPath }, { SITE_URL }] = await Promise.all([
    vite.ssrLoadModule("/src/App.tsx"),
    vite.ssrLoadModule("/src/content.ts"),
  ]);

  for (const route of routes) {
    globalThis.__HEALSPOC_SSR_PATH__ = route;
    const markup = renderToString(createElement(App));
    const metadata = getMetadata(route);
    const html = applyMetadata(
      applyServerMarkup(htmlTemplate, markup),
      route,
      metadata,
      isKnownPath(route),
    );
    const target = route === "/"
      ? resolve(dist, "index.html")
      : join(dist, route.replace(/^\/+|\/+$/g, ""), "index.html");
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }

  globalThis.__HEALSPOC_SSR_PATH__ = "/404/";
  const notFoundMarkup = renderToString(createElement(App));
  const notFoundHtml = applyMetadata(
    applyServerMarkup(htmlTemplate, notFoundMarkup),
    "/404/",
    getMetadata("/404/"),
    false,
  );
  await writeFile(resolve(dist, "404.html"), notFoundHtml);

  if (SITE_URL !== origin) {
    throw new Error("The static site origin does not match the configured HealSpoc URL.");
  }
} finally {
  globalThis.__HEALSPOC_SSR_PATH__ = undefined;
  await vite.close();
}

const deployedSitemap = sitemap.replaceAll("https://healspoc.com/", `${origin}/`);
await writeFile(resolve(dist, "sitemap.xml"), deployedSitemap);
const robots = await readFile(resolve(root, "public/robots.txt"), "utf8");
await writeFile(
  resolve(dist, "robots.txt"),
  robots.replaceAll("https://healspoc.com/sitemap.xml", `${origin}/sitemap.xml`),
);

await syncCspHashes(root);
console.log(`Prepared ${routes.length} prerendered routes, a real 404 page, and shared external assets.`);