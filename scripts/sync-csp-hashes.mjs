import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

function getHashes(html, pattern) {
  return [...html.matchAll(pattern)]
    .filter(([, attributes, body]) => !/\bsrc\s*=/i.test(attributes) && body.trim())
    .map(([, , body]) => {
      const digest = createHash("sha256").update(body).digest("base64");
      return `'sha256-${digest}'`;
    });
}

export async function syncCspHashes(root = process.cwd()) {
  const html = await readFile(resolve(root, "dist/index.html"), "utf8");
  const scriptHashes = getHashes(html, /<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  const styleHashes = getHashes(html, /<style\b([^>]*)>([\s\S]*?)<\/style>/gi);

  if (scriptHashes.length === 0) {
    throw new Error("No inline structured-data script was found in the static build.");
  }

  const styleSources = ["'self'", ...styleHashes].join(" ");
  const scriptSources = ["'self'", ...scriptHashes].join(" ");
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://api.web3forms.com",
    "connect-src 'self' https://api.web3forms.com",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `style-src ${styleSources}`,
    "style-src-attr 'none'",
    `script-src ${scriptSources}`,
    "script-src-attr 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const replacements = [
    [resolve(root, "public/.htaccess"), (text) =>
      text.replace(
        /Header always set Content-Security-Policy ".*"/,
        `Header always set Content-Security-Policy "${policy}"`,
      )],
    [resolve(root, "public/_headers"), (text) =>
      text.replace(/^  Content-Security-Policy: .*$/m, `  Content-Security-Policy: ${policy}`)],
    [resolve(root, "dist/.htaccess"), (text) =>
      text.replace(
        /Header always set Content-Security-Policy ".*"/,
        `Header always set Content-Security-Policy "${policy}"`,
      )],
    [resolve(root, "dist/_headers"), (text) =>
      text.replace(/^  Content-Security-Policy: .*$/m, `  Content-Security-Policy: ${policy}`)],
  ];

  for (const [path, update] of replacements) {
    const current = await readFile(path, "utf8");
    await writeFile(path, update(current));
  }

  console.log(
    `Updated CSP with ${scriptHashes.length} inline script and ${styleHashes.length} inline style hash(es).`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  await syncCspHashes();
}