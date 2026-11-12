/**
 * Serve `out/` the way the Cloudflare asset binding serves it.
 *
 * `next dev` cannot answer `/kjv/<book>/<chapter>/<verse>`: those 31,102 pages
 * are not routes, they are files written into `out/` by scripts/kjv-verses.mjs
 * after `next build`. Checking a verse card therefore means either deploying or
 * running this, which resolves paths the same way — exact file, then `.html`,
 * then `index.html`, then the export's own 404 body.
 *
 *   npm run build && npm run preview      # http://localhost:3001
 *
 * What it does not do is the Worker: a verse number past the end of a chapter
 * should be a 302 to the chapter, and this answers 404 instead. Everything the
 * export itself contains is byte-identical to production.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const ROOT = path.join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 3001);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function isFile(candidate) {
  return existsSync(candidate) && statSync(candidate).isFile();
}

/** Resolve a URL path against the export, or null when nothing matches. */
function resolve(pathname) {
  const decoded = decodeURIComponent(pathname);
  // `..` cannot escape the export: normalise inside ROOT and re-check.
  const candidate = path.join(ROOT, path.normalize(decoded));
  if (!candidate.startsWith(ROOT)) return null;

  // The export writes `<path>.html`, never `<path>/index.html` (there is no
  // trailingSlash in next.config.mjs), so `/kjv/` has to fall back to
  // `kjv.html` — which is what html_handling: auto-trailing-slash does on
  // Cloudflare. Without this every trailing-slash link 404s here and works in
  // production, the worst way for a preview to be wrong.
  if (decoded.endsWith("/") && candidate !== ROOT) {
    const directory = candidate.replace(/\/+$/, "");
    if (isFile(path.join(directory, "index.html"))) {
      return path.join(directory, "index.html");
    }
    if (isFile(`${directory}.html`)) return `${directory}.html`;
    return null;
  }
  if (isFile(candidate)) return candidate;
  if (isFile(`${candidate}.html`)) return `${candidate}.html`;
  if (isFile(path.join(candidate, "index.html"))) {
    return path.join(candidate, "index.html");
  }
  return null;
}

function send(res, file, status = 200) {
  res.writeHead(status, {
    "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
    // The point of the preview is to see what changed, never a cached copy.
    "cache-control": "no-store",
  });
  if (res.req.method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

if (!existsSync(ROOT)) {
  console.error(`no export at ${ROOT} — run npm run build first`);
  process.exit(1);
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const file = resolve(pathname);
  if (file) {
    send(res, file);
    return;
  }
  const notFound = path.join(ROOT, "404.html");
  if (isFile(notFound)) {
    send(res, notFound, 404);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not found\n");
}).listen(PORT, () => {
  console.log(`preview: http://localhost:${PORT} (serving out/)`);
});
