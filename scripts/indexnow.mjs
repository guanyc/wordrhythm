/**
 * Ping IndexNow so Bing, Yandex, Seznam and Naver pick up new or updated URLs
 * right away instead of waiting for their crawlers.
 *
 * Usage:
 *   npm run indexnow              # every URL in the sitemap
 *   npm run indexnow -- /blog/x   # only some paths
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const HOST = "https://wordrhythm.app";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SITEMAP = path.join(process.cwd(), "out", "sitemap.xml");
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** The key file lives at /public/<key>.txt and contains the key itself. */
async function readKey() {
  const files = await readdir(PUBLIC_DIR);
  for (const file of files) {
    if (!file.endsWith(".txt")) continue;
    const stem = path.basename(file, ".txt");
    const body = (await readFile(path.join(PUBLIC_DIR, file), "utf8")).trim();
    if (body === stem) return body;
  }
  throw new Error(
    "No IndexNow key file found in public/ (expected <key>.txt containing the key).",
  );
}

async function sitemapUrls() {
  let xml;
  try {
    xml = await readFile(SITEMAP, "utf8");
  } catch {
    const res = await fetch(`${HOST}/sitemap.xml`);
    if (!res.ok) throw new Error(`Cannot read sitemap (${res.status})`);
    xml = await res.text();
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const key = await readKey();

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map((p) => (p.startsWith("http") ? p : new URL(p, HOST).toString()))
  : await sitemapUrls();

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(HOST).host, key, urlList }),
});

console.log(
  `${urlList.length} URLs → ${res.status}${res.ok ? " (accepted)" : ""}`,
);
if (!res.ok && res.status !== 202) {
  console.log(await res.text());
  process.exitCode = 1;
}
