import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  getAllPosts,
  getPost,
  postLinks,
  renderPost,
} from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts()
    .filter((p) => !p.draft)
    .map((p) => ({ slug: p.slug }));
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
  const more = getAllPosts()
    .filter((p) => !p.draft && p.slug !== post.slug)
    .slice(0, 3);

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
      <p className="mt-3 text-sm text-muted">
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

      {links.length > 0 && (
        <div className="mt-12 rounded-2xl bg-surface p-6 shadow-card">
          <p className="font-semibold">Try it in the app</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-black/10 bg-bg px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
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
    </section>
  );
}
