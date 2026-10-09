import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { versions, getVersion, audioNote } from "@/lib/versions";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /**
   * Direct answer shown under the headline, 40-60 words.
   *
   * AI retrieval reads the first semantic blocks of a page, not the whole
   * thing. Most guides open with a question ("When anxiety rolls in, the
   * hardest part is...") which reads well to a person but gives a retriever
   * nothing quotable. This field is that quotable sentence.
   */
  answer: string;
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
      answer: String(data.answer ?? ""),
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

/** The translation every guide is written against; used as the fallback. */
const DEFAULT_VERSION = "kjv";

export interface PostLinks {
  /** The translation this post talks about, always present. */
  version: {
    href: string;
    label: string;
    note: string;
    playUrl?: string;
  } | null;
  /** Take a Break, either as its own app or the in-app feature. */
  takeABreak: { href: string; label: string } | null;
  /** Other guides on a shared tag. */
  related: PostMeta[];
}

/**
 * Three internal links for a post, in conversion order:
 *   1. the app it is about  2. Take a Break  3. related guides
 *
 * Falls back to the KJV app when a post carries no version tag, so every
 * guide keeps a path to the store — a post with empty `tags` previously
 * rendered no download block at all.
 */
export function postLinks(post: PostMeta): PostLinks {
  const slug =
    post.tags.find((tag) => versions.some((v) => v.slug === tag)) ??
    DEFAULT_VERSION;
  const version = getVersion(slug) ?? getVersion(DEFAULT_VERSION)!;
  // A post with no tags has no overlap to match on, which would render an
  // empty "related" section. Fall back to the newest guides so the block
  // always offers something to read next.
  const related = relatedPosts(post, 3);

  return {
    version: {
      href: `/versions/${version.slug}`,
      label: version.listing,
      note: audioNote(version.slug) ?? "Offline, no account needed",
      playUrl: version.playUrl,
    },
    // Every guide gets the Take a Break path: it is the same feature in every
    // translation, so the link holds whether or not the post is tagged for it.
    takeABreak: { href: "/take-a-break", label: "Take a Break" },
    related: related.length ? related : latestPosts(post.slug, 3),
  };
}

/** Latest published posts, newest first — used when no tag overlap exists. */
function latestPosts(exclude: string, limit: number): PostMeta[] {
  return getPublishedPosts()
    .filter((p) => p.slug !== exclude)
    .slice(0, limit);
}

/** Published posts sharing at least one tag with `post`, newest first. */
export function relatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const tags = new Set(post.tags);
  return getPublishedPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, overlap: p.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort(
      (a, b) => b.overlap - a.overlap || b.p.date.localeCompare(a.p.date),
    )
    .slice(0, limit)
    .map((x) => x.p);
}

/** Guides about a translation, for the bottom of a version page. */
export function postsForVersion(slug: string, limit = 3): PostMeta[] {
  return getPublishedPosts()
    .filter((p) => p.tags.includes(slug))
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
