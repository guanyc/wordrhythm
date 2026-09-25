/**
 * Writes out/rss.xml after `next build` (static export has no route handlers
 * for feeds, so the file is generated straight into the export folder).
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const HOST = "https://wordrhythm.app";
const DIR = path.join(process.cwd(), "content", "blog");
const OUT = path.join(process.cwd(), "out");

const esc = (s) =>
  String(s).replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c],
  );

const posts = [];
for (const file of await readdir(DIR)) {
  if (!file.endsWith(".md")) continue;
  const { data } = matter(await readFile(path.join(DIR, file), "utf8"));
  if (data.draft === true) continue;
  const slug = path.basename(file, ".md");
  posts.push({
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: new Date(data.date ?? Date.now()).toUTCString(),
  });
}
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const items = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${HOST}/blog/${p.slug}</link>
      <guid isPermaLink="true">${HOST}/blog/${p.slug}</guid>
      <pubDate>${p.date}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Word Rhythm — Guides</title>
    <link>${HOST}/blog</link>
    <description>Practical guides on daily Bible reading and devotional rhythm.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "rss.xml"), xml);
console.log(`rss.xml written with ${posts.length} posts`);
