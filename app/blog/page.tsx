import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides on daily Bible reading, devotional rhythm, verse search, reading plans, and finding a calmer way back to Scripture.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Guides · Word Rhythm",
    description:
      "Practical guides on daily Bible reading, devotional rhythm, verse search, and finding a calmer way back to Scripture.",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getPublishedPosts();
  const [latest, ...rest] = posts;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Guides
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Notes on a calmer daily rhythm
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Short, practical writing about reading Scripture in real life — on busy
        days, tired evenings, and the days you fell behind.
      </p>

      {latest && (
        <Link
          href={`/blog/${latest.slug}`}
          className="mt-10 block rounded-3xl border border-black/5 bg-surface p-6 shadow-card transition-colors hover:border-brand/40 sm:p-8"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand">
            Latest
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {latest.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted">{latest.description}</p>
          <p className="mt-4 text-sm text-muted">
            {formatDate(latest.date)} · {latest.readingMinutes} min read
          </p>
        </Link>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col rounded-2xl border border-black/5 bg-surface p-5 shadow-card transition-colors hover:border-brand/40"
          >
            <h2 className="text-lg font-semibold leading-snug tracking-tight">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted">
              {post.description}
            </p>
            <p className="mt-auto pt-4 text-xs text-muted">
              {formatDate(post.date)} · {post.readingMinutes} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
