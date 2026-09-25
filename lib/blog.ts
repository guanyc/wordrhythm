import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { versions } from "@/lib/versions";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  tags: string[];
  readingMinutes: number;
  draft: boolean;
}

const DIR = path.join(process.cwd(), "content", "blog");

function readFile(slug: string) {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: new Date(data.date ?? Date.now()).toISOString().slice(0, 10),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      readingMinutes: Math.max(1, Math.round(words / 200)),
      draft: data.draft === true,
    } satisfies PostMeta,
    content,
  };
}

/** Every post, newest first. Includes drafts — callers decide what to show. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readFile(f.slice(0, -3))?.meta)
    .filter((p): p is PostMeta => Boolean(p))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Posts that are safe to publish (no `draft: true`). */
export function getPublishedPosts(): PostMeta[] {
  return getAllPosts().filter((p) => !p.draft);
}

export function getPost(slug: string): PostMeta | undefined {
  return readFile(slug)?.meta;
}

/** Renders content/blog/<slug>.md to HTML at build time. */
export function renderPost(slug: string): string {
  const post = readFile(slug);
  if (!post) return "";
  return marked.parse(post.content, { async: false });
}

/** Internal links suggested by a post's tags (Bible versions, Take a Break). */
export function postLinks(post: PostMeta): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  for (const tag of post.tags) {
    const version = versions.find((v) => v.slug === tag);
    if (version && !links.some((l) => l.href.startsWith("/versions"))) {
      links.push({ href: `/versions/${version.slug}`, label: version.name });
    }
    if (
      tag === "take-a-break" &&
      !links.some((l) => l.href === "/take-a-break")
    ) {
      links.push({ href: "/take-a-break", label: "Take a Break" });
    }
  }
  return links;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
