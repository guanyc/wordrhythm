import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { emotionPageSlugs, getEmotionPage } from "@/lib/emotions";

export function generateStaticParams() {
  return emotionPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getEmotionPage(slug);
  if (!page) return { title: "Not found" };

  // The query people actually type is "bible verses for X", so the title
  // leads with that rather than the internal group name.
  const subject = page.title.toLowerCase();
  const title = `Bible Verses for ${subject} — KJV`;
  const first = page.verses[0];
  const description =
    `${page.verses.length} KJV Bible verses for ${subject}, each with a reflection and prayer. ` +
    `Start with ${first.reference}.` +
    (page.emotions.length > 1
      ? ` Also covers ${page.emotions.slice(1).map((e) => e.label).join(", ")}.`
      : "");

  return {
    title,
    description,
    alternates: { canonical: `/bible-verses/${page.slug}` },
    openGraph: { title, description, url: `/bible-verses/${page.slug}` },
  };
}

export default async function EmotionPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getEmotionPage(slug);
  if (!page) notFound();

  const subject = page.title.toLowerCase();

  // Mark the page as a collection of passages, not an article about one.
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Bible Verses for ${page.title}`,
    description: `${page.verses.length} KJV passages for ${subject}, each with a short reflection and prayer.`,
    numberOfItems: page.verses.length,
    itemListElement: page.verses.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: v.reference,
        text: v.text,
        abstract: [v.micro, v.insight, v.prayer].filter(Boolean).join(" "),
        inLanguage: "en",
      },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav className="text-sm text-muted">
        <Link
          href="/bible-verses"
          className="font-semibold text-brand hover:underline"
        >
          ← All Bible verses by feeling
        </Link>
      </nav>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        Bible Verses for {subject}
      </h1>
      <p className="mt-4 text-lg text-muted">{page.subtitle}.</p>

      <p className="mt-3 text-sm text-muted">
        Open a passage to read its reflection and prayer. In the app, Take a
        Break picks one of these at random each time you open it.
      </p>

      {page.emotions.length > 1 && (
        <p className="mt-4 text-sm text-muted">
          Also covers {page.emotions.slice(1).map((e, i, arr) => (
            <span key={e.code}>
              {i > 0 && (i === arr.length - 1 ? " and " : ", ")}
              {e.label}
            </span>
          ))}
          .
        </p>
      )}

      <ol className="mt-10 space-y-6">
        {page.verses.map((v, i) => (
          <li key={v.reference} className="border-t border-black/5 pt-6">
            <p className="font-semibold text-brand">
              {i + 1}. {v.reference}
            </p>
            <blockquote className="mt-2 leading-relaxed">{v.text}</blockquote>

            {(v.insight || v.prayer) && (
              <details className="group mt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm font-semibold transition-colors hover:bg-brand-soft">
                  <span>Reflection and prayer</span>
                  <span
                    aria-hidden="true"
                    className="text-brand transition-transform duration-200 group-open:rotate-180"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-3 space-y-3 rounded-xl bg-surface px-4 py-4 text-sm leading-relaxed">
                  {v.micro && <p className="font-semibold text-brand">{v.micro}</p>}
                  {v.insight && (
                    <p>
                      <span className="font-semibold">Insight </span>
                      {v.insight}
                    </p>
                  )}
                  {v.prayer && (
                    <p>
                      <span className="font-semibold">Prayer </span>
                      {v.prayer}
                    </p>
                  )}
                </div>
              </details>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-14 rounded-2xl bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold tracking-tight">
          Take a Break in the app
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Word Rhythm matches these verses to how you are feeling, then adds a
          short reflection and a prayer. Pick an emotion, get one verse in about
          a minute. Works fully offline.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/versions/kjv"
            className="inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Get the KJV app
          </Link>
          <Link
            href="/take-a-break"
            className="rounded-xl border border-black/10 bg-bg px-5 py-2.5 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
          >
            How Take a Break works
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          Other feelings
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {emotionPageSlugs()
            .filter((s) => s !== page.slug)
            .slice(0, 14)
            .map((s) => {
              const other = getEmotionPage(s);
              if (!other) return null;
              return (
                <Link
                  key={s}
                  href={`/bible-verses/${s}`}
                  className="rounded-full bg-surface px-3 py-1.5 text-sm hover:text-brand"
                >
                  {other.title}
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
}