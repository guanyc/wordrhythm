import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  getPublishedPosts,
  getPost,
  postLinks,
  renderPost,
} from "@/lib/blog";
import { TOTAL_EMOTION_PAGES } from "@/lib/emotions";

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.draft) notFound();

  const html = renderPost(post.slug);
  const links = postLinks(post);
  const more = links.related;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: "Guan Yongchun" },
    publisher: { "@type": "Organization", name: "Word Rhythm" },
    mainEntityOfPage: `https://wordrhythm.app/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Link
        href="/blog"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← All guides
      </Link>

      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      {post.answer && (
        <p className="mt-5 border-l-2 border-brand/40 pl-4 text-lg leading-relaxed text-ink">
          {post.answer}
        </p>
      )}
      <p className="mt-5 text-sm text-muted">
        {formatDate(post.date)} · {post.readingMinutes} min read
      </p>

      {post.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <article
        className="wr-prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {links.version && (
        <div className="mt-12 rounded-2xl bg-surface p-6 shadow-card">
          <p className="font-semibold">Try it in the app</p>
          <p className="mt-1 text-sm text-muted">{links.version.note}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href={links.version.href}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {links.version.label}
            </Link>
            {links.takeABreak && (
              <Link
                href={links.takeABreak.href}
                className="rounded-xl border border-black/10 bg-bg px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
              >
                {links.takeABreak.label}
              </Link>
            )}
            {links.version.playUrl && (
              <a
                href={links.version.playUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-bg px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
              >
                Get on Google Play
              </a>
            )}
          </div>
        </div>
      )}

      {more.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">Keep reading</h2>
          <ul className="mt-4 space-y-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block rounded-2xl border border-black/5 bg-surface p-4 shadow-card transition-colors hover:border-brand/40"
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {p.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.slug !== "what-bible-verses-help-when-you-feel-anxious" && (
        <div className="mt-12 border-t border-black/5 pt-8">
          <p className="text-sm text-muted">
            Looking for a verse that fits how you feel right now? We have{" "}
            <Link
              href="/bible-verses"
              className="font-semibold text-brand hover:underline"
            >
              Bible verses grouped by feeling
            </Link>{" "}
            — anxiety, grief, gratitude, anger and {TOTAL_EMOTION_PAGES - 4} more,
            each with its reference.
          </p>
        </div>
      )}
    </section>
  );
}
