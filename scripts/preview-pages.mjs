import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const dist = resolve(process.cwd(), "dist");
const basePart = (process.env.VITE_BASE_PATH || "/HS/").replace(/^\/+|\/+$/g, "");
const basePath = basePart ? `/${basePart}/` : "/";
const port = Number(process.env.PORT || 8080);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  if (!pathname.startsWith(basePath)) {
    response.writeHead(404);
    response.end();
    return;
  }

  const relative = pathname.slice(basePath.length);
  const target = resolve(dist, relative, relative.endsWith("/") || !extname(relative) ? "index.html" : "");
  if (target !== dist && !target.startsWith(`${dist}${sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }

  let body;
  let status = 200;
  let file = target;
  try {
    body = await readFile(file);
  } catch {
    status = 404;
    file = resolve(dist, "404.html");
    body = await readFile(file);
  }

  response.writeHead(status, {
    "Content-Type": mime[extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  response.end(request.method === "HEAD" ? undefined : body);
}).listen(port, "127.0.0.1", () => {
  console.log(`GitHub Pages preview: http://127.0.0.1:${port}${basePath}`);
});